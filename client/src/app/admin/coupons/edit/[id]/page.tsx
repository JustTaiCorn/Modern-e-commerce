"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { useAllCoupons, useCouponById, useUpdateCoupon } from "@/services/couponService";

type FormValues = {
  code: string;
  name: string;
  description?: string;
  value: number;
  maxUses?: number;
  maxUsesPerUser?: number;
  minOrderTotal?: number;
  startsAt?: string;
  endsAt?: string;
  isActive: boolean;
};

export default function AdminEditCouponPage() {
  const router = useRouter();
  const params = useParams();
  const couponId = parseInt(params.id as string);
  const { data: coupon, isLoading } = useCouponById(couponId);
  const { data: allCoupons = [] } = useAllCoupons();
  const { mutate: updateCoupon } = useUpdateCoupon();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>();

  const isActive = watch("isActive", true);

  useEffect(() => {
    if (coupon) {
      const formatDateForInput = (dateString?: string) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toISOString().slice(0, 16);
      };

      reset({
        code: coupon.code,
        name: coupon.name,
        description: coupon.description || "",
        value: coupon.value,
        minOrderTotal: coupon.minOrderTotal || undefined,
        maxUses: coupon.maxUses || undefined,
        maxUsesPerUser: coupon.maxUsesPerUser || undefined,
        startsAt: formatDateForInput(coupon.startsAt),
        endsAt: formatDateForInput(coupon.endsAt),
        isActive: coupon.isActive,
      });
    }
  }, [coupon, reset]);

  const onSubmit = async (data: FormValues) => {
    const existing = allCoupons.find(
      (c) => c.code.toLowerCase() === data.code.trim().toLowerCase() && c.id !== couponId
    );
    if (existing) {
      toast.error("Mã giảm giá này đã tồn tại trên hệ thống");
      return;
    }

    if (data.startsAt && data.endsAt) {
      if (new Date(data.endsAt) <= new Date(data.startsAt)) {
        toast.error("Thời gian kết thúc phải sau thời gian bắt đầu");
        return;
      }
    }

    const payload = {
      code: data.code.toUpperCase().trim(),
      name: data.name.trim(),
      description: data.description?.trim() || undefined,
      value: Number(data.value),
      minOrderTotal: data.minOrderTotal ? Number(data.minOrderTotal) : undefined,
      maxUses: data.maxUses ? Number(data.maxUses) : undefined,
      maxUsesPerUser: data.maxUsesPerUser ? Number(data.maxUsesPerUser) : undefined,
      startsAt: data.startsAt ? new Date(data.startsAt).toISOString() : undefined,
      endsAt: data.endsAt ? new Date(data.endsAt).toISOString() : undefined,
      isActive: data.isActive,
    };

    updateCoupon(
      { id: couponId, coupon: payload },
      {
        onSuccess: () => {
          router.push("/admin/coupons");
        },
      }
    );
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/coupons">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Chỉnh sửa mã ưu đãi
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Cập nhật thông tin mã voucher ID #{couponId}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Chi tiết chương trình ưu đãi</CardTitle>
          <CardDescription>Cập nhật mức giảm giá và điều kiện áp dụng</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">
                  Mã giảm giá (Code) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="code"
                  placeholder="Ví dụ: SALE50K, FREESHIP..."
                  {...register("code", {
                    required: "Mã code là bắt buộc",
                    minLength: { value: 3, message: "Tối thiểu 3 ký tự" },
                  })}
                  className="uppercase font-mono font-bold"
                />
                {errors.code && (
                  <p className="text-xs text-destructive">{errors.code.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">
                  Tên chương trình <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Ví dụ: Giảm 50.000đ đơn từ 500k"
                  {...register("name", { required: "Tên chương trình là bắt buộc" })}
                />
                {errors.name && (
                  <p className="text-xs text-destructive">{errors.name.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Mô tả ngắn</Label>
              <Textarea
                id="description"
                placeholder="Điều kiện chi tiết áp dụng cho khách hàng..."
                rows={2}
                {...register("description")}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="value">
                  Số tiền giảm (VNĐ) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="value"
                  type="number"
                  placeholder="Ví dụ: 50000"
                  {...register("value", {
                    required: "Mức giảm là bắt buộc",
                    min: { value: 1000, message: "Tối thiểu 1.000đ" },
                    valueAsNumber: true,
                  })}
                />
                {errors.value && (
                  <p className="text-xs text-destructive">{errors.value.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="minOrderTotal">Giá trị đơn tối thiểu (VNĐ)</Label>
                <Input
                  id="minOrderTotal"
                  type="number"
                  placeholder="Ví dụ: 300000 (Để trống nếu không giới hạn)"
                  {...register("minOrderTotal", { valueAsNumber: true })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startsAt">Thời gian bắt đầu</Label>
                <Input
                  id="startsAt"
                  type="datetime-local"
                  {...register("startsAt")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endsAt">Thời gian kết thúc</Label>
                <Input
                  id="endsAt"
                  type="datetime-local"
                  {...register("endsAt")}
                />
              </div>
            </div>

            <div className="flex items-center justify-between border p-3 rounded-lg">
              <div className="space-y-0.5">
                <Label htmlFor="active-toggle" className="text-sm font-medium">
                  Kích hoạt mã
                </Label>
                <p className="text-xs text-muted-foreground">
                  Cho phép khách hàng sử dụng mã này trong giỏ hàng
                </p>
              </div>
              <Switch
                id="active-toggle"
                checked={isActive}
                onCheckedChange={(val) => setValue("isActive", val)}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={isSubmitting}>
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/admin/coupons">Hủy bỏ</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
