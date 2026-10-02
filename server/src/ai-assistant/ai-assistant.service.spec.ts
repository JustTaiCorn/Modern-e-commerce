import { Test, TestingModule } from '@nestjs/testing';
import { AiAssistantService } from './ai-assistant.service';
import { GeminiService } from './gemini.service';
import { VectorStoreService } from './vector-store.service';
import { PrismaService } from '../prisma.service';

describe('AiAssistantService', () => {
  let service: AiAssistantService;
  let prismaService: any;
  let geminiService: any;
  let vectorStoreService: any;

  const mockProduct = {
    id: 1,
    name: 'Áo Thun Thể Thao Nam',
    slug: 'ao-thun-the-thao-nam',
    description: '<p>Chất liệu <b>cotton thoáng mát</b>, co giãn 4 chiều.</p>',
    rating: 4.8,
    numReviews: 25,
    category: { name: 'Áo Nam' },
    brand: { name: 'Coolmate' },
    variants: [
      {
        id: 101,
        sku: 'AT-DEN-M',
        price: 150000,
        attributeValues: [
          {
            attributeValue: {
              value: 'Đen',
              displayName: 'Màu Đen',
              colorHex: '#000000',
              type: { name: 'Color' },
            },
          },
          {
            attributeValue: {
              value: 'M',
              displayName: 'Size M',
              type: { name: 'Size' },
            },
          },
        ],
      },
      {
        id: 102,
        sku: 'AT-TRANG-L',
        price: 180000,
        attributeValues: [
          {
            attributeValue: {
              value: 'Trắng',
              displayName: 'Màu Trắng',
              colorHex: '#ffffff',
              type: { name: 'Color' },
            },
          },
          {
            attributeValue: {
              value: 'L',
              displayName: 'Size L',
              type: { name: 'Size' },
            },
          },
        ],
      },
    ],
  };

  beforeEach(async () => {
    prismaService = {
      product: {
        findUnique: jest.fn().mockResolvedValue(mockProduct),
        findMany: jest.fn().mockResolvedValue([{ id: 1 }, { id: 2 }]),
      },
      storeDocument: {
        count: jest.fn().mockResolvedValue(5),
      },
    };

    geminiService = {
      generateEmbedding: jest.fn().mockResolvedValue(new Array(768).fill(0.1)),
    };

    vectorStoreService = {
      upsertProductEmbedding: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiAssistantService,
        {
          provide: PrismaService,
          useValue: prismaService,
        },
        {
          provide: GeminiService,
          useValue: geminiService,
        },
        {
          provide: VectorStoreService,
          useValue: vectorStoreService,
        },
      ],
    }).compile();

    service = module.get<AiAssistantService>(AiAssistantService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('buildProductContent', () => {
    it('should format rich product content correctly with prices, colors, sizes, and ratings', () => {
      const content = service.buildProductContent(mockProduct);

      expect(content).toContain('Tên sản phẩm: Áo Thun Thể Thao Nam');
      expect(content).toContain('Thương hiệu: Coolmate');
      expect(content).toContain('Danh mục: Áo Nam');
      expect(content).toContain('Khoảng giá: 150.000 - 180.000 VNĐ');
      expect(content).toContain('Màu Đen');
      expect(content).toContain('Màu Trắng');
      expect(content).toContain('Size M');
      expect(content).toContain('Size L');
      expect(content).toContain('Đánh giá: 4.8/5 sao (25 lượt đánh giá)');
      expect(content).toContain(
        'Chất liệu cotton thoáng mát, co giãn 4 chiều.',
      );
      expect(content).not.toContain('<p>');
      expect(content).not.toContain('<b>');
    });

    it('should format single price when min and max prices are equal', () => {
      const singlePriceProduct = {
        name: 'Quần Jean',
        brand: { name: 'Levis' },
        category: { name: 'Quần Nam' },
        variants: [{ price: 500000 }],
        rating: 5,
        numReviews: 10,
        description: 'Quần bò',
      };

      const content = service.buildProductContent(singlePriceProduct);
      expect(content).toContain('Khoảng giá: 500.000 VNĐ');
      expect(content).not.toContain(' - 500.000');
    });

    it('should handle products with missing optional fields gracefully', () => {
      const minimalProduct = {
        name: 'Sản Phẩm Đơn Giản',
      };

      const content = service.buildProductContent(minimalProduct);
      expect(content).toContain('Tên sản phẩm: Sản Phẩm Đơn Giản');
      expect(content).toContain('Thương hiệu: Chính hãng');
      expect(content).toContain('Danh mục: Sản phẩm');
      expect(content).toContain('Khoảng giá: Liên hệ');
      expect(content).toContain('Đánh giá: 0.0/5 sao (0 lượt đánh giá)');
      expect(content).toContain('Mô tả chi tiết: Không có mô tả');
    });

    it('should support legacy or test variants.attributes format', () => {
      const legacyProduct = {
        name: 'Áo Polo',
        category: { name: 'Áo Nam' },
        brand: { name: 'Coolmate' },
        variants: [
          {
            price: 200000,
            attributes: [{ value: 'Đen' }, { value: 'XL' }],
          },
        ],
        rating: 4.5,
        numReviews: 12,
        description: 'Chất vải cá sấu',
      };

      const content = service.buildProductContent(legacyProduct);
      expect(content).toContain('Áo Polo');
      expect(content).toContain('200.000 VNĐ');
      expect(content).toContain('Đen');
      expect(content).toContain('XL');
    });

    it('should truncate long descriptions exceeding 500 characters', () => {
      const longDesc = 'A'.repeat(600);
      const productWithLongDesc = {
        name: 'Áo Sơ Mi',
        description: longDesc,
      };

      const content = service.buildProductContent(productWithLongDesc);
      expect(content).toContain('A'.repeat(500) + '...');
      expect(content).not.toContain('A'.repeat(501));
    });
  });

  describe('syncProductEmbedding', () => {
    it('should fetch product, build content, generate embedding, and upsert embedding', async () => {
      await service.syncProductEmbedding(1);

      expect(prismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          brand: true,
          category: true,
          variants: {
            include: {
              attributeValues: {
                include: {
                  attributeValue: {
                    include: {
                      type: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      expect(geminiService.generateEmbedding).toHaveBeenCalledTimes(1);
      expect(geminiService.generateEmbedding).toHaveBeenCalledWith(
        expect.stringContaining('Áo Thun Thể Thao Nam'),
      );

      expect(vectorStoreService.upsertProductEmbedding).toHaveBeenCalledTimes(
        1,
      );
      expect(vectorStoreService.upsertProductEmbedding).toHaveBeenCalledWith(
        1,
        expect.stringContaining('Áo Thun Thể Thao Nam'),
        expect.any(Array),
      );
    });

    it('should handle non-existent product gracefully without calling embedding service', async () => {
      prismaService.product.findUnique.mockResolvedValueOnce(null);

      await service.syncProductEmbedding(999);

      expect(prismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: 999 },
        include: expect.any(Object),
      });
      expect(geminiService.generateEmbedding).not.toHaveBeenCalled();
      expect(vectorStoreService.upsertProductEmbedding).not.toHaveBeenCalled();
    });

    it('should catch errors safely and not throw when an error occurs during sync (non-blocking)', async () => {
      geminiService.generateEmbedding.mockRejectedValueOnce(
        new Error('Gemini API quota exceeded'),
      );

      await expect(service.syncProductEmbedding(1)).resolves.not.toThrow();
    });
  });

  describe('reindexAll', () => {
    it('should loop through all products, call syncProductEmbedding, and return indexed counts', async () => {
      const syncSpy = jest
        .spyOn(service, 'syncProductEmbedding')
        .mockResolvedValue(undefined);

      const result = await service.reindexAll();

      expect(prismaService.product.findMany).toHaveBeenCalledWith({
        select: { id: true },
      });
      expect(syncSpy).toHaveBeenCalledTimes(2);
      expect(syncSpy).toHaveBeenCalledWith(1);
      expect(syncSpy).toHaveBeenCalledWith(2);
      expect(prismaService.storeDocument.count).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        indexedProducts: 2,
        indexedDocuments: 5,
      });

      syncSpy.mockRestore();
    });

    it('should continue indexing remaining products even if one sync fails', async () => {
      const syncSpy = jest
        .spyOn(service, 'syncProductEmbedding')
        .mockRejectedValueOnce(new Error('Sync failed for product 1'))
        .mockResolvedValueOnce(undefined);

      const result = await service.reindexAll();

      expect(syncSpy).toHaveBeenCalledTimes(2);
      expect(result.indexedProducts).toBe(1);
      expect(result.indexedDocuments).toBe(5);

      syncSpy.mockRestore();
    });
  });
});
