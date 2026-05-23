"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbLink, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Download, TrendingUp, Users, UtensilsCrossed, CreditCard, Loader2 } from "lucide-react";
import { adminAPI, type DemandReport, type RevenueReport } from "@/lib/api/api";

interface ReportStats {
  revenue_today: number;
  meals_served: number;
  active_subscriptions: number;
  new_users: number;
}

export default function AdminReportsPage() {
  const [period, setPeriod] = useState("this-month");
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [demandReport, setDemandReport] = useState<DemandReport[]>([]);
  const [revenueReport, setRevenueReport] = useState<RevenueReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [downloadingReport, setDownloadingReport] = useState<string | null>(null);

  useEffect(() => {
    fetchReportData();
  }, [period]);

  const getDateRange = () => {
    const today = new Date();
    const startDate = new Date();
    
    switch (period) {
      case "today":
        return { start_date: today.toISOString().split("T")[0], end_date: today.toISOString().split("T")[0] };
      case "this-week":
        startDate.setDate(today.getDate() - 7);
        return { start_date: startDate.toISOString().split("T")[0], end_date: today.toISOString().split("T")[0] };
      case "this-month":
        startDate.setDate(1);
        return { start_date: startDate.toISOString().split("T")[0], end_date: today.toISOString().split("T")[0] };
      case "last-month":
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastDay = new Date(today.getFullYear(), today.getMonth(), 0);
        return { start_date: lastMonth.toISOString().split("T")[0], end_date: lastDay.toISOString().split("T")[0] };
      default:
        return { start_date: today.toISOString().split("T")[0], end_date: today.toISOString().split("T")[0] };
    }
  };

  const fetchReportData = async () => {
    setIsLoading(true);
    const dateRange = getDateRange();
    
    try {
      const [dashboardRes, demandRes, revenueRes] = await Promise.all([
        adminAPI.getDashboardStats(),
        adminAPI.getDemandReport(dateRange.start_date).catch(() => []),
        adminAPI.getRevenueReport(dateRange).catch(() => null),
      ]);

      setStats({
        revenue_today: dashboardRes.revenue_today || dashboardRes.revenue_this_month || 0,
        meals_served: dashboardRes.meals_served_today || dashboardRes.todays_orders || 0,
        active_subscriptions: dashboardRes.active_subscriptions || 0,
        new_users: dashboardRes.new_users_today || 0,
      });
      
      setDemandReport(Array.isArray(demandRes) ? demandRes : []);
      setRevenueReport(revenueRes);
    } catch (err) {
      console.error("[v0] Failed to fetch report data:", err);
      setStats({
        revenue_today: 0,
        meals_served: 0,
        active_subscriptions: 0,
        new_users: 0,
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

  const quickStats = [
    { label: "Today's Revenue", value: formatCurrency(stats?.revenue_today || 0) },
    { label: "Meals Served", value: (stats?.meals_served || 0).toLocaleString() },
    { label: "Active Subscriptions", value: (stats?.active_subscriptions || 0).toLocaleString() },
    { label: "New Users", value: (stats?.new_users || 0).toString() },
  ];

  // Generate CSV content from data
  const generateCSV = (reportType: string): string => {
    const dateRange = getDateRange();
    let csvContent = "";
    
    switch (reportType) {
      case "demand":
        csvContent = "Meal Type,Meal Name,Total Orders,Served,Pending\n";
        demandReport.forEach(item => {
          csvContent += `${item.meal_type},${item.meal_name},${item.total_orders},${item.served},${item.pending}\n`;
        });
        break;
      case "revenue":
        csvContent = `Revenue Report (${dateRange.start_date} to ${dateRange.end_date})\n\n`;
        csvContent += `Total Revenue,${revenueReport?.total_revenue || 0}\n`;
        csvContent += `Total Transactions,${revenueReport?.transactions_count || 0}\n\n`;
        csvContent += "Payment Method,Amount,Count\n";
        revenueReport?.by_payment_method?.forEach(item => {
          csvContent += `${item.method},${item.amount},${item.count}\n`;
        });
        break;
      case "summary":
        csvContent = `Summary Report (${dateRange.start_date} to ${dateRange.end_date})\n\n`;
        csvContent += "Metric,Value\n";
        csvContent += `Total Revenue,${formatCurrency(stats?.revenue_today || 0)}\n`;
        csvContent += `Meals Served,${stats?.meals_served || 0}\n`;
        csvContent += `Active Subscriptions,${stats?.active_subscriptions || 0}\n`;
        csvContent += `New Users,${stats?.new_users || 0}\n`;
        break;
      default:
        csvContent = "No data available";
    }
    
    return csvContent;
  };

  const handleDownload = async (reportType: string, format: string) => {
    setDownloadingReport(`${reportType}-${format}`);
    
    try {
      const csvContent = generateCSV(reportType);
      const dateRange = getDateRange();
      const filename = `${reportType}-report-${dateRange.start_date}-to-${dateRange.end_date}.csv`;
      
      // Create blob and download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("[v0] Failed to download report:", err);
    } finally {
      setDownloadingReport(null);
    }
  };

  const reportCards = [
    { title: "Demand Report", description: "Meal demand and serving statistics", icon: UtensilsCrossed, type: "demand" },
    { title: "Revenue Report", description: "Financial summary and transactions", icon: CreditCard, type: "revenue" },
    { title: "Summary Report", description: "Complete summary of all metrics", icon: BarChart3, type: "summary" },
  ];

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

      <main className="flex-1 space-y-6 p-4 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
              <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8" />
              Reports & Analytics
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">Generate and download reports</p>
          </div>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="this-week">This Week</SelectItem>
              <SelectItem value="this-month">This Month</SelectItem>
              <SelectItem value="last-month">Last Month</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Quick Stats */}
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
              {quickStats.map((stat) => (
                <Card key={stat.label}>
                  <CardContent className="pt-6">
                    <p className="text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-xl sm:text-2xl font-bold">{stat.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Download Reports */}
            <Card>
              <CardHeader>
                <CardTitle>Download Reports</CardTitle>
                <CardDescription>Export your data as CSV files</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {reportCards.map((report) => (
                    <Card key={report.title} className="hover:border-primary/50 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="rounded-lg bg-primary/10 p-2">
                            <report.icon className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{report.title}</p>
                            <p className="text-xs text-muted-foreground">{report.description}</p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => handleDownload(report.type, "csv")}
                          disabled={downloadingReport === `${report.type}-csv`}
                        >
                          {downloadingReport === `${report.type}-csv` ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Download className="mr-2 h-4 w-4" />
                          )}
                          Download CSV
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Demand Report Table */}
            {demandReport.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Meal Demand Report</CardTitle>
                  <CardDescription>Orders and serving statistics by meal</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Mobile Card View */}
                  <div className="space-y-3 sm:hidden">
                    {demandReport.map((item, i) => (
                      <Card key={i} className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{item.meal_name}</span>
                          <Badge variant="outline">{item.meal_type}</Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div>
                            <p className="text-muted-foreground text-xs">Orders</p>
                            <p className="font-medium">{item.total_orders}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">Served</p>
                            <p className="font-medium text-green-600">{item.served}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">Pending</p>
                            <p className="font-medium text-amber-600">{item.pending}</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                  
                  {/* Desktop Table View */}
                  <div className="hidden sm:block">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Meal Name</TableHead>
                          <TableHead>Meal Type</TableHead>
                          <TableHead className="text-right">Total Orders</TableHead>
                          <TableHead className="text-right">Served</TableHead>
                          <TableHead className="text-right">Pending</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {demandReport.map((item, i) => (
                          <TableRow key={i}>
                            <TableCell className="font-medium">{item.meal_name}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{item.meal_type}</Badge>
                            </TableCell>
                            <TableCell className="text-right">{item.total_orders}</TableCell>
                            <TableCell className="text-right text-green-600">{item.served}</TableCell>
                            <TableCell className="text-right text-amber-600">{item.pending}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Revenue Breakdown */}
            {revenueReport && revenueReport.by_payment_method && revenueReport.by_payment_method.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Revenue by Payment Method</CardTitle>
                  <CardDescription>
                    Total: {formatCurrency(revenueReport.total_revenue)} from {revenueReport.transactions_count} transactions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {revenueReport.by_payment_method.map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                        <div>
                          <p className="font-medium">{item.method}</p>
                          <p className="text-sm text-muted-foreground">{item.count} transactions</p>
                        </div>
                        <p className="text-lg font-bold">{formatCurrency(item.amount)}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </main>
    </>
  );
}
