import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { GeminiService } from './gemini.service';
import { VectorStoreService } from './vector-store.service';

@Injectable()
export class AiAssistantService {
  private readonly logger = new Logger(AiAssistantService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly geminiService: GeminiService,
    private readonly vectorStoreService: VectorStoreService,
  ) {}

  /**
   * Builds clean, structured text in Vietnamese summarizing product details:
   * - Tên sản phẩm, Thương hiệu, Danh mục
   * - Khoảng giá (min - max từ variants)
   * - Màu sắc và Size (trích xuất từ variants.attributeValues.attributeValue hoặc variants.attributes)
   * - Đánh giá (rating / 5 sao, số lượt đánh giá)
   * - Mô tả chi tiết (tóm tắt mô tả)
   */
  buildProductContent(product: any): string {
    const brandName = product.brand?.name || product.brand || 'Chính hãng';
    const categoryName =
      product.category?.name || product.category || 'Sản phẩm';

    const variants = Array.isArray(product.variants) ? product.variants : [];
    const prices = variants
      .map((v: any) => Number(v.price))
      .filter((p: number) => !isNaN(p) && p > 0);

    let priceText = 'Liên hệ';
    if (prices.length > 0) {
      const minPrice = Math.min(...prices).toLocaleString('vi-VN');
      const maxPrice = Math.max(...prices).toLocaleString('vi-VN');
      priceText =
        minPrice === maxPrice
          ? `${minPrice} VNĐ`
          : `${minPrice} - ${maxPrice} VNĐ`;
    }

    const colors = new Set<string>();
    const sizes = new Set<string>();

    const colorKeywords =
      /^(đen|trắng|đỏ|xanh|vàng|hồng|tím|cam|xám|nâu|be|black|white|red|blue|yellow|pink|purple|orange|gray|grey|brown|beige|navy)/i;
    const sizeKeywords =
      /^(xxs|xs|s|m|l|xl|xxl|2xl|3xl|4xl|freesize|[0-9]{2})$/i;

    variants.forEach((v: any) => {
      const attrs = v.attributeValues || v.attributes || [];
      attrs.forEach((attrOrAv: any) => {
        const val = attrOrAv.attributeValue || attrOrAv;
        if (val) {
          const text = (val.displayName || val.value || '').trim();
          if (!text) return;

          const typeName = (
            val.type?.name ||
            val.attributeType?.name ||
            ''
          ).toLowerCase();
          const isColor =
            Boolean(val.colorHex) ||
            typeName === 'color' ||
            typeName === 'màu' ||
            typeName === 'màu sắc' ||
            typeName === 'mau' ||
            colorKeywords.test(text);

          const isSize =
            typeName === 'size' ||
            typeName === 'kích cỡ' ||
            typeName === 'kích thước' ||
            typeName === 'kich co' ||
            sizeKeywords.test(text);

          if (isColor) {
            colors.add(text);
          } else if (isSize) {
            sizes.add(text);
          } else {
            sizes.add(text);
          }
        }
      });
    });

    const colorsText =
      colors.size > 0 ? Array.from(colors).join(', ') : 'Đa dạng';
    const sizesText =
      sizes.size > 0 ? Array.from(sizes).join(', ') : 'Tiêu chuẩn';

    const rating = Number(product.rating || 0).toFixed(1);
    const numReviews = Number(product.numReviews || 0);

    const rawDesc = (product.description || '').replace(/<[^>]*>/g, '').trim();
    const description =
      rawDesc.length > 500
        ? rawDesc.substring(0, 500) + '...'
        : rawDesc || 'Không có mô tả';

    return [
      `Tên sản phẩm: ${product.name}`,
      `Thương hiệu: ${brandName} | Danh mục: ${categoryName}`,
      `Khoảng giá: ${priceText}`,
      colors.size > 0 ? `Màu sắc: ${colorsText}` : '',
      sizes.size > 0 ? `Kích cỡ: ${sizesText}` : '',
      `Đánh giá: ${rating}/5 sao (${numReviews} lượt đánh giá)`,
      `Mô tả chi tiết: ${description}`,
    ]
      .filter(Boolean)
      .join('\n');
  }

  /**
   * Fetches product with brand, category, variants.attributeValues.attributeValue.
   * Builds content, generates embedding via geminiService.generateEmbedding(content),
   * and calls vectorStoreService.upsertProductEmbedding(productId, content, embedding).
   * Catches and logs error safely (non-blocking).
   */
  async syncProductEmbedding(productId: number): Promise<void> {
    try {
      const product = await this.prisma.product.findUnique({
        where: { id: productId },
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

      if (!product) {
        this.logger.warn(`Product #${productId} not found for embedding sync`);
        return;
      }

      const content = this.buildProductContent(product);
      const embedding = await this.geminiService.generateEmbedding(content);
      await this.vectorStoreService.upsertProductEmbedding(
        product.id,
        content,
        embedding,
      );
      this.logger.log(
        `Synced embedding for product #${productId}: ${product.name}`,
      );
    } catch (error) {
      this.logger.error(
        `Error syncing product embedding for product #${productId}: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Loops through all products, syncs their embeddings, and returns counts.
   */
  async reindexAll(): Promise<{
    indexedProducts: number;
    indexedDocuments: number;
  }> {
    try {
      const products = await this.prisma.product.findMany({
        select: { id: true },
      });

      let indexedProducts = 0;
      for (const product of products) {
        try {
          await this.syncProductEmbedding(product.id);
          indexedProducts++;
        } catch (err) {
          this.logger.error(
            `Failed indexing product #${product.id}: ${err.message}`,
            err.stack,
          );
        }
      }

      const indexedDocuments = this.prisma.storeDocument
        ? await this.prisma.storeDocument.count()
        : 0;

      this.logger.log(
        `Reindexing completed: ${indexedProducts} products synced, ${indexedDocuments} store documents`,
      );

      return { indexedProducts, indexedDocuments };
    } catch (error) {
      this.logger.error(
        `Error during reindexAll: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
