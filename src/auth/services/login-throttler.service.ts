import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class LoginThrottlerService {
  private readonly logger = new Logger(LoginThrottlerService.name);

  // Cấu hình: Tối đa 5 lần thử sai, khóa trong 15 phút (900 giây)
  readonly MAX_FAILED_ATTEMPTS = 5;
  readonly LOCKOUT_TIME_SECONDS = 900;
  readonly ATTEMPTS_TTL_SECONDS = 900;

  constructor(private readonly redisService: RedisService) {}

  private getLockKey(email: string): string {
    return `auth:login:lock:${email}`;
  }

  private getAttemptsKey(email: string): string {
    return `auth:login:attempts:${email}`;
  }

  /**
   * Kiểm tra xem tài khoản có đang trong thời gian bị khóa hay không.
   * Nếu đang bị khóa -> ném lỗi HTTP 429 Too Many Requests kèm số phút còn lại.
   */
  async checkLockout(email: string): Promise<void> {
    const lockKey = this.getLockKey(email);
    const isLocked = await this.redisService.get(lockKey);

    if (isLocked) {
      const remainingTtl = await this.redisService.ttl(lockKey);
      const remainingMinutes = Math.max(1, Math.ceil(remainingTtl / 60));

      this.logger.warn(
        `Blocked login attempt for locked account: ${email} (${remainingMinutes}m remaining)`,
      );

      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: `Tài khoản tạm thời bị khóa do nhập sai mật khẩu quá ${this.MAX_FAILED_ATTEMPTS} lần. Vui lòng thử lại sau ${remainingMinutes} phút.`,
          error: 'Too Many Requests',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  /**
   * Ghi nhận 1 lần đăng nhập thất bại.
   * - Nếu chạm ngưỡng 5 lần -> Kích hoạt khóa 15 phút và ném HTTP 429.
   * - Nếu chưa chạm ngưỡng -> Ném UnauthorizedException kèm số lần thử còn lại.
   */
  async recordFailedAttempt(email: string): Promise<never> {
    const attemptsKey = this.getAttemptsKey(email);
    const lockKey = this.getLockKey(email);

    const attempts = await this.redisService.incr(attemptsKey);

    // Đặt TTL cho lần đầu tiên nhập sai
    if (attempts === 1) {
      await this.redisService.expire(attemptsKey, this.ATTEMPTS_TTL_SECONDS);
    }

    // Nếu đạt ngưỡng tối đa -> Khóa tài khoản
    if (attempts >= this.MAX_FAILED_ATTEMPTS) {
      await this.redisService.set(lockKey, '1', this.LOCKOUT_TIME_SECONDS);
      await this.redisService.del(attemptsKey);

      this.logger.warn(
        `Account locked for 15 minutes due to ${attempts} failed login attempts: ${email}`,
      );

      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: `Bạn đã nhập sai mật khẩu ${this.MAX_FAILED_ATTEMPTS} lần liên tiếp. Tài khoản của bạn đã bị tạm khóa trong 15 phút.`,
          error: 'Too Many Requests',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Nếu chưa chạm ngưỡng -> Cảnh báo số lần thử còn lại
    const remainingAttempts = this.MAX_FAILED_ATTEMPTS - attempts;
    this.logger.warn(
      `Failed login attempt (${attempts}/${this.MAX_FAILED_ATTEMPTS}) for: ${email}`,
    );

    throw new UnauthorizedException(
      `Thông tin đăng nhập không chính xác. Bạn còn ${remainingAttempts} lần thử trước khi tài khoản bị tạm khóa 15 phút.`,
    );
  }

  /**
   * Đăng nhập thành công -> Xóa bộ đếm số lần sai và cờ khóa
   */
  async resetAttempts(email: string): Promise<void> {
    const attemptsKey = this.getAttemptsKey(email);
    const lockKey = this.getLockKey(email);
    await this.redisService.del(attemptsKey, lockKey);
  }
}
