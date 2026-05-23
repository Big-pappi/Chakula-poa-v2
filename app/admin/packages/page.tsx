"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Plus, Pencil, Trash2, Loader2, Package, GraduationCap, Users, Crown, Star, X } from "lucide-react";
import { adminAPI } from "@/lib/api/api";
import { useToast } from "@/hooks/use-toast";

interface SubscriptionPlan {
  id: string;
  name: string;
  tier: "student" | "normal" | "premium" | "special";
  tier_display?: string;
  billing_cycle: "weekly" | "monthly" | "semester";
  billing_cycle_display?: string;
  is_student_only: boolean;
  features: string[];
  duration_type: "day" | "week" | "month" | "semester";
  duration_days: number;
  price: number;
  meals_per_day: number;
  is_active: boolean;
  created_at?: string;
}

type PlanFormData = Omit<SubscriptionPlan, "id" | "created_at" | "tier_display" | "billing_cycle_display">;

const initialFormData: PlanFormData = {
  name: "",
  tier: "normal",
  billing_cycle: "monthly",
  is_student_only: false,
  features: [],
  duration_type: "month",
  duration_days: 30,
  price: 0,
  meals_per_day: 2,
  is_active: true,
};

const tierIcons = {
  student: GraduationCap,
  normal: Users,
  premium: Crown,
  special: Star,
};

const tierColors = {
  student: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  normal: "bg-gray-500/10 text-gray-600 border-gray-500/20",
  premium: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  special: "bg-purple-500/10 text-purple-600 border-purple-500/20",
};

