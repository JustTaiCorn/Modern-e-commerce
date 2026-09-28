import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressesService {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: number) {
    return this.prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async findOne(id: number) {
    const address = await this.prisma.address.findUnique({ where: { id } });
    if (!address) throw new NotFoundException(`Address #${id} not found`);
    return address;
  }

  async create(dto: CreateAddressDto) {
    if (dto.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId: dto.userId },
        data: { isDefault: false },
      });
    }

    return this.prisma.address.create({
      data: {
        userId: dto.userId,
        fullName: dto.fullName,
        phone: dto.phone,
        street: dto.street,
        ward: dto.ward,
        district: dto.district,
        province: dto.province,
        country: dto.country || 'Vietnam',
        isDefault: Boolean(dto.isDefault),
      },
    });
  }

  async update(id: number, dto: UpdateAddressDto) {
    const address = await this.findOne(id);

    if (dto.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId: address.userId },
        data: { isDefault: false },
      });
    }

    return this.prisma.address.update({
      where: { id },
      data: {
        ...dto,
      },
    });
  }

  async setDefault(id: number) {
    const address = await this.findOne(id);

    await this.prisma.address.updateMany({
      where: { userId: address.userId },
      data: { isDefault: false },
    });

    return this.prisma.address.update({
      where: { id },
      data: { isDefault: true },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.address.delete({ where: { id } });
    return { message: `Address #${id} deleted successfully` };
  }
}
