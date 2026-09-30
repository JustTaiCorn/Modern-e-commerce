import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CloudinaryService } from 'src/cloudinary/services/cloudinary.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';

@Injectable()
export class CouponsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async findAll() {
    return this.prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAvailable(userId?: number, orderTotal?: number) {
    const now = new Date();
    const where: any = {
      isActive: true,
      OR: [{ startsAt: null }, { startsAt: { lte: now } }],
      AND: [{ OR: [{ endsAt: null }, { endsAt: { gte: now } }] }],
    };

    if (orderTotal !== undefined && orderTotal > 0) {
      where.AND.push({
        OR: [{ minOrderTotal: null }, { minOrderTotal: { lte: orderTotal } }],
      });
    }

    return this.prisma.coupon.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const coupon = await this.prisma.coupon.findUnique({ where: { id } });
    if (!coupon) throw new NotFoundException(`Coupon #${id} not found`);
    return coupon;
  }

  async findByCode(code: string) {
    const coupon = await this.prisma.coupon.findUnique({ where: { code } });
    if (!coupon) throw new NotFoundException(`Coupon code "${code}" not found`);
    return coupon;
  }

  async create(dto: CreateCouponDto) {
    const code = dto.code.trim().toUpperCase();
    const existing = await this.prisma.coupon.findUnique({ where: { code } });
    if (existing) {
      throw new ConflictException(`Coupon code "${code}" already exists`);
    }

    return this.prisma.coupon.create({
      data: {
        code,
        name: dto.name,
        description: dto.description,
        value: dto.value,
        maxUses: dto.maxUses ? Number(dto.maxUses) : null,
        maxUsesPerUser: dto.maxUsesPerUser ? Number(dto.maxUsesPerUser) : null,
        minOrderTotal: dto.minOrderTotal ? Number(dto.minOrderTotal) : null,
        startsAt: dto.startsAt ? new Date(dto.startsAt) : null,
        endsAt: dto.endsAt ? new Date(dto.endsAt) : null,
        isActive: dto.isActive !== undefined ? Boolean(dto.isActive) : true,
        imageUrl: dto.imageUrl,
      },
    });
  }

  async update(id: number, dto: UpdateCouponDto) {
    await this.findOne(id);

    const data: any = { ...dto };
    if (dto.code) {
      const code = dto.code.trim().toUpperCase();
      const existing = await this.prisma.coupon.findFirst({
        where: { code, NOT: { id } },
      });
      if (existing) {
        throw new ConflictException(`Coupon code "${code}" already exists`);
      }
      data.code = code;
    }

    if (dto.startsAt) data.startsAt = new Date(dto.startsAt);
    if (dto.endsAt) data.endsAt = new Date(dto.endsAt);

    return this.prisma.coupon.update({
      where: { id },
      data,
    });
  }

  async uploadImage(id: number, file: Express.Multer.File) {
    await this.findOne(id);
    const uploadResult = await this.cloudinary.uploadImage(file);
    const imageUrl = (uploadResult as any).secure_url || uploadResult.url;

    return this.prisma.coupon.update({
      where: { id },
      data: { imageUrl },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.coupon.delete({ where: { id } });
    return { message: `Coupon #${id} deleted successfully` };
  }
}
