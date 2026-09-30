"use client";

import { ForgotPasswordForm } from "@/app/(shop)/user/forgot-password/_components/forgot-password-form";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/stores/useAuthStore";
import { Card, CardContent } from "@/components/ui/card";

export default function ForgotPasswordPage() {
  const { authUser } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (authUser) {
      router.push("/user");
    }
  }, [authUser, router]);

  return (
    <div className="flex min-h-[75vh] flex-col items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-md">
        <Card className="border border-gray-100 shadow-sm">
          <CardContent className="p-8">
            <ForgotPasswordForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
