"use client";

import { useMemo } from "react";
import { useAllCoupons } from "@/services/couponService";

export default function OfferBanner() {
  const { data: coupons } = useAllCoupons();
  
  const couponBanners = useMemo(() => {
    return coupons
      ?.filter((coupon) => coupon.imageUrl && coupon.isActive)
      .map((coupon) => ({
        id: coupon.id,
        image: coupon.imageUrl,
        title: coupon.name,
        description: coupon.description || "",
        code: coupon.code,
        value: coupon.value,
      }));
  }, [coupons]);

  return (
    <section className="relative h-[250px] md:h-[450px] lg:h-[500px] md:max-w-7xl max-w-xl w-[90%] mx-auto overflow-hidden rounded-xl my-10">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `${
            couponBanners?.at(0)?.image
              ? `url(${couponBanners.at(0)?.image})`
              : `url(/images/Banners/OfferBanner.jpg)`
          }`,
        }}
      />
      <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black to-transparent opacity-40" />
    </section>
  );
}
