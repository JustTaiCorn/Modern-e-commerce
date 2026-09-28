import { Module } from '@nestjs/common';
import { CouponsController } from './coupons.controller';
import { CouponsService } from './coupons.service';
import { PrismaService } from 'src/prisma.service';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  imports: [CloudinaryModule],
  controllers: [CouponsController],
  providers: [CouponsService, PrismaService],
  exports: [CouponsService],
})
export class CouponsModule {}
