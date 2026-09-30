"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import useAuthStore from "@/stores/useAuthStore";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  requireAdmin?: boolean;
  requireStaff?: boolean;
  fallback?: React.ReactNode;
}

export function RoleGuard({
  children,
  allowedRoles,
  requireAdmin = false,
  requireStaff = false,
  fallback,
}: RoleGuardProps) {
  const router = useRouter();
  const { authUser, hasRole, isAdmin, isAdminOrStaff } = useAuthStore();

  const hasAccess = (() => {
    if (requireAdmin) return isAdmin();
    if (requireStaff) return isAdminOrStaff();
    if (allowedRoles && allowedRoles.length > 0) {
      return allowedRoles.some((role) => hasRole(role));
    }
    return true;
  })();

  useEffect(() => {
    if (authUser && !hasAccess) {
      router.push("/admin");
    }
  }, [authUser, hasAccess, router]);

  if (authUser && !hasAccess) {
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
}

export default RoleGuard;
