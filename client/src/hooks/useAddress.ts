"use client";

import axios from "axios";
import { useState, useCallback } from "react";
import { Province, Ward } from "@/types";

interface ProvinceResponse {
  requestId: string;
  provinces: Province[];
}

interface WardResponse {
  requestId: string;
  communes: Ward[];
}

const API_BASE = "/address-kit";

const normalizeName = (s: string) =>
  (s || "")
    .replace(/\s*\n\s*/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export function useAddress(initialEffectiveDate = "2025-07-01") {
  const [effectiveDate, setEffectiveDate] = useState<string>(initialEffectiveDate);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(false);
  const [isLoadingWards, setIsLoadingWards] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProvinces = useCallback(async () => {
    if (provinces.length > 0) return; // Đã có data, không cần fetch lại
    setIsLoadingProvinces(true);
    setError(null);
    try {
      const { data } = await axios.get<ProvinceResponse>(
        `${API_BASE}/${effectiveDate}/provinces`
      );
      const cleaned = (data.provinces || []).map((p) => ({
        ...p,
        name: normalizeName(p.name),
      }));
      setProvinces(cleaned);
    } catch (err) {
      console.error("Error fetching provinces:", err);
      setProvinces([]);
      setError("Không tải được danh sách tỉnh/thành");
    } finally {
      setIsLoadingProvinces(false);
    }
  }, [effectiveDate, provinces.length]);

  const fetchWards = async (provinceCode: string) => {
    if (!provinceCode) return;
    setIsLoadingWards(true);
    setError(null);
    try {
      const { data } = await axios.get<WardResponse>(
        `${API_BASE}/${effectiveDate}/provinces/${provinceCode}/communes`,
        { timeout: 15000 }
      );
      const cleaned = (data.communes || []).map((c) => ({
        ...c,
        name: normalizeName(c.name),
      }));
      setWards(cleaned);
    } catch {
      setWards([]);
      setError("Không tải được danh sách xã/phường");
    } finally {
      setIsLoadingWards(false);
    }
  };

  const clearWards = () => setWards([]);

  return {
    provinces,
    wards,
    fetchProvinces,
    isLoadingProvinces,
    isLoadingWards,
    error,
    fetchWards,
    clearWards,
    effectiveDate,
    setEffectiveDate,
  };
}
