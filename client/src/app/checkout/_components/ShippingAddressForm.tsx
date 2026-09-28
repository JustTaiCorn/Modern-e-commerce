"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, Province, Ward } from "@/types";
import { useFormContext, Controller } from "react-hook-form";

export interface ShippingFormData {
  fullName: string;
  phone: string;
  address: string;
  ward: string;
  wardCode: string;
  province: string;
  provinceCode: string;
}

interface ShippingAddressFormProps {
  authUser: User | null;
  selectedAddressId: number | null;
  isNewAddress: boolean;
  provinces: Province[];
  wards: Ward[];
  isLoadingProvinces: boolean;
  isLoadingWards: boolean;
  onProvinceChange: (provinceCode: string) => void;
  onWardChange: (wardCode: string) => void;
  onAddressSelect: (addressId: number) => void;
  onNewAddress: () => void;
}

export default function ShippingAddressForm({
  authUser,
  selectedAddressId,
  isNewAddress,
  provinces,
  wards,
  isLoadingProvinces,
  isLoadingWards,
  onProvinceChange,
  onWardChange,
  onAddressSelect,
  onNewAddress,
}: ShippingAddressFormProps) {
  const {
    register,
    control,
    formState: { errors },
    watch,
  } = useFormContext<ShippingFormData>();
  const provinceCode = watch("provinceCode");

  return (
    <div className="space-y-5">
      {/* Customer Information */}
      <div className="space-y-4 pb-4 border-b">
        <h3 className="font-semibold text-gray-900 text-sm">Thông tin người nhận</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="fullName" className="text-xs">
              Họ và tên <span className="text-red-500">*</span>
            </Label>
            <Input
              id="fullName"
              placeholder="Nguyễn Văn A"
              {...register("fullName", {
                required: "Vui lòng nhập họ và tên",
              })}
            />
            {errors.fullName && (
              <p className="text-xs text-red-500">{errors.fullName.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-xs">
              Số điện thoại <span className="text-red-500">*</span>
            </Label>
            <Input
              id="phone"
              placeholder="0912345678"
              {...register("phone", {
                required: "Vui lòng nhập số điện thoại",
                pattern: {
                  value: /^\d{10}$/,
                  message: "Số điện thoại phải gồm 10 chữ số",
                },
              })}
            />
            {errors.phone && (
              <p className="text-xs text-red-500">{errors.phone.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Saved Addresses */}
      {authUser && authUser.addresses && authUser.addresses.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold text-gray-700">Địa chỉ đã lưu</Label>
            <span className="text-xs text-gray-500">
              {authUser.addresses.length} địa chỉ
            </span>
          </div>
          <RadioGroup
            value={selectedAddressId?.toString() || "new"}
            onValueChange={(value: string) => {
              if (value === "new") {
                onNewAddress();
              } else {
                onAddressSelect(parseInt(value));
              }
            }}
            className="space-y-2.5"
          >
            {authUser.addresses.map((addr) => (
              <div
                key={addr.id}
                className={`flex items-start space-x-3 rounded-lg border p-3.5 cursor-pointer transition-colors ${
                  selectedAddressId === addr.id
                    ? "border-black bg-gray-50"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
                onClick={() => onAddressSelect(addr.id)}
              >
                <RadioGroupItem
                  value={addr.id.toString()}
                  id={`addr-${addr.id}`}
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Label
                      htmlFor={`addr-${addr.id}`}
                      className="font-medium text-xs sm:text-sm cursor-pointer"
                    >
                      {addr.line}
                    </Label>
                    {addr.isDefault && (
                      <Badge variant="secondary" className="text-[10px]">
                        Mặc định
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {[addr.ward, addr.district, addr.province]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                </div>
              </div>
            ))}

            <div
              className={`flex items-start space-x-3 rounded-lg border p-3.5 cursor-pointer transition-colors ${
                isNewAddress
                  ? "border-black bg-gray-50"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
              onClick={onNewAddress}
            >
              <RadioGroupItem value="new" id="addr-new" className="mt-0.5" />
              <Label htmlFor="addr-new" className="font-medium text-xs sm:text-sm cursor-pointer">
                + Nhập địa chỉ giao hàng khác
              </Label>
            </div>
          </RadioGroup>
        </div>
      )}

      {/* New address input fields */}
      {(isNewAddress || !authUser || !authUser.addresses || authUser.addresses.length === 0) && (
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="province" className="text-xs">
                Tỉnh / Thành phố <span className="text-red-500">*</span>
              </Label>
              <input
                type="hidden"
                {...register("province", {
                  required: "Vui lòng chọn Tỉnh/Thành phố",
                })}
              />
              <Controller
                name="provinceCode"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={onProvinceChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue
                        placeholder={
                          isLoadingProvinces ? "Đang tải danh sách..." : "Chọn Tỉnh/Thành phố"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent className="max-h-60 overflow-y-auto">
                      {provinces.map((province) => (
                        <SelectItem key={province.code} value={province.code}>
                          {province.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.province && (
                <p className="text-xs text-red-500">{errors.province.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ward" className="text-xs">
                Xã / Phường <span className="text-red-500">*</span>
              </Label>
              <input
                type="hidden"
                {...register("ward", { required: "Vui lòng chọn Xã/Phường" })}
              />
              <Controller
                name="wardCode"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={onWardChange}
                    disabled={!provinceCode}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue
                        placeholder={
                          !provinceCode
                            ? "Vui lòng chọn tỉnh trước"
                            : isLoadingWards
                            ? "Đang tải danh sách..."
                            : "Chọn Xã/Phường"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent className="max-h-60 overflow-y-auto">
                      {wards.map((ward) => (
                        <SelectItem key={ward.code} value={ward.code}>
                          {ward.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.ward && (
                <p className="text-xs text-red-500">{errors.ward.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="address" className="text-xs">
              Địa chỉ chi tiết (Số nhà, tên đường...) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="address"
              placeholder="VD: Số 123 đường Lê Lợi"
              {...register("address", {
                required: "Vui lòng nhập địa chỉ cụ thể",
              })}
            />
            {errors.address && (
              <p className="text-xs text-red-500">{errors.address.message}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
