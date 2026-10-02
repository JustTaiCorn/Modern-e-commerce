import { Test, TestingModule } from '@nestjs/testing';
import { AiAssistantController } from './ai-assistant.controller';
import { GeminiService } from './gemini.service';
import { VectorStoreService } from './vector-store.service';
import { AiAssistantService } from './ai-assistant.service';
import { PrismaService } from '../prisma.service';
import { ChatRequestDto } from './dto/chat-request.dto';

describe('AiAssistantController', () => {
  let controller: AiAssistantController;
  let geminiService: jest.Mocked<GeminiService>;
  let vectorStoreService: jest.Mocked<VectorStoreService>;
  let aiAssistantService: jest.Mocked<AiAssistantService>;
  let prismaService: any;

  const mockQueryVector = [0.1, 0.2, 0.3];

  const mockSimilarProducts = [
    {
      id: 1,
      name: 'Áo Polo Nam Trắng',
      slug: 'ao-polo-nam-trang',
      rating: 4.8,
      content: 'Tên sản phẩm: Áo Polo Nam Trắng\nKhoảng giá: 250.000 VNĐ',
      distance: 0.12,
    },
    {
      id: 2,
      name: 'Áo Thun Cổ Tròn',
      slug: 'ao-thun-co-tron',
      rating: 4.5,
      content: 'Tên sản phẩm: Áo Thun Cổ Tròn\nKhoảng giá: 180.000 VNĐ',
      distance: 0.25,
    },
  ];

  const mockSimilarDocuments = [
    {
      title: 'Chính sách đổi trả',
      category: 'Chính sách',
      content: 'Đổi trả miễn phí trong vòng 30 ngày.',
      distance: 0.2,
    },
  ];

  const mockDetailedProducts = [
    {
      id: 1,
      name: 'Áo Polo Nam Trắng',
      slug: 'ao-polo-nam-trang',
      rating: 4.8,
      images: [{ url: 'https://img.com/polo.jpg', isMain: true }],
      variants: [{ price: 250000 }],
    },
    {
      id: 2,
      name: 'Áo Thun Cổ Tròn',
      slug: 'ao-thun-co-tron',
      rating: 4.5,
      images: [{ url: 'https://img.com/tshirt.jpg', isMain: true }],
      variants: [{ price: 180000 }],
    },
  ];

  const createMockResponse = () => {
    const headers: Record<string, string> = {};
    const writes: string[] = [];

    const res: any = {
      setHeader: jest.fn((key: string, value: string) => {
        headers[key] = value;
      }),
      flushHeaders: jest.fn(),
      write: jest.fn((chunk: string) => {
        writes.push(chunk);
        return true;
      }),
      end: jest.fn(() => {
        res.writableEnded = true;
      }),
      headers,
      writes,
      writableEnded: false,
    };
    return res;
  };

  beforeEach(async () => {
    const mockGemini = {
      generateEmbedding: jest.fn(),
      streamChat: jest.fn(),
    };

    const mockVectorStore = {
      searchSimilarProducts: jest.fn(),
      searchSimilarDocuments: jest.fn(),
      upsertProductEmbedding: jest.fn(),
      upsertStoreDocument: jest.fn(),
    };

    const mockAiAssistant = {
      buildProductContent: jest.fn(),
      syncProductEmbedding: jest.fn(),
      reindexAll: jest.fn(),
    };

    const mockPrisma = {
      product: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
      storeDocument: {
        count: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AiAssistantController],
      providers: [
        { provide: GeminiService, useValue: mockGemini },
        { provide: VectorStoreService, useValue: mockVectorStore },
        { provide: AiAssistantService, useValue: mockAiAssistant },
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    controller = module.get<AiAssistantController>(AiAssistantController);
    geminiService = module.get(GeminiService);
    vectorStoreService = module.get(VectorStoreService);
    aiAssistantService = module.get(AiAssistantService);
    prismaService = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('chat', () => {
    it('should set SSE headers and stream the full RAG chat flow', async () => {
      const res = createMockResponse();
      const dto: ChatRequestDto = {
        messages: [
          { role: 'user', content: 'Tư vấn áo polo nam cho mình với' },
        ],
      };

      geminiService.generateEmbedding.mockResolvedValue(mockQueryVector);
      vectorStoreService.searchSimilarProducts.mockResolvedValue(
        mockSimilarProducts,
      );
      vectorStoreService.searchSimilarDocuments.mockResolvedValue(
        mockSimilarDocuments,
      );
      prismaService.product.findMany.mockResolvedValue(mockDetailedProducts);

      async function* fakeStream() {
        yield 'Chào bạn! ';
        yield 'Dưới đây là một số mẫu áo polo ';
        yield 'chất lượng tại Modern Shop.';
      }
      geminiService.streamChat.mockImplementation(fakeStream);

      await controller.chat(dto, res);

      // Verify headers
      expect(res.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'text/event-stream; charset=utf-8',
      );
      expect(res.setHeader).toHaveBeenCalledWith(
        'Cache-Control',
        'no-cache, no-transform',
      );
      expect(res.setHeader).toHaveBeenCalledWith('Connection', 'keep-alive');
      expect(res.flushHeaders).toHaveBeenCalled();

      // Verify embedding and retrieval calls
      expect(geminiService.generateEmbedding).toHaveBeenCalledWith(
        'Tư vấn áo polo nam cho mình với',
      );
      expect(vectorStoreService.searchSimilarProducts).toHaveBeenCalledWith(
        mockQueryVector,
        4,
      );
      expect(vectorStoreService.searchSimilarDocuments).toHaveBeenCalledWith(
        mockQueryVector,
        0.45,
        2,
      );
      expect(prismaService.product.findMany).toHaveBeenCalledWith({
        where: { id: { in: [1, 2] } },
        include: {
          images: { where: { isMain: true }, take: 1 },
          variants: { take: 1 },
        },
      });

      // Verify metadata event written
      const metadataWrite = res.writes.find((w: string) =>
        w.startsWith('event: metadata'),
      );
      expect(metadataWrite).toBeDefined();
      expect(metadataWrite).toContain('Áo Polo Nam Trắng');
      expect(metadataWrite).toContain('250000');
      expect(metadataWrite).toContain('https://img.com/polo.jpg');

      // Verify systemPrompt passed to streamChat
      expect(geminiService.streamChat).toHaveBeenCalledWith(
        expect.stringContaining(
          'Bạn là Trợ lý Mua sắm Thông minh & Thân thiện',
        ),
        dto.messages,
      );
      const systemPromptArg = geminiService.streamChat.mock.calls[0][0];
      expect(systemPromptArg).toContain('CHÂN THỰC');
      expect(systemPromptArg).toContain('[PRODUCT:id]');
      expect(systemPromptArg).toContain('Chính sách đổi trả');

      // Verify chunks written
      const chunkWrites = res.writes.filter((w: string) =>
        w.startsWith('event: chunk'),
      );
      expect(chunkWrites).toHaveLength(3);
      expect(chunkWrites[0]).toContain('Chào bạn!');
      expect(chunkWrites[1]).toContain('Dưới đây là một số mẫu áo polo');
      expect(chunkWrites[2]).toContain('chất lượng tại Modern Shop.');

      // Verify end event and response closed
      const endWrite = res.writes.find((w: string) =>
        w.startsWith('event: end'),
      );
      expect(endWrite).toBeDefined();
      expect(res.end).toHaveBeenCalled();
    });

    it('should include currentProductId in prompt when provided', async () => {
      const res = createMockResponse();
      const dto: ChatRequestDto = {
        messages: [{ role: 'user', content: 'Sản phẩm này có màu gì?' }],
        currentProductId: 99,
      };

      geminiService.generateEmbedding.mockResolvedValue(mockQueryVector);
      vectorStoreService.searchSimilarProducts.mockResolvedValue([]);
      vectorStoreService.searchSimilarDocuments.mockResolvedValue([]);

      async function* emptyStream() {
        yield 'Sản phẩm có màu trắng và đen.';
      }
      geminiService.streamChat.mockImplementation(emptyStream);

      await controller.chat(dto, res);

      expect(geminiService.streamChat).toHaveBeenCalledWith(
        expect.stringContaining('99'),
        dto.messages,
      );
      expect(res.end).toHaveBeenCalled();
    });

    it('should handle empty search results gracefully', async () => {
      const res = createMockResponse();
      const dto: ChatRequestDto = {
        messages: [{ role: 'user', content: 'Tìm kiếm sản phẩm lạ' }],
      };

      geminiService.generateEmbedding.mockResolvedValue(mockQueryVector);
      vectorStoreService.searchSimilarProducts.mockResolvedValue([]);
      vectorStoreService.searchSimilarDocuments.mockResolvedValue([]);

      async function* fakeStream() {
        yield 'Không tìm thấy sản phẩm phù hợp.';
      }
      geminiService.streamChat.mockImplementation(fakeStream);

      await controller.chat(dto, res);

      // Verify metadata with empty products list
      const metadataWrite = res.writes.find((w: string) =>
        w.startsWith('event: metadata'),
      );
      expect(metadataWrite).toBe('event: metadata\ndata: {"products":[]}\n\n');

      // Fallback context in system prompt
      const systemPromptArg = geminiService.streamChat.mock.calls[0][0];
      expect(systemPromptArg).toContain(
        'Không tìm thấy sản phẩm sát với tiêu chí.',
      );
      expect(systemPromptArg).toContain(
        'Không có tài liệu chính sách liên quan.',
      );

      expect(res.end).toHaveBeenCalled();
    });

    it('should catch error in embedding/search and emit error event', async () => {
      const res = createMockResponse();
      const dto: ChatRequestDto = {
        messages: [{ role: 'user', content: 'Lỗi phát sinh' }],
      };

      geminiService.generateEmbedding.mockRejectedValue(
        new Error('Gemini API Failure'),
      );

      await controller.chat(dto, res);

      const errorWrite = res.writes.find((w: string) =>
        w.startsWith('event: error'),
      );
      expect(errorWrite).toBeDefined();
      expect(errorWrite).toContain('Có lỗi xảy ra, vui lòng thử lại sau.');
      expect(res.end).toHaveBeenCalled();
    });

    it('should catch error in streamChat generator and emit error event', async () => {
      const res = createMockResponse();
      const dto: ChatRequestDto = {
        messages: [{ role: 'user', content: 'Lỗi khi stream' }],
      };

      geminiService.generateEmbedding.mockResolvedValue(mockQueryVector);
      vectorStoreService.searchSimilarProducts.mockResolvedValue([]);
      vectorStoreService.searchSimilarDocuments.mockResolvedValue([]);

      // Generator that yields then throws
      async function* failingStream() {
        yield 'Bắt đầu...';
        throw new Error('Stream connection dropped');
      }
      geminiService.streamChat.mockImplementation(failingStream);

      await controller.chat(dto, res);

      const errorWrite = res.writes.find((w: string) =>
        w.startsWith('event: error'),
      );
      expect(errorWrite).toBeDefined();
      expect(errorWrite).toContain('Có lỗi xảy ra, vui lòng thử lại sau.');
      expect(res.end).toHaveBeenCalled();
    });
  });

  describe('reindex', () => {
    it('should trigger reindexing and return counts', async () => {
      aiAssistantService.reindexAll.mockResolvedValue({
        indexedProducts: 15,
        indexedDocuments: 3,
      });

      const result = await controller.reindex();

      expect(aiAssistantService.reindexAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        indexedProducts: 15,
        indexedDocuments: 3,
      });
    });
  });
});
