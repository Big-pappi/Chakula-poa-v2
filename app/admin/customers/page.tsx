"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Pencil,
  UserX,
  UserCheck,
  CreditCard,
  Loader2,
  Users,
  RefreshCcw,
} from "lucide-react";
import Link from "next/link";
import { adminAPI } from "@/lib/api/api";
import { useToast } from "@/hooks/use-toast";

interface Customer {
  id: string;
  cps_number: string;
  full_name: string;
  first_name?: string;
  last_name?: string;
  phone_number: string;
  email?: string;
  registration_number?: string;
  is_active: boolean;
  active_subscription?: {
    id: string;
    plan_name: string;
    plan_id: string;
    start_date: string;
    end_date: string;
    days_left: number;
    remaining_meals: number;
    dietary_plan?: string;
  } | null;
  subscription_status: "active" | "expired" | "none";
  total_subscriptions: number;
  created_at: string;
}

export default function CustomersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "all");
  const [subscriptionFilter, setSubscriptionFilter] = useState(
    searchParams.get("subscription_status") || "all"
  );

  const fetchCustomers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string> = {};
      if (searchQuery) params.search = searchQuery;
      if (statusFilter !== "all") params.status = statusFilter;
      if (subscriptionFilter !== "all") params.subscription_status = subscriptionFilter;

      const response = await adminAPI.getCustomers(params);
      setCustomers(Array.isArray(response) ? response : []);
    } catch (err) {
      console.error("[v0] Failed to fetch customers:", err);
      toast({
        title: "Error",
        description: "Failed to load customers",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, statusFilter, subscriptionFilter, toast]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchCustomers();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [fetchCustomers]);

  const handleToggleStatus = async (customer: Customer) => {
    try {
      const action = customer.is_active ? "deactivate" : "activate";
      await adminAPI.toggleCustomerStatus(customer.id, action);
      toast({
        title: "Success",
        description: `Customer ${action}d successfully`,
      });
      fetchCustomers();
    } catch (err) {
      console.error("[v0] Failed to toggle customer status:", err);
      toast({
        title: "Error",
        description: "Failed to update customer status",
        variant: "destructive",
      });
    }
  };

  const getSubscriptionBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default">Active</Badge>;
      case "expired":
        return <Badge variant="destructive">Expired</Badge>;
      default:
        return <Badge variant="secondary">No Subscription</Badge>;
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge variant="outline" className="border-green-500/50 text-green-600">
        Active
      </Badge>
    ) : (
      <Badge variant="outline" className="border-red-500/50 text-red-600">
        Inactive
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Customers</h1>
          <p className="text-muted-foreground">
            Manage customers subscribed to your restaurant
          </p>
        </div>
        <Button variant="outline" onClick={fetchCustomers} disabled={isLoading}>
          <RefreshCcw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, phone, or CPS number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Select value={subscriptionFilter} onValueChange={setSubscriptionFilter}>
                <SelectTrigger className="w-[180px]">
                  <CreditCard className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Subscription" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subscriptions</SelectItem>
                  <SelectItem value="active">Active Sub</SelectItem>
                  <SelectItem value="expired">Expired Sub</SelectItem>
                  <SelectItem value="none">No Subscription</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customers List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : customers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No customers found</h3>
            <p className="text-muted-foreground text-center max-w-md mt-1">
              {searchQuery || statusFilter !== "all" || subscriptionFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Customers who subscribe to your restaurant will appear here"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Desktop Table */}
          <Card className="hidden lg:block">
            <CardHeader>
              <CardTitle>Customer List</CardTitle>
              <CardDescription>{customers.length} customers found</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>CPS Number</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Subscription</TableHead>
                    <TableHead>Account</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {customer.full_name
                                ?.split(" ")
                                .map((n) => n[0])
                                .join("") || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{customer.full_name}</p>
                            {customer.email && (
                              <p className="text-sm text-muted-foreground">{customer.email}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-sm bg-muted px-2 py-1 rounded">
                          {customer.cps_number}
                        </code>
                      </TableCell>
                      <TableCell>{customer.phone_number}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {getSubscriptionBadge(customer.subscription_status)}
                          {customer.active_subscription && (
                            <p className="text-xs text-muted-foreground">
                              {customer.active_subscription.days_left} days left
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(customer.is_active)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/customers/${customer.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/customers/${customer.id}?edit=true`}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit Info
                              </Link>
                            </DropdownMenuItem>
                            {customer.active_subscription && (
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/customers/${customer.id}?tab=subscription`}>
                                  <CreditCard className="mr-2 h-4 w-4" />
                                  Manage Subscription
                                </Link>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleToggleStatus(customer)}
                              className={customer.is_active ? "text-destructive" : "text-green-600"}
                            >
                              {customer.is_active ? (
                                <>
                                  <UserX className="mr-2 h-4 w-4" />
                                  Deactivate Account
                                </>
                              ) : (
                                <>
                                  <UserCheck className="mr-2 h-4 w-4" />
                                  Activate Account
                                </>
                              )}
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

          {/* Mobile/Tablet Cards */}
          <div className="grid gap-4 lg:hidden">
            {customers.map((customer) => (
              <Card key={customer.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {customer.full_name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("") || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{customer.full_name}</p>
                        <p className="text-sm text-muted-foreground font-mono">
                          {customer.cps_number}
                        </p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/customers/${customer.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/customers/${customer.id}?edit=true`}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit Info
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleToggleStatus(customer)}
                          className={customer.is_active ? "text-destructive" : "text-green-600"}
                        >
                          {customer.is_active ? (
                            <>
                              <UserX className="mr-2 h-4 w-4" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <UserCheck className="mr-2 h-4 w-4" />
                              Activate
                            </>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {getSubscriptionBadge(customer.subscription_status)}
                    {getStatusBadge(customer.is_active)}
                  </div>
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phone</span>
                      <span>{customer.phone_number}</span>
                    </div>
                    {customer.active_subscription && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Plan</span>
                          <span>{customer.active_subscription.plan_name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Days Left</span>
                          <span>{customer.active_subscription.days_left}</span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Subscriptions</span>
                      <span>{customer.total_subscriptions}</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => router.push(`/admin/customers/${customer.id}`)}
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
