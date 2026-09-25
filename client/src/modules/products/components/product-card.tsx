import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Product } from '@apps/shared/types';
import { formatPrice } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  // ponytail: Trích xuất an toàn id, ảnh chính và giá theo chuẩn Prisma backend
  const productId = product.id ?? product._id;
  const imageRaw =
    product.images?.find((img) => img.isMain)?.url || product.images?.[0];
  const imageUrl =
    typeof imageRaw === 'object' && imageRaw !== null ? imageRaw.url : imageRaw || '/placeholder.png';
  const price =
    product.minPrice !== undefined
      ? product.minPrice
      : (product.price ?? product.variants?.[0]?.price ?? 0);
  const rating = Number(product.rating) || 0;
  const numReviews = product.numReviews || 0;

  return (
    <Link href={`/products/${productId}`}>
      <Card className="h-full overflow-hidden transition-colors hover:bg-accent">
        <div className="relative aspect-square">
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 20vw, (min-width: 768px) 25vw, (min-width: 640px) 33vw, 50vw"
          />
        </div>
        <div className="p-4 border-t border-border">
          <h3 className="font-medium">{product.name}</h3>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-lg font-bold">{formatPrice(Number(price))}</p>
            <div className="flex items-center gap-1">
              <span>⭐</span>
              <span className="text-sm text-muted-foreground">
                {rating.toFixed(1)} ({numReviews})
              </span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
