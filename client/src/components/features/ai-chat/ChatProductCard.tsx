import React, { useState } from 'react';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { ChatProductItem } from '@/types/ai-chat';

export interface ChatProductCardProps {
  product: ChatProductItem;
}

export const ChatProductCard: React.FC<ChatProductCardProps> = ({ product }) => {
  const [imgError, setImgError] = useState(false);

  const productUrl = `/products/${product.slug || product.id}`;
  const formattedPrice =
    typeof product.price === 'number'
      ? `${product.price.toLocaleString('vi-VN')} đ`
      : 'Liên hệ';
  const ratingValue =
    typeof product.rating === 'number' && !isNaN(product.rating)
      ? product.rating.toFixed(1)
      : '5.0';

  return (
    <div className="flex items-center gap-3 p-2.5 rounded-xl border border-border bg-card text-card-foreground shadow-sm hover:shadow-md hover:border-primary/40 transition-all duration-200 group">
      {/* Thumbnail */}
      <div className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-muted/60 flex items-center justify-center border border-border/40">
        {!imgError && product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-muted-foreground text-[10px] text-center p-1 font-medium bg-muted">
            No Image
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <h4
          className="text-xs font-medium text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors"
          title={product.name}
        >
          {product.name}
        </h4>

        <div className="flex items-center justify-between gap-1.5 mt-1.5">
          <span className="text-xs font-bold text-primary whitespace-nowrap">
            {formattedPrice}
          </span>
          <div className="flex items-center gap-0.5 text-[11px] text-amber-500 font-medium whitespace-nowrap">
            <span>★</span>
            <span>{ratingValue}</span>
          </div>
        </div>

        <div className="mt-2 flex justify-end">
          <Link
            href={productUrl}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-colors shadow-xs"
          >
            <span>Xem chi tiết</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ChatProductCard;
