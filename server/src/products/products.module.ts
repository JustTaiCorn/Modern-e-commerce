import { Module, forwardRef } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { InventoriesController } from './inventories.controller';
import { ProductsService } from './products.service';
import { PrismaService } from '../prisma.service';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { AiAssistantModule } from '../ai-assistant/ai-assistant.module';

@Module({
  imports: [CloudinaryModule, forwardRef(() => AiAssistantModule)],
  controllers: [ProductsController, InventoriesController],
  providers: [ProductsService, PrismaService],
  exports: [ProductsService],
})
export class ProductsModule {}
