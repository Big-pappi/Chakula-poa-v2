"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/auth-context";
import { SuperAdminSidebar } from "@/components/super-admin/sidebar";
import { Loader2 } from "lucide-react";

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/login");
      } else if (user && user.role !== "super_admin" && user.role !== "developer") {
        // Redirect non-super admin users to their appropriate dashboard
        if (user.role === "admin") {
          router.push("/admin");
        } else if (user.role === "staff") {
          router.push("/staff");
        } else {
          router.push("/dashboard");
        }
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Don't render content until we confirm user is super admin
  if (!isAuthenticated || !user || (user.role !== "super_admin" && user.role !== "developer")) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SuperAdminSidebar />
      <main className="lg:pl-72">
        <div className="pt-14 lg:pt-0">{children}</div>
      </main>
    </div>
  );
}
