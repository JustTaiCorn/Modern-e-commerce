import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class ColorsService {
  constructor(private readonly prisma: PrismaService) {}

  private async getOrCreateColorType() {
    let type = await this.prisma.productAttributeType.findFirst({
      where: { name: { equals: 'Color', mode: 'insensitive' } },
    });

    if (!type) {
      type = await this.prisma.productAttributeType.create({
        data: { name: 'Color' },
      });
    }

    return type;
  }

  async findAll() {
    const type = await this.getOrCreateColorType();
    const values = await this.prisma.productAttributeValue.findMany({
      where: { typeId: type.id },
      orderBy: { id: 'asc' },
    });

    return values.map((v) => ({
      id: v.id,
      name: v.displayName || v.value,
      code: v.colorHex || v.value,
    }));
  }

  async findOne(id: number) {
    const value = await this.prisma.productAttributeValue.findUnique({
      where: { id },
    });
    if (!value) throw new NotFoundException(`Color #${id} not found`);

    return {
      id: value.id,
      name: value.displayName || value.value,
      code: value.colorHex || value.value,
    };
  }

  async create(dto: { name: string; code: string }) {
    const type = await this.getOrCreateColorType();
    const hex = dto.code?.startsWith('#') ? dto.code : `#${dto.code}`;

    const value = await this.prisma.productAttributeValue.create({
      data: {
        typeId: type.id,
        value: dto.code || dto.name,
        displayName: dto.name,
        colorHex: hex,
      },
    });

    return {
      id: value.id,
      name: value.displayName || value.value,
      code: value.colorHex || value.value,
    };
  }

  async update(id: number, dto: { name?: string; code?: string }) {
    await this.findOne(id);
    const hex = dto.code
      ? dto.code.startsWith('#')
        ? dto.code
        : `#${dto.code}`
      : undefined;

    const value = await this.prisma.productAttributeValue.update({
      where: { id },
      data: {
        displayName: dto.name,
        colorHex: hex,
        value: dto.code || dto.name,
      },
    });

    return {
      id: value.id,
      name: value.displayName || value.value,
      code: value.colorHex || value.value,
    };
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.productAttributeValue.delete({ where: { id } });
    return { message: `Color #${id} deleted successfully` };
  }
}
