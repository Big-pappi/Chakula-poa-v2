"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Pencil,
  UserX,
  UserCheck,
  CalendarPlus,
  XCircle,
  Loader2,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  Clock,
  UtensilsCrossed,
} from "lucide-react";
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
  region?: string;
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

interface Subscription {
  id: string;
  plan: {
    id: string;
    name: string;
    price: number;
  };
  dietary_plan?: {
    name: string;
  } | null;
  start_date: string;
  end_date: string;
  status: string;
  remaining_meals: number;
  days_left: number;
  created_at: string;
}

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "overview");
  
  // Edit dialog state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(searchParams.get("edit") === "true");
  const [editFormData, setEditFormData] = useState({
    full_name: "",
    first_name: "",
    last_name: "",
    email: "",
    registration_number: "",
    region: "",
  });
  
  // Extend subscription dialog
  const [isExtendDialogOpen, setIsExtendDialogOpen] = useState(false);
  const [extendDays, setExtendDays] = useState(7);
  
  // Cancel subscription dialog
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  
  // Deactivate dialog
  const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCustomer = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await adminAPI.getCustomer(resolvedParams.id);
      setCustomer(response);
      setEditFormData({
        full_name: response.full_name || "",
        first_name: response.first_name || "",
        last_name: response.last_name || "",
        email: response.email || "",
        registration_number: response.registration_number || "",
        region: response.region || "",
      });
    } catch (err) {
      console.error("[v0] Failed to fetch customer:", err);
      toast({
        title: "Error",
        description: "Failed to load customer details",
        variant: "destructive",
      });
      router.push("/admin/customers");
    } finally {
      setIsLoading(false);
    }
  }, [resolvedParams.id, router, toast]);

  const fetchSubscriptions = useCallback(async () => {
    try {
      const response = await adminAPI.getCustomerSubscriptions(resolvedParams.id);
      setSubscriptions(response.subscriptions || []);
    } catch (err) {
      console.error("[v0] Failed to fetch subscriptions:", err);
    }
  }, [resolvedParams.id]);

  useEffect(() => {
    fetchCustomer();
    fetchSubscriptions();
  }, [fetchCustomer, fetchSubscriptions]);

  const handleUpdateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await adminAPI.updateCustomer(resolvedParams.id, editFormData);
      toast({
        title: "Success",
        description: "Customer information updated",
      });
      setIsEditDialogOpen(false);
      fetchCustomer();
    } catch (err) {
      console.error("[v0] Failed to update customer:", err);
      toast({
        title: "Error",
        description: "Failed to update customer",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!customer) return;
    setIsSubmitting(true);
    
    try {
      const action = customer.is_active ? "deactivate" : "activate";
      await adminAPI.toggleCustomerStatus(resolvedParams.id, action);
      toast({
        title: "Success",
        description: `Customer ${action}d successfully`,
      });
      setIsDeactivateDialogOpen(false);
      fetchCustomer();
    } catch (err) {
      console.error("[v0] Failed to toggle status:", err);
      toast({
        title: "Error",
        description: "Failed to update customer status",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExtendSubscription = async () => {
    setIsSubmitting(true);
    
    try {
      await adminAPI.manageCustomerSubscription(resolvedParams.id, {
        action: "extend",
        days: extendDays,
      });
      toast({
        title: "Success",
        description: `Subscription extended by ${extendDays} days`,
      });
      setIsExtendDialogOpen(false);
      fetchCustomer();
      fetchSubscriptions();
    } catch (err) {
      console.error("[v0] Failed to extend subscription:", err);
      toast({
        title: "Error",
        description: "Failed to extend subscription",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelSubscription = async () => {
    setIsSubmitting(true);
    
    try {
      await adminAPI.manageCustomerSubscription(resolvedParams.id, {
        action: "cancel",
        reason: cancelReason,
      });
      toast({
        title: "Success",
        description: "Subscription cancelled",
      });
      setIsCancelDialogOpen(false);
      fetchCustomer();
      fetchSubscriptions();
    } catch (err) {
      console.error("[v0] Failed to cancel subscription:", err);
      toast({
        title: "Error",
        description: "Failed to cancel subscription",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return `TSh ${amount.toLocaleString()}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!customer) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/customers">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{customer.full_name}</h1>
          <p className="text-muted-foreground font-mono">{customer.cps_number}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsEditDialogOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button
            variant={customer.is_active ? "destructive" : "default"}
            onClick={() => setIsDeactivateDialogOpen(true)}
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
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Profile Card */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-primary/10 text-primary text-xl">
                      {customer.full_name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("") || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-lg">{customer.full_name}</p>
                    <div className="flex gap-2 mt-1">
                      <Badge variant={customer.is_active ? "default" : "destructive"}>
                        {customer.is_active ? "Active" : "Inactive"}
                      </Badge>
                      <Badge
                        variant={
                          customer.subscription_status === "active"
                            ? "default"
                            : customer.subscription_status === "expired"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {customer.subscription_status === "active"
                          ? "Subscribed"
                          : customer.subscription_status === "expired"
                          ? "Expired"
                          : "No Subscription"}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3 pt-4 border-t">
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{customer.phone_number}</span>
                  </div>
                  {customer.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{customer.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Joined {formatDate(customer.created_at)}</span>
                  </div>
                  {customer.registration_number && (
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <span>Reg: {customer.registration_number}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Active Subscription Card */}
            <Card>
              <CardHeader>
                <CardTitle>Current Subscription</CardTitle>
              </CardHeader>
              <CardContent>
                {customer.active_subscription ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                      <p className="font-medium text-lg">{customer.active_subscription.plan_name}</p>
                      {customer.active_subscription.dietary_plan && (
                        <Badge variant="outline" className="mt-1">
                          {customer.active_subscription.dietary_plan}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          Days Left
                        </div>
                        <p className="text-2xl font-bold mt-1">
                          {customer.active_subscription.days_left}
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <UtensilsCrossed className="h-4 w-4" />
                          Meals Left
                        </div>
                        <p className="text-2xl font-bold mt-1">
                          {customer.active_subscription.remaining_meals}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      <p>Start: {formatDate(customer.active_subscription.start_date)}</p>
                      <p>End: {formatDate(customer.active_subscription.end_date)}</p>
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => setIsExtendDialogOpen(true)}
                      >
                        <CalendarPlus className="mr-2 h-4 w-4" />
                        Extend
                      </Button>
                      <Button
                        variant="destructive"
                        className="flex-1"
                        onClick={() => setIsCancelDialogOpen(true)}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No active subscription</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      This customer does not have an active subscription plan
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{customer.total_subscriptions}</div>
                <p className="text-sm text-muted-foreground">Total Subscriptions</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">
                  {customer.active_subscription?.remaining_meals || 0}
                </div>
                <p className="text-sm text-muted-foreground">Meals Remaining</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">
                  {customer.active_subscription?.days_left || 0}
                </div>
                <p className="text-sm text-muted-foreground">Days Until Expiry</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Subscription Tab */}
        <TabsContent value="subscription" className="space-y-6">
          {customer.active_subscription && (
            <Card>
              <CardHeader>
                <CardTitle>Active Subscription Management</CardTitle>
                <CardDescription>
                  Manage the customer&apos;s current subscription
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="p-4 rounded-lg border">
                    <p className="text-sm text-muted-foreground">Plan</p>
                    <p className="font-medium">{customer.active_subscription.plan_name}</p>
                  </div>
                  <div className="p-4 rounded-lg border">
                    <p className="text-sm text-muted-foreground">Days Left</p>
                    <p className="font-medium">{customer.active_subscription.days_left}</p>
                  </div>
                  <div className="p-4 rounded-lg border">
                    <p className="text-sm text-muted-foreground">Meals Remaining</p>
                    <p className="font-medium">{customer.active_subscription.remaining_meals}</p>
                  </div>
                  <div className="p-4 rounded-lg border">
                    <p className="text-sm text-muted-foreground">End Date</p>
                    <p className="font-medium">
                      {formatDate(customer.active_subscription.end_date)}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button onClick={() => setIsExtendDialogOpen(true)}>
                    <CalendarPlus className="mr-2 h-4 w-4" />
                    Extend Subscription
                  </Button>
                  <Button variant="destructive" onClick={() => setIsCancelDialogOpen(true)}>
                    <XCircle className="mr-2 h-4 w-4" />
                    Cancel Subscription
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Subscription History</CardTitle>
              <CardDescription>
                All past and current subscriptions for this customer
              </CardDescription>
            </CardHeader>
            <CardContent>
              {subscriptions.length === 0 ? (
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No subscription history</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Plan</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Meals Used</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscriptions.map((sub) => (
                      <TableRow key={sub.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{sub.plan.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatCurrency(sub.plan.price)}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>{formatDate(sub.start_date)}</p>
                            <p className="text-muted-foreground">to {formatDate(sub.end_date)}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              sub.status === "active"
                                ? "default"
                                : sub.status === "expired"
                                ? "secondary"
                                : "destructive"
                            }
                          >
                            {sub.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{sub.remaining_meals} remaining</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Customer Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Customer Information</DialogTitle>
            <DialogDescription>
              Update the customer&apos;s profile details
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateCustomer} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  value={editFormData.first_name}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, first_name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  value={editFormData.last_name}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, last_name: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={editFormData.email}
                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="registration_number">Registration Number</Label>
              <Input
                id="registration_number"
                value={editFormData.registration_number}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, registration_number: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="region">Region</Label>
              <Input
                id="region"
                value={editFormData.region}
                onChange={(e) => setEditFormData({ ...editFormData, region: e.target.value })}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Extend Subscription Dialog */}
      <Dialog open={isExtendDialogOpen} onOpenChange={setIsExtendDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Extend Subscription</DialogTitle>
            <DialogDescription>
              Add more days to the customer&apos;s current subscription
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="extend_days">Number of Days</Label>
              <Input
                id="extend_days"
                type="number"
                value={extendDays}
                onChange={(e) => setExtendDays(Number(e.target.value))}
                min={1}
                max={365}
              />
              <p className="text-sm text-muted-foreground">
                New end date will be:{" "}
                {customer.active_subscription
                  ? formatDate(
                      new Date(
                        new Date(customer.active_subscription.end_date).getTime() +
                          extendDays * 24 * 60 * 60 * 1000
                      ).toISOString()
                    )
                  : "N/A"}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsExtendDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleExtendSubscription} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Extend by {extendDays} Days
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Subscription Dialog */}
      <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this customer&apos;s subscription? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="cancel_reason">Reason (optional)</Label>
            <Input
              id="cancel_reason"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Enter reason for cancellation..."
              className="mt-2"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelSubscription}
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Cancel Subscription
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Deactivate Account Dialog */}
      <AlertDialog open={isDeactivateDialogOpen} onOpenChange={setIsDeactivateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {customer.is_active ? "Deactivate Account" : "Activate Account"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {customer.is_active
                ? "Deactivating this account will prevent the customer from logging in or using their subscription."
                : "Activating this account will restore the customer's access to the platform."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleToggleStatus}
              disabled={isSubmitting}
              className={
                customer.is_active
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : ""
              }
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {customer.is_active ? "Deactivate" : "Activate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
