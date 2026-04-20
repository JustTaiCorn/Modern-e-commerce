import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { hashPassword } from 'src/utils/password';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

const PUBLIC_FIELDS = {
  id: true,
  username: true,
  email: true,
  bio: true,
  profile_img: true,
  isVerified: true,
  created_at: true,
};

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    const existing = await this.prisma.user.findFirst({
      where: { OR: [{ email: dto.email }, { username: dto.username }] },
    });

    if (existing) {
      throw new ConflictException(
        existing.email === dto.email
          ? 'Email already in use'
          : 'Username already taken',
      );
    }

    const hashedPassword = await hashPassword(dto.password);

    return this.prisma.user.create({
      data: {
        username: dto.username,
        email: dto.email,
        password: hashedPassword,
      },
      select: PUBLIC_FIELDS,
    });
  }

  async findAll() {
    return this.prisma.user.findMany({ select: PUBLIC_FIELDS });
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: PUBLIC_FIELDS,
    });

    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }

    return user;
  }

  async findById(id: number) {
    return this.findOne(id);
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findByUserEmail(email: string) {
    return this.findByEmail(email);
  }

  async update(id: number, dto: UpdateUserDto) {
    await this.findOne(id);

    if (dto.username) {
      const taken = await this.prisma.user.findFirst({
        where: { username: dto.username, NOT: { id } },
      });
      if (taken) throw new ConflictException('Username already taken');
    }

    return this.prisma.user.update({
      where: { id },
      data: dto,
      select: PUBLIC_FIELDS,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.user.delete({ where: { id } });
    return { message: `User #${id} deleted successfully` };
  }
}
