"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/context/auth-context";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import {
  LayoutDashboard,
  Building2,
  Users,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  Shield,
  Store,
  Package,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/super-admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/super-admin/locations", label: "All Locations", icon: Store },
  { href: "/super-admin/users", label: "All Users", icon: Users },
  { href: "/super-admin/plans", label: "Subscription Plans", icon: Package },
  { href: "/super-admin/payments", label: "Payments", icon: CreditCard },
  { href: "/super-admin/system", label: "System Settings", icon: Settings },
];

function NavContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

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
        />
        <span className="text-xl font-bold text-foreground">
          Chakula <span className="text-primary">Poa</span>
        </span>
      </div>

      {/* Admin Info */}
      <div className="px-4 py-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground truncate">
              {user?.first_name || "Super"} {user?.last_name || "Admin"}
            </p>
            <p className="text-xs text-primary font-semibold">
              System Administrator
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== "/super-admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

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

export function SuperAdminSidebar() {
  const [open, setOpen] = useState(false);

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
          />
          <span className="font-bold text-foreground">
            Chakula <span className="text-primary">Poa</span>
          </span>
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
<SheetContent side="left" className="w-72 p-0">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <NavContent onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-border/50 bg-background lg:block">
        <NavContent />
      </aside>
    </>
  );
}
