"use client";

import { SignupForm } from "@/app/(shop)/user/signup/_components/signup-form";
import { useRouter } from "next/navigation";
import useAuthStore from "@/stores/useAuthStore";
import { SignUpData } from "@/types";
import { Card, CardContent } from "@/components/ui/card";

export default function SignupPage() {
  const router = useRouter();
  const { signup, isSigningUp } = useAuthStore();

  const handleSignup = async (data: SignUpData) => {
    try {
      await signup({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        phone: data.phone,
      });
      router.push("/user/login");
    } catch (error) {
      console.error("Signup failed:", error);
    }
  };

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-md">
        <Card className="border border-gray-100 shadow-sm">
          <CardContent className="p-8">
            <SignupForm handleSignup={handleSignup} isLoading={isSigningUp} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
