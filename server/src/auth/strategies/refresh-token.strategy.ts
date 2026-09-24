import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Request } from 'express';
import { cookieConfig } from 'src/utils/cookie.config';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: (req: Request) => {
        return req?.cookies?.[cookieConfig.refresh.name] ?? null;
      },
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_REFRESH_SECRET'),
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: { sub: number }) {
    const refreshToken = req.cookies?.[cookieConfig.refresh.name];
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }
    return {
      ...payload,
      refreshToken,
    };
  }
}
