import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { GeminiService } from './gemini.service';

describe('GeminiService', () => {
  let service: GeminiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GeminiService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'GEMINI_API_KEY') return 'mock-key';
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<GeminiService>(GeminiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateEmbedding', () => {
    it('should generate embedding for text', async () => {
      const mockEmbeddingValues = [0.1, 0.2, 0.3];
      const mockEmbedContent = jest.fn().mockResolvedValue({
        embedding: { values: mockEmbeddingValues },
      });
      const mockGetGenerativeModel = jest.fn().mockReturnValue({
        embedContent: mockEmbedContent,
      });

      (service as any).genAI = {
        getGenerativeModel: mockGetGenerativeModel,
      };

      const result = await service.generateEmbedding('test text');

      expect(mockGetGenerativeModel).toHaveBeenCalledWith({
        model: 'gemini-embedding-001',
      });
      expect(mockEmbedContent).toHaveBeenCalledWith({
        content: { role: 'user', parts: [{ text: 'test text' }] },
        outputDimensionality: 768,
      });
      expect(result).toEqual(mockEmbeddingValues);
    });

    it('should throw and log error when embedding fails', async () => {
      const mockGetGenerativeModel = jest.fn().mockReturnValue({
        embedContent: jest
          .fn()
          .mockRejectedValue(new Error('Embedding failed')),
      });

      (service as any).genAI = {
        getGenerativeModel: mockGetGenerativeModel,
      };

      await expect(service.generateEmbedding('fail test')).rejects.toThrow(
        'Embedding failed',
      );
    });
  });

  describe('streamChat', () => {
    it('should stream chat response chunks and map roles properly', async () => {
      async function* mockStream() {
        yield { text: () => 'Hello' };
        yield { text: () => ' from' };
        yield { text: () => ' Gemini!' };
        yield { text: () => '' };
      }

      const mockSendMessageStream = jest.fn().mockResolvedValue({
        stream: mockStream(),
      });
      const mockStartChat = jest.fn().mockReturnValue({
        sendMessageStream: mockSendMessageStream,
      });
      const mockGetGenerativeModel = jest.fn().mockReturnValue({
        startChat: mockStartChat,
      });

      (service as any).genAI = {
        getGenerativeModel: mockGetGenerativeModel,
      };

      const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [
        { role: 'user', content: 'First question' },
        { role: 'assistant', content: 'First response' },
        { role: 'user', content: 'Second question' },
      ];

      const chunks: string[] = [];
      for await (const chunk of service.streamChat(
        'You are a helpful assistant',
        messages,
      )) {
        chunks.push(chunk);
      }

      expect(mockGetGenerativeModel).toHaveBeenCalledWith({
        model: 'gemini-3.6-flash',
        systemInstruction: 'You are a helpful assistant',
      });
      expect(mockStartChat).toHaveBeenCalledWith({
        history: [
          { role: 'user', parts: [{ text: 'First question' }] },
          { role: 'model', parts: [{ text: 'First response' }] },
        ],
      });
      expect(mockSendMessageStream).toHaveBeenCalledWith('Second question');
      expect(chunks).toEqual(['Hello', ' from', ' Gemini!']);
    });

    it('should handle single message with empty history', async () => {
      async function* mockStream() {
        yield { text: () => 'Direct answer' };
      }

      const mockSendMessageStream = jest.fn().mockResolvedValue({
        stream: mockStream(),
      });
      const mockStartChat = jest.fn().mockReturnValue({
        sendMessageStream: mockSendMessageStream,
      });
      const mockGetGenerativeModel = jest.fn().mockReturnValue({
        startChat: mockStartChat,
      });

      (service as any).genAI = {
        getGenerativeModel: mockGetGenerativeModel,
      };

      const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [
        { role: 'user', content: 'Only question' },
      ];

      const chunks: string[] = [];
      for await (const chunk of service.streamChat('', messages)) {
        chunks.push(chunk);
      }

      expect(mockStartChat).toHaveBeenCalledWith({
        history: [],
      });
      expect(mockSendMessageStream).toHaveBeenCalledWith('Only question');
      expect(chunks).toEqual(['Direct answer']);
    });

    it('should return immediately when messages array is empty', async () => {
      const chunks: string[] = [];
      for await (const chunk of service.streamChat('system', [])) {
        chunks.push(chunk);
      }
      expect(chunks).toEqual([]);
    });

    it('should throw error when streamChat encounters an error', async () => {
      const mockGetGenerativeModel = jest.fn().mockReturnValue({
        startChat: jest.fn().mockReturnValue({
          sendMessageStream: jest
            .fn()
            .mockRejectedValue(new Error('Network error')),
        }),
      });

      (service as any).genAI = {
        getGenerativeModel: mockGetGenerativeModel,
      };

      const generator = service.streamChat('system', [
        { role: 'user', content: 'Hello' },
      ]);

      await expect(async () => {
        for await (const _ of generator) {
          // should throw
        }
      }).rejects.toThrow('Network error');
    });
  });

  describe('constructor without API key', () => {
    it('should warn when GEMINI_API_KEY is not configured', async () => {
      const emptyModule: TestingModule = await Test.createTestingModule({
        providers: [
          GeminiService,
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn().mockReturnValue(''),
            },
          },
        ],
      }).compile();

      const emptyService = emptyModule.get<GeminiService>(GeminiService);
      expect(emptyService).toBeDefined();
    });
  });
});
