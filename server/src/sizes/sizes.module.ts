import { Module } from '@nestjs/common';
import { SizesController } from './sizes.controller';
import { SizesService } from './sizes.service';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [SizesController],
  providers: [SizesService, PrismaService],
  exports: [SizesService],
})
export class SizesModule {}
