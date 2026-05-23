"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbLink, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Download, Loader2, UtensilsCrossed, AlertCircle } from "lucide-react";
import { staffAPI } from "@/lib/api/api";
import type { MealOrder } from "@/lib/api/api";

export default function StaffCollectionsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [mealFilter, setMealFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [collections, setCollections] = useState<MealOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await staffAPI.getTodayOrders();
      setCollections(response || []);
    } catch (err: any) {
      console.error("[v0] Failed to fetch collections:", err);
      setError("Failed to load collections. Please try again.");
      // Demo data for preview
      setCollections([
        { id: "1", user: { full_name: "John Mwamba", cps_number: "CPS#A1B2" }, meal_type: "tea", status: "served", served_at: "2024-01-15T07:30:00", order_date: "2024-01-15" } as any,
        { id: "2", user: { full_name: "Grace Kileo", cps_number: "CPS#C3D4" }, meal_type: "lunch", status: "served", served_at: "2024-01-15T12:42:00", order_date: "2024-01-15" } as any,
        { id: "3", user: { full_name: "Peter Makundi", cps_number: "CPS#E5F6" }, meal_type: "lunch", status: "pending", order_date: "2024-01-15" } as any,
        { id: "4", user: { full_name: "Amina Hassan", cps_number: "CPS#G7H8" }, meal_type: "evening", status: "served", served_at: "2024-01-15T18:38:00", order_date: "2024-01-15" } as any,
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCollections = collections.filter((c) => {
    const matchesSearch = 
      c.user?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.user?.cps_number?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMeal = mealFilter === "all" || c.meal_type === mealFilter;
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    return matchesSearch && matchesMeal && matchesStatus;
  });

  const getMealTypeLabel = (mealType: string) => {
    switch (mealType) {
      case "tea": return "Morning Tea";
      case "lunch": return "Lunch";
      case "evening": return "Evening";
      default: return mealType;
    }
  };

  const getMealTypeColor = (mealType: string) => {
    switch (mealType) {
      case "tea": return "bg-amber-100 text-amber-800";
      case "lunch": return "bg-blue-100 text-blue-800";
      case "evening": return "bg-purple-100 text-purple-800";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/staff">Staff</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Collections</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <main className="flex-1 p-4 md:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Today&apos;s Collections</h1>
            <p className="text-muted-foreground">View all meal collections for today</p>
          </div>
          <Button variant="outline" className="bg-transparent">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{collections.length}</div>
              <p className="text-xs text-muted-foreground">Total Orders</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">
                {collections.filter(c => c.status === "served").length}
              </div>
              <p className="text-xs text-muted-foreground">Served</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-amber-600">
                {collections.filter(c => c.status === "pending").length}
              </div>
              <p className="text-xs text-muted-foreground">Pending</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-red-600">
                {collections.filter(c => c.status === "cancelled" || c.status === "expired").length}
              </div>
              <p className="text-xs text-muted-foreground">Cancelled/Expired</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle>All Collections</CardTitle>
                <CardDescription>
                  {isLoading ? "Loading..." : `${filteredCollections.length} records found`}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or CPS number..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={mealFilter} onValueChange={setMealFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Meal Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Meals</SelectItem>
                  <SelectItem value="tea">Morning Tea</SelectItem>
                  <SelectItem value="lunch">Lunch</SelectItem>
                  <SelectItem value="evening">Evening</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="served">Served</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={fetchCollections}>
                Refresh
              </Button>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                <p className="text-destructive">{error}</p>
                <Button onClick={fetchCollections} className="mt-4">
                  Try Again
                </Button>
              </div>
            ) : filteredCollections.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <UtensilsCrossed className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                <p className="text-muted-foreground">No collections found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>CPS Number</TableHead>
                    <TableHead>Meal Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time Served</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCollections.map((collection) => (
                    <TableRow key={collection.id}>
                      <TableCell className="font-medium">
                        {collection.user?.full_name || "Unknown"}
                      </TableCell>
                      <TableCell>
                        <code className="text-sm bg-muted px-2 py-1 rounded">
                          {collection.user?.cps_number || "-"}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge className={getMealTypeColor(collection.meal_type)}>
                          {getMealTypeLabel(collection.meal_type)}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(collection.order_date)}</TableCell>
                      <TableCell>{formatTime(collection.served_at)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            collection.status === "served"
                              ? "default"
                              : collection.status === "pending"
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {collection.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
