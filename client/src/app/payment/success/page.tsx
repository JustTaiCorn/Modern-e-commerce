import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { CheckCircle2, ArrowRight, ShoppingBag } from 'lucide-react';

interface SuccessPageProps {
  searchParams: Promise<{
    orderId?: string;
  }>;
}

export default async function PaymentSuccessPage({
  searchParams,
}: SuccessPageProps) {
  const { orderId } = await searchParams;

  return (
    <Container>
      <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
        <Card className="max-w-md w-full p-8 text-center space-y-6 shadow-xl border-emerald-500/20 bg-gradient-to-b from-card to-card/50">
          <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-10 h-10 animate-bounce" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Thanh toán thành công!
            </h1>
            <p className="text-sm text-muted-foreground">
              Giao dịch chuyển khoản qua VietQR (SePay) đã được xác nhận.
            </p>
          </div>

          {orderId && (
            <div className="p-4 rounded-lg bg-muted/50 border border-border/50 text-sm">
              <span className="text-muted-foreground">Mã đơn hàng: </span>
              <span className="font-semibold text-foreground">#{orderId}</span>
            </div>
          )}

          <div className="flex flex-col gap-3 pt-2">
            {orderId && (
              <Button asChild className="w-full gap-2" size="lg">
                <Link href={`/orders/${orderId}`}>
                  Xem chi tiết đơn hàng
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            )}

            <Button asChild variant="outline" className="w-full gap-2">
              <Link href="/products">
                <ShoppingBag className="w-4 h-4" />
                Tiếp tục mua hàng
              </Link>
            </Button>
          </div>
        </Card>
      </div>
    </Container>
  );
}
