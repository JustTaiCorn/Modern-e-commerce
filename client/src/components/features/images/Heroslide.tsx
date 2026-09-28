"use client";

import { banner } from "@/data/banner";
import AutoSwiper from "./AutoSwiper";
import { SwiperSlide } from "swiper/react";
import Image from "next/image";
import { useMemo } from "react";
import { useAllCoupons } from "@/services/couponService";

export default function Heroslide() {
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

  const displayBanners = couponBanners && couponBanners.length > 0 ? couponBanners : banner;

  return (
    <AutoSwiper className="px-4 md:px-8 py-2 rounded-md">
      {displayBanners?.map((item) => (
        <SwiperSlide key={item.id}>
          <div className="relative w-full h-[250px] md:h-[600px] sm:h-[350px] rounded-lg overflow-hidden">
            <Image
              src={item.image}
              alt={item.title}
              fill
              className="w-full h-full object-cover"
              priority
            />
          </div>
        </SwiperSlide>
      ))}
    </AutoSwiper>
  );
}
