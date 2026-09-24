import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { RedisService } from 'src/redis/redis.service';
import { slugify } from 'src/utils/slug';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';

@Injectable()
export class BrandsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async create(dto: CreateBrandDto) {
    const slug = dto.slug ? slugify(dto.slug) : slugify(dto.name);

    const existing = await this.prisma.brand.findFirst({
      where: { OR: [{ name: dto.name }, { slug }] },
    });
    if (existing) {
      throw new ConflictException(
        existing.name === dto.name
          ? 'Brand name already exists'
          : 'Brand slug already exists',
      );
    }

    const brand = await this.prisma.brand.create({
      data: { name: dto.name, slug, logoUrl: dto.logoUrl },
    });

    // ponytail: Xóa cache danh sách thương hiệu khi thêm mới
    await this.redis.del('brands:all');
    return brand;
  }

  // ponytail: Cache danh sách thương hiệu 24h cho bộ lọc
  findAll() {
    return this.redis.getOrSet('brands:all', 86400, () =>
      this.prisma.brand.findMany({ orderBy: { createdAt: 'desc' } }),
    );
  }

  // ponytail: Cache chi tiết thương hiệu 24h
  async findOne(id: number) {
    return this.redis.getOrSet(`brand:${id}`, 86400, async () => {
      const brand = await this.prisma.brand.findUnique({ where: { id } });
      if (!brand) throw new NotFoundException(`Brand #${id} not found`);
      return brand;
    });
  }

  async findBySlug(slug: string) {
    const brand = await this.prisma.brand.findUnique({ where: { slug } });
    if (!brand) throw new NotFoundException(`Brand "${slug}" not found`);
    return brand;
  }

  async update(id: number, dto: UpdateBrandDto) {
    await this.findOne(id);

    const data: any = { ...dto };
    if (dto.slug) data.slug = slugify(dto.slug);
    else if (dto.name) data.slug = slugify(dto.name);

    if (data.slug || dto.name) {
      const taken = await this.prisma.brand.findFirst({
        where: {
          NOT: { id },
          OR: [
            ...(dto.name ? [{ name: dto.name }] : []),
            ...(data.slug ? [{ slug: data.slug }] : []),
          ],
        },
      });
      if (taken) throw new ConflictException('Name or slug already taken');
    }

    const updated = await this.prisma.brand.update({ where: { id }, data });
    // ponytail: Xóa cache khi cập nhật thương hiệu
    await this.redis.del('brands:all', `brand:${id}`);
    return updated;
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.brand.delete({ where: { id } });
    // ponytail: Xóa cache khi xóa thương hiệu
    await this.redis.del('brands:all', `brand:${id}`);
    return { message: `Brand #${id} deleted successfully` };
  }
}
