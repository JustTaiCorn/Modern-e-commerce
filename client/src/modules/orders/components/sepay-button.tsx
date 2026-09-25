'use client';

// ponytail: Nút thanh toán VietQR qua cổng SePay, tự động POST form có chữ ký điện tử
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { QrCode, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';
import { formatPrice } from '@/lib/utils';

interface SepayButtonProps {
  orderId: number | string;
  amount: number;
}

export function SepayButton({ orderId, amount }: SepayButtonProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const numOrderId = Number(orderId);
      const response = await apiClient.post('/payment/sepay/checkout', {
        orderId: numOrderId,
      });

      const data = response.data;
      const { checkoutUrl, fields } = data || {};

      if (!checkoutUrl || !fields) {
        throw new Error('Dữ liệu cổng thanh toán không hợp lệ.');
      }

      // Tạo form ẩn và submit POST sang SePay
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = checkoutUrl;
      form.style.display = 'none';

      Object.entries(fields).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = String(value);
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    } catch (error: any) {
      console.error('SePay Checkout Error:', error);
      toast({
        title: 'Lỗi khởi tạo thanh toán',
        description:
          error?.response?.data?.message ||
          'Không thể kết nối đến cổng thanh toán SePay. Vui lòng thử lại.',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  return (
    <Button
      className="w-full bg-[#0052cc] hover:bg-[#0747a6] text-white flex items-center justify-center gap-2 py-6 text-base font-semibold shadow-md transition-all"
      onClick={handleCheckout}
      disabled={loading}
    >
      {loading ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Đang chuyển hướng cổng VietQR...</span>
        </>
      ) : (
        <>
          <QrCode className="h-5 w-5" />
          <span>Thanh toán VietQR ({formatPrice(amount)})</span>
        </>
      )}
    </Button>
  );
}
