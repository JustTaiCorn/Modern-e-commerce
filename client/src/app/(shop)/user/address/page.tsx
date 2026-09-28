"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { MapPin, Plus } from "lucide-react";
import { useAddress } from "@/hooks/useAddress";
import UserLayout from "@/components/layouts/UserLayout";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import AddressCard from "./_components/AddressCard";
import AddressDeleteDialog from "./_components/AddressDeleteDialog";
import useAuthStore from "@/stores/useAuthStore";
import { Address } from "@/types";

interface AddressFormData {
  line: string;
  ward: string;
  district?: string;
  province: string;
  isDefault: boolean;
}

export default function AddressManagementPage() {
  const {
    authUser,
    fetchAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
  } = useAuthStore();

  const {
    provinces,
    fetchProvinces,
    wards,
    isLoadingProvinces,
    isLoadingWards,
    fetchWards,
    clearWards,
  } = useAddress();

  useEffect(() => {
    fetchProvinces();
  }, [fetchProvinces]);

  // States
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [deletingAddressId, setDeletingAddressId] = useState<number | null>(null);
  const [selectedProvinceCode, setSelectedProvinceCode] = useState("");
  const [selectedWardCode, setSelectedWardCode] = useState("");

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AddressFormData>({
    defaultValues: {
      line: "",
      ward: "",
      province: "",
      isDefault: false,
    },
  });

  const addresses = authUser?.addresses || [];

  useEffect(() => {
    const loadAddresses = async () => {
      if (authUser?.id) {
        setIsLoadingAddresses(true);
        try {
          await fetchAddresses();
        } catch (error) {
          console.error("Failed to fetch addresses:", error);
        } finally {
          setIsLoadingAddresses(false);
        }
      }
    };

    if (authUser?.id && addresses.length === 0) {
      loadAddresses();
    }
  }, [authUser?.id, fetchAddresses, addresses.length]);

  // Reset form
  const resetFormState = () => {
    reset({
      line: "",
      ward: "",
      province: "",
      isDefault: false,
    });
    setSelectedProvinceCode("");
    setSelectedWardCode("");
    clearWards();
    setEditingAddress(null);
  };

  const handleOpenAddDialog = () => {
    resetFormState();
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (address: Address) => {
    setEditingAddress(address);
    reset({
      line: address.line,
      ward: address.ward || "",
      province: address.province || "",
      isDefault: address.isDefault,
    });
    setIsDialogOpen(true);
  };

  const handleProvinceChange = (provinceCode: string) => {
    const selectedProvince = provinces.find((p) => p.code === provinceCode);
    if (selectedProvince) {
      setSelectedProvinceCode(provinceCode);
      setValue("province", selectedProvince.name, { shouldValidate: true });
      setValue("ward", "", { shouldValidate: true });
      setSelectedWardCode("");
      fetchWards(provinceCode);
    }
  };

  const handleWardChange = (wardCode: string) => {
    const selectedWard = wards.find((w) => w.code === wardCode);
    if (selectedWard) {
      setSelectedWardCode(wardCode);
      setValue("ward", selectedWard.name, { shouldValidate: true });
    }
  };

  const onSubmit: SubmitHandler<AddressFormData> = async (data) => {
    try {
      if (editingAddress) {
        await updateAddress(editingAddress.id, data);
      } else {
        await addAddress(data);
      }

      setIsDialogOpen(false);
      resetFormState();
    } catch (error) {
      console.error("Error saving address:", error);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingAddressId) return;

    try {
      await deleteAddress(deletingAddressId);
      setIsDeleteDialogOpen(false);
      setDeletingAddressId(null);
    } catch (error) {
      console.error("Error deleting address:", error);
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      await setDefaultAddress(id);
    } catch (error) {
      console.error("Error setting default address:", error);
    }
  };

  return (
    <UserLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Quản lý địa chỉ nhận hàng
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              Quản lý các địa chỉ giao hàng để tiện cho việc mua sắm
            </p>
          </div>
          <Button onClick={handleOpenAddDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Thêm địa chỉ mới
          </Button>
        </div>

        {/* Address List */}
        {isLoadingAddresses ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4" />
              <p className="text-gray-600 text-sm">Đang tải danh sách địa chỉ...</p>
            </CardContent>
          </Card>
        ) : addresses.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <MapPin className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Chưa có địa chỉ nào
              </h3>
              <p className="text-gray-500 text-sm max-w-sm mb-6">
                Thêm địa chỉ giao hàng của bạn để quá trình đặt và nhận hàng diễn ra nhanh chóng hơn.
              </p>
              <Button onClick={handleOpenAddDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Thêm địa chỉ đầu tiên
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((address) => (
              <AddressCard
                key={address.id}
                address={address}
                onEdit={handleOpenEditDialog}
                onDelete={(id) => {
                  setDeletingAddressId(id);
                  setIsDeleteDialogOpen(true);
                }}
                onSetDefault={handleSetDefault}
                isOnlyAddress={addresses.length === 1}
              />
            ))}
          </div>
        )}

        {/* Add/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingAddress ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ mới"}
              </DialogTitle>
              <DialogDescription>
                {editingAddress
                  ? "Cập nhật thông tin địa chỉ giao nhận của bạn"
                  : "Nhập thông tin địa chỉ nhận hàng"}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Province & Ward */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="province">
                    Tỉnh/Thành phố <span className="text-red-500">*</span>
                  </Label>
                  <input
                    type="hidden"
                    {...register("province", {
                      required: "Vui lòng chọn Tỉnh/Thành phố",
                    })}
                  />
                  <Select
                    value={selectedProvinceCode}
                    onValueChange={handleProvinceChange}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          isLoadingProvinces ? "Đang tải..." : "Chọn Tỉnh/Thành"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {provinces.map((province) => (
                        <SelectItem key={province.code} value={province.code}>
                          {province.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.province && (
                    <p className="text-xs text-red-500">
                      {errors.province.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ward">
                    Phường/Xã <span className="text-red-500">*</span>
                  </Label>
                  <input
                    type="hidden"
                    {...register("ward", {
                      required: "Vui lòng chọn Phường/Xã",
                    })}
                  />
                  <Select
                    value={selectedWardCode}
                    onValueChange={handleWardChange}
                    disabled={!selectedProvinceCode}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          !selectedProvinceCode
                            ? "Chọn Tỉnh/Thành trước"
                            : isLoadingWards
                            ? "Đang tải..."
                            : "Chọn Phường/Xã"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {wards.map((ward) => (
                        <SelectItem key={ward.code} value={ward.code}>
                          {ward.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.ward && (
                    <p className="text-xs text-red-500">
                      {errors.ward.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Line Address */}
              <div className="space-y-2">
                <Label htmlFor="line">
                  Địa chỉ chi tiết <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="line"
                  placeholder="Số nhà, tên ngõ, tòa nhà..."
                  {...register("line", {
                    required: "Vui lòng nhập địa chỉ chi tiết",
                  })}
                />
                {errors.line && (
                  <p className="text-xs text-red-500">{errors.line.message}</p>
                )}
              </div>

              {/* Set Default Checkbox */}
              <div className="flex items-center space-x-2 pt-2">
                <Controller
                  name="isDefault"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="checkbox"
                      id="isDefault"
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                    />
                  )}
                />
                <Label htmlFor="isDefault" className="cursor-pointer text-sm">
                  Đặt làm địa chỉ nhận hàng mặc định
                </Label>
              </div>

              <DialogFooter className="pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    resetFormState();
                  }}
                  disabled={isSubmitting}
                >
                  Hủy
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting
                    ? "Đang lưu..."
                    : editingAddress
                    ? "Lưu thay đổi"
                    : "Thêm địa chỉ"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AddressDeleteDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onConfirm={handleDeleteConfirm}
          onCancel={() => {
            setIsDeleteDialogOpen(false);
            setDeletingAddressId(null);
          }}
        />
      </div>
    </UserLayout>
  );
}
