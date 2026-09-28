"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useColorById, useUpdateColor } from "@/services/colorService";
import { useForm } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

interface ColorForm {
  name: string;
  code: string;
}

export default function AdminEditColorPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params?.id);

  const { data: colorData, isLoading: isLoadingColor } = useColorById(id);
  const updateColorMutation = useUpdateColor();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ColorForm>({
    defaultValues: {
      name: "",
      code: "#000000",
    },
  });

  useEffect(() => {
    if (colorData) {
      reset({
        name: colorData.name,
        code: colorData.code,
      });
    }
  }, [colorData, reset]);

  const onSubmit = async (data: ColorForm) => {
    try {
      if (id) {
        await updateColorMutation.mutateAsync({ id, data });
      }
      router.push("/admin/colors");
    } catch (error) {
      console.error("Error saving color:", error);
    }
  };

  const isLoading = isLoadingColor || updateColorMutation.isPending;
  const watchedColor = watch("code");

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/colors">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Chỉnh sửa màu sắc
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Cập nhật tên và mã hiển thị của màu sắc
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Thông tin màu sắc</CardTitle>
          <CardDescription>Cập nhật màu ID #{id}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">
                Tên màu <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Ví dụ: Đen, Trắng..."
                {...register("name", { required: "Tên màu là bắt buộc" })}
                className={errors.name ? "border-destructive" : ""}
                disabled={isLoading}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">
                Mã màu Hex <span className="text-red-500">*</span>
              </Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={watchedColor}
                  onChange={(e) => setValue("code", e.target.value)}
                  className="h-10 w-12 rounded border cursor-pointer p-0.5 bg-white"
                />
                <Input
                  id="code"
                  placeholder="#000000"
                  {...register("code", { required: "Mã màu là bắt buộc" })}
                  className="font-mono text-sm"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/admin/colors">Hủy bỏ</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
