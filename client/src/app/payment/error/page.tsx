import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { XCircle, RotateCcw, Home } from 'lucide-react';

interface ErrorPageProps {
  searchParams: Promise<{
    orderId?: string;
  }>;
}

export default async function PaymentErrorPage({
  searchParams,
}: ErrorPageProps) {
  const { orderId } = await searchParams;

  return (
    <Container>
      <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
        <Card className="max-w-md w-full p-8 text-center space-y-6 shadow-xl border-destructive/20 bg-gradient-to-b from-card to-card/50">
          <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
            <XCircle className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Lỗi thanh toán
            </h1>
            <p className="text-sm text-muted-foreground">
              Có lỗi xảy ra trong quá trình xử lý giao dịch. Vui lòng thử lại
              hoặc chọn phương thức thanh toán khác.
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
                  Thử lại
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
