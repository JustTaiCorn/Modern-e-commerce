import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { RedisService } from 'src/redis/redis.service';
import { slugify } from 'src/utils/slug';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async create(dto: CreateCategoryDto) {
    const slug = dto.slug ? slugify(dto.slug) : slugify(dto.name);

    const existing = await this.prisma.category.findFirst({
      where: { OR: [{ name: dto.name }, { slug }] },
    });
    if (existing) {
      throw new ConflictException('Category name already exists');
    }

    const category = await this.prisma.category.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description,
        imageUrl: dto.imageUrl,
        parentId: dto.parentId ? Number(dto.parentId) : undefined,
        isActive: dto.isActive !== undefined ? Boolean(dto.isActive) : true,
      },
      include: { parent: true, children: true },
    });

    // ponytail: Xóa cache danh sách danh mục khi thêm mới
    await this.redis.del('categories:all');
    return category;
  }

  // ponytail: Cache danh sách danh mục
  findAll() {
    return this.redis.getOrSet('categories:all', 300, () =>
      this.prisma.category.findMany({
        include: { parent: true, children: true },
        orderBy: { createdAt: 'desc' },
      }),
    );
  }

  // ponytail: Cache chi tiết danh mục 24h
  async findOne(id: number) {
    return this.redis.getOrSet(`category:${id}`, 86400, async () => {
      const category = await this.prisma.category.findUnique({
        where: { id },
        include: { parent: true, children: true },
      });
      if (!category) throw new NotFoundException(`Category #${id} not found`);
      return category;
    });
  }

  async findBySlug(slug: string) {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      include: { parent: true, children: true },
    });
    if (!category) throw new NotFoundException(`Category "${slug}" not found`);
    return category;
  }

  async update(id: number, dto: UpdateCategoryDto) {
    await this.findOne(id);

    const data: UpdateCategoryDto = { ...dto };
    if (dto.slug) data.slug = slugify(dto.slug);
    else if (dto.name) data.slug = slugify(dto.name);

    if (data.slug || dto.name) {
      const taken = await this.prisma.category.findFirst({
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

    const updated = await this.prisma.category.update({
      where: { id },
      data: {
        ...data,
        parentId:
          data.parentId !== undefined
            ? data.parentId
              ? Number(data.parentId)
              : null
            : undefined,
        isActive:
          data.isActive !== undefined ? Boolean(data.isActive) : undefined,
      },
      include: { parent: true, children: true },
    });
    // ponytail: Xóa cache khi cập nhật danh mục
    await this.redis.del('categories:all', `category:${id}`);
    return updated;
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.category.delete({ where: { id } });
    // ponytail: Xóa cache khi xóa danh mục
    await this.redis.del('categories:all', `category:${id}`);
    return { message: `Category #${id} deleted successfully` };
  }
}
