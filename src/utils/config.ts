import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

export const corsConfig = (): CorsOptions => ({
    origin: process.env.CLIENT_URL,
    methods: 'GET, POST, OPTIONS, PUT, PATCH, DELETE',
    credentials: true,
  });