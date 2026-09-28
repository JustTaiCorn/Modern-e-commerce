import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number | undefined | null): string {
  if (price === undefined || price === null || isNaN(price)) {
    return "0 ₫";
  }
  return price.toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
  });
}

export function formatCurrency(amount: number | undefined | null): string {
  return formatPrice(amount);
}

export const formatDate = (
  dateString: string | undefined | null
): string => {
  if (!dateString) return "";
  try {
    return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: vi });
  } catch {
    return String(dateString);
  }
};

export const priceRanges = [
  { label: "Tất cả giá", value: [0, 5000000] as [number, number] },
  { label: formatPrice(500000), value: [0, 500000] as [number, number] },
  {
    label: formatPrice(500000) + " - " + formatPrice(1000000),
    value: [500000, 1000000] as [number, number],
  },
  {
    label: formatPrice(1000000) + " - " + formatPrice(2000000),
    value: [1000000, 2000000] as [number, number],
  },
  {
    label: formatPrice(2000000) + " - " + formatPrice(5000000),
    value: [2000000, 5000000] as [number, number],
  },
];

export const getVisiblePages = (current: number, total: number) => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  if (current <= 4) return [1, 2, 3, 4, 5, null, total];
  if (current >= total - 3)
    return [1, null, total - 4, total - 3, total - 2, total - 1, total];

  return [1, null, current - 1, current, current + 1, null, total];
};
