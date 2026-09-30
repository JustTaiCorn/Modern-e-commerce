"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { useCategoryStore } from "@/stores/categoryStore";

export default function AdminAddSubcategoryPage() {
  const router = useRouter();
  const { createCategory, categories, fetchCategories } = useCategoryStore();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState<number | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const parentCategories = categories.filter((cat) => !cat.parentId);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "Tên danh mục con không được để trống";
    }
    if (!parentId) {
      newErrors.parentId = "Vui lòng chọn danh mục chính";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      await createCategory({
        parentId: parentId!,
        name: name.trim(),
        isActive,
      });
      router.push("/admin/subcategories");
    } catch (error) {
      console.error("Error adding subcategory:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/subcategories">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Thêm danh mục con
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Tạo danh mục phân loại chi tiết và liên kết vào danh mục cha
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Thông tin danh mục con</CardTitle>
          <CardDescription>Chọn danh mục cha và đặt tên cho danh mục con</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="parent">
                Danh mục chính cha <span className="text-red-500">*</span>
              </Label>
              <Select
                value={parentId ? String(parentId) : ""}
                onValueChange={(val) => {
                  setParentId(Number(val));
                  if (errors.parentId) setErrors((prev) => ({ ...prev, parentId: "" }));
                }}
              >
                <SelectTrigger className={errors.parentId ? "border-destructive" : ""}>
                  <SelectValue placeholder="Chọn danh mục cha" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {parentCategories.map((cat) => (
                    <SelectItem key={cat.id} value={String(cat.id)}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.parentId && (
                <p className="text-xs text-red-500">{errors.parentId}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">
                Tên danh mục con <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
                }}
                placeholder="Ví dụ: Áo phông ngắn tay, Quần kaki ống đứng..."
                disabled={loading}
              />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name}</p>
              )}
            </div>

            <div className="flex items-center justify-between border p-3 rounded-lg">
              <div className="space-y-0.5">
                <Label htmlFor="active-toggle" className="text-sm font-medium">
                  Trạng thái hoạt động
                </Label>
                <p className="text-xs text-muted-foreground">
                  Bật để kích hoạt danh mục con này trên cửa hàng
                </p>
              </div>
              <Switch
                id="active-toggle"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Đang lưu..." : "Lưu danh mục con"}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/admin/subcategories">Hủy bỏ</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
