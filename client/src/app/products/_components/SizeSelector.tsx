"use client";

import React from "react";
import { Size } from "@/types";

interface SizeSelectorProps {
  availableSizes: Size[];
  selectedSize: Size | null;
  onSelectSize: (size: Size) => void;
}

export default function SizeSelector({
  availableSizes,
  selectedSize,
  onSelectSize,
}: SizeSelectorProps) {
  return (
    <div>
      <h3 className="font-medium text-gray-900 mb-3 text-sm">
        Kích cỡ: <span className="font-semibold">{selectedSize?.code || selectedSize?.name || "Chưa chọn"}</span>
      </h3>
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
        {availableSizes.map((size) => (
          <button
            key={size.id}
            onClick={() => onSelectSize(size)}
            type="button"
            className={`py-2 px-3 border rounded-md text-xs sm:text-sm font-medium transition-all ${
              selectedSize?.id === size.id
                ? "border-black bg-black text-white shadow-sm"
                : "border-gray-200 hover:border-gray-400 bg-white text-gray-800"
            }`}
          >
            {size.code || size.name}
          </button>
        ))}
      </div>
    </div>
  );
}
