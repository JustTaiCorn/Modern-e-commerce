import { Injectable, Optional } from '@nestjs/common';
import { RedisService } from './redis/redis.service';

@Injectable()
export class AppService {
  constructor(@Optional() private readonly redisService?: RedisService) {}

  getHello(): string {
    return 'Hello World!';
  }

  async getHealth() {
    let redisStatus = 'disconnected';
    if (this.redisService) {
      try {
        const pong = await this.redisService.getClient().ping();
        if (pong === 'PONG') {
          redisStatus = 'connected';
        }
      } catch {
        redisStatus = 'disconnected';
      }
    }

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      redis: redisStatus,
    };
  }
}
