import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

export interface SimilarProductResult {
  id: number;
  name: string;
  slug: string;
  rating: number;
  content: string;
  distance: number;
}

export interface SimilarDocumentResult {
  title: string;
  category: string;
  content: string;
  distance: number;
}

@Injectable()
export class VectorStoreService {
  private readonly logger = new Logger(VectorStoreService.name);

  constructor(private readonly prisma: PrismaService) {}

  private toVectorString(embedding: number[]): string {
    return JSON.stringify(embedding);
  }

  async upsertProductEmbedding(
    productId: number,
    content: string,
    embedding: number[],
  ): Promise<void> {
    try {
      const vectorStr = this.toVectorString(embedding);
      await this.prisma.$executeRawUnsafe(
        `INSERT INTO "product_embeddings" ("productId", "content", "embedding", "updatedAt")
VALUES ($1, $2, $3::vector, NOW())
ON CONFLICT ("productId")
DO UPDATE SET "content" = EXCLUDED."content", "embedding" = EXCLUDED."embedding", "updatedAt" = NOW();`,
        productId,
        content,
        vectorStr,
      );
    } catch (error) {
      this.logger.error(
        `Failed to upsert product embedding for productId ${productId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async upsertStoreDocument(
    title: string,
    category: string,
    content: string,
    embedding: number[],
  ): Promise<void> {
    try {
      const vectorStr = this.toVectorString(embedding);
      await this.prisma.$executeRawUnsafe(
        `INSERT INTO "store_documents" ("title", "category", "content", "embedding", "createdAt", "updatedAt")
VALUES ($1, $2, $3, $4::vector, NOW(), NOW());`,
        title,
        category,
        content,
        vectorStr,
      );
    } catch (error) {
      this.logger.error(
        `Failed to upsert store document "${title}": ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async searchSimilarProducts(
    embedding: number[],
    limit = 4,
  ): Promise<SimilarProductResult[]> {
    try {
      const vectorStr = this.toVectorString(embedding);
      const rows = await this.prisma.$queryRawUnsafe<any[]>(
        `SELECT p.id, p.name, p.slug, p.rating, pe.content,
       (pe.embedding <=> $1::vector) AS distance
FROM "product_embeddings" pe
JOIN "products" p ON p.id = pe."productId"
ORDER BY pe.embedding <=> $1::vector ASC
LIMIT $2;`,
        vectorStr,
        limit,
      );

      return (rows || []).map((row) => ({
        id: Number(row.id),
        name: row.name,
        slug: row.slug,
        rating: Number(row.rating),
        content: row.content,
        distance: Number(row.distance),
      }));
    } catch (error) {
      this.logger.error(
        `Failed to search similar products: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async searchSimilarDocuments(
    embedding: number[],
    maxDistance = 0.45,
    limit = 2,
  ): Promise<SimilarDocumentResult[]> {
    try {
      const vectorStr = this.toVectorString(embedding);
      const rows = await this.prisma.$queryRawUnsafe<any[]>(
        `SELECT title, category, content, (embedding <=> $1::vector) AS distance
FROM "store_documents"
WHERE (embedding <=> $1::vector) < $2
ORDER BY distance ASC
LIMIT $3;`,
        vectorStr,
        maxDistance,
        limit,
      );

      return (rows || []).map((row) => ({
        title: row.title,
        category: row.category,
        content: row.content,
        distance: Number(row.distance),
      }));
    } catch (error) {
      this.logger.error(
        `Failed to search similar documents: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
