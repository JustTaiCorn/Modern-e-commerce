"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { useInventoryStore } from "@/stores/inventoryStore";

interface VariantInventory {
  variantId: number;
  sku: string;
  sizeName: string;
  colorName: string;
  colorCode: string;
  currentQuantity: number;
  newQuantity: number;
}

export default function AdminProductInventoryPage() {
  const params = useParams();
  const router = useRouter();
  const productId = Number(params?.id);

  const { updateInventory, fetchInventoriesByProduct } = useInventoryStore();

  const [productName, setProductName] = useState("");
  const [productSku, setProductSku] = useState("");
  const [variants, setVariants] = useState<VariantInventory[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const productInventories = await fetchInventoriesByProduct(productId);

        if (!productInventories || productInventories.length === 0) {
          toast.error("Không tìm thấy sản phẩm hoặc sản phẩm chưa có biến thể");
          router.push("/admin/stock");
          return;
        }

        const firstInventory = productInventories[0];
        const firstVariant = firstInventory.productVariant || firstInventory;
        setProductName(
          firstVariant.product?.name || "Sản phẩm"
        );
        setProductSku(
          firstVariant.product?.sku ||
          firstVariant.sku ||
          ""
        );

        const variantInventories: VariantInventory[] = productInventories.map(
          (inv: any) => {
            const variant = inv.productVariant || inv;
            const size =
              variant.size ||
              variant.attributeValues?.find(
                (av: any) =>
                  av.attributeValue?.type?.name?.toLowerCase() === "size" ||
                  !av.attributeValue?.colorHex
              )?.attributeValue;
            const color =
              variant.color ||
              variant.attributeValues?.find(
                (av: any) =>
                  av.attributeValue?.type?.name?.toLowerCase() === "color" ||
                  av.attributeValue?.colorHex
              )?.attributeValue;

            return {
              variantId: variant.id,
              sku: variant.sku,
              sizeName: size?.displayName || size?.name || size?.value || "N/A",
              colorName: color?.displayName || color?.name || color?.value || "N/A",
              colorCode: color?.colorHex || color?.code || "#000000",
              currentQuantity: inv.quantity ?? variant.countInStock ?? 0,
              newQuantity: inv.quantity ?? variant.countInStock ?? 0,
            };
          }
        );

        setVariants(variantInventories);
      } catch (error) {
        console.error("Load inventory error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (productId) {
      loadData();
    }
  }, [productId, fetchInventoriesByProduct, router]);

  const handleQuantityChange = (variantId: number, value: string) => {
    const numValue = parseInt(value) || 0;
    if (numValue < 0) return;

    setVariants((prev) =>
      prev.map((v) =>
        v.variantId === variantId ? { ...v, newQuantity: numValue } : v
      )
    );
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      const promises = variants.map((v) =>
        updateInventory({
          variantId: v.variantId,
          quantity: v.newQuantity,
        })
      );

      await Promise.all(promises);
      toast.success("Cập nhật số lượng kho thành công!");
      router.push("/admin/stock");
    } catch (error) {
      console.error("Save inventory error:", error);
      toast.error("Lỗi khi lưu số lượng tồn kho");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div>
          <p className="text-gray-500 text-sm">Đang tải thông tin biến thể...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/stock">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Điều chỉnh tồn kho
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Sản phẩm: <span className="font-semibold text-gray-800">{productName}</span> ({productSku})
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Danh sách biến thể kích thước / màu sắc</CardTitle>
          <CardDescription>
            Nhập số lượng thực tế trong kho cho từng mã SKU biến thể
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Mã SKU biến thể</TableHead>
                  <TableHead>Màu sắc</TableHead>
                  <TableHead>Kích thước</TableHead>
                  <TableHead className="text-center">Tồn kho hiện tại</TableHead>
                  <TableHead className="w-40 text-center">Số lượng mới</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {variants.map((v) => (
                  <TableRow key={v.variantId}>
                    <TableCell className="font-mono text-xs font-semibold text-gray-800">
                      {v.sku}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: v.colorCode }}
                        />
                        <span className="text-xs">{v.colorName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-xs">{v.sizeName}</TableCell>
                    <TableCell className="text-center font-medium text-sm">
                      {v.currentQuantity}
                    </TableCell>
                    <TableCell className="text-center">
                      <Input
                        type="number"
                        min="0"
                        value={v.newQuantity}
                        onChange={(e) => handleQuantityChange(v.variantId, e.target.value)}
                        className="text-center font-bold h-9 w-28 mx-auto"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" asChild>
              <Link href="/admin/stock">Hủy</Link>
            </Button>
            <Button onClick={handleSaveAll} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Đang lưu..." : "Lưu tất cả thay đổi"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
