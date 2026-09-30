"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSizeById, useUpdateSize } from "@/services/sizeService";
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

interface SizeForm {
  code: string;
  name: string;
  sortOrder: number;
}

export default function AdminEditSizePage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params?.id);

  const { data: sizeData, isLoading: isLoadingSize } = useSizeById(id);
  const updateSizeMutation = useUpdateSize();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SizeForm>({
    defaultValues: {
      code: "",
      name: "",
      sortOrder: 1,
    },
  });

  useEffect(() => {
    if (sizeData) {
      reset({
        code: sizeData.code,
        name: sizeData.name,
        sortOrder: sizeData.sortOrder,
      });
    }
  }, [sizeData, reset]);

  const onSubmit = async (data: SizeForm) => {
    try {
      if (id) {
        await updateSizeMutation.mutateAsync({
          id,
          data: {
            code: data.code.toUpperCase().trim(),
            name: data.name.trim(),
            sortOrder: Number(data.sortOrder),
          },
        });
      }
      router.push("/admin/sizes");
    } catch (error) {
      console.error("Error updating size:", error);
    }
  };

  const isLoading = isLoadingSize || updateSizeMutation.isPending;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/sizes">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Chỉnh sửa kích thước
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Cập nhật thông tin kích thước ID #{id}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Thông tin kích thước</CardTitle>
          <CardDescription>Cập nhật mã ký hiệu, tên gọi và thứ tự</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="code">
                Mã kích thước (Ký hiệu) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="code"
                placeholder="Ví dụ: S, M, L, XL..."
                {...register("code", {
                  required: "Mã size là bắt buộc",
                  maxLength: {
                    value: 10,
                    message: "Mã size không được quá 10 ký tự",
                  },
                })}
                className={errors.code ? "border-destructive uppercase font-bold" : "uppercase font-bold"}
                disabled={isLoading}
              />
              {errors.code && (
                <p className="text-xs text-destructive">{errors.code.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">
                Tên hiển thị mô tả <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Ví dụ: Cỡ Nhỏ, Cỡ Vừa..."
                {...register("name", { required: "Tên kích thước là bắt buộc" })}
                className={errors.name ? "border-destructive" : ""}
                disabled={isLoading}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sortOrder">
                Thứ tự sắp xếp <span className="text-red-500">*</span>
              </Label>
              <Input
                id="sortOrder"
                type="number"
                {...register("sortOrder", {
                  required: "Thứ tự sắp xếp là bắt buộc",
                  valueAsNumber: true,
                })}
                className={errors.sortOrder ? "border-destructive" : ""}
                disabled={isLoading}
              />
              {errors.sortOrder && (
                <p className="text-xs text-destructive">{errors.sortOrder.message}</p>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/admin/sizes">Hủy bỏ</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
