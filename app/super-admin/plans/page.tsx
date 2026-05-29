"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/context/auth-context";
import { superAdmin, plans } from "@/lib/api";
import { superAdminAPI as backupAPI, restaurantsAPI } from "@/lib/api/api";
import type { SubscriptionPlan, Restaurant } from "@/lib/types";
import {
  PLAN_TIERS,
  BILLING_CYCLES,
  type PlanTier,
  type BillingCycle,
} from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Package,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Loader2,
  AlertCircle,
  Check,
  X,
  GraduationCap,
  Star,
  Crown,
  Sparkles,
  Users,
  TrendingUp,
} from "lucide-react";

// Tier icons
const TIER_ICONS: Record<PlanTier, React.ElementType> = {
  student: GraduationCap,
  normal: Star,
  premium: Crown,
  special: Sparkles,
};

// Tier badge colors
const TIER_COLORS: Record<PlanTier, string> = {
  student: "bg-blue-100 text-blue-700 border-blue-200",
  normal: "bg-gray-100 text-gray-700 border-gray-200",
  premium: "bg-purple-100 text-purple-700 border-purple-200",
  special: "bg-amber-100 text-amber-700 border-amber-200",
};

interface PlanFormData {
  name: string;
  tier: PlanTier;
  billing_cycle: BillingCycle;
  duration_days: number;
  price: number;
  meals_per_day: number;
  is_student_only: boolean;
  features: string;
  is_active: boolean;
  restaurant_id?: string;
}

const defaultPlanData: PlanFormData = {
  name: "",
  tier: "normal",
  billing_cycle: "monthly",
  duration_days: 30,
  price: 0,
  meals_per_day: 2,
  is_student_only: false,
  features: "",
  is_active: true,
  restaurant_id: undefined,
};

