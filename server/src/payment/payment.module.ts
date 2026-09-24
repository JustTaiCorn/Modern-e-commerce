import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { SepayService } from './sepay.service';
import { PrismaService } from '../prisma.service';

@Module({
  imports: [ConfigModule],
  controllers: [PaymentController],
  providers: [PaymentService, SepayService, PrismaService],
  exports: [PaymentService, SepayService],
})
export class PaymentModule {}