export default function PackagesPage() {
  const { toast } = useToast();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [formData, setFormData] = useState<PlanFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newFeature, setNewFeature] = useState("");

  const fetchPlans = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await adminAPI.getPlans();
      setPlans(Array.isArray(response) ? response : []);
    } catch (err) {
      console.error("[v0] Failed to fetch plans:", err);
      toast({
        title: "Error",
        description: "Failed to load subscription plans",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const openCreateDialog = () => {
    setSelectedPlan(null);
    setFormData(initialFormData);
    setIsDialogOpen(true);
  };

  const openEditDialog = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setFormData({
      name: plan.name,
      tier: plan.tier,
      billing_cycle: plan.billing_cycle,
      is_student_only: plan.is_student_only,
      features: plan.features || [],
      duration_type: plan.duration_type,
      duration_days: plan.duration_days,
      price: plan.price,
      meals_per_day: plan.meals_per_day,
      is_active: plan.is_active,
    });
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (selectedPlan) {
        await adminAPI.updatePlan(selectedPlan.id, formData);
        toast({
          title: "Success",
          description: "Plan updated successfully",
        });
      } else {
        await adminAPI.createPlan(formData);
        toast({
          title: "Success",
          description: "Plan created successfully",
        });
      }
      setIsDialogOpen(false);
      fetchPlans();
    } catch (err) {
      console.error("[v0] Failed to save plan:", err);
      toast({
        title: "Error",
        description: selectedPlan ? "Failed to update plan" : "Failed to create plan",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedPlan) return;
    setIsSubmitting(true);

    try {
      await adminAPI.deletePlan(selectedPlan.id);
      toast({
        title: "Success",
        description: "Plan deleted successfully",
      });
      setIsDeleteDialogOpen(false);
      fetchPlans();
    } catch (err) {
      console.error("[v0] Failed to delete plan:", err);
      toast({
        title: "Error",
        description: "Failed to delete plan",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addFeature = () => {
    if (newFeature.trim() && !formData.features.includes(newFeature.trim())) {
      setFormData({
        ...formData,
        features: [...formData.features, newFeature.trim()],
      });
      setNewFeature("");
    }
  };

  const removeFeature = (feature: string) => {
    setFormData({
      ...formData,
      features: formData.features.filter((f) => f !== feature),
    });
  };

  const formatCurrency = (amount: number) => {
    return `TSh ${amount.toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Subscription Packages</h1>
          <p className="text-muted-foreground">
            Create and manage subscription plans for your customers
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Add Package
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedPlan ? "Edit Package" : "Create New Package"}</DialogTitle>
              <DialogDescription>
                {selectedPlan
                  ? "Update the subscription package details"
                  : "Add a new subscription package for your customers"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Package Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Monthly Basic"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price (TSh)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    placeholder="e.g., 150000"
                    required
                    min={0}
                  />
                </div>
              </div>

              {/* Tier and Billing */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="tier">Plan Tier</Label>
                  <Select
                    value={formData.tier}
                    onValueChange={(value: "student" | "normal" | "premium" | "special") =>
                      setFormData({ ...formData, tier: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select tier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student Plan</SelectItem>
                      <SelectItem value="normal">Normal Plan</SelectItem>
                      <SelectItem value="premium">Premium Plan</SelectItem>
                      <SelectItem value="special">Special Plan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="billing_cycle">Billing Cycle</Label>
                  <Select
                    value={formData.billing_cycle}
                    onValueChange={(value: "weekly" | "monthly" | "semester") =>
                      setFormData({ ...formData, billing_cycle: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select billing cycle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="semester">Per Semester</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Duration and Meals */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="duration_type">Duration Type</Label>
                  <Select
                    value={formData.duration_type}
                    onValueChange={(value: "day" | "week" | "month" | "semester") =>
                      setFormData({ ...formData, duration_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="day">Day</SelectItem>
                      <SelectItem value="week">Week</SelectItem>
                      <SelectItem value="month">Month</SelectItem>
                      <SelectItem value="semester">Semester</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration_days">Duration (Days)</Label>
                  <Input
                    id="duration_days"
                    type="number"
                    value={formData.duration_days}
                    onChange={(e) => setFormData({ ...formData, duration_days: Number(e.target.value) })}
                    min={1}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="meals_per_day">Meals Per Day</Label>
                  <Input
                    id="meals_per_day"
                    type="number"
                    value={formData.meals_per_day}
                    onChange={(e) => setFormData({ ...formData, meals_per_day: Number(e.target.value) })}
                    min={1}
                    max={5}
                    required
                  />
                </div>
              </div>

              {/* Features */}
              <div className="space-y-2">
                <Label>Features</Label>
                <div className="flex gap-2">
                  <Input
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    placeholder="Add a feature..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addFeature();
                      }
                    }}
                  />
                  <Button type="button" variant="outline" onClick={addFeature}>
                    Add
                  </Button>
                </div>
                {formData.features.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.features.map((feature) => (
                      <Badge key={feature} variant="secondary" className="gap-1">
                        {feature}
                        <button
                          type="button"
                          onClick={() => removeFeature(feature)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Switches */}
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <Label htmlFor="is_student_only" className="font-medium">
                      Student Only
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Only verified students can subscribe to this plan
                    </p>
                  </div>
                  <Switch
                    id="is_student_only"
                    checked={formData.is_student_only}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_student_only: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <Label htmlFor="is_active" className="font-medium">
                      Active
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Make this plan available for purchase
                    </p>
                  </div>
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_active: checked })
                    }
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {selectedPlan ? "Update Package" : "Create Package"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Plans List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : plans.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No packages yet</h3>
            <p className="text-muted-foreground text-center max-w-md mt-1">
              Create your first subscription package to start accepting customers.
            </p>
            <Button className="mt-4" onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Package
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Desktop Table */}
          <Card className="hidden md:block">
            <CardHeader>
              <CardTitle>All Packages</CardTitle>
              <CardDescription>{plans.length} subscription packages</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Package</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Meals/Day</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {plans.map((plan) => {
                    const TierIcon = tierIcons[plan.tier];
                    return (
                      <TableRow key={plan.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{plan.name}</p>
                            {plan.is_student_only && (
                              <Badge variant="outline" className="text-xs mt-1">
                                <GraduationCap className="h-3 w-3 mr-1" />
                                Students only
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={tierColors[plan.tier]}>
                            <TierIcon className="h-3 w-3 mr-1" />
                            {plan.tier_display || plan.tier}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(plan.price)}
                        </TableCell>
                        <TableCell>
                          {plan.duration_days} days
                          <span className="text-muted-foreground text-sm ml-1">
                            ({plan.billing_cycle_display || plan.billing_cycle})
                          </span>
                        </TableCell>
                        <TableCell>{plan.meals_per_day}</TableCell>
                        <TableCell>
                          <Badge variant={plan.is_active ? "default" : "secondary"}>
                            {plan.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(plan)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openDeleteDialog(plan)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Mobile Cards */}
          <div className="grid gap-4 md:hidden">
            {plans.map((plan) => {
              const TierIcon = tierIcons[plan.tier];
              return (
                <Card key={plan.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{plan.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className={tierColors[plan.tier]}>
                            <TierIcon className="h-3 w-3 mr-1" />
                            {plan.tier_display || plan.tier}
                          </Badge>
                          <Badge variant={plan.is_active ? "default" : "secondary"}>
                            {plan.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(plan)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDeleteDialog(plan)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Price</span>
                      <span className="font-medium">{formatCurrency(plan.price)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Duration</span>
                      <span>{plan.duration_days} days</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Meals/Day</span>
                      <span>{plan.meals_per_day}</span>
                    </div>
                    {plan.features && plan.features.length > 0 && (
                      <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground mb-2">Features</p>
                        <div className="flex flex-wrap gap-1">
                          {plan.features.slice(0, 3).map((feature) => (
                            <Badge key={feature} variant="secondary" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                          {plan.features.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{plan.features.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Package</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{selectedPlan?.name}&quot;? This action cannot
              be undone. Existing subscriptions using this plan will not be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
