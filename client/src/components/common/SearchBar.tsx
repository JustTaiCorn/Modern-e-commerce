"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import privateClient from "@/lib/axios";
import { Product } from "@/types";

interface SearchBarProps {
  className?: string;
  isMobile?: boolean;
  onClose?: () => void;
}

export default function SearchBar({
  className,
  isMobile = false,
  onClose,
}: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchProducts = async (query: string) => {
    setIsLoading(true);
    try {
      const response = await privateClient.get("/products", {
        params: { keyword: query },
      });
      const resData = response.data?.data || response.data;
      const list = Array.isArray(resData)
        ? resData
        : Array.isArray(resData?.items)
        ? resData.items
        : [];
      setSearchResults(list.slice(0, 6));
      setShowResults(true);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        searchProducts(searchQuery);
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleClearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setShowResults(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      setShowResults(false);
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      if (onClose) onClose();
    }
  };

  const handleProductClick = () => {
    setShowResults(false);
    setSearchQuery("");
    if (onClose) onClose();
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="w-4 h-4 text-muted-foreground" />
        </div>
        <Input
          type="text"
          placeholder="Tìm kiếm sản phẩm..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className={`${
            isMobile ? "w-full" : "w-64 lg:w-80"
          } pl-9 pr-9 py-1.5 text-xs md:text-sm rounded-full`}
        />
        {searchQuery && (
          <button
            onClick={handleClearSearch}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-xl shadow-xl max-h-[480px] overflow-y-auto z-50">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-xs">Đang tìm kiếm...</p>
            </div>
          ) : searchResults.length > 0 ? (
            <>
              <div className="p-2.5 border-b bg-muted/40">
                <h3 className="font-semibold text-xs uppercase text-muted-foreground">
                  Gợi ý sản phẩm ({searchResults.length})
                </h3>
              </div>
              <div className="divide-y">
                {searchResults.map((product) => {
                  const img =
                    product.images?.[0]?.url ||
                    (product.images?.[0] as any)?.image_url ||
                    "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=300";

                  return (
                    <Link
                      key={product.id}
                      href={`/products/${product.id}`}
                      onClick={handleProductClick}
                      className="flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors"
                    >
                      <div className="relative w-12 h-14 flex-shrink-0 bg-muted rounded overflow-hidden">
                        <Image
                          src={img}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-xs sm:text-sm line-clamp-1">
                          {product.name}
                        </h4>
                        <p className="text-xs font-bold text-primary mt-1">
                          {formatPrice(product.basePrice || (product as any).price)}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
              <div className="p-2.5 border-t bg-muted/40 text-center">
                <Link
                  href={`/search?q=${encodeURIComponent(searchQuery)}`}
                  onClick={handleProductClick}
                  className="text-xs text-primary hover:underline font-semibold"
                >
                  Xem tất cả kết quả →
                </Link>
              </div>
            </>
          ) : (
            <div className="p-6 text-center text-muted-foreground text-xs">
              <p>Không tìm thấy sản phẩm phù hợp</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
