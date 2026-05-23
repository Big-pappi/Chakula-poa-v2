"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/context/auth-context";
import { useMaintenanceMode } from "@/lib/hooks/use-system-settings";
import { subscriptions, meals } from "@/lib/api";
import type { Subscription, MealOrder } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Utensils,
  CreditCard,
  History,
  QrCode,
  ArrowRight,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Lock,
  Settings,
  User,
} from "lucide-react";

export default function UserDashboard() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuth();
  const { isMaintenanceMode } = useMaintenanceMode();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [recentOrders, setRecentOrders] = useState<MealOrder[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  // Redirect to maintenance page if in maintenance mode
  useEffect(() => {
    if (isMaintenanceMode && user?.role !== "super_admin" && user?.role !== "admin") {
      router.push("/maintenance");
    }
  }, [isMaintenanceMode, user?.role, router]);

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated) return;

      try {
        // First check localStorage for test subscription
        const storedSubscription = localStorage.getItem("chakula_poa_active_subscription");
        if (storedSubscription) {
          const parsed = JSON.parse(storedSubscription);
          // Check if subscription is still active (not expired)
          if (new Date(parsed.end_date) > new Date() && parsed.status === "active") {
            setSubscription(parsed);
          }
        }

        // Then try API (will override localStorage if API returns data)
        const [subResponse, ordersResponse] = await Promise.all([
          subscriptions.getCurrent(),
          meals.getOrders(),
        ]);

        if (subResponse.data) {
          setSubscription(subResponse.data);
        }
        if (ordersResponse.data) {
          setRecentOrders(ordersResponse.data.slice(0, 5));
        }
      } catch {
        // Keep localStorage subscription if API fails
        // Demo data for preview - check localStorage first
        const storedSubscription = localStorage.getItem("chakula_poa_active_subscription");
        if (storedSubscription) {
          const parsed = JSON.parse(storedSubscription);
          if (new Date(parsed.end_date) > new Date() && parsed.status === "active") {
            setSubscription(parsed);
          }
        }
        setRecentOrders([]);
      } finally {
        setDataLoading(false);
      }
    };
    fetchData();
  }, [isAuthenticated]);

  const daysRemaining = subscription
    ? Math.max(
        0,
        Math.ceil(
          (new Date(subscription.end_date).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24)
        )
      )
    : 0;

  const hasActiveSubscription = subscription && subscription.status === "active";

  // Quick actions - some require subscription
  const quickActions = [
    {
      title: "Select Meals",
      description: "Choose your meals for tomorrow",
      icon: Utensils,
      href: "/dashboard/meals",
      color: "bg-orange-500",
      requiresSubscription: true,
    },
    {
      title: "My Subscription",
      description: "View plan details & renew",
      icon: CreditCard,
      href: "/dashboard/subscriptions",
      color: "bg-emerald-500",
      requiresSubscription: false,
    },
    {
      title: "Order History",
      description: "View past meal orders",
      icon: History,
      href: "/dashboard/history",
      color: "bg-blue-500",
      requiresSubscription: true,
    },
    {
      title: "My QR Code",
      description: "Show at canteen",
      icon: QrCode,
      href: "/dashboard/qr-code",
      color: "bg-purple-500",
      requiresSubscription: true,
    },
  ];

  // Additional actions always available
  const accountActions = [
    {
      title: "Profile",
      description: "Update your details",
      icon: User,
      href: "/dashboard/profile",
    },
    {
      title: "Settings",
      description: "App preferences",
      icon: Settings,
      href: "/dashboard/settings",
    },
  ];

  if (isLoading || dataLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="mb-4 sm:mb-6 lg:mb-8">
        <h1 className="text-xl font-bold text-foreground sm:text-2xl lg:text-3xl">
          Welcome back, {user.first_name || user.full_name?.split(" ")[0] || user.phone_number || "User"}!
        </h1>
        <p className="mt-1 text-sm text-muted-foreground sm:text-base">
          {"Here's what's happening with your meal plan today."}
        </p>
      </div>

      {/* Subscription Status Card */}
      {hasActiveSubscription ? (
        <Card className="mb-4 border-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent shadow-lg sm:mb-6 lg:mb-8">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground sm:h-14 sm:w-14">
                  <CreditCard className="h-5 w-5 sm:h-7 sm:w-7" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-bold text-foreground sm:text-lg">
                      {subscription.plan_name || "Active Plan"}
                    </h3>
                    <Badge
                      variant={
                        subscription.status === "active"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {subscription.status}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                    Valid until{" "}
                    {new Date(subscription.end_date).toLocaleDateString(
                      "en-GB",
                      {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      }
                    )}
                  </p>
                </div>
              </div>
              <div className="flex gap-6 sm:gap-8">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary sm:text-3xl">
                    {subscription.meals_remaining || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Meals Left</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground sm:text-3xl">
                    {daysRemaining}
                  </p>
                  <p className="text-xs text-muted-foreground">Days Left</p>
                </div>
              </div>
            </div>
            {daysRemaining <= 7 && (
              <div className="mt-4 flex flex-col gap-2 rounded-lg bg-amber-500/10 px-3 py-2 sm:flex-row sm:items-center sm:gap-2 sm:px-4 sm:py-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 sm:h-5 sm:w-5" />
                  <span className="text-xs text-amber-700 sm:text-sm">
                    Your subscription expires soon. Renew now to avoid
                    interruption.
                  </span>
                </div>
                <Button
                  size="sm"
                  className="w-full sm:ml-auto sm:w-auto"
                  asChild
                >
                  <Link href="/dashboard/subscriptions">Renew Now</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-4 border-2 border-dashed border-primary/30 sm:mb-6 lg:mb-8">
          <CardContent className="p-4 text-center sm:p-6">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 sm:mb-4 sm:h-14 sm:w-14">
              <CreditCard className="h-6 w-6 text-primary sm:h-7 sm:w-7" />
            </div>
            <h3 className="text-base font-bold text-foreground sm:text-lg">
              No Active Subscription
            </h3>
            <p className="mb-3 mt-1 text-xs text-muted-foreground sm:mb-4 sm:text-sm">
              Subscribe to a meal plan to start enjoying campus meals
            </p>
            <Button asChild>
              <Link href="/dashboard/subscriptions">View Plans</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions Grid */}
      <div className="mb-4 grid grid-cols-2 gap-3 sm:mb-6 sm:gap-4 lg:mb-8 lg:grid-cols-4">
        {quickActions.map((action) => {
          const isLocked = action.requiresSubscription && !hasActiveSubscription;
          
          if (isLocked) {
            return (
              <Card 
                key={action.href} 
                className="h-full cursor-not-allowed border-border/50 opacity-60"
              >
                <CardContent className="p-3 sm:p-4 lg:p-6 relative">
                  <div className="absolute top-2 right-2">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div
                    className={`${action.color} mb-2 flex h-10 w-10 items-center justify-center rounded-xl sm:mb-3 sm:h-12 sm:w-12 lg:mb-4 opacity-50`}
                  >
                    <action.icon className="h-5 w-5 text-white sm:h-6 sm:w-6" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground sm:text-base">
                    {action.title}
                  </h3>
                  <p className="mt-1 hidden text-xs text-muted-foreground sm:block">
                    Requires subscription
                  </p>
                </CardContent>
              </Card>
            );
          }

          return (
            <Link key={action.href} href={action.href}>
              <Card className="h-full cursor-pointer border-border/50 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
                <CardContent className="p-3 sm:p-4 lg:p-6">
                  <div
                    className={`${action.color} mb-2 flex h-10 w-10 items-center justify-center rounded-xl sm:mb-3 sm:h-12 sm:w-12 lg:mb-4`}
                  >
                    <action.icon className="h-5 w-5 text-white sm:h-6 sm:w-6" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground sm:text-base">
                    {action.title}
                  </h3>
                  <p className="mt-1 hidden text-xs text-muted-foreground sm:block">
                    {action.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Stats Row - Only show if subscribed */}
      {hasActiveSubscription && (
        <div className="mb-4 grid grid-cols-1 gap-3 sm:mb-6 sm:grid-cols-3 sm:gap-4 lg:mb-8">
          <Card className="border-border/50">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground sm:text-sm">
                    {"Today's Meals"}
                  </p>
                  <p className="mt-1 text-xl font-bold text-foreground sm:text-2xl">
                    {
                      recentOrders.filter(
                        (o) =>
                          o.order_date === new Date().toISOString().split("T")[0]
                      ).length
                    }
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 sm:h-12 sm:w-12">
                  <Utensils className="h-5 w-5 text-emerald-600 sm:h-6 sm:w-6" />
                </div>
              </div>
              <div className="mt-2 flex items-center gap-1 text-xs text-emerald-600 sm:mt-3">
                <TrendingUp className="h-3 w-3" />
                <span>On track for today</span>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground sm:text-sm">
                    This Week
                  </p>
                  <p className="mt-1 text-xl font-bold text-foreground sm:text-2xl">
                    {recentOrders.length}
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 sm:h-12 sm:w-12">
                  <Calendar className="h-5 w-5 text-blue-600 sm:h-6 sm:w-6" />
                </div>
              </div>
              <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground sm:mt-3">
                <span>Out of {(subscription.meals_remaining || 0) + recentOrders.length} total meals</span>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground sm:text-sm">
                    Next Meal
                  </p>
                  <p className="mt-1 text-xl font-bold text-foreground sm:text-2xl">
                    {new Date().getHours() < 10 ? "Breakfast" : new Date().getHours() < 14 ? "Lunch" : "Dinner"}
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 sm:h-12 sm:w-12">
                  <Clock className="h-5 w-5 text-orange-600 sm:h-6 sm:w-6" />
                </div>
              </div>
              <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground sm:mt-3">
                <span>
                  {new Date().getHours() < 10 
                    ? "6:00 AM - 10:00 AM" 
                    : new Date().getHours() < 14 
                    ? "12:00 PM - 2:00 PM" 
                    : "6:00 PM - 9:00 PM"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Account Actions */}
      <div className="mb-4 sm:mb-6 lg:mb-8">
        <h2 className="text-base font-semibold text-foreground mb-3 sm:text-lg">
          Account
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {accountActions.map((action) => (
            <Link key={action.href} href={action.href}>
              <Card className="h-full cursor-pointer border-border/50 transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
                <CardContent className="p-3 sm:p-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <action.icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-foreground">
                      {action.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {action.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Orders - Only show if subscribed */}
      {hasActiveSubscription && (
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between p-4 sm:p-6">
            <div>
              <CardTitle className="text-base sm:text-lg">
                Recent Orders
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Your recent meal selections
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link
                href="/dashboard/history"
                className="flex items-center gap-1 text-xs sm:text-sm"
              >
                View All <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
            {recentOrders.length > 0 ? (
              <div className="space-y-2 sm:space-y-3">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between rounded-lg bg-muted/50 p-3 sm:p-4"
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 sm:h-10 sm:w-10">
                        <Utensils className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground sm:text-base">
                          {order.meal_name || "Meal"}
                        </p>
                        <p className="text-xs capitalize text-muted-foreground">
                          {order.meal_type} -{" "}
                          {new Date(order.order_date).toLocaleDateString(
                            "en-GB",
                            {
                              day: "numeric",
                              month: "short",
                            }
                          )}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        order.status === "served"
                          ? "default"
                          : order.status === "confirmed"
                            ? "secondary"
                            : "outline"
                      }
                      className="text-xs"
                    >
                      {order.status === "served" && (
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                      )}
                      {order.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-muted-foreground sm:py-8">
                <Utensils className="mx-auto mb-2 h-10 w-10 opacity-50 sm:mb-3 sm:h-12 sm:w-12" />
                <p className="text-sm">No recent orders</p>
                <Button className="mt-3 sm:mt-4" asChild>
                  <Link href="/dashboard/meals">Select Meals</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Call to Action for Non-Subscribers */}
      {!hasActiveSubscription && (
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-bold text-foreground mb-2">
              Ready to Start Eating Better?
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Get access to daily meals, QR codes, and more with a subscription.
            </p>
            <Button asChild size="lg">
              <Link href="/dashboard/subscriptions">
                Browse Subscription Plans
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
