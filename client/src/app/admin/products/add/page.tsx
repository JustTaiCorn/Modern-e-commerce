"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useProductStore } from "@/stores/productStore";
import { useCategoryStore } from "@/stores/categoryStore";
import { ArrowLeft, Upload, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useForm, Controller } from "react-hook-form";
import { Category } from "@/types";
import { useColors } from "@/services/colorService";
import { useSizes } from "@/services/sizeService";
import { toast } from "sonner";

interface ProductFormValues {
  name: string;
  sku: string;
  description: string;
  basePrice: number;
  category: Category;
  colors: number[];
  sizes: number[];
  isPublished: boolean;
  images?: File[];
}

interface ImagePreview {
  file?: File;
  image_url: string;
  id?: number;
  isExisting?: boolean;
}

export default function AdminProductFormPage() {
  const router = useRouter();
  const params = useParams();
  const isEdit = !!params?.id;

  const { data: colors = [] } = useColors();
  const { data: sizes = [] } = useSizes();
  const { categories, fetchCategories } = useCategoryStore();
  const { addProductWithVariants, updateProduct, getProduct } =
    useProductStore();

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Can choose subcategories or categories
  const selectableCategories = categories.length > 0 
    ? (categories.some((c) => c.parentId) ? categories.filter((c) => c.parentId) : categories)
    : [];

  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    defaultValues: {
      name: "",
      sku: "",
      description: "",
      basePrice: 0,
      category: undefined as any,
      colors: [],
      sizes: [],
      isPublished: true,
      images: [],
    },
  });

  const [imagePreviews, setImagePreviews] = useState<ImagePreview[]>([]);

  useEffect(() => {
    if (
      isEdit &&
      params?.id &&
      categories.length > 0 &&
      colors.length > 0 &&
      sizes.length > 0
    ) {
      const existingProduct = getProduct(Number(params.id));

      if (existingProduct) {
        const productColors = existingProduct.colors?.map((c) => c.id) || [];
        const productSizes = existingProduct.sizes?.map((s) => s.id) || [];

        // Load existing images
        const existingImages: ImagePreview[] =
          existingProduct.images?.map((img) => ({
            image_url: img.image_url || (img as any).url,
            id: img.id,
            isExisting: true,
          })) || [];

        setImagePreviews(existingImages);

        setTimeout(() => {
          reset({
            name: existingProduct.name,
            sku: existingProduct.sku,
            description: existingProduct.description || "",
            basePrice: existingProduct.basePrice,
            category: existingProduct.category,
            colors: productColors,
            sizes: productSizes,
            isPublished: existingProduct.isPublished,
            images: [] as File[],
          });
        }, 100);
      }
    }
  }, [isEdit, params?.id, getProduct, reset, categories, colors, sizes]);

  const onSubmit = async (data: ProductFormValues) => {
    if (!data.category || data.colors.length === 0 || data.sizes.length === 0) {
      toast.warning("Vui lòng chọn đầy đủ danh mục, ít nhất một màu sắc và một kích thước");
      return;
    }

    try {
      const productData = {
        name: data.name,
        sku: data.sku,
        description: data.description,
        basePrice: data.basePrice,
        category: data.category,
        isPublished: data.isPublished,
      };

      if (isEdit && params?.id) {
        const keepImageUrls = imagePreviews
          .filter((img) => img.isExisting)
          .map((img) => img.image_url);

        const newImageFiles = data.images || [];

        await updateProduct(
          Number(params.id),
          productData,
          data.sizes,
          data.colors,
          newImageFiles,
          keepImageUrls
        );
      } else {
        await addProductWithVariants(
          productData,
          data.sizes,
          data.colors,
          data.images || []
        );
      }

      router.push("/admin/products");
    } catch (error) {
      console.error("Error saving product:", error);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    const newPreviews: ImagePreview[] = files.map((file) => ({
      file,
      image_url: URL.createObjectURL(file),
      isExisting: false,
    }));

    setImagePreviews((prev) => [...prev, ...newPreviews]);
    setValue("images", [...(watch("images") || []), ...files]);
  };

  const removeImage = (index: number) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));

    const currentImages = watch("images") || [];
    setValue(
      "images",
      currentImages.filter((_, i) => i !== index)
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/products">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            {isEdit ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isEdit
              ? "Cập nhật thông tin chi tiết và biến thể sản phẩm"
              : "Tạo sản phẩm và tự động sinh các biến thể kích thước / màu sắc"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Thông tin cơ bản</CardTitle>
              <CardDescription>Nhập tên, mã SKU, mô tả và giá sản phẩm</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Tên Sản Phẩm *</Label>
                <Input
                  {...register("name", {
                    required: "Tên sản phẩm là bắt buộc",
                  })}
                  placeholder="Ví dụ: Áo Sơ Mi Nam Oxford"
                  className={errors.name ? "border-destructive" : ""}
                />
                {errors.name && (
                  <p className="text-xs text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>SKU *</Label>
                <Input
                  {...register("sku", {
                    required: "SKU là bắt buộc",
                  })}
                  placeholder="Ví dụ: ASM-OXF-01"
                  className={errors.sku ? "border-destructive" : ""}
                />
                {errors.sku && (
                  <p className="text-xs text-destructive">
                    {errors.sku.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Mô tả chi tiết *</Label>
                <Textarea
                  {...register("description", {
                    required: "Mô tả sản phẩm là bắt buộc",
                  })}
                  rows={4}
                  placeholder="Mô tả chất liệu, form dáng, tính năng nổi bật..."
                  className={errors.description ? "border-destructive" : ""}
                />
                {errors.description && (
                  <p className="text-xs text-destructive">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Giá Gốc (VNĐ) *</Label>
                <Input
                  type="number"
                  {...register("basePrice", {
                    required: "Giá gốc là bắt buộc",
                    valueAsNumber: true,
                    min: {
                      value: 0,
                      message: "Giá phải lớn hơn hoặc bằng 0",
                    },
                  })}
                  placeholder="Ví dụ: 350000"
                  className={errors.basePrice ? "border-destructive" : ""}
                />
                {errors.basePrice && (
                  <p className="text-xs text-destructive">
                    {errors.basePrice.message}
                  </p>
                )}
              </div>

              <div className="pt-2">
                <Label className="flex items-center space-x-2 cursor-pointer">
                  <Controller
                    control={control}
                    name="isPublished"
                    render={({ field }) => (
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <span className="text-sm font-medium">Hiển thị bán trên website ngay sau khi tạo</span>
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Categories & Options */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Danh mục & Tùy chọn</CardTitle>
              <CardDescription>
                Chọn danh mục, màu sắc và kích thước áp dụng
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label>Danh Mục Sản Phẩm *</Label>
                <Controller
                  control={control}
                  name="category"
                  rules={{
                    required: "Vui lòng chọn danh mục",
                    validate: (value) => (value && value.id ? true : "Vui lòng chọn danh mục"),
                  }}
                  render={({ field }) => (
                    <Select
                      value={field.value?.id ? String(field.value.id) : ""}
                      onValueChange={(value) => {
                        const selectedCategory = categories.find(
                          (c) => c.id === Number(value)
                        );
                        field.onChange(selectedCategory);
                      }}
                    >
                      <SelectTrigger
                        className={errors.category ? "border-destructive" : ""}
                      >
                        <SelectValue placeholder="Chọn danh mục áp dụng" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {selectableCategories.map((c) => (
                          <SelectItem key={c.id} value={String(c.id)}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.category && (
                  <p className="text-xs text-destructive">
                    {errors.category.message}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <Label>Màu Sắc Áp Dụng *</Label>
                <Controller
                  control={control}
                  name="colors"
                  rules={{
                    validate: (v) =>
                      v && v.length > 0 || "Chọn ít nhất một màu sắc",
                  }}
                  render={({ field }) => (
                    <div className="grid grid-cols-2 gap-2 border p-3 rounded-lg max-h-48 overflow-y-auto">
                      {colors.map((color) => {
                        const checked = field.value?.includes(color.id);
                        return (
                          <div
                            key={color.id}
                            className="flex items-center space-x-2 py-1"
                          >
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(c) => {
                                const isChecked = c as boolean;
                                field.onChange(
                                  isChecked
                                    ? [...(field.value || []), color.id]
                                    : field.value?.filter((id: number) => id !== color.id)
                                );
                              }}
                            />
                            <div className="flex items-center space-x-2">
                              <div
                                className="w-3.5 h-3.5 rounded-full border shadow-xs"
                                style={{ backgroundColor: color.code }}
                              />
                              <span className="text-xs text-gray-700">{color.name}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                />
                {errors.colors && (
                  <p className="text-xs text-destructive">
                    {errors.colors.message}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <Label>Kích Thước Áp Dụng *</Label>
                <Controller
                  control={control}
                  name="sizes"
                  rules={{
                    validate: (v) =>
                      v && v.length > 0 || "Chọn ít nhất một kích thước",
                  }}
                  render={({ field }) => (
                    <div className="grid grid-cols-3 gap-2 border p-3 rounded-lg max-h-48 overflow-y-auto">
                      {sizes.map((size) => {
                        const checked = field.value?.includes(size.id);
                        return (
                          <div
                            key={size.id}
                            className="flex items-center space-x-2 py-1"
                          >
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(c) => {
                                const isChecked = c as boolean;
                                field.onChange(
                                  isChecked
                                    ? [...(field.value || []), size.id]
                                    : field.value?.filter((s: number) => s !== size.id)
                                );
                              }}
                            />
                            <span className="text-xs font-medium text-gray-700">
                              {size.code}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                />
                {errors.sizes && (
                  <p className="text-xs text-destructive">
                    {errors.sizes.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Hình ảnh sản phẩm</CardTitle>
              <CardDescription>
                Tải lên một hoặc nhiều hình ảnh minh họa ({imagePreviews.length} ảnh đã chọn)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-200 hover:border-primary/50 transition-colors rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 mb-2">
                  Kéo thả hình ảnh vào đây hoặc nhấp để chọn tệp
                </p>
                <Input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <Button type="button" variant="outline" asChild>
                  <label htmlFor="image-upload" className="cursor-pointer">
                    Chọn tệp ảnh
                  </label>
                </Button>
              </div>

              {/* Preview Grid */}
              {imagePreviews.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-xs font-semibold uppercase text-gray-500 mb-3">
                    Ảnh đã tải lên:
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group aspect-square rounded-lg border overflow-hidden bg-gray-50">
                        <Image
                          src={preview.image_url}
                          alt={`Preview ${index + 1}`}
                          fill
                          className="object-cover"
                          unoptimized={true}
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-3 pt-6">
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/products">Hủy bỏ</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "Đang lưu..."
              : isEdit
              ? "Cập nhật sản phẩm"
              : "Tạo sản phẩm & Biến thể"}
          </Button>
        </div>
      </form>
    </div>
  );
}
