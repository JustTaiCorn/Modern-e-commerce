import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class SizesService {
  constructor(private readonly prisma: PrismaService) {}

  private async getOrCreateSizeType() {
    let type = await this.prisma.productAttributeType.findFirst({
      where: { name: { equals: 'Size', mode: 'insensitive' } },
    });

    if (!type) {
      type = await this.prisma.productAttributeType.create({
        data: { name: 'Size' },
      });
    }

    return type;
  }

  async findAll() {
    const type = await this.getOrCreateSizeType();
    const values = await this.prisma.productAttributeValue.findMany({
      where: { typeId: type.id },
      orderBy: { id: 'asc' },
    });

    return values.map((v, idx) => ({
      id: v.id,
      name: v.displayName || v.value,
      code: v.value,
      sortOrder: idx + 1,
    }));
  }

  async findOne(id: number) {
    const value = await this.prisma.productAttributeValue.findUnique({
      where: { id },
    });
    if (!value) throw new NotFoundException(`Size #${id} not found`);

    return {
      id: value.id,
      name: value.displayName || value.value,
      code: value.value,
      sortOrder: value.id,
    };
  }

  async create(dto: { name: string; code: string; sortOrder?: number }) {
    const type = await this.getOrCreateSizeType();

    const value = await this.prisma.productAttributeValue.create({
      data: {
        typeId: type.id,
        value: dto.code || dto.name,
        displayName: dto.name,
      },
    });

    return {
      id: value.id,
      name: value.displayName || value.value,
      code: value.value,
      sortOrder: dto.sortOrder || value.id,
    };
  }

  async update(
    id: number,
    dto: { name?: string; code?: string; sortOrder?: number },
  ) {
    await this.findOne(id);

    const value = await this.prisma.productAttributeValue.update({
      where: { id },
      data: {
        displayName: dto.name,
        value: dto.code || dto.name,
      },
    });

    return {
      id: value.id,
      name: value.displayName || value.value,
      code: value.value,
      sortOrder: dto.sortOrder || value.id,
    };
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.productAttributeValue.delete({ where: { id } });
    return { message: `Size #${id} deleted successfully` };
  }
}
