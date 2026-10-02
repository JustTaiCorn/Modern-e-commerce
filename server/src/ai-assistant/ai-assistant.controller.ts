import { Controller, Post, Body, Res, Logger } from '@nestjs/common';
import { Response } from 'express';
import { ChatRequestDto } from './dto/chat-request.dto';
import { GeminiService } from './gemini.service';
import { VectorStoreService } from './vector-store.service';
import { AiAssistantService } from './ai-assistant.service';
import { PrismaService } from '../prisma.service';

@Controller('api/ai')
export class AiAssistantController {
  private readonly logger = new Logger(AiAssistantController.name);

  constructor(
    private readonly geminiService: GeminiService,
    private readonly vectorStoreService: VectorStoreService,
    private readonly aiAssistantService: AiAssistantService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('chat')
  async chat(@Body() dto: ChatRequestDto, @Res() res: Response) {
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    if (typeof (res as any).flushHeaders === 'function') {
      (res as any).flushHeaders();
    }

    try {
      const messages = dto?.messages || [];
      const latestMessage = messages[messages.length - 1]?.content || '';

      // 1. Generate Query Vector
      const queryVector =
        await this.geminiService.generateEmbedding(latestMessage);

      // 2. Vector Semantic Search
      const [topProducts, topDocs] = await Promise.all([
        this.vectorStoreService.searchSimilarProducts(queryVector, 4),
        this.vectorStoreService.searchSimilarDocuments(queryVector, 0.45, 2),
      ]);

      // 3. Fetch full product preview metadata
      const productIds = topProducts.map((p) => p.id);
      const detailedProducts =
        productIds.length > 0
          ? await this.prisma.product.findMany({
              where: { id: { in: productIds } },
              include: {
                images: { where: { isMain: true }, take: 1 },
                variants: { take: 1 },
              },
            })
          : [];

      const recommendedProducts = detailedProducts.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: p.variants?.[0]?.price ? Number(p.variants[0].price) : 0,
        imageUrl: p.images?.[0]?.url || '',
        rating: Number(p.rating || 5),
      }));

      // Send initial metadata event
      res.write(
        `event: metadata\ndata: ${JSON.stringify({ products: recommendedProducts })}\n\n`,
      );

      // 4. Build Context
      const productContext = topProducts
        .map((p) => `- ID: ${p.id} | ${p.content}`)
        .join('\n');
      const policyContext = topDocs
        .map((d) => `[${d.category} - ${d.title}]: ${d.content}`)
        .join('\n\n');

      const currentProductContext = dto?.currentProductId
        ? `\nKhách hàng hiện đang xem sản phẩm có ID: ${dto.currentProductId}.`
        : '';

      const systemPrompt = `
Bạn là Trợ lý Mua sắm Thông minh & Thân thiện của cửa hàng Modern Shop.
Nhiệm vụ: Tư vấn sản phẩm, giải đáp thắc mắc về size, màu sắc và chính sách mua sắm.${currentProductContext}

=== DỮ LIỆU SẢN PHẨM PHÙ HỢP TỪ KHO HÀNG (CONTEXT) ===
${productContext || 'Không tìm thấy sản phẩm sát với tiêu chí.'}

=== CHÍNH SÁCH CỬA HÀNG LIÊN QUAN ===
${policyContext || 'Không có tài liệu chính sách liên quan.'}

=== NGUYÊN TẮC BẮT BUỘC (GUARDRAILS) ===
1. CHÂN THỰC: Chỉ tư vấn dựa trên CONTEXT được cung cấp. Tuyệt đối không tự bịa đặt sản phẩm, giá cả, mã giảm giá hoặc chính sách không có.
2. NẾU KHÔNG CÓ HÀNG: Lịch sự thông báo và gợi ý các sản phẩm gần nhất trong danh sách.
3. PHONG CÁCH: Thân thiện, chu đáo, viết tiếng Việt tự nhiên, dùng Markdown dễ đọc (bullet points, in đậm tên sản phẩm và giá).
4. GẮN THẺ SẢN PHẨM: Khi bạn nhắc đến một sản phẩm cụ thể để giới thiệu cho khách, hãy chèn mã [PRODUCT:id] vào câu.
`;

      // 5. Stream LLM Response
      for await (const chunk of this.geminiService.streamChat(
        systemPrompt,
        messages,
      )) {
        res.write(`event: chunk\ndata: ${JSON.stringify({ text: chunk })}\n\n`);
      }

      res.write('event: end\ndata: {}\n\n');
      res.end();
    } catch (error) {
      this.logger.error(
        `Error in chat streaming: ${error.message}`,
        error.stack,
      );
      if (!res.writableEnded) {
        res.write(
          `event: error\ndata: ${JSON.stringify({
            message: 'Có lỗi xảy ra, vui lòng thử lại sau.',
          })}\n\n`,
        );
        res.end();
      }
    }
  }

  @Post('reindex')
  async reindex() {
    return this.aiAssistantService.reindexAll();
  }
}
