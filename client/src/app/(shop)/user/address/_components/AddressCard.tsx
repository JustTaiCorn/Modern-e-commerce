import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Edit2, Trash2, Star, Check } from "lucide-react";
import { Address } from "@/types";

interface AddressCardProps {
  address: Address;
  onEdit: (address: Address) => void;
  onDelete: (id: number) => void;
  onSetDefault: (id: number) => void;
  isOnlyAddress: boolean;
}

export default function AddressCard({
  address,
  onEdit,
  onDelete,
  onSetDefault,
  isOnlyAddress,
}: AddressCardProps) {
  return (
    <Card
      className={`relative transition-all duration-200 ${
        address.isDefault ? "border-primary shadow-sm bg-primary/5" : "border-gray-200"
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            {address.isDefault && (
              <Badge variant="default" className="gap-1 bg-primary text-white">
                <Star className="h-3 w-3 fill-current" />
                Mặc định
              </Badge>
            )}
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-500 hover:text-gray-900"
              onClick={() => onEdit(address)}
              title="Chỉnh sửa"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
              onClick={() => onDelete(address.id)}
              disabled={address.isDefault && isOnlyAddress}
              title="Xóa"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        <div>
          <p className="font-semibold text-gray-900">{address.line}</p>
          <p className="text-gray-600 text-sm mt-1">
            {[address.ward, address.district, address.province].filter(Boolean).join(", ")}
          </p>
        </div>

        {!address.isDefault && (
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs hover:bg-primary hover:text-white"
            onClick={() => onSetDefault(address.id)}
          >
            <Check className="h-3.5 w-3.5 mr-1.5" />
            Đặt làm mặc định
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
