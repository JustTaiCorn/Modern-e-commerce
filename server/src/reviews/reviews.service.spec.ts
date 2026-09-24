import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

describe('ReviewsService', () => {
  let service: ReviewsService;
  let mockPrisma: any;
  let mockTx: any;
  let mockRedis: any;

  beforeEach(() => {
    mockTx = {
      review: {
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        aggregate: jest.fn(),
      },
      product: {
        update: jest.fn(),
      },
    };

    mockPrisma = {
      product: {
        findUnique: jest.fn(),
      },
      order: {
        findFirst: jest.fn(),
      },
      review: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
      },
      $transaction: jest.fn((callback) => callback(mockTx)),
    };

    mockRedis = {
      del: jest.fn().mockResolvedValue(1),
    };

    service = new ReviewsService(mockPrisma, mockRedis);
  });

  describe('create', () => {
    const dto: CreateReviewDto = {
      rating: 5,
      comment: 'Sản phẩm tuyệt vời!',
    };

    it('should throw NotFoundException if product does not exist', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null);

      await expect(service.create(999, 1, dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if user has no DELIVERED order with the product', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({ id: 1 });
      mockPrisma.order.findFirst.mockResolvedValue(null);

      await expect(service.create(1, 1, dto)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockPrisma.order.findFirst).toHaveBeenCalledWith({
        where: {
          userId: 1,
          status: 'DELIVERED',
          orderItems: { some: { productId: 1 } },
        },
      });
    });

    it('should throw ConflictException if user has already reviewed the product', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({ id: 1 });
      mockPrisma.order.findFirst.mockResolvedValue({ id: 10, status: 'DELIVERED' });
      mockPrisma.review.findUnique.mockResolvedValue({ id: 5, rating: 4 });

      await expect(service.create(1, 1, dto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should create review, recalculate rating, and invalidate redis cache on valid purchase', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({ id: 1 });
      mockPrisma.order.findFirst.mockResolvedValue({ id: 10, status: 'DELIVERED' });
      mockPrisma.review.findUnique.mockResolvedValue(null);

      const createdReview = {
        id: 1,
        rating: 5,
        comment: 'Sản phẩm tuyệt vời!',
        userId: 1,
        productId: 1,
        user: { id: 1, username: 'testuser', profile_img: null },
      };
      mockTx.review.create.mockResolvedValue(createdReview);
      mockTx.review.aggregate.mockResolvedValue({
        _avg: { rating: 5 },
        _count: { id: 1 },
      });
      mockTx.product.update.mockResolvedValue({ id: 1, rating: 5, numReviews: 1 });

      const result = await service.create(1, 1, dto);

      expect(result).toEqual(createdReview);
      expect(mockTx.review.create).toHaveBeenCalledWith({
        data: {
          rating: 5,
          comment: 'Sản phẩm tuyệt vời!',
          userId: 1,
          productId: 1,
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
      expect(mockTx.product.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          rating: 5,
          numReviews: 1,
        },
      });
      expect(mockRedis.del).toHaveBeenCalledWith('product:1');
    });
  });

  describe('update', () => {
    const updateDto: UpdateReviewDto = {
      rating: 4,
      comment: 'Cập nhật nhận xét',
    };

    it('should throw NotFoundException if review does not exist', async () => {
      mockPrisma.review.findUnique.mockResolvedValue(null);

      await expect(service.update(999, 1, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if user is not the owner of review', async () => {
      mockPrisma.review.findUnique.mockResolvedValue({
        id: 1,
        userId: 2, // different user
        productId: 10,
      });

      await expect(service.update(1, 1, updateDto)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should update review, recalculate rating, and invalidate cache when owner edits', async () => {
      mockPrisma.review.findUnique.mockResolvedValue({
        id: 1,
        userId: 1,
        productId: 10,
        rating: 5,
        comment: 'Cũ',
      });

      const updated = {
        id: 1,
        rating: 4,
        comment: 'Cập nhật nhận xét',
        userId: 1,
        productId: 10,
      };
      mockTx.review.update.mockResolvedValue(updated);
      mockTx.review.aggregate.mockResolvedValue({
        _avg: { rating: 4 },
        _count: { id: 1 },
      });
      mockTx.product.update.mockResolvedValue({ id: 10, rating: 4, numReviews: 1 });

      const result = await service.update(1, 1, updateDto);

      expect(result).toEqual(updated);
      expect(mockTx.review.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          rating: 4,
          comment: 'Cập nhật nhận xét',
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
      expect(mockRedis.del).toHaveBeenCalledWith('product:10');
    });
  });

  describe('remove', () => {
    it('should throw NotFoundException if review does not exist', async () => {
      mockPrisma.review.findUnique.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });

    it('should delete review, recalculate rating (reset to 0 if last review), and invalidate cache', async () => {
      mockPrisma.review.findUnique.mockResolvedValue({
        id: 1,
        productId: 10,
      });

      mockTx.review.delete.mockResolvedValue({ id: 1 });
      mockTx.review.aggregate.mockResolvedValue({
        _avg: { rating: null },
        _count: { id: 0 },
      });
      mockTx.product.update.mockResolvedValue({ id: 10, rating: 0, numReviews: 0 });

      const result = await service.remove(1);

      expect(result).toEqual({ success: true, message: 'Đã xóa đánh giá thành công' });
      expect(mockTx.review.delete).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockTx.product.update).toHaveBeenCalledWith({
        where: { id: 10 },
        data: { rating: 0, numReviews: 0 },
      });
      expect(mockRedis.del).toHaveBeenCalledWith('product:10');
    });
  });

  describe('findByProduct', () => {
    it('should return paginated reviews for a product', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({ id: 10 });
      mockPrisma.review.findMany.mockResolvedValue([
        { id: 1, rating: 5, comment: 'Tốt', userId: 1, productId: 10 },
      ]);
      mockPrisma.review.count.mockResolvedValue(1);

      const result = await service.findByProduct(10, { page: 1, limit: 10 });

      expect(result).toEqual({
        items: [{ id: 1, rating: 5, comment: 'Tốt', userId: 1, productId: 10 }],
        total: 1,
        page: 1,
        pages: 1,
      });
    });
  });
});
