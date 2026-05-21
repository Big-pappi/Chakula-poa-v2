"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useMaintenanceMode } from "@/lib/hooks/use-system-settings";
import { useAuth } from "@/lib/context/auth-context";

// Pages that should be accessible even during maintenance
const MAINTENANCE_EXEMPT_PATHS = [
  "/maintenance",
  "/login",
];

// Paths that only super admin can access during maintenance
const SUPER_ADMIN_PATHS = [
  "/super-admin",
];

export function MaintenanceGuard({ children }: { children: React.ReactNode }) {
  const { isMaintenanceMode, isLoading } = useMaintenanceMode();
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    // Check if current path is always exempt (maintenance page, login)
    const isAlwaysExempt = MAINTENANCE_EXEMPT_PATHS.some(
      (path) => pathname === path || pathname.startsWith(path + "/")
    );

    // Check if this is a super admin path
    const isSuperAdminPath = SUPER_ADMIN_PATHS.some(
      (path) => pathname === path || pathname.startsWith(path + "/")
    );

    // Only super_admin role can bypass maintenance mode
    const isSuperAdmin = user?.role === "super_admin";

    // During maintenance mode:
    // - Always exempt paths (maintenance, login) are accessible to everyone
    // - Super admin paths are only accessible to super_admin users
    // - All other paths redirect non-super-admins to maintenance page
    if (isMaintenanceMode && !isAlwaysExempt) {
      if (isSuperAdminPath && !isSuperAdmin) {
        // Non-super-admin trying to access super admin paths during maintenance
        router.push("/maintenance");
      } else if (!isSuperAdminPath && !isSuperAdmin) {
        // Non-super-admin trying to access any other path during maintenance
        router.push("/maintenance");
      }
      // Super admins can access everything
    }
  }, [isMaintenanceMode, isLoading, pathname, router, user]);

  // Don't block rendering while checking
  return <>{children}</>;
}
