"use client";

import { OrderStatusBadge } from "./StatusBadges";
import { formatDate, formatPrice } from "@/lib/utils";
import { Order } from "@/types";
import { useUserById } from "@/services/usersService";

interface InvoiceTemplateProps {
  order: Order;
}

export function InvoiceTemplate({ order }: InvoiceTemplateProps) {
  const { data: user } = useUserById(order.userId || order.user?.id || 0);

  // Parse shipping address snapshot
  const getShippingInfo = () => {
    if (!order.shippingAddressSnapshot) return null;

    try {
      let addr: Record<string, string>;

      if (typeof order.shippingAddressSnapshot === "string") {
        addr = JSON.parse(order.shippingAddressSnapshot);
      } else {
        addr = order.shippingAddressSnapshot as Record<string, string>;
      }

      return addr;
    } catch (error) {
      console.error("Error parsing shipping address:", error);
      return null;
    }
  };

  const shippingInfo = getShippingInfo();

  const formatAddress = () => {
    if (!shippingInfo) return "N/A";

    const parts = [
      shippingInfo.line,
      shippingInfo.ward,
      shippingInfo.district,
      shippingInfo.province,
      shippingInfo.country,
    ].filter(Boolean);

    return parts.length > 0 ? parts.join(", ") : "N/A";
  };

  return (
    <div className="bg-white p-6 rounded-lg border shadow-xs max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-2xl font-bold text-gray-900">Hóa đơn bán hàng</h1>
            <OrderStatusBadge status={order.status} />
          </div>
          <p className="text-gray-500 text-sm">
            Mã đơn hàng: <span className="font-semibold text-gray-800">#{order.code}</span>
          </p>
        </div>
        <div className="md:text-right">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Modern Shop Admin</h2>
          <div className="text-sm text-gray-600 space-y-0.5">
            <p>Tòa nhà Landmark, Hà Nội, Việt Nam</p>
            <p>Hotline CSKH: 1900 6868</p>
            <p>Email: admin@modernshop.com</p>
          </div>
        </div>
      </div>

      {/* Invoice Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 bg-gray-50 p-4 rounded-lg">
        <div>
          <h3 className="text-xs font-semibold uppercase text-gray-500 mb-1">Ngày lập</h3>
          <p className="text-gray-900 font-medium">{formatDate(order.createdAt)}</p>
        </div>
        <div>
          <h3 className="text-xs font-semibold uppercase text-gray-500 mb-1">Mã hóa đơn</h3>
          <p className="text-gray-900 font-medium">#{order.code}</p>
        </div>
        <div>
          <h3 className="text-xs font-semibold uppercase text-gray-500 mb-1">
            Thông tin khách hàng
          </h3>
          <div className="text-gray-900 space-y-0.5">
            <p className="font-medium">
              {shippingInfo?.customerName || user?.fullName || order.user?.fullName || "Khách hàng"}
            </p>
            {(shippingInfo?.phone || user?.phone || order.user?.phone) && (
              <p className="text-xs text-gray-600">
                {shippingInfo?.phone || user?.phone || order.user?.phone}
              </p>
            )}
            <p className="text-xs text-gray-600">{formatAddress()}</p>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-8 overflow-hidden rounded-lg border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-xs font-semibold uppercase text-gray-600">
                  STT
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold uppercase text-gray-600">
                  Tên sản phẩm
                </th>
                <th className="text-center py-3 px-4 text-xs font-semibold uppercase text-gray-600">
                  Số lượng
                </th>
                <th className="text-right py-3 px-4 text-xs font-semibold uppercase text-gray-600">
                  Đơn giá
                </th>
                <th className="text-right py-3 px-4 text-xs font-semibold uppercase text-gray-600">
                  Thành tiền
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {order.items?.map((item, index) => (
                <tr key={item.id} className="hover:bg-gray-50/50">
                  <td className="py-3 px-4 text-xs text-gray-500">{index + 1}</td>
                  <td className="py-3 px-4 text-sm text-gray-900 font-medium">
                    {item.productName}
                    {item.sku && (
                      <span className="block text-xs text-gray-400 font-normal">
                        SKU: {item.sku}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900 text-center">
                    {item.quantity}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900 text-right">
                    {formatPrice(item.unitPrice)}
                  </td>
                  <td className="py-3 px-4 text-sm font-semibold text-gray-900 text-right">
                    {formatPrice(item.lineTotal)}
                  </td>
                </tr>
              )) || []}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="border-t border-gray-200 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <h3 className="text-xs font-semibold uppercase text-gray-500 mb-1">
              Phương thức thanh toán
            </h3>
            <p className="text-gray-900 font-medium text-sm">
              {order.paymentMethod === "COD" ? "Thanh toán khi nhận hàng (COD)" : "Ví điện tử / VNPAY"}
            </p>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase text-gray-500 mb-1">
              Phí vận chuyển
            </h3>
            <p className="text-gray-900 font-medium text-sm">{formatPrice(order.shippingFee)}</p>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase text-gray-500 mb-1">
              Giảm giá
            </h3>
            <p className="text-gray-900 font-medium text-sm text-emerald-600">
              -{formatPrice(order.discountTotal)}
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1 text-sm text-gray-600">
            <p>Tổng tiền hàng: <span className="font-medium text-gray-900">{formatPrice(order.subtotal)}</span></p>
            <p>Tổng số lượng: <span className="font-medium text-gray-900">{order.totalItems} sản phẩm</span></p>
            <p>
              Trạng thái thanh toán:{" "}
              <span className={`font-semibold ${order.paymentStatus === "PAID" ? "text-emerald-600" : "text-amber-600"}`}>
                {order.paymentStatus === "PAID" ? "Đã thanh toán" : "Chưa thanh toán"}
              </span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase text-gray-500 font-semibold">Tổng thanh toán</p>
            <p className="text-2xl font-bold text-red-600">
              {formatPrice(order.grandTotal)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
