"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { Progress } from "@/components/ui/progress";
import { Users, UtensilsCrossed, CreditCard, TrendingUp, AlertTriangle, CheckCircle2, Clock, ArrowUpRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { admin } from "@/lib/api/endpoints";

interface DashboardStats {
  total_users: number;
  active_subscriptions: number;
  meals_served_today: number;
  revenue_this_month: number;
  expiring_subscriptions: number;
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
        admin.getDashboardStats(),
        admin.getUsers({ limit: 5 }),
      ]);
      
      if (dashboardResponse.data) {
        setStats(dashboardResponse.data as unknown as DashboardStats);
      }
      const usersData = usersResponse.data;
      if (usersData) {
        // Handle both array and paginated response
        const usersArray = Array.isArray(usersData) 
          ? usersData 
          : (usersData as { results?: RecentUser[] }).results || [];
        setRecentUsers(usersArray as unknown as RecentUser[]);
      }
    } catch (err) {
      console.error("[v0] Failed to fetch dashboard data:", err);
      // Set empty state - no mock data
      setStats({
        total_users: 0,
        active_subscriptions: 0,
        meals_served_today: 0,
        revenue_this_month: 0,
        expiring_subscriptions: 0,
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
    { title: "Total Users", value: stats?.total_users?.toLocaleString() || "0", icon: Users },
    { title: "Active Subscriptions", value: stats?.active_subscriptions?.toLocaleString() || "0", icon: CreditCard },
    { title: "Meals Served Today", value: stats?.meals_served_today?.toLocaleString() || "0", icon: UtensilsCrossed },
    { title: "Revenue This Month", value: formatCurrency(stats?.revenue_this_month || 0), icon: TrendingUp },
  ];

  const mealStats = [
    { meal: "Morning Tea", served: 234, capacity: 400, percentage: 58 },
    { meal: "Lunch", served: 412, capacity: 500, percentage: 82 },
    { meal: "Evening", served: 210, capacity: 450, percentage: 47 },
  ];

  const alerts = [
    { type: "warning", message: `${stats?.expiring_subscriptions || 0} subscriptions expiring this week`, time: "Now" },
    { type: "info", message: "Staff serving meals at full capacity", time: "2h ago" },
    { type: "success", message: "Daily report generated successfully", time: "6h ago" },
  ];

  const getSubscriptionStatus = (user: RecentUser) => {
    if (!user.subscription) return "none";
    if (user.subscription.status === "expired" || user.subscription.days_left <= 0) return "expired";
    if (user.subscription.days_left <= 3) return "expiring";
    return "active";
  };

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Admin Dashboard</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <main className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your canteen operations</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="bg-transparent" asChild>
              <Link href="/admin/reports">View Reports</Link>
            </Button>
            <Button asChild>
              <Link href="/admin/staff">Manage Staff</Link>
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {statsCards.map((stat) => (
                <Card key={stat.title}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                    <stat.icon className="h-5 w-5 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stat.value}</div>
                    <div className="flex items-center text-sm">
                      <ArrowUpRight className="mr-1 h-4 w-4 text-green-600" />
                      <span className="text-green-600">+5%</span>
                      <span className="ml-1 text-muted-foreground">vs last month</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Recent Users</CardTitle>
                  <CardDescription>Latest registered users and their subscriptions</CardDescription>
                </CardHeader>
                <CardContent>
                  {recentUsers.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No users found</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentUsers.map((user) => {
                        const status = getSubscriptionStatus(user);
                        return (
                          <div key={user.id} className="flex items-center justify-between rounded-lg border p-4">
                            <div className="flex items-center gap-4">
                              <Avatar>
                                <AvatarFallback className="bg-primary/10 text-primary">
                                  {user.full_name?.split(" ").map((n) => n[0]).join("") || "U"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{user.full_name}</p>
                                <p className="text-sm text-muted-foreground font-mono">{user.cps_number}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              {user.subscription?.plan?.name && (
                                <Badge variant="secondary">{user.subscription.plan.name}</Badge>
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
                                {status === "expiring" ? `${user.subscription?.days_left}d left` : status}
                              </Badge>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <Button variant="outline" className="mt-4 w-full bg-transparent" asChild>
                    <Link href="/admin/users">View All Users</Link>
                  </Button>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Meal Capacity</CardTitle>
                    <CardDescription>Today&apos;s serving progress</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {mealStats.map((meal) => (
                      <div key={meal.meal} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{meal.meal}</span>
                          <span className="text-muted-foreground">
                            {meal.served}/{meal.capacity}
                          </span>
                        </div>
                        <Progress value={meal.percentage} />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Alerts</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {alerts.map((alert, i) => (
                      <div key={i} className="flex items-start gap-3 rounded-lg border p-3">
                        {alert.type === "warning" && <AlertTriangle className="h-5 w-5 text-amber-500" />}
                        {alert.type === "info" && <Clock className="h-5 w-5 text-blue-500" />}
                        {alert.type === "success" && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                        <div className="flex-1">
                          <p className="text-sm">{alert.message}</p>
                          <p className="text-xs text-muted-foreground">{alert.time}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </main>
    </>
  );
}
