import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { hashPassword } from 'src/utils/password';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  private mapUser(user: any) {
    if (!user) return null;
    const { password: _p, roles, ...rest } = user;
    return {
      ...rest,
      fullName: rest.fullName || rest.username || 'Người dùng',
      roles: (roles || []).map((r: any) => r.role || r),
    };
  }

  async create(dto: CreateUserDto | any) {
    const username =
      dto.username?.trim() ||
      dto.email.split('@')[0] + '_' + Math.floor(1000 + Math.random() * 9000);

    const existing = await this.prisma.user.findFirst({
      where: { OR: [{ email: dto.email }, { username }] },
    });

    if (existing) {
      throw new ConflictException(
        existing.email === dto.email
          ? 'Email already in use'
          : 'Username already taken',
      );
    }

    const hashedPassword = await hashPassword(dto.password);

    const user = await this.prisma.user.create({
      data: {
        username,
        email: dto.email,
        password: hashedPassword,
        fullName: dto.fullName || username,
        phone: dto.phone,
        isActive: dto.isActive !== undefined ? dto.isActive : true,
        isVerified: true,
      },
      include: {
        roles: { include: { role: true } },
        addresses: true,
      },
    });

    // If roleIds or role specified
    if (dto.roleIds && Array.isArray(dto.roleIds) && dto.roleIds.length > 0) {
      for (const roleId of dto.roleIds) {
        await this.prisma.userRole.create({
          data: { userId: user.id, roleId },
        }).catch(() => {});
      }
    } else if (dto.role) {
      const roleName = String(dto.role).toUpperCase();
      let role = await this.prisma.role.findFirst({
        where: { name: { equals: roleName, mode: 'insensitive' } },
      });
      if (!role) {
        role = await this.prisma.role.create({ data: { name: roleName } });
      }
      await this.prisma.userRole.create({
        data: { userId: user.id, roleId: role.id },
      }).catch(() => {});
    }

    return this.findOne(user.id);
  }

  async createStaff(dto: any) {
    return this.create({
      ...dto,
      role: 'STAFF',
    });
  }

  async findAll() {
    const users = await this.prisma.user.findMany({
      include: {
        roles: { include: { role: true } },
        addresses: true,
      },
      orderBy: { id: 'asc' },
    });

    return users.map((u) => this.mapUser(u));
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        roles: { include: { role: true } },
        addresses: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }

    return this.mapUser(user);
  }

  async findById(id: number) {
    return this.findOne(id);
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        roles: { include: { role: true } },
        addresses: true,
      },
    });
  }

  async findByUserEmail(email: string) {
    return this.findByEmail(email);
  }

  async update(id: number, dto: UpdateUserDto | any) {
    await this.findOne(id);

    if (dto.username) {
      const taken = await this.prisma.user.findFirst({
        where: { username: dto.username, NOT: { id } },
      });
      if (taken) throw new ConflictException('Username already taken');
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        username: dto.username,
        fullName: dto.fullName,
        phone: dto.phone,
        bio: dto.bio,
        profile_img: dto.profile_img,
        isActive: dto.isActive !== undefined ? dto.isActive : undefined,
      },
      include: {
        roles: { include: { role: true } },
        addresses: true,
      },
    });

    return this.mapUser(updated);
  }

  async lockUser(id: number) {
    await this.findOne(id);
    const updated = await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
      include: {
        roles: { include: { role: true } },
        addresses: true,
      },
    });
    return this.mapUser(updated);
  }

  async unlockUser(id: number) {
    await this.findOne(id);
    const updated = await this.prisma.user.update({
      where: { id },
      data: { isActive: true },
      include: {
        roles: { include: { role: true } },
        addresses: true,
      },
    });
    return this.mapUser(updated);
  }

  async assignRole(id: number, rolePayload: { id?: number; name?: string; roleId?: number }) {
    await this.findOne(id);

    let targetRoleId = rolePayload.roleId || rolePayload.id;

    if (!targetRoleId && rolePayload.name) {
      const roleName = rolePayload.name.trim();
      let role = await this.prisma.role.findFirst({
        where: { name: { equals: roleName, mode: 'insensitive' } },
      });
      if (!role) {
        role = await this.prisma.role.create({ data: { name: roleName.toUpperCase() } });
      }
      targetRoleId = role.id;
    }

    if (!targetRoleId) {
      throw new BadRequestException('Role ID or name is required');
    }

    // Delete existing roles and assign the new role
    await this.prisma.userRole.deleteMany({
      where: { userId: id },
    });

    await this.prisma.userRole.create({
      data: {
        userId: id,
        roleId: targetRoleId,
      },
    });

    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.user.delete({ where: { id } });
    return { message: `User #${id} deleted successfully` };
  }
}
