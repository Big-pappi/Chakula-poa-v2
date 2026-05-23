"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useAuth } from "@/lib/context/auth-context";
import { Loader2 } from "lucide-react";

export default function AdminLayout({
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
      } else if (user && user.role !== "admin" && user.role !== "super_admin") {
        // Redirect non-admin users to their appropriate dashboard
        router.push("/dashboard");
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

  // Don't render admin content for non-admin users
  if (!isAuthenticated || (user && user.role !== "admin" && user.role !== "super_admin")) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider className="min-h-screen bg-background">
      <AdminSidebar />
      {/* Main content area with sidebar offset */}
      <main className="flex-1 lg:pl-72 pt-16 lg:pt-0 min-h-screen">
        <div className="p-4 md:p-6 lg:p-8">{children}</div>
      </main>
    </SidebarProvider>
  );
}
