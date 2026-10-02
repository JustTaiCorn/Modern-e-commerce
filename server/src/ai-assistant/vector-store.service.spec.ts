import { Test, TestingModule } from '@nestjs/testing';
import { VectorStoreService } from './vector-store.service';
import { PrismaService } from '../prisma.service';

describe('VectorStoreService', () => {
  let service: VectorStoreService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    $executeRawUnsafe: jest.fn(),
    $queryRawUnsafe: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VectorStoreService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<VectorStoreService>(VectorStoreService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(prismaService).toBeDefined();
  });

  describe('upsertProductEmbedding', () => {
    const productId = 42;
    const content = 'Test Product Description';
    const embedding = [0.1, 0.2, 0.3, 0.4];

    it('should execute INSERT INTO product_embeddings with correct parameters', async () => {
      mockPrismaService.$executeRawUnsafe.mockResolvedValue(1);

      await service.upsertProductEmbedding(productId, content, embedding);

      expect(mockPrismaService.$executeRawUnsafe).toHaveBeenCalledTimes(1);
      expect(mockPrismaService.$executeRawUnsafe).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO "product_embeddings"'),
        productId,
        content,
        JSON.stringify(embedding),
      );
      expect(mockPrismaService.$executeRawUnsafe).toHaveBeenCalledWith(
        expect.stringContaining('ON CONFLICT ("productId")'),
        productId,
        content,
        JSON.stringify(embedding),
      );
    });

    it('should throw and log error when database query fails', async () => {
      const dbError = new Error('Database connection failed');
      mockPrismaService.$executeRawUnsafe.mockRejectedValue(dbError);

      await expect(
        service.upsertProductEmbedding(productId, content, embedding),
      ).rejects.toThrow('Database connection failed');
    });
  });

  describe('upsertStoreDocument', () => {
    const title = 'Return Policy';
    const category = 'POLICY';
    const content = 'Full return policy details...';
    const embedding = [0.05, 0.15, 0.25];

    it('should execute INSERT INTO store_documents with correct parameters', async () => {
      mockPrismaService.$executeRawUnsafe.mockResolvedValue(1);

      await service.upsertStoreDocument(title, category, content, embedding);

      expect(mockPrismaService.$executeRawUnsafe).toHaveBeenCalledTimes(1);
      expect(mockPrismaService.$executeRawUnsafe).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO "store_documents"'),
        title,
        category,
        content,
        JSON.stringify(embedding),
      );
    });

    it('should throw and log error when database query fails', async () => {
      const dbError = new Error('Insert document failed');
      mockPrismaService.$executeRawUnsafe.mockRejectedValue(dbError);

      await expect(
        service.upsertStoreDocument(title, category, content, embedding),
      ).rejects.toThrow('Insert document failed');
    });
  });

  describe('searchSimilarProducts', () => {
    const embedding = [0.1, 0.2, 0.3];

    it('should search similar products with default limit of 4 and map results properly', async () => {
      const mockRows = [
        {
          id: 1,
          name: 'Nike Air Max',
          slug: 'nike-air-max',
          rating: '4.8',
          content: 'Running shoes',
          distance: '0.12',
        },
        {
          id: '2',
          name: 'Adidas Ultraboost',
          slug: 'adidas-ultraboost',
          rating: 4.5,
          content: 'Comfortable trainers',
          distance: 0.24,
        },
      ];

      mockPrismaService.$queryRawUnsafe.mockResolvedValue(mockRows);

      const results = await service.searchSimilarProducts(embedding);

      expect(mockPrismaService.$queryRawUnsafe).toHaveBeenCalledTimes(1);
      expect(mockPrismaService.$queryRawUnsafe).toHaveBeenCalledWith(
        expect.stringContaining(
          'SELECT p.id, p.name, p.slug, p.rating, pe.content',
        ),
        JSON.stringify(embedding),
        4,
      );
      expect(results).toEqual([
        {
          id: 1,
          name: 'Nike Air Max',
          slug: 'nike-air-max',
          rating: 4.8,
          content: 'Running shoes',
          distance: 0.12,
        },
        {
          id: 2,
          name: 'Adidas Ultraboost',
          slug: 'adidas-ultraboost',
          rating: 4.5,
          content: 'Comfortable trainers',
          distance: 0.24,
        },
      ]);
    });

    it('should allow custom limit parameter', async () => {
      mockPrismaService.$queryRawUnsafe.mockResolvedValue([]);

      const results = await service.searchSimilarProducts(embedding, 10);

      expect(mockPrismaService.$queryRawUnsafe).toHaveBeenCalledWith(
        expect.any(String),
        JSON.stringify(embedding),
        10,
      );
      expect(results).toEqual([]);
    });

    it('should handle null or undefined rows gracefully by returning empty array', async () => {
      mockPrismaService.$queryRawUnsafe.mockResolvedValue(null);

      const results = await service.searchSimilarProducts(embedding);

      expect(results).toEqual([]);
    });

    it('should throw and log error when query fails', async () => {
      const dbError = new Error('Failed to query products');
      mockPrismaService.$queryRawUnsafe.mockRejectedValue(dbError);

      await expect(service.searchSimilarProducts(embedding)).rejects.toThrow(
        'Failed to query products',
      );
    });
  });

  describe('searchSimilarDocuments', () => {
    const embedding = [0.1, 0.2, 0.3];

    it('should search similar documents with default maxDistance = 0.45 and limit = 2', async () => {
      const mockRows = [
        {
          title: 'Return Policy',
          category: 'POLICY',
          content: 'Policy text here',
          distance: '0.15',
        },
      ];

      mockPrismaService.$queryRawUnsafe.mockResolvedValue(mockRows);

      const results = await service.searchSimilarDocuments(embedding);

      expect(mockPrismaService.$queryRawUnsafe).toHaveBeenCalledTimes(1);
      expect(mockPrismaService.$queryRawUnsafe).toHaveBeenCalledWith(
        expect.stringContaining(
          'SELECT title, category, content, (embedding <=> $1::vector) AS distance',
        ),
        JSON.stringify(embedding),
        0.45,
        2,
      );
      expect(results).toEqual([
        {
          title: 'Return Policy',
          category: 'POLICY',
          content: 'Policy text here',
          distance: 0.15,
        },
      ]);
    });

    it('should allow custom maxDistance and limit parameters', async () => {
      mockPrismaService.$queryRawUnsafe.mockResolvedValue([]);

      const results = await service.searchSimilarDocuments(embedding, 0.3, 5);

      expect(mockPrismaService.$queryRawUnsafe).toHaveBeenCalledWith(
        expect.any(String),
        JSON.stringify(embedding),
        0.3,
        5,
      );
      expect(results).toEqual([]);
    });

    it('should handle null or undefined rows gracefully by returning empty array', async () => {
      mockPrismaService.$queryRawUnsafe.mockResolvedValue(null);

      const results = await service.searchSimilarDocuments(embedding);

      expect(results).toEqual([]);
    });

    it('should throw and log error when query fails', async () => {
      const dbError = new Error('Failed to query documents');
      mockPrismaService.$queryRawUnsafe.mockRejectedValue(dbError);

      await expect(service.searchSimilarDocuments(embedding)).rejects.toThrow(
        'Failed to query documents',
      );
    });
  });
});
