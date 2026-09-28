"use client";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Image from "next/image";

export type PaymentMethodType = "COD" | "SEPAY";

interface PaymentMethodSelectorProps {
  paymentMethod: PaymentMethodType;
  onPaymentMethodChange: (method: PaymentMethodType) => void;
}

export default function PaymentMethodSelector({
  paymentMethod,
  onPaymentMethodChange,
}: PaymentMethodSelectorProps) {
  return (
    <RadioGroup
      value={paymentMethod}
      onValueChange={(value: string) =>
        onPaymentMethodChange(value as PaymentMethodType)
      }
      className="space-y-3"
    >
      {/* COD */}
      <div
        className={`flex items-start space-x-3 rounded-lg border p-4 cursor-pointer transition-colors ${
          paymentMethod === "COD"
            ? "border-black bg-gray-50"
            : "border-gray-200 hover:border-gray-300 bg-white"
        }`}
        onClick={() => onPaymentMethodChange("COD")}
      >
        <RadioGroupItem value="COD" id="payment-cod" className="mt-1" />
        <Label htmlFor="payment-cod" className="flex-1 cursor-pointer">
          <div className="font-semibold text-gray-900 text-sm">
            Thanh toán khi nhận hàng (COD)
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Thanh toán bằng tiền mặt trực tiếp cho nhân viên giao hàng khi nhận hàng.
          </p>
        </Label>
      </div>

      {/* SePay */}
      <div
        className={`flex items-start space-x-3 rounded-lg border p-4 cursor-pointer transition-colors ${
          paymentMethod === "SEPAY"
            ? "border-black bg-gray-50"
            : "border-gray-200 hover:border-gray-300 bg-white"
        }`}
        onClick={() => onPaymentMethodChange("SEPAY")}
      >
        <RadioGroupItem value="SEPAY" id="payment-sepay" className="mt-1" />
        <Label htmlFor="payment-sepay" className="flex-1 cursor-pointer">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-gray-900 text-sm">
              Thanh toán trực tuyến (SePay QR)
            </span>
            <Image
              src="/images/logo/sepay.svg"
              alt="SePay"
              width={50}
              height={18}
              className="h-4 w-auto"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Chuyển khoản ngân hàng tức thì qua mã QR — an toàn, nhanh chóng.
          </p>
        </Label>
      </div>
    </RadioGroup>
  );
}
