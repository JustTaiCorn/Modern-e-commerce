import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
  Req,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AccessTokenGuard } from './guards/access-token.guard';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { cookieConfig } from 'src/utils/cookie.config';
import { ResponseMessage } from 'src/decorator/customize';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @ApiOperation({ summary: 'Login with email and password' })
  @ResponseMessage('Login successful')
  async login(
    @Body() _loginDto: LoginDto,
    @Req() req: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = req.user as { id: number; email: string };
    const tokens = await this.authService.login(
      user,
      req.headers['user-agent'],
      req.ip,
    );

    const { name, options } = cookieConfig.refresh;
    res.cookie(name, tokens.refreshToken, options);

    return {
      accessToken: tokens.accessToken,
    };
  }

  @Get('verify-email')
  @ApiOperation({ summary: 'Verify email with token' })
  @ApiQuery({
    name: 'token',
    required: true,
    description: 'Verification token (UUID)',
  })
  async verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resend verification email' })
  async resendVerification(@Body('email') email: string) {
    return this.authService.resendVerificationEmail(email);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RefreshTokenGuard)
  @ResponseMessage('Token refreshed successfully')
  @ApiOperation({ summary: 'Refresh access token using refresh token cookie' })
  async refreshTokens(
    @Req() req: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = req.user as { sub: number; refreshToken: string };
    const tokens = await this.authService.refreshTokens(user.refreshToken);

    const { name, options } = cookieConfig.refresh;
    res.cookie(name, tokens.refreshToken, options);

    return {
      accessToken: tokens.accessToken,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Logged out successfully')
  @ApiOperation({ summary: 'Logout and revoke session' })
  async logout(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    const { name, options } = cookieConfig.refresh;
    const refreshToken = req.cookies?.[name];

    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }

    res.clearCookie(name, options);

    return {};
  }

  @Get('me')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  async getMe(@Req() req: any) {
    const user = req.user as { userId: number };
    return this.authService.getProfile(user.userId);
  }
}
