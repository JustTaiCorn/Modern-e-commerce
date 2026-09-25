import { Container } from '@/components/ui/container';
import { fetchWithAuth } from '@/lib/fetch-with-auth';
import { AdminOrderDetails } from '@/modules/admin/components/admin-order-details';
import { Order } from '@apps/shared/types/order';

interface AdminOrderPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AdminOrderPage({ params }: AdminOrderPageProps) {
  const { id } = await params;
  const response = await fetchWithAuth(`/orders/${id}`);
  const json = await response.json();
  const order: Order = json.data || json;

  return (
    <Container>
      <div className="max-w-7xl mx-auto py-10">
        <AdminOrderDetails order={order} />
      </div>
    </Container>
  );
}
