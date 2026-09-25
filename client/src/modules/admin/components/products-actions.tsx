'use client';

// ponytail: Xử lý thao tác sản phẩm Admin hỗ trợ cả ID số lẫn string
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { deleteProduct } from '@/modules/admin/actions/delete-product';
import type { Product } from '@apps/shared/types';

interface ProductsActionsProps {
  product: Product;
}

export function ProductsActions({ product }: ProductsActionsProps) {
  const router = useRouter();
  const productId = String(product.id ?? product._id ?? '');

  const handleDelete = async () => {
    if (!productId) return;
    if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      const result = await deleteProduct(productId);

      if (result.success) {
        toast({
          title: 'Thành công',
          description: result.message,
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Lỗi',
          description: result.message,
        });
      }
    }
  };

  return (
    <div className="space-x-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push(`/admin/products/${productId}/edit`)}
      >
        <Pencil className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="text-red-500 hover:text-red-600"
        onClick={handleDelete}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
