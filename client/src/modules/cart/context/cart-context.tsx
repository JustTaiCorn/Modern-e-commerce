'use client';

// ponytail: Quản lý CartContext gọn gàng, tương thích trực tiếp với NestJS Cart API và variantId
import { createContext, useContext, useState, useEffect } from 'react';
import { CartItem } from '@apps/shared/types/cart';
import { apiClient } from '@/lib/api-client';
import { useUser } from '@/modules/auth/hooks/use-user';
import { useToast } from '@/hooks/use-toast';

interface CartContextType {
  items: CartItem[];
  loading: boolean;
  addItem: (
    variantId: number,
    qty: number,
    metadata?: Partial<CartItem>,
  ) => Promise<void>;
  removeItem: (variantId: number) => Promise<void>;
  updateQuantity: (variantId: number, qty: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'cart_items';

// ponytail: Chuẩn hóa item từ backend/local sang CartItem an toàn
const normalizeCartItems = (rawItems: any[]): CartItem[] => {
  if (!Array.isArray(rawItems)) return [];
  return rawItems.map(item => ({
    id: item.id,
    cartId: item.cartId,
    variantId: item.variantId ? Number(item.variantId) : undefined,
    productId: item.productId ?? item.variant?.productId ?? item.id,
    name: item.name ?? item.variant?.product?.name ?? 'Sản phẩm',
    image:
      item.image ||
      item.variant?.product?.images?.[0]?.url ||
      '/placeholder.png',
    price: Number(item.price ?? item.variant?.price ?? 0),
    countInStock: Number(item.countInStock ?? item.variant?.countInStock ?? 0),
    qty: Number(item.qty || 1),
    sku: item.sku || item.variant?.sku,
    variant: item.variant,
  }));
};

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const { toast } = useToast();

  // Load initial cart data
  useEffect(() => {
    const loadCart = async () => {
      setLoading(true);
      try {
        if (user) {
          const localCart = localStorage.getItem(CART_STORAGE_KEY);
          const localItems: CartItem[] = localCart ? JSON.parse(localCart) : [];

          const response = await apiClient.get('/cart');
          const serverCart = response.data;
          const serverItems = normalizeCartItems(serverCart?.items || []);

          if (localItems.length > 0) {
            await mergeCarts(localItems, serverItems);
            localStorage.removeItem(CART_STORAGE_KEY);
          } else {
            setItems(serverItems);
          }
        } else {
          const storedCart = localStorage.getItem(CART_STORAGE_KEY);
          if (storedCart) {
            setItems(normalizeCartItems(JSON.parse(storedCart)));
          }
        }
      } catch (error) {
        console.error('Error loading cart:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, [user]);

  // Sync cart to localStorage for guests
  useEffect(() => {
    if (!user) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, user]);

  const addItem = async (
    variantId: number,
    qty: number,
    metadata?: Partial<CartItem>,
  ) => {
    setLoading(true);
    try {
      const numVariantId = Number(variantId);
      if (user) {
        const response = await apiClient.post('/cart/items', {
          variantId: numVariantId,
          qty,
        });
        const cart = response.data;
        setItems(normalizeCartItems(cart?.items || []));
        toast({
          title: 'Đã thêm vào giỏ',
          description: 'Sản phẩm đã được thêm vào giỏ hàng thành công.',
        });
      } else {
        const existingIndex = items.findIndex(
          item => (item.variantId || item.productId) === numVariantId,
        );

        let updatedItems: CartItem[];
        if (existingIndex > -1) {
          updatedItems = items.map((item, idx) =>
            idx === existingIndex
              ? { ...item, qty: Math.min(item.qty + qty, item.countInStock) }
              : item,
          );
        } else {
          const newItem: CartItem = {
            variantId: numVariantId,
            productId: metadata?.productId ?? numVariantId,
            name: metadata?.name || 'Sản phẩm',
            image: metadata?.image || '/placeholder.png',
            price: Number(metadata?.price || 0),
            countInStock: Number(metadata?.countInStock || 99),
            qty,
            sku: metadata?.sku,
          };
          updatedItems = [...items, newItem];
        }

        setItems(updatedItems);
        toast({
          title: 'Đã thêm vào giỏ',
          description: 'Sản phẩm đã được lưu trong giỏ hàng tạm.',
        });
      }
    } catch (error) {
      toast({
        title: 'Lỗi thêm vào giỏ',
        description: 'Có lỗi xảy ra khi thêm vào giỏ hàng.',
        variant: 'destructive',
      });
      console.error('Error adding item to cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (variantId: number) => {
    setLoading(true);
    try {
      const numVariantId = Number(variantId);
      if (user) {
        const response = await apiClient.delete(`/cart/items/${numVariantId}`);
        const cart = response.data;
        setItems(normalizeCartItems(cart?.items || []));
      } else {
        setItems(
          items.filter(
            item => (item.variantId || item.productId) !== numVariantId,
          ),
        );
      }
      toast({
        title: 'Đã xóa sản phẩm',
        description: 'Sản phẩm đã được xóa khỏi giỏ hàng.',
      });
    } catch (error) {
      toast({
        title: 'Lỗi xóa sản phẩm',
        description: 'Không thể xóa sản phẩm khỏi giỏ hàng.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (variantId: number, qty: number) => {
    setLoading(true);
    try {
      const numVariantId = Number(variantId);
      if (user) {
        const response = await apiClient.put(`/cart/items/${numVariantId}`, {
          qty,
        });
        const cart = response.data;
        setItems(normalizeCartItems(cart?.items || []));
      } else {
        setItems(
          items.map(item =>
            (item.variantId || item.productId) === numVariantId
              ? { ...item, qty }
              : item,
          ),
        );
      }
    } catch (error) {
      console.error('Error updating cart item:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    setLoading(true);
    try {
      if (user) {
        await apiClient.delete('/cart');
      }
      setItems([]);
      localStorage.removeItem(CART_STORAGE_KEY);
      toast({
        title: 'Giỏ hàng đã xóa',
        description: 'Tất cả sản phẩm đã được xóa khỏi giỏ.',
      });
    } catch (error) {
      toast({
        title: 'Lỗi xóa giỏ',
        description: 'Không thể xóa giỏ hàng lúc này.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const mergeCarts = async (
    localItems: CartItem[],
    serverItems: CartItem[],
  ) => {
    const serverMap = new Map(
      serverItems.map(item => [item.variantId || item.productId, item]),
    );

    for (const localItem of localItems) {
      const id = localItem.variantId || localItem.productId;
      if (!id) continue;
      const numId = Number(id);
      const serverItem = serverMap.get(numId);
      try {
        if (serverItem) {
          await apiClient.put(`/cart/items/${numId}`, {
            qty: Math.max(localItem.qty, serverItem.qty),
          });
        } else {
          await apiClient.post('/cart/items', {
            variantId: numId,
            qty: localItem.qty,
          });
        }
      } catch (err) {
        console.error('Error merging item:', err);
      }
    }

    const refreshed = await apiClient.get('/cart');
    setItems(normalizeCartItems(refreshed.data?.items || []));
  };

  return (
    <CartContext.Provider
      value={{
        items,
        loading,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
