"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbSeparator,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { useCartQuery } from "@/services/cartService";
import { useCartStore } from "@/stores/cartStore";
import { useProductStore } from "@/stores/productStore";
import useAuthStore from "@/stores/useAuthStore";
import { useAddress } from "@/hooks/useAddress";

import ShippingAddressForm, { ShippingFormData } from "@/app/checkout/_components/ShippingAddressForm";
import PaymentMethodSelector, { PaymentMethodType } from "@/app/checkout/_components/PaymentMethodSelector";
import OrderSummary from "@/app/checkout/_components/OrderSummary";

import { Coupon } from "@/types";
import { EnrichedCartItem } from "@/types/cart";
import { createSepayCheckout, submitSepayForm } from "@/services/paymentService";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useCreateOrder } from "@/services/orderService";
import { useAvailableCoupons } from "@/services/couponService";
import { useProductsQuery } from "@/services/productService";
import { useForm, FormProvider, SubmitHandler } from "react-hook-form";


function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { authUser, fetchAddresses } = useAuthStore();
  const { data: items = [], isLoading: isLoadingCart } = useCartQuery();
  const { mutateAsync: createOrder } = useCreateOrder();
  const { getCartSummary, clearCart } = useCartStore();
  const { fetchProducts } = useProductStore();
  const { data: products } = useProductsQuery();

  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const baseSummary = getCartSummary();
  const { data: availableCoupons = [] } = useAvailableCoupons(
    authUser?.id,
    baseSummary.subtotal
  );

  const summary = useMemo(() => {
    if (appliedCoupon && appliedCoupon.isActive) {
      const subtotal = baseSummary.subtotal;
      let discount = (subtotal * appliedCoupon.value) / 100;
      if (discount > subtotal) {
        discount = subtotal;
      }
      const subtotalAfterDiscount = subtotal - discount;
      const total = subtotalAfterDiscount + baseSummary.shippingFee;

      return {
        ...baseSummary,
        discount,
        total,
      };
    }
    return baseSummary;
  }, [baseSummary, appliedCoupon]);

  const {
    provinces,
    wards,
    isLoadingProvinces,
    isLoadingWards,
    fetchProvinces,
    fetchWards,
    clearWards,
  } = useAddress();

  useEffect(() => {
    fetchProvinces();
  }, [fetchProvinces]);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>("COD");
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [isNewAddress, setIsNewAddress] = useState(false);
  const [showCouponList, setShowCouponList] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const methods = useForm<ShippingFormData>({
    defaultValues: {
      fullName: "",
      phone: "",
      address: "",
      ward: "",
      wardCode: "",
      province: "",
      provinceCode: "",
    },
  });

  const { handleSubmit, reset, setValue } = methods;

  const enrichedItems: EnrichedCartItem[] = useMemo(() => {
    return items
      .map((item) => {
        const variant = item.variant;
        if (!variant) return null;

        const product = products?.find(
          (p) => p.id === variant.product?.id || variant.product_id
        );

        return {
          ...item,
          product,
          color: variant.color,
          size: variant.size,
        } as EnrichedCartItem;
      })
      .filter((item): item is EnrichedCartItem => item !== null);
  }, [items, products]);

  useEffect(() => {
    if (authUser) {
      fetchAddresses?.();
      const defaultAddr =
        authUser.addresses?.find((addr) => addr.isDefault) ||
        authUser.addresses?.[0];

      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id);
        setIsNewAddress(false);
        reset({
          fullName: authUser.fullName,
          phone: authUser.phone || "",
          address: defaultAddr.line,
          ward: defaultAddr.ward || "",
          wardCode: "",
          province: defaultAddr.province || "",
          provinceCode: "",
        });
      } else {
        setIsNewAddress(true);
        reset({
          fullName: authUser.fullName,
          phone: authUser.phone || "",
          address: "",
          ward: "",
          wardCode: "",
          province: "",
          provinceCode: "",
        });
      }
    } else {
      setIsNewAddress(true);
    }
  }, [authUser, reset, fetchAddresses]);

  // Handle VNPay / Sepay callback params
  useEffect(() => {
    const paymentStatus = searchParams?.get("status");
    if (paymentStatus === "success") {
      toast.success("Thanh toán thành công! Đơn hàng của bạn đã được tiếp nhận.");
      setTimeout(() => {
        router.push("/user/orders");
      }, 1500);
    } else if (paymentStatus === "fail") {
      toast.error("Thanh toán không thành công. Bạn có thể thử lại bằng phương thức khác.");
    }
  }, [searchParams, router]);

  const handleProvinceChange = (provinceCode: string) => {
    const selectedProvince = provinces.find((p) => p.code === provinceCode);
    setValue("provinceCode", provinceCode);
    setValue("province", selectedProvince?.name || "", { shouldValidate: true });
    setValue("wardCode", "");
    setValue("ward", "", { shouldValidate: true });
    fetchWards(provinceCode);
  };

  const handleWardChange = (wardCode: string) => {
    const selectedWard = wards.find((w) => w.code === wardCode);
    setValue("wardCode", wardCode);
    setValue("ward", selectedWard?.name || "", { shouldValidate: true });
  };

  const handleAddressSelect = (addressId: number) => {
    setSelectedAddressId(addressId);
    setIsNewAddress(false);

    if (authUser) {
      const selectedAddr = authUser.addresses?.find(
        (addr) => addr.id === addressId
      );
      if (selectedAddr) {
        reset({
          fullName: authUser.fullName,
          phone: authUser.phone || "",
          address: selectedAddr.line,
          ward: selectedAddr.ward || "",
          wardCode: "",
          province: selectedAddr.province || "",
          provinceCode: "",
        });
        clearWards();
      }
    }
  };

  const handleNewAddress = () => {
    setIsNewAddress(true);
    setSelectedAddressId(null);
    reset({
      fullName: authUser?.fullName || "",
      phone: authUser?.phone || "",
      address: "",
      ward: "",
      wardCode: "",
      province: "",
      provinceCode: "",
    });
  };

  const handleApplyCoupon = (couponCode: string) => {
    const coupon = availableCoupons.find((c) => c.code === couponCode);
    if (!coupon) {
      toast.error("Mã giảm giá không tồn tại hoặc đã hết hạn");
      return;
    }
    setAppliedCoupon(coupon);
    setShowCouponList(false);
    toast.success(`Đã áp dụng mã giảm giá: ${couponCode}`);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
  };

  const onSubmitOrder: SubmitHandler<ShippingFormData> = async (formData) => {
    if (!authUser?.id) {
      toast.error("Vui lòng đăng nhập để tiến hành đặt hàng");
      router.push("/user/login?redirect=/checkout");
      return;
    }

    if (items.length === 0) {
      toast.error("Giỏ hàng đang trống");
      return;
    }

    setIsSubmitting(true);

    try {
      const fullAddressString = [
        formData.address,
        formData.ward,
        formData.province,
      ]
        .filter(Boolean)
        .join(", ");

      const orderRequest = {
        paymentMethod: paymentMethod,
        shippingAddress: {
          fullName: formData.fullName,
          phone: formData.phone,
          address: fullAddressString,
          ward: formData.ward,
          province: formData.province,
        },
        couponCode: appliedCoupon?.code,
      };

      const createdOrder = await createOrder({
        userId: authUser.id,
        request: orderRequest,
      });

      if (paymentMethod === "SEPAY") {
        // Tạo SePay checkout session từ server
        toast.info("Đang chuyển tới cổng thanh toán SePay...");
        const sepayRes = await createSepayCheckout(
          createdOrder.id,
          `USER_${authUser.id}`
        );

        if (!sepayRes?.checkoutUrl || !sepayRes?.fields) {
          throw new Error("Không nhận được thông tin thanh toán từ SePay");
        }

        // Xóa giỏ hàng trước khi redirect
        await clearCart();
        setAppliedCoupon(null);

        // POST form lên SePay — bắt buộc POST, không được dùng window.location.href
        submitSepayForm(sepayRes.checkoutUrl, sepayRes.fields);
        return;
      }

      // COD — không cần thanh toán online
      toast.success(`Đặt hàng thành công! Mã đơn: ${(createdOrder as any)?.code || createdOrder.id}`);
      await clearCart();
      setAppliedCoupon(null);
      router.push("/user/orders");
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || "Lỗi khi xử lý đơn hàng. Vui lòng thử lại.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };


  if (isLoadingCart) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/">Trang chủ</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/cart">Giỏ hàng</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <span className="font-semibold text-gray-800">Thanh toán</span>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">
          Thông tin thanh toán & Đặt hàng
        </h1>

        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmitOrder)}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Address & Payment Method */}
              <div className="lg:col-span-2 space-y-6">
                {/* Shipping Address */}
                <Card className="border border-gray-100 shadow-sm">
                  <CardHeader className="pb-4 border-b flex flex-row items-center gap-2">
                    <MapPin className="w-5 h-5 text-gray-900" />
                    <CardTitle className="text-base font-semibold">
                      Địa chỉ nhận hàng
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-5">
                    <ShippingAddressForm
                      authUser={authUser}
                      selectedAddressId={selectedAddressId}
                      isNewAddress={isNewAddress}
                      provinces={provinces}
                      wards={wards}
                      isLoadingProvinces={isLoadingProvinces}
                      isLoadingWards={isLoadingWards}
                      onProvinceChange={handleProvinceChange}
                      onWardChange={handleWardChange}
                      onAddressSelect={handleAddressSelect}
                      onNewAddress={handleNewAddress}
                    />
                  </CardContent>
                </Card>

                {/* Payment Method */}
                <Card className="border border-gray-100 shadow-sm">
                  <CardHeader className="pb-4 border-b flex flex-row items-center gap-2">
                    <CreditCard className="w-5 h-5 text-gray-900" />
                    <CardTitle className="text-base font-semibold">
                      Phương thức thanh toán
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-5">
                    <PaymentMethodSelector
                      paymentMethod={paymentMethod}
                      onPaymentMethodChange={setPaymentMethod}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Right Column: Order Summary */}
              <div className="lg:col-span-1">
                <Card className="sticky top-6 border border-gray-100 shadow-sm">
                  <CardHeader className="pb-3 border-b">
                    <CardTitle className="text-base font-semibold">
                      Đơn hàng của bạn
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <OrderSummary
                      items={enrichedItems}
                      summary={summary}
                      appliedCoupon={appliedCoupon}
                      availableCoupons={availableCoupons}
                      showCouponList={showCouponList}
                      isSubmitting={isSubmitting}
                      paymentMethod={paymentMethod}
                      onToggleCouponList={() => setShowCouponList(!showCouponList)}
                      onApplyCoupon={handleApplyCoupon}
                      onRemoveCoupon={handleRemoveCoupon}
                      onSubmitOrder={() => {
                        handleSubmit(onSubmitOrder)();
                      }}
                      onBackToCart={() => router.push("/cart")}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <CheckoutContent />
    </Suspense>
  );
}
