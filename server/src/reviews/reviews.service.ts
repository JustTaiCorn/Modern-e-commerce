import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { PrismaService } from '../prisma.service';
import { RedisService } from '../redis/redis.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { QueryReviewDto } from './dto/query-review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async create(productId: number, userId: number, dto: CreateReviewDto) {
    // 1. Kiểm tra sản phẩm có tồn tại không
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    // 2. ponytail: 1 câu query xác thực quyền đánh giá - Đơn hàng DELIVERED có chứa sản phẩm
    const deliveredOrder = await this.prisma.order.findFirst({
      where: {
        userId,
        status: 'DELIVERED',
        orderItems: { some: { productId } },
      },
    });

    if (!deliveredOrder) {
      throw new BadRequestException(
        'Bạn chỉ có thể đánh giá sau khi đã mua và nhận hàng thành công.',
      );
    }

    // 3. Kiểm tra user đã đánh giá sản phẩm này chưa (unique userId - productId)
    const existingReview = await this.prisma.review.findUnique({
      where: { userId_productId: { userId, productId } },
    });
    if (existingReview) {
      throw new ConflictException(
        'Bạn đã đánh giá sản phẩm này rồi. Vui lòng sử dụng chức năng cập nhật đánh giá.',
      );
    }

    // 4. Tạo review và đồng bộ rating/numReviews trong atomic transaction
    const newReview = await this.prisma.$transaction(async (tx) => {
      const review = await tx.review.create({
        data: {
          rating: dto.rating,
          comment: dto.comment,
          userId,
          productId,
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              profile_img: true,
            },
          },
        },
      });

      await this.recalculateProductRating(tx, productId);
      return review;
    });

    // Invalidate product cache
    await this.redis.del(`product:${productId}`);

    return newReview;
  }

  async update(reviewId: number, userId: number, dto: UpdateReviewDto) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });
    if (!review) {
      throw new NotFoundException(`Review with ID ${reviewId} not found`);
    }

    // Chỉ chính chủ mới được sửa
    if (review.userId !== userId) {
      throw new ForbiddenException('Bạn không có quyền chỉnh sửa đánh giá này.');
    }

    const updatedReview = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.review.update({
        where: { id: reviewId },
        data: {
          rating: dto.rating ?? review.rating,
          comment: dto.comment ?? review.comment,
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              profile_img: true,
            },
          },
        },
      });

      await this.recalculateProductRating(tx, review.productId);
      return updated;
    });

    // Invalidate product cache
    await this.redis.del(`product:${review.productId}`);

    return updatedReview;
  }

  async remove(reviewId: number) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });
    if (!review) {
      throw new NotFoundException(`Review with ID ${reviewId} not found`);
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.review.delete({
        where: { id: reviewId },
      });

      await this.recalculateProductRating(tx, review.productId);
    });

    // Invalidate product cache
    await this.redis.del(`product:${review.productId}`);

    return { success: true, message: 'Đã xóa đánh giá thành công' };
  }

  async findByProduct(productId: number, query: QueryReviewDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    const page = query.page ? Number(query.page) : 1;
    const limit = query.limit ? Number(query.limit) : 10;
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where: { productId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              profile_img: true,
            },
          },
        },
      }),
      this.prisma.review.count({
        where: { productId },
      }),
    ]);

    return {
      items: reviews,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  // ponytail: Tái tính toán trung bình sao và tổng số review trực tiếp từ DB
  private async recalculateProductRating(
    tx: Prisma.TransactionClient,
    productId: number,
  ) {
    const aggregates = await tx.review.aggregate({
      where: { productId },
      _avg: { rating: true },
      _count: { id: true },
    });

    const avgRating = aggregates._avg.rating
      ? Number(aggregates._avg.rating.toFixed(2))
      : 0;
    const numReviews = aggregates._count.id ?? 0;

    await tx.product.update({
      where: { id: productId },
      data: {
        rating: avgRating,
        numReviews,
      },
    });
  }
}
