"use client";

import { useEffect, useState, useMemo } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProductStore } from "@/stores/productStore";
import { useCategoryStore } from "@/stores/categoryStore";
import {
  ArrowLeft,
  Upload,
  X,
  Layers,
  Palette,
  Image as ImageIcon,
  Check,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useForm, Controller } from "react-hook-form";
import { Category, Color, Size } from "@/types";
import { useColors } from "@/services/colorService";
import { useSizes } from "@/services/sizeService";
import privateClient from "@/lib/axios";
import { formatPrice } from "@/lib/utils";
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
}

export interface ImageItem {
  id?: number;
  file?: File;
  image_url: string;
  isExisting?: boolean;
  colorId?: number | null; // null: ảnh chung sản phẩm, number: gắn với màu cụ thể
  colorName?: string | null;
  colorCode?: string | null;
}

export default function AdminProductFormPage() {
  const router = useRouter();
  const params = useParams();
  const isEdit = !!params?.id;

  const { data: colors = [] } = useColors();
  const { data: sizes = [] } = useSizes();
  const { categories, fetchCategories } = useCategoryStore();
  const { addProductWithVariants, updateProduct } = useProductStore();

  const [imageItems, setImageItems] = useState<ImageItem[]>([]);
  const [deletedImageIds, setDeletedImageIds] = useState<number[]>([]);
  const [activeImageTab, setActiveImageTab] = useState<string>("all");
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const selectableCategories = categories.length > 0
    ? categories.some((c) => c.parentId)
      ? categories.filter((c) => c.parentId)
      : categories
    : [];

  const {
    register,
    control,
    handleSubmit,
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
    },
  });

  const selectedColorIds = watch("colors") || [];
  const selectedSizeIds = watch("sizes") || [];
  const baseSku = watch("sku") || "SKU";
  const basePrice = watch("basePrice") || 0;

  // ponytail: Danh sách các màu đã được chọn trong form
  const activeSelectedColors = useMemo(() => {
    return colors.filter((c) => selectedColorIds.includes(c.id));
  }, [colors, selectedColorIds]);

  const activeSelectedSizes = useMemo(() => {
    return sizes.filter((s) => selectedSizeIds.includes(s.id));
  }, [sizes, selectedSizeIds]);

  // ponytail: Tải dữ liệu sản phẩm khi ở chế độ chỉnh sửa (Edit mode)
  useEffect(() => {
    if (isEdit && params?.id) {
      const loadProduct = async () => {
        setIsLoadingProduct(true);
        try {
          const res = await privateClient.get(`/products/${params.id}`);
          const p = res.data?.data || res.data;
          if (p) {
            const productColors = p.colors?.map((c: any) => c.id) || [];
            const productSizes = p.sizes?.map((s: any) => s.id) || [];

            // Nạp ảnh hiện có kèm thông tin phân loại màu sắc
            const existingImages: ImageItem[] = (p.images || []).map((img: any) => ({
              id: img.id,
              image_url: img.url || img.image_url,
              isExisting: true,
              colorId: img.colorId ?? null,
              colorName: img.colorName ?? null,
              colorCode: img.colorCode ?? null,
            }));

            setImageItems(existingImages);

            reset({
              name: p.name,
              sku: p.sku || `PRD-${p.id}`,
              description: p.description || "",
              basePrice: Number(p.basePrice ?? p.minPrice ?? 0),
              category: p.category,
              colors: productColors,
              sizes: productSizes,
              isPublished: p.isPublished !== false && p.isActive !== false,
            });
          }
        } catch (err) {
          console.error("Failed to load product:", err);
          toast.error("Không thể tải thông tin sản phẩm");
        } finally {
          setIsLoadingProduct(false);
        }
      };
      loadProduct();
    }
  }, [isEdit, params?.id, reset]);

  // ponytail: Upload ảnh theo nhóm màu sắc hoặc ảnh chung
  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    targetColorId: number | null = null
  ) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const targetColor = colors.find((c) => c.id === targetColorId);

    const newItems: ImageItem[] = files.map((file) => ({
      file,
      image_url: URL.createObjectURL(file),
      isExisting: false,
      colorId: targetColorId,
      colorName: targetColor ? targetColor.name : null,
      colorCode: targetColor ? targetColor.code : null,
    }));

    setImageItems((prev) => [...prev, ...newItems]);
    // Reset file input để có thể chọn lại cùng 1 file nếu muốn
    e.target.value = "";
  };

  const removeImage = (index: number) => {
    const target = imageItems[index];
    if (target.isExisting && target.id) {
      setDeletedImageIds((prev) => [...prev, target.id!]);
    }
    setImageItems((prev) => prev.filter((_, i) => i !== index));
  };

  const changeImageColor = (index: number, newColorId: number | null) => {
    const targetColor = colors.find((c) => c.id === newColorId);
    setImageItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              colorId: newColorId,
              colorName: targetColor ? targetColor.name : null,
              colorCode: targetColor ? targetColor.code : null,
            }
          : item
      )
    );
  };

  const filteredImageItems = useMemo(() => {
    if (activeImageTab === "all") return imageItems;
    if (activeImageTab === "general") return imageItems.filter((img) => !img.colorId);
    const colorIdNum = Number(activeImageTab);
    return imageItems.filter((img) => img.colorId === colorIdNum);
  }, [imageItems, activeImageTab]);

  const onSubmit = async (data: ProductFormValues) => {
    if (!data.category || data.colors.length === 0 || data.sizes.length === 0) {
      toast.warning("Vui lòng chọn danh mục, ít nhất một màu sắc và một kích thước");
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

      // Tách các file mới cần upload kèm colorId
      const newImageUploads = imageItems
        .filter((img) => !img.isExisting && img.file)
        .map((img) => ({
          file: img.file!,
          colorId: img.colorId ?? null,
        }));

      if (isEdit && params?.id) {
        const keepImageUrls = imageItems
          .filter((img) => img.isExisting)
          .map((img) => img.image_url);

        const existingImagesWithClassification = imageItems
          .filter((img) => img.isExisting && img.id)
          .map((img) => ({
            id: img.id!,
            colorId: img.colorId ?? null,
          }));

        await updateProduct(
          Number(params.id),
          productData,
          data.sizes,
          data.colors,
          newImageUploads,
          keepImageUrls,
          deletedImageIds,
          existingImagesWithClassification
        );
      } else {
        await addProductWithVariants(
          productData,
          data.sizes,
          data.colors,
          newImageUploads
        );
      }

      router.push("/admin/products");
    } catch (error) {
      console.error("Error saving product:", error);
    }
  };

  if (isLoadingProduct) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div>
          <p className="text-gray-500 text-sm">Đang tải thông tin sản phẩm...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
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
              ? "Cập nhật thông tin chi tiết, màu sắc, kích thước và ảnh phân loại"
              : "Tạo sản phẩm, tải ảnh riêng biệt theo từng màu sắc & tự động tạo biến thể"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Cột 1: Thông tin cơ bản */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Thông tin cơ bản</CardTitle>
              <CardDescription>Nhập tên, mã SKU gốc, mô tả và giá sản phẩm</CardDescription>
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
                  <p className="text-xs text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Mã SKU Gốc *</Label>
                <Input
                  {...register("sku", {
                    required: "SKU là bắt buộc",
                  })}
                  placeholder="Ví dụ: ASM-OXF-01"
                  className={errors.sku ? "border-destructive" : ""}
                />
                {errors.sku && (
                  <p className="text-xs text-destructive">{errors.sku.message}</p>
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
                  <p className="text-xs text-destructive">{errors.description.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Giá Bán Chuẩn (VNĐ) *</Label>
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
                  <p className="text-xs text-destructive">{errors.basePrice.message}</p>
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

          {/* Cột 2: Danh mục & Phân loại Màu sắc / Kích thước */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Danh mục & Phân loại</CardTitle>
              <CardDescription>
                Chọn danh mục, màu sắc và kích thước áp dụng cho sản phẩm
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
                  <p className="text-xs text-destructive">{errors.category.message}</p>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Màu Sắc Áp Dụng *</Label>
                  <span className="text-xs text-muted-foreground">
                    Đã chọn: {activeSelectedColors.length} màu
                  </span>
                </div>
                <Controller
                  control={control}
                  name="colors"
                  rules={{
                    validate: (v) => (v && v.length > 0) || "Chọn ít nhất một màu sắc",
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
                  <p className="text-xs text-destructive">{errors.colors.message}</p>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Kích Thước Áp Dụng *</Label>
                  <span className="text-xs text-muted-foreground">
                    Đã chọn: {activeSelectedSizes.length} size
                  </span>
                </div>
                <Controller
                  control={control}
                  name="sizes"
                  rules={{
                    validate: (v) => (v && v.length > 0) || "Chọn ít nhất một kích thước",
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
                  <p className="text-xs text-destructive">{errors.sizes.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* KHU VỰC TẢI ẢNH THEO TỪNG PHÂN LOẠI MÀU SẮC (Crucial Redesign!) */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-primary" />
                    Hình ảnh theo phân loại màu sắc ({imageItems.length} ảnh)
                  </CardTitle>
                  <CardDescription>
                    Tải ảnh riêng biệt cho từng màu sắc (hoặc ảnh dùng chung). Khách hàng bấm màu nào sẽ thấy đúng ảnh màu đó trên web.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Tabs lọc & quản lý ảnh theo màu */}
              <Tabs
                value={activeImageTab}
                onValueChange={setActiveImageTab}
                className="w-full"
              >
                <TabsList className="flex flex-wrap h-auto p-1 gap-1 bg-gray-100/80 rounded-lg">
                  <TabsTrigger value="all" className="text-xs">
                    Tất cả ảnh ({imageItems.length})
                  </TabsTrigger>
                  <TabsTrigger value="general" className="text-xs">
                    Ảnh dùng chung ({imageItems.filter((i) => !i.colorId).length})
                  </TabsTrigger>
                  {activeSelectedColors.map((color) => {
                    const count = imageItems.filter((i) => i.colorId === color.id).length;
                    return (
                      <TabsTrigger
                        key={color.id}
                        value={String(color.id)}
                        className="text-xs flex items-center gap-1.5"
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full border shadow-2xs"
                          style={{ backgroundColor: color.code }}
                        />
                        {color.name} ({count})
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
              </Tabs>

              {/* Khung tải ảnh dành riêng cho tab đang chọn */}
              <div className="border-2 border-dashed border-gray-200 hover:border-primary/50 transition-colors rounded-xl p-6 text-center bg-gray-50/50">
                <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm font-medium text-gray-700 mb-1">
                  {activeImageTab === "all" || activeImageTab === "general" ? (
                    <span>Tải ảnh dùng chung cho sản phẩm</span>
                  ) : (
                    <span>
                      Tải ảnh cho phân loại:{" "}
                      <strong className="text-primary">
                        {colors.find((c) => String(c.id) === activeImageTab)?.name}
                      </strong>
                    </span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground mb-3">
                  Hỗ trợ định dạng JPG, PNG, WEBP. Chọn nhiều ảnh cùng lúc.
                </p>

                <Input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    const targetColorId =
                      activeImageTab === "all" || activeImageTab === "general"
                        ? null
                        : Number(activeImageTab);
                    handleImageUpload(e, targetColorId);
                  }}
                  className="hidden"
                  id="tab-image-upload"
                />
                <Button type="button" variant="outline" size="sm" asChild>
                  <label htmlFor="tab-image-upload" className="cursor-pointer">
                    Chọn tệp tải lên
                  </label>
                </Button>
              </div>

              {/* Lưới danh sách ảnh preview kèm selector gán màu */}
              {filteredImageItems.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground border rounded-lg bg-white">
                  Chưa có hình ảnh nào trong mục này. Bấm &quot;Chọn tệp tải lên&quot; ở trên để thêm ảnh.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {filteredImageItems.map((item) => {
                    const realIndex = imageItems.findIndex((i) => i === item);
                    const currentColor = colors.find((c) => c.id === item.colorId);

                    return (
                      <div
                        key={item.id ? `exist-${item.id}` : `new-${realIndex}`}
                        className="group relative rounded-xl border bg-white p-2 shadow-xs space-y-2 flex flex-col justify-between overflow-hidden"
                      >
                        <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-gray-100 border">
                          <Image
                            src={item.image_url}
                            alt="Ảnh sản phẩm"
                            fill
                            className="object-cover"
                            unoptimized={true}
                          />

                          {/* Huy hiệu màu trên ảnh */}
                          <div className="absolute top-1.5 left-1.5">
                            {currentColor ? (
                              <span
                                className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/95 text-gray-800 shadow-xs border"
                              >
                                <span
                                  className="w-2 h-2 rounded-full border shadow-2xs"
                                  style={{ backgroundColor: currentColor.code }}
                                />
                                {currentColor.name}
                              </span>
                            ) : (
                              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-black/60 text-white backdrop-blur-xs">
                                Dùng chung
                              </span>
                            )}
                          </div>

                          {/* Nút xóa ảnh */}
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-1.5 right-1.5 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeImage(realIndex)}
                            title="Xóa ảnh này"
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>

                        {/* Dropdown đổi màu gán cho ảnh nhanh chóng */}
                        <div className="space-y-1">
                          <Label className="text-[11px] text-muted-foreground block">
                            Gắn với phân loại:
                          </Label>
                          <select
                            value={item.colorId ? String(item.colorId) : "general"}
                            onChange={(e) => {
                              const val = e.target.value;
                              changeImageColor(
                                realIndex,
                                val === "general" ? null : Number(val)
                              );
                            }}
                            className="w-full text-xs h-7 px-2 rounded-md border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                          >
                            <option value="general">Dùng chung (Mặc định)</option>
                            {activeSelectedColors.map((c) => (
                              <option key={c.id} value={String(c.id)}>
                                Màu: {c.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* BẢNG XEM TRƯỚC CÁC BIẾN THỂ TỰ ĐỘNG SINH (Variants Matrix Preview) */}
          {activeSelectedColors.length > 0 && activeSelectedSizes.length > 0 && (
            <Card className="lg:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Layers className="h-4 w-4 text-primary" />
                  Xem trước ma trận biến thể ({activeSelectedColors.length * activeSelectedSizes.length} phân loại)
                </CardTitle>
                <CardDescription>
                  Hệ thống tự động sinh các mã biến thể tương ứng từ Màu sắc và Kích thước đã chọn
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto max-h-60 rounded-lg border">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-gray-50/80 sticky top-0 border-b">
                      <tr>
                        <th className="p-2.5 font-semibold text-gray-700">Mã SKU biến thể</th>
                        <th className="p-2.5 font-semibold text-gray-700">Màu sắc</th>
                        <th className="p-2.5 font-semibold text-gray-700">Kích thước</th>
                        <th className="p-2.5 font-semibold text-gray-700">Giá bán</th>
                        <th className="p-2.5 font-semibold text-gray-700 text-center">Tồn kho ban đầu</th>
                        <th className="p-2.5 font-semibold text-gray-700 text-center">Ảnh đã gắn</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {activeSelectedColors.flatMap((c) =>
                        activeSelectedSizes.map((s) => {
                          const variantSku = `${baseSku}-C${c.id}-S${s.id}`;
                          const attachedImagesCount = imageItems.filter(
                            (i) => i.colorId === c.id
                          ).length;

                          return (
                            <tr key={`${c.id}-${s.id}`} className="hover:bg-gray-50/50">
                              <td className="p-2.5 font-mono font-medium text-gray-800">
                                {variantSku}
                              </td>
                              <td className="p-2.5">
                                <div className="flex items-center gap-1.5">
                                  <span
                                    className="w-2.5 h-2.5 rounded-full border shadow-2xs"
                                    style={{ backgroundColor: c.code }}
                                  />
                                  <span>{c.name}</span>
                                </div>
                              </td>
                              <td className="p-2.5 font-semibold">{s.code}</td>
                              <td className="p-2.5 text-gray-700 font-medium">
                                {formatPrice(basePrice)}
                              </td>
                              <td className="p-2.5 text-center text-emerald-700 font-semibold">
                                100 sp
                              </td>
                              <td className="p-2.5 text-center">
                                <span
                                  className={`inline-block px-2 py-0.5 rounded-full font-medium ${
                                    attachedImagesCount > 0
                                      ? "bg-primary/10 text-primary"
                                      : "bg-gray-100 text-gray-500"
                                  }`}
                                >
                                  {attachedImagesCount > 0
                                    ? `${attachedImagesCount} ảnh`
                                    : "Chưa có"}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 pt-6 border-t mt-6">
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/products">Hủy bỏ</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "Đang lưu sản phẩm..."
              : isEdit
              ? "Cập nhật sản phẩm"
              : "Tạo sản phẩm & Biến thể"}
          </Button>
        </div>
      </form>
    </div>
  );
}
