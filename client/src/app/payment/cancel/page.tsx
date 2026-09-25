import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';

interface CancelPageProps {
  searchParams: Promise<{
    orderId?: string;
  }>;
}

export default async function PaymentCancelPage({
  searchParams,
}: CancelPageProps) {
  const { orderId } = await searchParams;

  return (
    <Container>
      <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
        <Card className="max-w-md w-full p-8 text-center space-y-6 shadow-xl border-amber-500/20 bg-gradient-to-b from-card to-card/50">
          <div className="mx-auto w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <AlertCircle className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Thanh toán đã hủy
            </h1>
            <p className="text-sm text-muted-foreground">
              Bạn đã hủy quá trình quét mã VietQR. Đơn hàng của bạn vẫn được lưu
              ở trạng thái chờ thanh toán.
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
                  <RotateCcw className="w-4 h-4" />
                  Thử thanh toán lại
                </Link>
              </Button>
            )}

            <Button asChild variant="outline" className="w-full gap-2">
              <Link href="/">
                <Home className="w-4 h-4" />
                Về trang chủ
              </Link>
            </Button>
          </div>
        </Card>
      </div>
    </Container>
  );
}
