"use client";

import React from "react";
import {
  Truck,
  CreditCard,
  Shield,
  Handbag,
} from "lucide-react";
import {
  Marquee,
  MarqueeContent,
  MarqueeFade,
  MarqueeItem,
} from "../ui/marquee";

interface PolicyItem {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

const policyData: PolicyItem[] = [
  {
    id: "quality",
    icon: <Handbag className="w-8 h-8 md:w-10 md:h-10 text-primary" />,
    title: "Chính hãng",
    description: "100% Chính hãng",
  },
  {
    id: "delivery",
    icon: <Truck className="w-8 h-8 md:w-10 md:h-10 text-primary" />,
    title: "Miễn phí vận chuyển",
    description: "Áp dụng cho đơn hàng từ 500k",
  },
  {
    id: "payment",
    icon: <CreditCard className="w-8 h-8 md:w-10 md:h-10 text-primary" />,
    title: "Thanh toán đa dạng",
    description: "COD, SePay, VNPay, Chuyển khoản",
  },
  {
    id: "security",
    icon: <Shield className="w-8 h-8 md:w-10 md:h-10 text-primary" />,
    title: "Bảo hành",
    description: "Đổi trả lên đến 180 ngày",
  },
];

export default function ListPolicy() {
  return (
    <div className="w-full py-4 border-y bg-muted/30">
      <Marquee>
        <MarqueeFade side="left" />
        <MarqueeFade side="right" />
        <MarqueeContent>
          {policyData.map((policy) => (
            <MarqueeItem
              className="flex items-center gap-3 py-2 px-6"
              key={policy.id}
            >
              {policy.icon}
              <div>
                <h3 className="text-sm md:text-base font-bold text-foreground">
                  {policy.title}
                </h3>
                <p className="text-xs md:text-sm text-muted-foreground">{policy.description}</p>
              </div>
            </MarqueeItem>
          ))}
        </MarqueeContent>
      </Marquee>
    </div>
  );
}
