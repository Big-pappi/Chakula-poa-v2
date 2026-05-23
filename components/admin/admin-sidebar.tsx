"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/context/auth-context";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useSidebar } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  Store,
  Users,
  UserCog,
  Package,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const adminNavItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/restaurant", label: "Restaurant", icon: Store },
  { href: "/admin/staff", label: "Staff", icon: UserCog },
  { href: "/admin/packages", label: "Packages", icon: Package },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

function AdminNavContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  // Get role badge color
  const getRoleBadgeColor = () => {
    switch (user?.role) {
      case "super_admin":
        return "bg-purple-500/10 text-purple-600 border-purple-500/20";
      case "admin":
        return "bg-primary/10 text-primary border-primary/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  // Get role display name
  const getRoleDisplay = () => {
    switch (user?.role) {
      case "super_admin":
        return "Super Admin";
      case "admin":
        return "Restaurant Owner";
      default:
        return user?.role || "Admin";
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-6 border-b border-border/50">
        <Image
          src="/logo.png"
          alt="Chakula Poa"
          width={48}
          height={48}
          className="rounded-xl"
          style={{ width: 48, height: 48 }}
        />
        <div>
          <span className="text-xl font-bold text-foreground">
            Chakula <span className="text-primary">Poa</span>
          </span>
          <p className="text-xs text-muted-foreground">Admin Portal</p>
        </div>
      </div>

      {/* User Info */}
      <div className="px-4 py-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-bold text-primary">
              {user?.full_name?.charAt(0) || user?.phone_number?.slice(-2) || "A"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground truncate">
              {user?.full_name || user?.phone_number || "Admin"}
            </p>
            <Badge
              variant="outline"
              className={cn("text-xs font-normal", getRoleBadgeColor())}
            >
              {getRoleDisplay()}
            </Badge>
          </div>
        </div>
        {user?.cps_number && (
          <p className="mt-2 text-xs text-muted-foreground font-mono">
            ID: {user.cps_number}
          </p>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {adminNavItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className="h-5 w-5" />
                {item.label}
              </div>
              {isActive && <ChevronRight className="h-4 w-4" />}
            </Link>
          );
        })}
      </nav>

      {/* Restaurant Info (for admin role) */}
      {user?.role === "admin" && user?.restaurant_name && (
        <div className="mx-3 mb-3 p-3 rounded-lg bg-muted/50 border border-border/50">
          <p className="text-xs text-muted-foreground">Managing</p>
          <p className="text-sm font-medium text-foreground truncate">
            {user.restaurant_name}
          </p>
        </div>
      )}

      {/* Logout */}
      <div className="p-4 border-t border-border/50">
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={() => {
            logout();
            onNavigate?.();
          }}
        >
          <LogOut className="h-5 w-5 mr-3" />
          Logout
        </Button>
      </div>
    </div>
  );
}

export function AdminSidebar() {
  const { openMobile, setOpenMobile } = useSidebar();

  return (
    <>
      {/* Mobile Header */}
      <div className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between bg-background/95 backdrop-blur-sm border-b border-border/50 px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="Chakula Poa"
            width={36}
            height={36}
            className="rounded-lg"
            style={{ width: 36, height: 36 }}
          />
          <div>
            <span className="font-bold text-foreground">
              Chakula <span className="text-primary">Poa</span>
            </span>
            <span className="ml-2 text-xs text-muted-foreground">Admin</span>
          </div>
        </div>
        <Sheet open={openMobile} onOpenChange={setOpenMobile}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Admin navigation</SheetTitle>
              <SheetDescription>Navigation links for the admin portal.</SheetDescription>
            </SheetHeader>
            <AdminNavContent onNavigate={() => setOpenMobile(false)} />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-border/50 bg-background lg:block">
        <AdminNavContent />
      </aside>
    </>
  );
}
