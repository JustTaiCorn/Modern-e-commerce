"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { useCategoryStore } from "@/stores/categoryStore";

export default function AdminAddCategoryPage() {
  const router = useRouter();
  const { createCategory } = useCategoryStore();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Tên danh mục không được để trống");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await createCategory({
        name: name.trim(),
        isActive: true,
      });

      router.push("/admin/categories");
    } catch (err: any) {
      setError(err?.message || "Không thể tạo danh mục");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/categories">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Thêm danh mục chính
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Tạo danh mục gốc mới trên hệ thống
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Thông tin danh mục</CardTitle>
          <CardDescription>Nhập tên danh mục chính (Ví dụ: Thời trang nam, Thời trang nữ)</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">
                Tên danh mục <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError("");
                }}
                placeholder="Nhập tên danh mục..."
                disabled={loading}
              />
              {error && <p className="text-xs text-red-500">{error}</p>}
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Đang lưu..." : "Lưu danh mục"}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/admin/categories">Hủy bỏ</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
