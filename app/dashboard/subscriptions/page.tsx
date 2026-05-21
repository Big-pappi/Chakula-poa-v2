"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/context/auth-context";
import { plans, subscriptions } from "@/lib/api";
import { useRouter } from "next/navigation";
import type { SubscriptionPlan, Subscription } from "@/lib/types";
import { PLAN_TIERS, BILLING_CYCLES, PAYMENT_METHODS, type PlanTier, type BillingCycle } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Check,
  CreditCard,
  Calendar,
  Clock,
  Utensils,
  Loader2,
  AlertCircle,
  GraduationCap,
  Star,
  Crown,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Info,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Icon mapping for plan tiers
const TIER_ICONS: Record<PlanTier, React.ElementType> = {
  student: GraduationCap,
  normal: Star,
  premium: Crown,
  special: Sparkles,
};

export default function SubscriptionsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [plansList, setPlansList] = useState<SubscriptionPlan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [pendingChange, setPendingChange] = useState<{
    new_plan: SubscriptionPlan;
    scheduled_date: string;
    change_type: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedBillingCycle, setSelectedBillingCycle] = useState<BillingCycle>("monthly");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch plans filtered by user's restaurant if available
        const restaurantId = user?.restaurant_id || undefined;
        
        const [plansRes, subRes] = await Promise.all([
          plans.getAll(restaurantId),
          subscriptions.getCurrent(),
        ]);
        
        if (plansRes.data && Array.isArray(plansRes.data)) {
          // Filter plans to only show those for user's restaurant
          let filteredPlans = plansRes.data;
          if (user?.restaurant_id) {
            filteredPlans = plansRes.data.filter(
              (plan: SubscriptionPlan) => 
                plan.restaurant_id === user.restaurant_id || 
                plan.university_id === user.restaurant_id ||
                !plan.restaurant_id // Include plans without restaurant (general plans)
            );
          }
          setPlansList(filteredPlans);
          setError(filteredPlans.length === 0 ? "No subscription plans available for your location" : null);
        } else {
          setPlansList([]);
          setError("No subscription plans available");
        }
        
        // Check localStorage for test subscription first
        const storedSub = localStorage.getItem("chakula_poa_active_subscription");
        if (storedSub) {
          const parsed = JSON.parse(storedSub);
          if (new Date(parsed.end_date) > new Date() && parsed.status === "active") {
            setCurrentSubscription(parsed);
          }
        }
        
        if (subRes.data) {
          setCurrentSubscription(subRes.data);
          if (subRes.data.pending_change) {
            setPendingChange(subRes.data.pending_change);
          }
        }
      } catch (err) {
        setPlansList([]);
        setError("Failed to load plans. Please check if backend is running.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user?.restaurant_id]);

  // Filter plans by billing cycle
  const filteredPlans = plansList.filter(
    (plan) => plan.billing_cycle === selectedBillingCycle || !plan.billing_cycle
  );

  // Group plans by tier
  const plansByTier = filteredPlans.reduce((acc, plan) => {
    const tier = plan.tier || "normal";
    if (!acc[tier]) acc[tier] = [];
    acc[tier].push(plan);
    return acc;
  }, {} as Record<PlanTier, SubscriptionPlan[]>);

  const handleSubscribe = (planId: string) => {
    router.push(`/dashboard/checkout?plan=${planId}`);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-TZ", {
      style: "currency",
      currency: "TZS",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  };

  const getChangeType = (currentPlan: SubscriptionPlan | undefined, newPlan: SubscriptionPlan): "upgrade" | "downgrade" | "same" => {
    if (!currentPlan) return "upgrade";
    if (newPlan.price > currentPlan.price) return "upgrade";
    if (newPlan.price < currentPlan.price) return "downgrade";
    return "same";
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
          Subscription Plans
        </h1>
        <p className="mt-1 text-sm sm:text-base text-muted-foreground">
          Choose a meal plan that fits your needs
        </p>
      </div>

      {/* Current Subscription */}
      {currentSubscription && currentSubscription.status === "active" && (
        <Card className="mb-6 sm:mb-8 border-primary/20 bg-primary/5">
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-primary">
                  <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle className="text-base sm:text-lg">Current Plan</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    {currentSubscription.plan?.name || "Active Subscription"}
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {currentSubscription.plan?.tier && (
                  <Badge variant="outline" className="capitalize">
                    {PLAN_TIERS[currentSubscription.plan.tier as PlanTier]?.label || currentSubscription.plan.tier}
                  </Badge>
                )}
                <Badge className="bg-green-500 hover:bg-green-500">Active</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="flex items-center gap-3 rounded-lg bg-background p-3 sm:p-4">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Expires</p>
                  <p className="text-sm sm:text-base font-semibold text-foreground">
                    {new Date(currentSubscription.end_date).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-background p-3 sm:p-4">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Days Left</p>
                  <p className="text-sm sm:text-base font-semibold text-foreground">
                    {getDaysRemaining(currentSubscription.end_date)} days
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-background p-3 sm:p-4">
                <Utensils className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Meals Left</p>
                  <p className="text-sm sm:text-base font-semibold text-foreground">
                    {currentSubscription.remaining_meals} meals
                  </p>
                </div>
              </div>
            </div>

            {/* Pending Plan Change Notice */}
            {pendingChange && (
              <div className="mt-4 flex items-start gap-3 rounded-lg bg-blue-50 p-4 text-blue-700">
                <Info className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Plan Change Scheduled</p>
                  <p className="text-xs mt-1">
                    Your {pendingChange.change_type} to{" "}
                    <span className="font-semibold">{pendingChange.new_plan.name}</span> will take
                    effect on{" "}
                    {new Date(pendingChange.scheduled_date).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                    .
                  </p>
                  <Button
                    variant="link"
                    className="h-auto p-0 text-xs text-blue-700 underline mt-1"
                    onClick={() => {
                      // Cancel pending change logic
                    }}
                  >
                    Cancel this change
                  </Button>
                </div>
              </div>
            )}

            {getDaysRemaining(currentSubscription.end_date) <= 7 && !pendingChange && (
              <div className="mt-4 flex items-center gap-2 rounded-lg bg-amber-50 p-3 text-amber-700">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <p className="text-xs sm:text-sm">
                  Your subscription expires soon. Renew now to avoid interruption.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Error Message */}
      {error && (
        <Card className="mb-6 border-destructive/20 bg-destructive/5">
          <CardContent className="flex items-center gap-3 p-4">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Billing Cycle Tabs */}
      <Tabs
        value={selectedBillingCycle}
        onValueChange={(v) => setSelectedBillingCycle(v as BillingCycle)}
        className="mb-6"
      >
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="semester">Semester</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Plans Grid */}
      {filteredPlans.length === 0 && !error ? (
        <Card className="border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              No subscription plans available for {BILLING_CYCLES[selectedBillingCycle].label.toLowerCase()} billing.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Render plans by tier */}
          {(["student", "normal", "premium", "special"] as PlanTier[]).map((tier) => {
            const tierPlans = plansByTier[tier];
            if (!tierPlans || tierPlans.length === 0) return null;

            const TierIcon = TIER_ICONS[tier];
            const tierInfo = PLAN_TIERS[tier];

            return (
              <div key={tier}>
                <div className="flex items-center gap-2 mb-4">
                  <TierIcon className={`h-5 w-5 ${tier === "premium" ? "text-purple-500" : tier === "student" ? "text-blue-500" : tier === "special" ? "text-amber-500" : "text-gray-500"}`} />
                  <h2 className="text-lg font-semibold">{tierInfo.label}</h2>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs max-w-xs">{tierInfo.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {tierPlans.map((plan) => {
                    const isCurrentPlan =
                      currentSubscription?.plan?.id === plan.id &&
                      currentSubscription.status === "active";
                    const pricePerDay = plan.price / plan.duration_days;
                    const pricePerMeal = plan.price / (plan.duration_days * plan.meals_per_day);
                    const changeType = currentSubscription?.plan
                      ? getChangeType(currentSubscription.plan, plan)
                      : null;

                    return (
                      <Card
                        key={plan.id}
                        className={`relative overflow-hidden transition-all ${
                          tier === "premium"
                            ? "border-purple-500 ring-2 ring-purple-500/20"
                            : isCurrentPlan
                            ? "border-primary ring-2 ring-primary/20"
                            : "border-border/50 hover:border-primary/50"
                        }`}
                      >
                        {tier === "premium" && (
                          <div className="absolute right-0 top-0 rounded-bl-lg bg-purple-500 px-3 py-1">
                            <span className="text-xs font-semibold text-white">Popular</span>
                          </div>
                        )}
                        {plan.is_student_only && (
                          <div className="absolute left-0 top-0 rounded-br-lg bg-blue-500 px-3 py-1">
                            <span className="text-xs font-semibold text-white flex items-center gap-1">
                              <GraduationCap className="h-3 w-3" /> Students Only
                            </span>
                          </div>
                        )}

                        <CardHeader className={plan.is_student_only ? "pt-10" : ""}>
                          <CardTitle className="text-lg sm:text-xl">{plan.name}</CardTitle>
                          <CardDescription className="text-xs sm:text-sm">
                            {BILLING_CYCLES[plan.billing_cycle as BillingCycle]?.label || plan.duration_type} plan
                          </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-4 sm:space-y-6">
                          <div>
                            <p className="text-3xl sm:text-4xl font-bold text-foreground">
                              {formatPrice(plan.price)}
                            </p>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              {formatPrice(Math.round(pricePerDay))}/day
                            </p>
                          </div>

                          <div className="space-y-2 sm:space-y-3">
                            <div className="flex items-center gap-2">
                              <Check className="h-4 w-4 text-green-600" />
                              <span className="text-xs sm:text-sm text-muted-foreground">
                                {plan.duration_days} days of meals
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Check className="h-4 w-4 text-green-600" />
                              <span className="text-xs sm:text-sm text-muted-foreground">
                                {plan.meals_per_day} meals per day
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Check className="h-4 w-4 text-green-600" />
                              <span className="text-xs sm:text-sm text-muted-foreground">
                                {formatPrice(Math.round(pricePerMeal))} per meal
                              </span>
                            </div>
                            {/* Plan features */}
                            {plan.features?.slice(0, 2).map((feature, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-green-600" />
                                <span className="text-xs sm:text-sm text-muted-foreground">
                                  {feature}
                                </span>
                              </div>
                            ))}
                          </div>

                          <Button
                            className="h-10 sm:h-12 w-full"
                            variant={tier === "premium" ? "default" : "outline"}
                            disabled={isCurrentPlan || (plan.is_student_only && !user?.registration_number)}
                            onClick={() => handleSubscribe(plan.id)}
                          >
                            {isCurrentPlan ? (
                              "Current Plan"
                            ) : changeType === "upgrade" ? (
                              <span className="flex items-center gap-1">
                                <ArrowUp className="h-4 w-4" /> Upgrade
                              </span>
                            ) : changeType === "downgrade" ? (
                              <span className="flex items-center gap-1">
                                <ArrowDown className="h-4 w-4" /> Downgrade
                              </span>
                            ) : (
                              "Subscribe"
                            )}
                          </Button>

                          {changeType && changeType !== "same" && !isCurrentPlan && currentSubscription && (
                            <p className="text-xs text-center text-muted-foreground">
                              Change takes effect after current plan ends on{" "}
                              {new Date(currentSubscription.end_date).toLocaleDateString("en-GB", {
                                day: "numeric",
                                month: "short",
                              })}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Payment Methods */}
      <Card className="mt-6 sm:mt-8 border-border/50">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Payment Methods</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            We accept mobile money and bank transfers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3 sm:gap-4">
            {Object.entries(PAYMENT_METHODS).map(([key, method]) => (
              <div
                key={key}
                className="flex items-center gap-2 rounded-lg border border-border/50 px-3 py-2 sm:px-4 sm:py-2"
              >
                <div
                  className={`h-6 w-6 sm:h-8 sm:w-8 rounded ${method.bgColor} flex items-center justify-center text-xs sm:text-sm font-bold text-white`}
                >
                  {method.label.charAt(0)}
                </div>
                <span className="text-xs sm:text-sm font-medium">{method.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
