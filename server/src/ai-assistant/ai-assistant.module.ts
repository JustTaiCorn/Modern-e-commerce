import { Module } from '@nestjs/common';
import { AiAssistantController } from './ai-assistant.controller';
import { AiAssistantService } from './ai-assistant.service';
import { GeminiService } from './gemini.service';
import { VectorStoreService } from './vector-store.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [AiAssistantController],
  providers: [
    AiAssistantService,
    GeminiService,
    VectorStoreService,
    PrismaService,
  ],
  exports: [AiAssistantService, GeminiService, VectorStoreService],
})
export class AiAssistantModule {}
