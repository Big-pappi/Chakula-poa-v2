"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/context/auth-context";
import { subscriptions } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import {
  Home,
  Utensils,
  QrCode,
  CreditCard,
  History,
  User,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import type { Subscription } from "@/lib/types";

const navItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/dashboard/meals", label: "Select Meals", icon: Utensils },
  { href: "/dashboard/qr-code", label: "My QR Code", icon: QrCode },
  { href: "/dashboard/subscriptions", label: "Subscription", icon: CreditCard },
  { href: "/dashboard/history", label: "History", icon: History },
  { href: "/dashboard/profile", label: "Profile", icon: User },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

function NavContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [activeSubscription, setActiveSubscription] = useState<Subscription | null>(null);

  // Check for active subscription
  useEffect(() => {
    const checkSubscription = async () => {
      // Check localStorage first (for test subscriptions)
      const storedSub = localStorage.getItem("chakula_poa_active_subscription");
      if (storedSub) {
        const parsed = JSON.parse(storedSub);
        if (new Date(parsed.end_date) > new Date() && parsed.status === "active") {
          setActiveSubscription(parsed);
          return;
        }
      }
      // Then check API
      try {
        const response = await subscriptions.getCurrent();
        if (response.data && response.data.status === "active") {
          setActiveSubscription(response.data);
        }
      } catch {
        // No subscription
      }
    };
    checkSubscription();
  }, []);

  // Helper to get CPS number (only if subscribed)
  const getCPSNumber = () => {
    if (!activeSubscription) return null;
    if (user?.cps_number) return user.cps_number;
    if (user?.id) {
      const prefix = user.id.slice(0, 6).toUpperCase().replace(/[^A-Z0-9]/g, "X");
      return `CPS-${prefix}`;
    }
    return null;
  };

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center px-4 py-6 border-b border-border/50">
        <Image
          src="/logo.png"
          alt="Chakula Poa"
          width={52}
          height={52}
          className="h-12 w-12 rounded-xl object-contain"
        />
      </div>

      {/* User Info */}
      <div className="px-4 py-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-bold text-primary">
              {user?.first_name?.charAt(0) || user?.full_name?.charAt(0) || user?.phone_number?.slice(-2) || "U"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground truncate">
              {user?.first_name && user?.last_name 
                ? `${user.first_name} ${user.last_name}` 
                : user?.full_name || user?.phone_number || "User"}
            </p>
            {activeSubscription ? (
              <p className="text-xs text-primary font-semibold">
                {getCPSNumber()}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                No active plan
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
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

export function DashboardSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile Header */}
      <div className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between bg-background/95 backdrop-blur-sm border-b border-border/50 px-4 py-3 lg:hidden">
        <div className="flex items-center">
          <Image
            src="/logo.png"
            alt="Chakula Poa"
            width={44}
            height={44}
            priority
            className="h-10 w-10 rounded-lg object-contain"
          />
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <SheetTitle className="sr-only">Navigation menu</SheetTitle>
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