export default function SuperAdminPlansPage() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTier, setFilterTier] = useState<PlanTier | "all">("all");
  const [filterCycle, setFilterCycle] = useState<BillingCycle | "all">("all");

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [formData, setFormData] = useState<PlanFormData>(defaultPlanData);
  const [saving, setSaving] = useState(false);

  // Stats
  const stats = {
    totalPlans: plans.length,
    activePlans: plans.filter((p) => p.is_active).length,
    totalSubscribers: plans.reduce((acc, p) => acc + (p.subscribers_count || 0), 0),
    monthlyRevenue: plans.reduce(
      (acc, p) => acc + (p.price * (p.subscribers_count || 0)),
      0
    ),
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch plans and restaurants using the correct API
      const [plansRes, restaurantsRes] = await Promise.all([
        plans.getAll(), // Get all plans
        superAdmin.getRestaurants(), // Get all restaurants
      ]);

      if (plansRes.data) {
        setPlans(Array.isArray(plansRes.data) ? plansRes.data : []);
      }
      if (restaurantsRes.data) {
        setRestaurants(
          Array.isArray(restaurantsRes.data) ? restaurantsRes.data : []
        );
      }
      setError(null);
    } catch (err) {
      console.error("[v0] Error fetching plans:", err);
      setError("Failed to load subscription plans. Check if backend is running.");
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter plans
  const filteredPlans = plans.filter((plan) => {
    const matchesSearch =
      plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.tier?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTier = filterTier === "all" || plan.tier === filterTier;
    const matchesCycle =
      filterCycle === "all" || plan.billing_cycle === filterCycle;
    return matchesSearch && matchesTier && matchesCycle;
  });

  const handleCreate = async () => {
    setSaving(true);
    try {
      const featuresArray = formData.features
        .split("\n")
        .filter((f) => f.trim());
      const planData = {
        ...formData,
        features: featuresArray,
        duration_type: formData.billing_cycle === "weekly" ? "week" : formData.billing_cycle === "semester" ? "semester" : "month",
      };

      // API call to create plan using superAdmin from endpoints.ts
      const response = await superAdmin.createPlan(planData);
      if (response.error) {
        throw new Error(response.error);
      }

      // Re-fetch data instead of optimistic update to ensure persistence
      await fetchData();

      setIsCreateDialogOpen(false);
      setFormData(defaultPlanData);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create plan";
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedPlan) return;
    setSaving(true);
    try {
      const featuresArray = formData.features
        .split("\n")
        .filter((f) => f.trim());
      const planData = {
        ...formData,
        features: featuresArray,
        duration_type: formData.billing_cycle === "weekly" ? "week" : formData.billing_cycle === "semester" ? "semester" : "month",
      };

      // API call to update plan
      const response = await superAdmin.updatePlan(selectedPlan.id, planData);
      if (response.error) {
        throw new Error(response.error);
      }

      // Re-fetch data instead of optimistic update to ensure persistence
      await fetchData();

      setIsEditDialogOpen(false);
      setSelectedPlan(null);
      setFormData(defaultPlanData);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update plan";
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedPlan) return;
    setSaving(true);
    try {
      // API call to delete plan
      const response = await superAdmin.deletePlan(selectedPlan.id);
      if (response.error) {
        throw new Error(response.error);
      }

      // Re-fetch data instead of optimistic update to ensure persistence
      await fetchData();

      setIsDeleteDialogOpen(false);
      setSelectedPlan(null);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete plan";
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (plan: SubscriptionPlan) => {
    try {
      // API call to toggle
      const response = await superAdmin.updatePlan(plan.id, { is_active: !plan.is_active });
      if (response.error) {
        throw new Error(response.error);
      }

      // Re-fetch data to ensure persistence
      await fetchData();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update plan status";
      setError(errorMessage);
    }
  };

  const openEditDialog = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setFormData({
      name: plan.name,
      tier: plan.tier || "normal",
      billing_cycle: plan.billing_cycle || "monthly",
      duration_days: plan.duration_days,
      price: plan.price,
      meals_per_day: plan.meals_per_day,
      is_student_only: plan.is_student_only || false,
      features: plan.features?.join("\n") || "",
      is_active: plan.is_active,
      restaurant_id: plan.restaurant_id,
    });
    setIsEditDialogOpen(true);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-TZ", {
      style: "currency",
      currency: "TZS",
      minimumFractionDigits: 0,
    }).format(price);
  };

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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Subscription Plans
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage all subscription plans across the platform
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Subscription Plan</DialogTitle>
              <DialogDescription>
                Add a new subscription plan to the platform
              </DialogDescription>
            </DialogHeader>
            <PlanForm
              formData={formData}
              setFormData={setFormData}
              restaurants={restaurants}
            />
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={saving || !formData.name}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Plan"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Plans</p>
                <p className="text-2xl font-bold">{stats.totalPlans}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                <Check className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Plans</p>
                <p className="text-2xl font-bold">{stats.activePlans}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Subscribers</p>
                <p className="text-2xl font-bold">{stats.totalSubscribers.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                <TrendingUp className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Est. Revenue</p>
                <p className="text-2xl font-bold">
                  {formatPrice(stats.monthlyRevenue)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error */}
      {error && (
        <Card className="mb-6 border-destructive/20 bg-destructive/5">
          <CardContent className="flex items-center gap-3 p-4">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <p className="text-sm text-destructive">{error}</p>
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto"
              onClick={() => setError(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search plans..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Select
                value={filterTier}
                onValueChange={(v) => setFilterTier(v as PlanTier | "all")}
              >
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="All Tiers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tiers</SelectItem>
                  {Object.entries(PLAN_TIERS).map(([key, tier]) => (
                    <SelectItem key={key} value={key}>
                      {tier.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={filterCycle}
                onValueChange={(v) => setFilterCycle(v as BillingCycle | "all")}
              >
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="All Cycles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cycles</SelectItem>
                  {Object.entries(BILLING_CYCLES).map(([key, cycle]) => (
                    <SelectItem key={key} value={key}>
                      {cycle.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plans Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All Plans</CardTitle>
          <CardDescription>
            {filteredPlans.length} plan{filteredPlans.length !== 1 ? "s" : ""}{" "}
            found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plan Name</TableHead>
                  <TableHead>Restaurant</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Billing Cycle</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Meals/Day</TableHead>
                  <TableHead>Subscribers</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPlans.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <Package className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">No plans found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPlans.map((plan) => {
                    const TierIcon = TIER_ICONS[plan.tier as PlanTier] || Star;
                    const restaurant = restaurants.find(r => r.id === plan.restaurant_id);
                    return (
                      <TableRow key={plan.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{plan.name}</span>
                            {plan.is_student_only && (
                              <Badge variant="outline" className="text-xs">
                                <GraduationCap className="h-3 w-3 mr-1" />
                                Students
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {restaurant ? (
                            <div className="text-sm">
                              <p className="font-medium">{restaurant.name}</p>
                              <p className="text-muted-foreground text-xs">
                                {restaurant.region || restaurant.area || "N/A"}
                              </p>
                            </div>
                          ) : (
                            <Badge variant="outline" className="text-xs">
                              All Restaurants
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={TIER_COLORS[plan.tier as PlanTier] || ""}
                          >
                            <TierIcon className="h-3 w-3 mr-1" />
                            {PLAN_TIERS[plan.tier as PlanTier]?.label || plan.tier}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {BILLING_CYCLES[plan.billing_cycle as BillingCycle]?.label ||
                              plan.billing_cycle}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatPrice(plan.price)}
                        </TableCell>
                        <TableCell>{plan.meals_per_day}</TableCell>
                        <TableCell>
                          {(plan as SubscriptionPlan & { subscribers_count?: number })
                            .subscribers_count?.toLocaleString() || 0}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={plan.is_active}
                              onCheckedChange={() => handleToggleActive(plan)}
                            />
                            <span
                              className={`text-xs ${
                                plan.is_active
                                  ? "text-green-600"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {plan.is_active ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => openEditDialog(plan)}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Plan
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => {
                                  setSelectedPlan(plan);
                                  setIsDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Plan
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Subscription Plan</DialogTitle>
            <DialogDescription>
              Update the plan details below
            </DialogDescription>
          </DialogHeader>
          <PlanForm
            formData={formData}
            setFormData={setFormData}
            restaurants={restaurants}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={saving || !formData.name}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Plan</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedPlan?.name}? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Plan"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Plan Form Component
function PlanForm({
  formData,
  setFormData,
  restaurants,
}: {
  formData: PlanFormData;
  setFormData: React.Dispatch<React.SetStateAction<PlanFormData>>;
  restaurants: Restaurant[];
}) {
  return (
    <div className="space-y-4 py-4">
      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Plan Name</Label>
        <Input
          id="name"
          placeholder="e.g., Student Weekly Plan"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
      </div>

      {/* Tier and Billing Cycle */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Plan Tier</Label>
          <Select
            value={formData.tier}
            onValueChange={(v) => setFormData({ ...formData, tier: v as PlanTier })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(PLAN_TIERS).map(([key, tier]) => (
                <SelectItem key={key} value={key}>
                  {tier.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Billing Cycle</Label>
          <Select
            value={formData.billing_cycle}
            onValueChange={(v) => {
              const cycle = v as BillingCycle;
              setFormData({
                ...formData,
                billing_cycle: cycle,
                duration_days: BILLING_CYCLES[cycle].days,
              });
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(BILLING_CYCLES).map(([key, cycle]) => (
                <SelectItem key={key} value={key}>
                  {cycle.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Price and Duration */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Price (TZS)</Label>
          <Input
            id="price"
            type="number"
            placeholder="55000"
            value={formData.price || ""}
            onChange={(e) =>
              setFormData({ ...formData, price: Number(e.target.value) })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="duration_days">Duration (days)</Label>
          <Input
            id="duration_days"
            type="number"
            value={formData.duration_days}
            onChange={(e) =>
              setFormData({ ...formData, duration_days: Number(e.target.value) })
            }
          />
        </div>
      </div>

      {/* Meals per day */}
      <div className="space-y-2">
        <Label htmlFor="meals_per_day">Meals per Day</Label>
        <Select
          value={String(formData.meals_per_day)}
          onValueChange={(v) =>
            setFormData({ ...formData, meals_per_day: Number(v) })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1 meal</SelectItem>
            <SelectItem value="2">2 meals</SelectItem>
            <SelectItem value="3">3 meals</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Restaurant (Optional) */}
      <div className="space-y-2">
        <Label>Restaurant (Optional)</Label>
        <Select
          value={formData.restaurant_id || "all"}
          onValueChange={(v) =>
            setFormData({
              ...formData,
              restaurant_id: v === "all" ? undefined : v,
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="All restaurants" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Restaurants (Global Plan)</SelectItem>
            {restaurants.map((r) => (
              <SelectItem key={r.id} value={r.id}>
                {r.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Features */}
      <div className="space-y-2">
        <Label htmlFor="features">Features (one per line)</Label>
        <Textarea
          id="features"
          placeholder="2 meals per day&#10;Standard menu&#10;SMS notifications"
          rows={4}
          value={formData.features}
          onChange={(e) => setFormData({ ...formData, features: e.target.value })}
        />
      </div>

      {/* Toggles */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>Student Only</Label>
          <p className="text-xs text-muted-foreground">
            Restrict to verified students
          </p>
        </div>
        <Switch
          checked={formData.is_student_only}
          onCheckedChange={(v) =>
            setFormData({ ...formData, is_student_only: v })
          }
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>Active</Label>
          <p className="text-xs text-muted-foreground">
            Make this plan available for subscription
          </p>
        </div>
        <Switch
          checked={formData.is_active}
          onCheckedChange={(v) => setFormData({ ...formData, is_active: v })}
        />
      </div>
    </div>
  );
}
