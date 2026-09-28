"use client";

import Image from "next/image";
import { useMemo } from "react";
import { useAllCoupons } from "@/services/couponService";
import Link from "next/link";

export default function GridLetter() {
  const { data: coupons } = useAllCoupons();

  const couponBanners = useMemo(() => {
    return coupons
      ?.filter((coupon) => coupon.imageUrl && coupon.isActive)
      .map((coupon) => ({
        id: coupon.id,
        image: coupon.imageUrl!,
        title: coupon.name,
        description: coupon.description || "",
        code: coupon.code,
        value: coupon.value,
      }));
  }, [coupons]);

  // Fallback banners if no active coupon banners with image
  const defaultBanners = [
    {
      id: 991,
      image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1000&auto=format&fit=crop",
      title: "BỘ SƯU TẬP MỚI",
      code: "NEW2026",
      value: 10,
    },
    {
      id: 992,
      image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1000&auto=format&fit=crop",
      title: "ƯU ĐÃI THÀNH VIÊN",
      code: "VIPMEMBER",
      value: 15,
    },
  ];

  const displayBanners =
    couponBanners && couponBanners.length > 0 ? couponBanners.slice(0, 2) : defaultBanners;

  return (
    <div className="w-full px-4 py-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {displayBanners.map((item, index) => (
          <div
            key={item.id || index}
            className="h-[380px] lg:h-[460px] rounded-2xl overflow-hidden relative group cursor-pointer shadow-md"
          >
            {/* Background Image */}
            <div className="absolute inset-0 overflow-hidden">
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
            </div>

            {/* Content */}
            <div className="relative h-full flex flex-col justify-between p-8 z-10">
              <div>
                <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-semibold rounded-full mb-3 uppercase tracking-wider">
                  Mã giảm giá
                </span>
                <h2 className="text-3xl lg:text-4xl font-extrabold text-white mb-2 tracking-tight">
                  {item.title}
                </h2>
                <p className="text-white/90 text-sm lg:text-base font-medium">
                  Nhập mã <span className="font-bold text-yellow-300 underline">{item.code}</span> để giảm {item.value}%
                </p>
              </div>
              <Link
                href="/categories"
                className="bg-white text-black px-7 py-3 rounded-full font-bold hover:bg-black hover:text-white transition-all duration-300 w-fit uppercase text-xs tracking-wider shadow-lg"
              >
                KHÁM PHÁ NGAY
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
