import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const [totalUsers, totalOrders, orders, customersCount] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.order.count(),
      this.prisma.order.findMany({
        where: {
          status: { not: 'CANCELLED' },
        },
        select: {
          totalPrice: true,
          createdAt: true,
        },
      }),
      this.prisma.user.count({
        where: {
          roles: {
            some: {
              role: {
                name: { equals: 'CUSTOMER', mode: 'insensitive' },
              },
            },
          },
        },
      }),
    ]);

    const totalRevenue = orders.reduce(
      (sum, o) => sum + Number(o.totalPrice || 0),
      0,
    );

    // Group monthly revenue for the last 6 months
    const monthlyMap = new Map<string, { revenue: number; orders: number }>();
    const months = [
      'Tháng 1',
      'Tháng 2',
      'Tháng 3',
      'Tháng 4',
      'Tháng 5',
      'Tháng 6',
      'Tháng 7',
      'Tháng 8',
      'Tháng 9',
      'Tháng 10',
      'Tháng 11',
      'Tháng 12',
    ];

    for (const order of orders) {
      const d = new Date(order.createdAt);
      const monthKey = months[d.getMonth()];
      const existing = monthlyMap.get(monthKey) || { revenue: 0, orders: 0 };
      existing.revenue += Number(order.totalPrice || 0);
      existing.orders += 1;
      monthlyMap.set(monthKey, existing);
    }

    const monthlyRevenue = Array.from(monthlyMap.entries()).map(
      ([month, data]) => ({
        month,
        revenue: data.revenue,
        orders: data.orders,
      }),
    );

    return {
      totalRevenue,
      totalOrders,
      totalCustomers: customersCount || totalUsers,
      monthlyRevenue,
    };
  }
}
