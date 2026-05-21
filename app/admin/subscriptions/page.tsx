"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbLink, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CreditCard, Search, Download, TrendingUp, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { adminAPI } from "@/lib/api/api";
import type { Subscription } from "@/lib/api/api";

export default function AdminSubscriptionsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    active: 0,
    expiring: 0,
    revenue: 0,
  });

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    setIsLoading(true);
    try {
      const response = await adminAPI.getSubscriptions();
      const subs = response.results || response || [];
      setSubscriptions(subs);
      
      // Calculate stats
      const active = subs.filter((s: Subscription) => s.status === "active").length;
      const expiring = subs.filter((s: Subscription) => s.days_left && s.days_left <= 7 && s.days_left > 0).length;
      const revenue = subs.reduce((sum: number, s: Subscription) => sum + (s.plan?.price || 0), 0);
      
      setStats({ active, expiring, revenue });
    } catch (err: unknown) {
      console.error("[v0] Failed to fetch subscriptions:", err);
      // Set empty state - no mock data
      setSubscriptions([]);
      setStats({ active: 0, expiring: 0, revenue: 0 });
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatus = (sub: Subscription) => {
    if (sub.status === "expired" || sub.days_left === 0) return "expired";
    if (sub.days_left && sub.days_left <= 7) return "expiring";
    return "active";
  };

  const filteredSubscriptions = subscriptions.filter((sub) => {
    const matchesSearch = 
      sub.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.user?.cps_number?.toLowerCase().includes(searchTerm.toLowerCase());
    const status = getStatus(sub);
    const matchesStatus = statusFilter === "all" || status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statCards = [
    { title: "Active Subscriptions", value: stats.active.toString(), icon: CheckCircle2, color: "text-green-600" },
    { title: "Expiring Soon", value: stats.expiring.toString(), icon: AlertTriangle, color: "text-amber-600" },
    { title: "Total Revenue", value: formatCurrency(stats.revenue), icon: TrendingUp, color: "text-primary" },
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
              <BreadcrumbPage>Subscriptions</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <main className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <CreditCard className="h-8 w-8" />
              Subscriptions
            </h1>
            <p className="text-muted-foreground">Manage user meal subscriptions</p>
          </div>
          <Button variant="outline" className="bg-transparent">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {statCards.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle>All Subscriptions</CardTitle>
                <CardDescription>
                  {isLoading ? "Loading..." : `${filteredSubscriptions.length} subscriptions found`}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <div className="relative w-[250px]">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or CPS..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="expiring">Expiring</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredSubscriptions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No subscriptions found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Days Left</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubscriptions.map((sub) => {
                    const status = getStatus(sub);
                    return (
                      <TableRow key={sub.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{sub.user?.full_name || "Unknown"}</p>
                            <p className="text-sm text-muted-foreground font-mono">{sub.user?.cps_number}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{sub.plan?.name || "Unknown"}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(sub.plan?.price || 0)}
                        </TableCell>
                        <TableCell>{formatDate(sub.start_date)}</TableCell>
                        <TableCell>{formatDate(sub.end_date)}</TableCell>
                        <TableCell>
                          <span className={status === "expiring" ? "text-amber-600 font-semibold" : ""}>
                            {sub.days_left || 0} days
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              status === "active"
                                ? "default"
                                : status === "expiring"
                                ? "secondary"
                                : "destructive"
                            }
                          >
                            {status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
