"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbLink, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Users, Search, Plus, MoreHorizontal, Eye, Edit, Trash2, Download, Loader2, AlertTriangle, RefreshCw, Phone } from "lucide-react";
import Link from "next/link";
import { adminAPI } from "@/lib/api/api";
import type { User } from "@/lib/api/api";

interface UserWithSubscription extends User {
  plan_name?: string;
  meals_left?: number;
  subscription_status?: "active" | "expiring" | "expired" | "none";
  days_left?: number;
}

export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  
  const [users, setUsers] = useState<UserWithSubscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await adminAPI.getUsers({ 
        search: searchTerm || undefined,
        status: filterStatus !== "all" ? filterStatus : undefined 
      });
      
      // Transform the data to include subscription info
      const usersData = Array.isArray(response) ? response : [];
      setUsers(usersData.map((user: any) => ({
        ...user,
        plan_name: user.subscription?.plan_name || "No Plan",
        meals_left: user.subscription?.remaining_meals || 0,
        days_left: user.subscription?.days_left || 0,
        subscription_status: user.subscription?.status || "none",
      })));
    } catch (err: any) {
      console.error("[v0] Failed to fetch users:", err);
      setError(err.message || "Failed to load users. Please ensure the backend is running.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(debounce);
  }, [searchTerm, filterStatus]);

  const getSubscriptionStatus = (user: UserWithSubscription): "active" | "expiring" | "expired" | "none" => {
    if (!user.subscription_status || user.subscription_status === "none") return "none";
    if (user.days_left && user.days_left <= 3 && user.days_left > 0) return "expiring";
    return user.subscription_status;
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.cps_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone_number?.includes(searchTerm);
    return matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default">Active</Badge>;
      case "expiring":
        return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">Expiring</Badge>;
      case "expired":
        return <Badge variant="destructive">Expired</Badge>;
      default:
        return <Badge variant="secondary">No Plan</Badge>;
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "??";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const stats = {
    total: users.length,
    active: users.filter(u => getSubscriptionStatus(u) === "active").length,
    expiring: users.filter(u => getSubscriptionStatus(u) === "expiring").length,
    expired: users.filter(u => getSubscriptionStatus(u) === "expired" || getSubscriptionStatus(u) === "none").length,
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
              <BreadcrumbPage>Users</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <main className="flex-1 space-y-6 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
              <Users className="h-6 w-6 sm:h-8 sm:w-8" />
              Users Management
            </h1>
            <p className="text-muted-foreground">Manage user accounts and subscriptions</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={fetchUsers} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button variant="outline" className="bg-transparent">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="border-border/50">
            <CardContent className="p-3 sm:p-4 text-center">
              <p className="text-xl sm:text-2xl font-bold text-primary">{stats.total}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Total Users</p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-3 sm:p-4 text-center">
              <p className="text-xl sm:text-2xl font-bold text-green-600">{stats.active}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Active</p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-3 sm:p-4 text-center">
              <p className="text-xl sm:text-2xl font-bold text-amber-600">{stats.expiring}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Expiring</p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-3 sm:p-4 text-center">
              <p className="text-xl sm:text-2xl font-bold text-red-600">{stats.expired}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Expired/No Plan</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="relative flex-1 min-w-[250px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name, CPS, email, phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <Card className="border-border/50">
            <CardContent className="py-12 text-center">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No users found</p>
              <p className="text-sm text-muted-foreground mt-1">
                {searchTerm ? "Try adjusting your search" : "Users will appear here when they register"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Mobile Cards View */}
            <div className="lg:hidden space-y-3">
              {filteredUsers.map((user) => (
                <Card key={user.id} className="border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {getInitials(user.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.full_name}</p>
                          <p className="text-xs text-muted-foreground font-mono">{user.cps_number || "No CPS"}</p>
                        </div>
                      </div>
                      {getStatusBadge(getSubscriptionStatus(user))}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                      <div>Plan: <span className="text-foreground">{user.plan_name || "None"}</span></div>
                      <div>
                        Days Left: 
                        <span className={user.days_left && user.days_left <= 5 ? "text-red-600 font-medium ml-1" : "text-foreground ml-1"}>
                          {user.days_left || 0}
                        </span>
                      </div>
                      <div className="col-span-2 flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {user.phone_number}
                      </div>
                    </div>
                    <div className="flex justify-end mt-3 pt-3 border-t gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Desktop Table View */}
            <Card className="hidden lg:block">
              <CardHeader>
                <CardTitle>User List</CardTitle>
                <CardDescription>Total {filteredUsers.length} users</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>CPS Number</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Days Left</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {getInitials(user.full_name)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{user.full_name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono">{user.cps_number || "-"}</TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm">{user.email || "No email"}</p>
                            <p className="text-xs text-muted-foreground">{user.phone_number}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{user.plan_name || "None"}</Badge>
                        </TableCell>
                        <TableCell>
                          <span className={user.days_left && user.days_left <= 5 ? "text-red-600 font-medium" : ""}>
                            {user.days_left || 0} days
                          </span>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(getSubscriptionStatus(user))}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Deactivate
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </>
  );
}
