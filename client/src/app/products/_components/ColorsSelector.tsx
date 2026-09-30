"use client";

import React from "react";

interface Color {
  id: number;
  name: string;
  code: string;
}

interface ColorSelectorProps {
  availableColors: Color[];
  selectedColor: Color | null;
  onSelectColor: (color: Color) => void;
}

export default function ColorSelector({
  availableColors,
  selectedColor,
  onSelectColor,
}: ColorSelectorProps) {
  return (
    <div>
      <h3 className="font-medium text-gray-900 mb-3 text-sm">
        Màu sắc: <span className="font-semibold">{selectedColor?.name || "Chưa chọn"}</span>
      </h3>
      <div className="flex flex-wrap gap-2.5">
        {availableColors.map((color) => (
          <button
            key={color.id}
            onClick={() => onSelectColor(color)}
            className={`w-9 h-9 rounded-full border transition-all ${
              selectedColor?.id === color.id
                ? "border-black ring-2 ring-black/20 scale-105"
                : "border-gray-300 hover:border-gray-500"
            }`}
            style={{ backgroundColor: color.code }}
            title={color.name}
            type="button"
          />
        ))}
      </div>
    </div>
  );
}
