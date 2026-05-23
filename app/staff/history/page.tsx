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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { History, Search, Download, Filter, CalendarIcon, Loader2, Users, AlertCircle, Clock } from "lucide-react";
import { staffAPI } from "@/lib/api/api";
import type { MealOrder } from "@/lib/api/api";
import { format } from "date-fns";

export default function StaffHistoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMeal, setFilterMeal] = useState("all");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [servingHistory, setServingHistory] = useState<MealOrder[]>([]);
  const [usersServedCount, setUsersServedCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, [selectedDate]);

  const fetchHistory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params: { date?: string; start_date?: string; end_date?: string } = {};
      if (selectedDate) {
        params.date = format(selectedDate, "yyyy-MM-dd");
      }
      const response = await staffAPI.getServiceHistory(params);
      setServingHistory(response.results || []);
      setUsersServedCount(response.users_served_count || 0);
    } catch (err) {
      console.error("[v0] Failed to fetch history:", err);
      setError("Failed to load serving history. Please try again.");
      setServingHistory([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter by search term and meal type
  const filteredHistory = servingHistory.filter((record) => {
    const matchesSearch = searchTerm === "" || 
      record.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.user?.cps_number?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesMeal = filterMeal === "all" || record.meal_type === filterMeal;
    
    return matchesSearch && matchesMeal;
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

  return (
    <>
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
              <BreadcrumbPage>Serving History</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <main className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <History className="h-8 w-8" />
              Serving History
            </h1>
            <p className="text-muted-foreground">View your meal serving records</p>
          </div>
          <Button variant="outline" className="bg-transparent">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Users Served</CardTitle>
              <Users className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{usersServedCount}</div>
              <p className="text-xs text-muted-foreground">
                {selectedDate ? `on ${format(selectedDate, "MMM d, yyyy")}` : "Total"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Meals Served</CardTitle>
              <History className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{filteredHistory.length}</div>
              <p className="text-xs text-muted-foreground">
                {selectedDate ? `on ${format(selectedDate, "MMM d, yyyy")}` : "All time"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Date Selected</CardTitle>
              <CalendarIcon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">
                {selectedDate ? format(selectedDate, "MMM d, yyyy") : "All dates"}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name or CPS..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[200px] justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Select value={filterMeal} onValueChange={setFilterMeal}>
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
              <Button variant="outline" onClick={fetchHistory}>
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Records</CardTitle>
            <CardDescription>
              {isLoading ? "Loading..." : `Total ${filteredHistory.length} records found`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                <p className="text-destructive">{error}</p>
                <Button onClick={fetchHistory} className="mt-4">
                  Try Again
                </Button>
              </div>
            ) : filteredHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <History className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No serving records found</p>
                <p className="text-sm text-muted-foreground">
                  {selectedDate 
                    ? `No meals served on ${format(selectedDate, "MMM d, yyyy")}`
                    : "Start serving meals to see your history here"}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User Name</TableHead>
                    <TableHead>CPS Number</TableHead>
                    <TableHead>Meal Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Days Left</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHistory.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">
                        {record.user?.full_name || "Unknown"}
                      </TableCell>
                      <TableCell className="font-mono">
                        {record.user?.cps_number || "-"}
                      </TableCell>
                      <TableCell>
                        <Badge className={getMealTypeColor(record.meal_type)}>
                          {getMealTypeLabel(record.meal_type)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {record.order_date ? format(new Date(record.order_date), "MMM d, yyyy") : "-"}
                      </TableCell>
                      <TableCell>
                        {record.served_at ? format(new Date(record.served_at), "h:mm a") : "-"}
                      </TableCell>
                      <TableCell>
                        {record.subscription?.days_left !== undefined ? (
                          <span className={record.subscription.days_left <= 3 ? "text-destructive font-semibold" : ""}>
                            {record.subscription.days_left} days
                          </span>
                        ) : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={record.status === "served" ? "default" : "destructive"}>
                          {record.status}
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
    </>
  );
}
