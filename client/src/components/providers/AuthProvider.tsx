"use client";

import { useEffect, useState } from "react";
import useAuthStore from "@/stores/useAuthStore";
import { useRouter } from "next/navigation";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isInitialized, setIsInitialized] = useState(false);
  const authUser = useAuthStore((state) => state.authUser);
  const isAdminOrStaff = useAuthStore((state) => state.isAdminOrStaff());
  const router = useRouter();

  useEffect(() => {
    // Check if auth state exists
    const authStorage = localStorage.getItem("auth-storage");
    if (!authStorage) {
      router.replace("/login");
    } else {
      setIsInitialized(true);
    }
  }, [router]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="text-sm text-muted-foreground">Đang xác thực...</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
