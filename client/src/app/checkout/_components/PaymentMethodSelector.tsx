"use client";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Image from "next/image";

interface PaymentMethodSelectorProps {
  paymentMethod: "COD" | "WALLET";
  onPaymentMethodChange: (method: "COD" | "WALLET") => void;
}

export default function PaymentMethodSelector({
  paymentMethod,
  onPaymentMethodChange,
}: PaymentMethodSelectorProps) {
  return (
    <RadioGroup
      value={paymentMethod}
      onValueChange={(value: string) =>
        onPaymentMethodChange(value as "COD" | "WALLET")
      }
      className="space-y-3"
    >
      {/* COD Payment */}
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

      {/* VNPay / Sepay Payment */}
      <div
        className={`flex items-start space-x-3 rounded-lg border p-4 cursor-pointer transition-colors ${
          paymentMethod === "WALLET"
            ? "border-black bg-gray-50"
            : "border-gray-200 hover:border-gray-300 bg-white"
        }`}
        onClick={() => onPaymentMethodChange("WALLET")}
      >
        <RadioGroupItem value="WALLET" id="payment-wallet" className="mt-1" />
        <Label htmlFor="payment-wallet" className="flex-1 cursor-pointer">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-gray-900 text-sm">
              Thanh toán trực tuyến (VNPay / SePay QR)
            </span>
            <Image
              src="/images/logo/vnpay.svg"
              alt="VNPay"
              width={50}
              height={18}
              className="h-4 w-auto"
            />
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Chuyển khoản ngân hàng tức thì qua mã QR hoặc cổng thanh toán an toàn.
          </p>
        </Label>
      </div>
    </RadioGroup>
  );
}
