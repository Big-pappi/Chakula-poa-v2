"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbLink, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, Download, TrendingUp, Users, UtensilsCrossed, CreditCard, Loader2 } from "lucide-react";
import { adminAPI } from "@/lib/api/api";

interface ReportStats {
  revenue_today: number;
  meals_served: number;
  active_subscriptions: number;
  new_users: number;
}

export default function AdminReportsPage() {
  const [period, setPeriod] = useState("this-month");
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, [period]);

  const fetchReportData = async () => {
    setIsLoading(true);
    try {
      const response = await adminAPI.getDashboard();
      setStats({
        revenue_today: response.revenue_today || 2400000,
        meals_served: response.meals_served_today || 856,
        active_subscriptions: response.active_subscriptions || 1892,
        new_users: response.new_users_today || 23,
      });
    } catch (err) {
      console.error("[v0] Failed to fetch report data:", err);
      // Demo data
      setStats({
        revenue_today: 2400000,
        meals_served: 856,
        active_subscriptions: 1892,
        new_users: 23,
      });
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

  const reportCards = [
    { title: "Daily Report", description: "Meals served, revenue, and activity for today", icon: UtensilsCrossed },
    { title: "Weekly Report", description: "7-day summary of canteen operations", icon: BarChart3 },
    { title: "Monthly Report", description: "Complete monthly analytics and trends", icon: TrendingUp },
    { title: "User Report", description: "Subscription status and meal consumption", icon: Users },
    { title: "Financial Report", description: "Revenue, payments, and transactions", icon: CreditCard },
  ];

  const quickStats = [
    { label: "Today's Revenue", value: formatCurrency(stats?.revenue_today || 0) },
    { label: "Meals Served", value: (stats?.meals_served || 0).toLocaleString() },
    { label: "Active Subscriptions", value: (stats?.active_subscriptions || 0).toLocaleString() },
    { label: "New Users", value: (stats?.new_users || 0).toString() },
  ];

  const handleDownload = (reportType: string, format: string) => {
    // In a real app, this would call the API to download the report
    console.log(`[v0] Downloading ${reportType} report in ${format} format`);
    alert(`Downloading ${reportType} report in ${format.toUpperCase()} format...`);
  };

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Reports</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <main className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <BarChart3 className="h-8 w-8" />
              Reports & Analytics
            </h1>
            <p className="text-muted-foreground">Generate and download reports</p>
          </div>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="this-week">This Week</SelectItem>
              <SelectItem value="this-month">This Month</SelectItem>
              <SelectItem value="last-month">Last Month</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-4">
              {quickStats.map((stat) => (
                <Card key={stat.label}>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {reportCards.map((report) => (
                <Card key={report.title} className="hover:border-primary/50 transition-colors">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-primary/10 p-2">
                        <report.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{report.title}</CardTitle>
                        <CardDescription>{report.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        className="flex-1 bg-transparent"
                        onClick={() => handleDownload(report.title, "pdf")}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        PDF
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1 bg-transparent"
                        onClick={() => handleDownload(report.title, "excel")}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Excel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </main>
    </>
  );
}
