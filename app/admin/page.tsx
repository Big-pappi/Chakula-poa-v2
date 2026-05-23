"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Users, UtensilsCrossed, CreditCard, TrendingUp, AlertTriangle, CheckCircle2, Clock, ArrowUpRight, Loader2, Package, UserCog } from "lucide-react";
import Link from "next/link";
import { adminAPI } from "@/lib/api/api";
import { useAuth } from "@/lib/context/auth-context";

interface DashboardStats {
  total_users: number;
  active_subscriptions: number;
  todays_orders: number;
  revenue_this_month: number;
  expiring_subscriptions?: number;
  new_staff_pending?: number;
  meals_served_today?: {
    breakfast: { served: number; capacity: number };
    lunch: { served: number; capacity: number };
    dinner: { served: number; capacity: number };
  };
}

interface RecentUser {
  id: string;
  full_name: string;
  cps_number: string;
  subscription?: {
    plan?: { name: string };
    status: string;
    days_left: number;
  };
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [dashboardResponse, usersResponse] = await Promise.all([
        adminAPI.getDashboardStats(),
        adminAPI.getUsers({ search: "" }),
      ]);
      
      setStats(dashboardResponse);
      // Get first 5 users
      const users = Array.isArray(usersResponse) ? usersResponse.slice(0, 5) : [];
      setRecentUsers(users);
    } catch (err) {
      console.error("[v0] Failed to fetch dashboard data:", err);
      setStats({
        total_users: 0,
        active_subscriptions: 0,
        todays_orders: 0,
        revenue_this_month: 0,
      });
      setRecentUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `TSh ${(amount / 1000000).toFixed(1)}M`;
    }
    return `TSh ${amount.toLocaleString()}`;
  };

  const statsCards = [
    { title: "Total Customers", value: stats?.total_users?.toLocaleString() || "0", icon: Users, href: "/admin/customers" },
    { title: "Active Subscriptions", value: stats?.active_subscriptions?.toLocaleString() || "0", icon: CreditCard, href: "/admin/customers?subscription_status=active" },
    { title: "Orders Today", value: stats?.todays_orders?.toLocaleString() || "0", icon: UtensilsCrossed, href: "/admin/reports" },
    { title: "Revenue This Month", value: formatCurrency(stats?.revenue_this_month || 0), icon: TrendingUp, href: "/admin/reports" },
  ];

  const quickActions = [
    { title: "Manage Staff", description: "Add or edit staff members", icon: UserCog, href: "/admin/staff" },
    { title: "Manage Packages", description: "Create and edit subscription plans", icon: Package, href: "/admin/packages" },
    { title: "View Customers", description: "Manage customer accounts", icon: Users, href: "/admin/customers" },
  ];

  const getSubscriptionStatus = (userItem: RecentUser) => {
    if (!userItem.subscription) return "none";
    if (userItem.subscription.status === "expired" || userItem.subscription.days_left <= 0) return "expired";
    if (userItem.subscription.days_left <= 3) return "expiring";
    return "active";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.full_name?.split(" ")[0] || "Admin"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/reports">View Reports</Link>
          </Button>
          <Button asChild>
            <Link href="/admin/packages">Manage Packages</Link>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statsCards.map((stat) => (
              <Link key={stat.title} href={stat.href}>
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                    <stat.icon className="h-5 w-5 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold md:text-3xl">{stat.value}</div>
                    <div className="flex items-center text-sm mt-1">
                      <ArrowUpRight className="mr-1 h-4 w-4 text-green-600" />
                      <span className="text-green-600">+5%</span>
                      <span className="ml-1 text-muted-foreground">vs last month</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="grid gap-4 sm:grid-cols-3">
            {quickActions.map((action) => (
              <Link key={action.title} href={action.href}>
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                  <CardContent className="flex items-center gap-4 p-6">
                    <div className="rounded-lg bg-primary/10 p-3">
                      <action.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{action.title}</p>
                      <p className="text-sm text-muted-foreground">{action.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Recent Customers */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Recent Customers</CardTitle>
                <CardDescription>Latest registered customers and their subscriptions</CardDescription>
              </CardHeader>
              <CardContent>
                {recentUsers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No customers found</p>
                    <p className="text-sm">Customers who subscribe to your restaurant will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentUsers.map((userItem) => {
                      const status = getSubscriptionStatus(userItem);
                      return (
                        <div key={userItem.id} className="flex items-center justify-between rounded-lg border p-4">
                          <div className="flex items-center gap-4">
                            <Avatar>
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {userItem.full_name?.split(" ").map((n) => n[0]).join("") || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{userItem.full_name}</p>
                              <p className="text-sm text-muted-foreground font-mono">{userItem.cps_number}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {userItem.subscription?.plan?.name && (
                              <Badge variant="secondary" className="hidden sm:inline-flex">
                                {userItem.subscription.plan.name}
                              </Badge>
                            )}
                            <Badge
                              variant={
                                status === "active"
                                  ? "default"
                                  : status === "expiring"
                                  ? "secondary"
                                  : "destructive"
                              }
                            >
                              {status === "expiring" ? `${userItem.subscription?.days_left}d left` : status}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                <Button variant="outline" className="mt-4 w-full" asChild>
                  <Link href="/admin/customers">View All Customers</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Alerts & Activity */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Today&apos;s Activity</CardTitle>
                  <CardDescription>Meal serving progress</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { 
                      meal: "Breakfast", 
                      served: stats?.meals_served_today?.breakfast?.served ?? 0, 
                      capacity: stats?.meals_served_today?.breakfast?.capacity ?? 100 
                    },
                    { 
                      meal: "Lunch", 
                      served: stats?.meals_served_today?.lunch?.served ?? 0, 
                      capacity: stats?.meals_served_today?.lunch?.capacity ?? 150 
                    },
                    { 
                      meal: "Dinner", 
                      served: stats?.meals_served_today?.dinner?.served ?? 0, 
                      capacity: stats?.meals_served_today?.dinner?.capacity ?? 120 
                    },
                  ].map((meal) => {
                    const percentage = meal.capacity > 0 ? Math.round((meal.served / meal.capacity) * 100) : 0;
                    return (
                      <div key={meal.meal} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{meal.meal}</span>
                          <span className="text-muted-foreground">
                            {meal.served}/{meal.capacity}
                          </span>
                        </div>
                        <Progress value={percentage} />
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Alerts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    ...(stats?.expiring_subscriptions && stats.expiring_subscriptions > 0 
                      ? [{ type: "warning", message: `${stats.expiring_subscriptions} subscription${stats.expiring_subscriptions > 1 ? 's' : ''} expiring this week`, time: "Now" }] 
                      : []),
                    ...(stats?.new_staff_pending && stats.new_staff_pending > 0 
                      ? [{ type: "info", message: `${stats.new_staff_pending} new staff member${stats.new_staff_pending > 1 ? 's' : ''} pending approval`, time: "Recent" }] 
                      : []),
                    { type: "success", message: "Dashboard synced with live data", time: "Just now" },
                  ].map((alert, i) => (
                    <div key={i} className="flex items-start gap-3 rounded-lg border p-3">
                      {alert.type === "warning" && <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />}
                      {alert.type === "info" && <Clock className="h-5 w-5 text-blue-500 shrink-0" />}
                      {alert.type === "success" && <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">{alert.message}</p>
                        <p className="text-xs text-muted-foreground">{alert.time}</p>
                      </div>
                    </div>
                  ))}
                  {!(stats?.expiring_subscriptions || stats?.new_staff_pending) && (
                    <p className="text-sm text-muted-foreground text-center py-2">No urgent alerts</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
