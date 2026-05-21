"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Building2,
  Users,
  CreditCard,
  TrendingUp,
  ArrowUpRight,
  Shield,
  Activity,
  Server,
  AlertTriangle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { superAdmin, restaurants as restaurantsAPI } from "@/lib/api/endpoints";
import { getRegionLabel, type Restaurant, type SystemStats } from "@/lib/types";

export default function SuperAdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [locations, setLocations] = useState<Restaurant[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, locationsRes] = await Promise.all([
          superAdmin.getSystemStats(),
          restaurantsAPI.getAll(),
        ]);
        
        console.log("[v0] Dashboard stats response:", statsRes);
        console.log("[v0] Dashboard locations response:", locationsRes);
        
        if (statsRes.data) {
          setStats(statsRes.data);
        } else if (statsRes.error) {
          setError(statsRes.error);
        }
        
        if (locationsRes.data && Array.isArray(locationsRes.data)) {
          console.log("[v0] Loaded", locationsRes.data.length, "locations for dashboard");
          setLocations(locationsRes.data);
        } else if (locationsRes.error) {
          setError(prev => prev ? `${prev}; ${locationsRes.error}` : locationsRes.error);
        }
      } catch (err) {
        console.log("[v0] Dashboard fetch exception:", err);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
        setError(`Unable to connect to backend server. Please ensure Django is running at ${apiUrl}`);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const systemStatsDisplay = [
    { title: "Total Locations", value: stats?.total_restaurants?.toString() || "0", change: "+2", icon: Building2, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Total Users", value: stats?.total_users?.toLocaleString() || "0", change: "+856", icon: Users, color: "text-green-600", bg: "bg-green-50" },
    { title: "Active Subscriptions", value: stats?.active_subscriptions?.toLocaleString() || "0", change: "+1,234", icon: CreditCard, color: "text-primary", bg: "bg-primary/10" },
    { title: "Monthly Revenue", value: stats?.monthly_revenue ? `TSh ${(stats.monthly_revenue / 1000000).toFixed(1)}M` : "TSh 0", change: "+15%", icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  // System health - in production, these would come from API monitoring
  const systemHealth = stats ? [
    { service: "API Gateway", status: "operational" as const, uptime: "99.9%" },
    { service: "Database", status: "operational" as const, uptime: "99.8%" },
    { service: "Payment Gateway", status: stats.total_transactions > 0 ? "operational" as const : "unknown" as const, uptime: stats.total_transactions > 0 ? "99.7%" : "N/A" },
    { service: "Restaurants Online", status: locations.length > 0 ? "operational" as const : "unknown" as const, uptime: `${locations.filter(l => l.is_active).length}/${locations.length}` },
  ] : [];

  // Recent activity - in production, this would come from an activity log API
  const recentActivity = locations.length > 0 ? [
    { action: "System initialized", detail: `${locations.length} locations loaded`, time: "Just now", type: "success" },
    { action: "Stats refreshed", detail: `${stats?.total_users || 0} users, ${stats?.active_subscriptions || 0} subscriptions`, time: "Just now", type: "info" },
  ] : [];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="h-5 w-5 text-primary" />
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            System Administrator
          </Badge>
        </div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
          System Overview
        </h1>
        <p className="mt-1 text-sm sm:text-base text-muted-foreground">
          Manage all universities and system-wide settings
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-2 mb-6">
        <Button variant="outline" className="bg-transparent w-full sm:w-auto" asChild>
          <Link href="/super-admin/system">System Settings</Link>
        </Button>
        <Button className="w-full sm:w-auto" asChild>
          <Link href="/super-admin/locations">Manage Locations</Link>
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <Card className="mb-6 border-destructive/20 bg-destructive/5">
          <CardContent className="flex items-center gap-3 p-4">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {systemStatsDisplay.map((stat) => (
          <Card key={stat.title} className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2 p-3 sm:p-4">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`rounded-lg p-1.5 sm:p-2 ${stat.bg}`}>
                <stat.icon className={`h-3 w-3 sm:h-4 sm:w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              <div className="text-lg sm:text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center text-xs text-green-600">
                <ArrowUpRight className="mr-1 h-3 w-3" />
                <span className="truncate">{stat.change} this month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Universities Card */}
        <Card className="lg:col-span-2 border-border/50">
          <CardHeader className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Building2 className="h-5 w-5" />
                  Locations
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  All registered locations in the system
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" className="bg-transparent w-full sm:w-auto" asChild>
                <Link href="/super-admin/locations">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            {locations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No locations registered yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {locations.slice(0, 5).map((loc) => (
                  <div key={loc.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-lg border p-3 sm:p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
                        <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs sm:text-sm">
                          {loc.code?.slice(0, 4) || loc.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm sm:text-base truncate">{loc.name}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">{getRegionLabel(loc.region)} - {loc.location_type}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
                      <Badge variant={loc.is_active ? "default" : "secondary"} className="text-xs">
                        {loc.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Column */}
        <div className="space-y-6">
          {/* System Health */}
          <Card className="border-border/50">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Server className="h-5 w-5" />
                System Health
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 space-y-3">
              {systemHealth.map((service) => (
                <div key={service.service} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {service.status === "operational" ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0" />
                    )}
                    <span className="text-sm truncate">{service.service}</span>
                  </div>
                  <Badge variant={service.status === "operational" ? "outline" : "secondary"} className="text-xs ml-2">
                    {service.uptime}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="border-border/50">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Activity className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
              {recentActivity.map((activity, i) => (
                <div key={i} className="border-l-2 border-primary/20 pl-3 sm:pl-4">
                  <p className="text-sm font-medium">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">{activity.detail}</p>
                  <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
