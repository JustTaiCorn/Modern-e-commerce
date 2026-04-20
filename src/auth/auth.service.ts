import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma.service';
import { MailService } from 'src/mail/mail.service';
import { UsersService } from 'src/users/users.service';
import { RegisterDto } from './dto/register.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { hashPassword, verifyPassword } from 'src/utils/password';
import { plainToInstance } from 'class-transformer';
import { randomUUID } from 'crypto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
    private readonly usersService: UsersService,
  ) {}
  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.email }, { username: dto.username }],
      },
    });

    if (existingUser) {
      if (existingUser.email === dto.email) {
        throw new ConflictException('Email already in use');
      }
      throw new ConflictException('Username already taken');
    }
    const hashedPassword = await hashPassword(dto.password);
    const user = await this.prisma.user.create({
      data: {
        username: dto.username,
        email: dto.email,
        password: hashedPassword,
      },
    });

    const verificationToken = await this.prisma.verificationToken.create({
      data: {
        token: randomUUID(),
        userId: user.id,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    await this.mailService.sendVerificationEmail(
      user.email,
      user.username,
      verificationToken.token,
    );

    return {
      message:
        'Registration successful! Please check your email to verify your account.',
    };
  }

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user || !(await verifyPassword(user.password, password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isVerified) {
      throw new ForbiddenException(
        'Please verify your email before logging in',
      );
    }

    const { password: _password, ...result } = user;
    return result;
  }

  async login(user: { id: number }, deviceInfo?: string, ipAddress?: string) {
    const tokens = await this.generateTokens(user.id);
    await this.prisma.session.create({
      data: {
        refreshToken: tokens.refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        deviceInfo,
        ipAddress,
      },
    });

    return tokens;
  }

  async verifyEmail(token: string) {
    const verificationToken = await this.prisma.verificationToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!verificationToken) {
      throw new BadRequestException('Invalid verification token');
    }

    if (verificationToken.used) {
      throw new BadRequestException('This token has already been used');
    }

    if (verificationToken.expiresAt < new Date()) {
      throw new BadRequestException(
        'Verification token has expired. Please register again.',
      );
    }
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: verificationToken.userId },
        data: { isVerified: true },
      }),
      this.prisma.verificationToken.update({
        where: { id: verificationToken.id },
        data: { used: true },
      }),
    ]);

    return { message: 'Email verified successfully! You can now log in.' };
  }

  // ──────────────────── RESEND VERIFICATION EMAIL ────────────────────
  async resendVerificationEmail(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.isVerified) {
      throw new BadRequestException('Email is already verified');
    }

    // Invalidate old tokens
    await this.prisma.verificationToken.updateMany({
      where: { userId: user.id, used: false },
      data: { used: true },
    });

    // Create new token
    const verificationToken = await this.prisma.verificationToken.create({
      data: {
        token: randomUUID(),
        userId: user.id,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    await this.mailService.sendVerificationEmail(
      user.email,
      user.username,
      verificationToken.token,
    );

    return { message: 'Verification email sent. Please check your inbox.' };
  }
  async refreshTokens(oldRefreshToken: string) {
    const session = await this.prisma.session.findUnique({
      where: { refreshToken: oldRefreshToken },
      include: { user: true },
    });

    if (!session) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    if (session.revokedAt) {
      this.logger.warn(
        `Reuse of revoked refresh token detected for user ${session.userId}. Revoking all sessions.`,
      );
      await this.prisma.session.updateMany({
        where: { userId: session.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      throw new UnauthorizedException(
        'Suspicious activity detected. All sessions revoked. Please log in again.',
      );
    }

    if (session.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token has expired');
    }

    const tokens = await this.generateTokens(session.userId);

    await this.prisma.$transaction([
      this.prisma.session.update({
        where: { id: session.id },
        data: { revokedAt: new Date() },
      }),
      this.prisma.session.create({
        data: {
          refreshToken: tokens.refreshToken,
          userId: session.userId,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          deviceInfo: session.deviceInfo,
          ipAddress: session.ipAddress,
        },
      }),
    ]);

    return tokens;
  }
  async logout(refreshToken: string) {
    const session = await this.prisma.session.findUnique({
      where: { refreshToken },
    });

    if (session && !session.revokedAt) {
      await this.prisma.session.update({
        where: { id: session.id },
        data: { revokedAt: new Date() },
      });
    }

    return { message: 'Logged out successfully' };
  }

  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          select: {
            role: {
              select: { name: true },
            },
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }
  private async generateTokens(userId: number) {
    const payload = { sub: userId };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      }),
    ]);

    return { accessToken, refreshToken };
  }
}
