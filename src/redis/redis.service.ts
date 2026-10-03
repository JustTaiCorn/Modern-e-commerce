import { Injectable, Logger, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnApplicationShutdown {
  private readonly client: Redis;
  private readonly logger = new Logger(RedisService.name);

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('REDIS_HOST') || 'localhost';
    const port = Number(this.configService.get<number>('REDIS_PORT')) || 6379;
    const password =
      this.configService.get<string>('REDIS_PASSWORD') || undefined;

    this.client = new Redis({
      host,
      port,
      password,
      lazyConnect: false,
      maxRetriesPerRequest: 3,
      enableOfflineQueue: true,
      retryStrategy: (times) => {
        const delay = Math.min(times * 200, 2000);
        return delay;
      },
    });

    this.client.on('connect', () => {
      this.logger.log(`Connected to Redis server at ${host}:${port}`);
    });

    this.client.on('error', (err) => {
      this.logger.warn(`Redis connection error: ${err.message}`);
    });
  }

  getClient(): Redis {
    return this.client;
  }

  async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (error) {
      this.logger.error(`Failed to get key "${key}": ${error.message}`);
      return null;
    }
  }

  async set(
    key: string,
    value: string | number,
    ttlSeconds?: number,
  ): Promise<'OK' | null> {
    try {
      if (ttlSeconds) {
        return await this.client.set(key, value, 'EX', ttlSeconds);
      }
      return await this.client.set(key, value);
    } catch (error) {
      this.logger.error(`Failed to set key "${key}": ${error.message}`);
      return null;
    }
  }

  async del(...keys: string[]): Promise<number> {
    try {
      return await this.client.del(...keys);
    } catch (error) {
      this.logger.error(
        `Failed to delete keys "${keys.join(', ')}": ${error.message}`,
      );
      return 0;
    }
  }

  async incr(key: string): Promise<number> {
    try {
      return await this.client.incr(key);
    } catch (error) {
      this.logger.error(`Failed to increment key "${key}": ${error.message}`);
      return 0;
    }
  }

  async expire(key: string, seconds: number): Promise<number> {
    try {
      return await this.client.expire(key, seconds);
    } catch (error) {
      this.logger.error(
        `Failed to set expire on key "${key}": ${error.message}`,
      );
      return 0;
    }
  }

  async ttl(key: string): Promise<number> {
    try {
      return await this.client.ttl(key);
    } catch (error) {
      this.logger.error(
        `Failed to get TTL for key "${key}": ${error.message}`,
      );
      return -1;
    }
  }

  // ponytail: Cache-aside helper tối giản — đọc từ Redis, miss thì gọi DB và lưu JSON
  async getOrSet<T>(
    key: string,
    ttlSeconds: number,
    fetcher: () => Promise<T>,
  ): Promise<T> {
    try {
      const cached = await this.client.get(key);
      if (cached) {
        return JSON.parse(cached) as T;
      }
    } catch (error) {
      this.logger.warn(
        `Redis get cache error on key "${key}": ${error.message}`,
      );
    }

    const result = await fetcher();

    if (result !== null && result !== undefined) {
      try {
        await this.client.set(key, JSON.stringify(result), 'EX', ttlSeconds);
      } catch (error) {
        this.logger.warn(
          `Redis set cache error on key "${key}": ${error.message}`,
        );
      }
    }

    return result;
  }

  async onApplicationShutdown() {
    this.logger.log('Closing Redis connection...');
    await this.client.quit();
  }
}
