// ponytail: Hiển thị CartItem rõ ràng, hỗ trợ variantId và thông tin SKU phân loại
import { Button } from '@/components/ui/button';
import { CartItem as CartItemType } from '@apps/shared/types/cart';
import { useCart } from '../context/cart-context';
import Image from 'next/image';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart();
  const itemId = item.variantId || Number(item.productId);
  const maxStock = Math.max(1, Math.min(item.countInStock || 10, 10));

  const variantLabel =
    item.sku ||
    (item.variant?.color || item.variant?.size
      ? [item.variant.color, item.variant.size].filter(Boolean).join(' - ')
      : null);

  return (
    <div className="flex items-center gap-4 rounded-lg border p-4 md:flex-col md:items-start">
      <div className="relative h-24 w-24 md:h-32 md:w-full bg-muted rounded-md overflow-hidden">
        <Image
          src={item.image || '/placeholder.png'}
          alt={item.name}
          fill
          className="object-cover rounded-md md:object-contain"
        />
      </div>
      <div className="flex flex-1 items-start justify-between gap-4 md:w-full md:flex-col">
        <div className="space-y-1">
          <Link
            href={`/products/${item.productId}`}
            className="font-medium hover:underline line-clamp-1"
          >
            {item.name}
          </Link>
          {variantLabel && (
            <p className="text-xs text-muted-foreground font-mono">
              Phân loại: {variantLabel}
            </p>
          )}
          <p className="text-sm text-muted-foreground">
            {formatPrice(item.price)}
          </p>
        </div>
        <div className="flex items-center gap-4 md:w-full md:justify-between">
          <Select
            value={item.qty.toString()}
            onValueChange={value => updateQuantity(itemId, Number(value))}
          >
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[...Array(maxStock)].map((_, i) => (
                <SelectItem key={i + 1} value={(i + 1).toString()}>
                  {i + 1}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-4">
            <span className="font-medium">
              {formatPrice(item.price * item.qty)}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeItem(itemId)}
              className="text-destructive hover:text-destructive"
            >
              Xóa
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
