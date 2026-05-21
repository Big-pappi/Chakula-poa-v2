"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/auth-context";
import { plans, payments } from "@/lib/api";
import type { SubscriptionPlan } from "@/lib/types";
import {
  PAYMENT_METHODS,
  PLAN_TIERS,
  type PaymentMethod,
  type PlanTier,
} from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Check,
  CreditCard,
  Loader2,
  AlertCircle,
  Phone,
  Building2,
  Shield,
  Clock,
  Smartphone,
  CheckCircle2,
  XCircle,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { PaymentIcons } from "@/components/icons/payment-icons";

// Payment method icons with their brand colors
const PaymentMethodCard = ({
  method,
  label,
  selected,
  onClick,
}: {
  method: PaymentMethod;
  label: string;
  selected: boolean;
  onClick: () => void;
}) => {
  const Icon = PaymentIcons[method];
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 rounded-xl border-2 p-4 transition-all ${
        selected
          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
          : "border-border hover:border-primary/50"
      }`}
    >
      {Icon ? (
        <Icon className="h-12 w-12 flex-shrink-0" />
      ) : (
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-500 text-white font-bold text-lg">
          {label.charAt(0)}
        </div>
      )}
      <div className="text-left flex-1">
        <p className="font-semibold text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">
          {method === "bank_transfer" ? "Bank Account" : "Mobile Money"}
        </p>
      </div>
      {selected && (
        <Check className="ml-auto h-5 w-5 text-primary flex-shrink-0" />
      )}
    </button>
  );
};

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const planId = searchParams.get("plan");

  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Payment state
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [phoneNumber, setPhoneNumber] = useState(user?.phone_number || "");
  const [processing, setProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "processing" | "success" | "failed"
  >("idle");
  const [paymentReference, setPaymentReference] = useState<string | null>(null);

  // Platform fee percentage (would come from system settings) - used internally, not shown to user
  const platformFeePercentage = 10;

  useEffect(() => {
    if (!planId) {
      router.push("/dashboard/subscriptions");
      return;
    }

    const fetchPlan = async () => {
      try {
        const response = await plans.getById(planId);
        if (response.data) {
          setPlan(response.data);
        } else {
          setError("Plan not found");
        }
      } catch (err) {
        // Demo plan for testing
        setPlan({
          id: planId,
          name: "Monthly Premium Plan",
          tier: "premium",
          billing_cycle: "monthly",
          is_student_only: false,
          features: [
            "2 meals per day",
            "Premium menu access",
            "Priority seating",
            "SMS notifications",
          ],
          duration_type: "month",
          duration_days: 30,
          price: 85000,
          meals_per_day: 2,
          is_active: true,
          created_at: new Date().toISOString(),
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, [planId, router]);

  // Calculate payment breakdown
  const calculateBreakdown = () => {
    if (!plan) return { total: 0, platformFee: 0, restaurantAmount: 0 };
    const total = plan.price;
    const platformFee = Math.round((total * platformFeePercentage) / 100);
    const restaurantAmount = total - platformFee;
    return { total, platformFee, restaurantAmount };
  };

  const { total, platformFee, restaurantAmount } = calculateBreakdown();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-TZ", {
      style: "currency",
      currency: "TZS",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handlePayment = async () => {
    if (!selectedMethod || !phoneNumber || !plan) return;

    setProcessing(true);
    setPaymentStatus("processing");

    try {
      // Initiate payment via API
      const response = await payments.initiate({
        plan_id: plan.id,
        payment_method: selectedMethod,
        phone_number: phoneNumber,
        amount: total,
      });

      if (response.data?.reference) {
        setPaymentReference(response.data.reference);
        // Poll for payment status or wait for callback
        // For now, simulate success after delay
        setTimeout(() => {
          // Save subscription to localStorage for testing
          saveTestSubscription(plan, response.data.reference);
          setPaymentStatus("success");
          setProcessing(false);
        }, 3000);
      } else {
        throw new Error("Failed to initiate payment");
      }
    } catch (err) {
      // Simulate payment for demo/testing
      const ref = `CPS${Date.now()}`;
      setPaymentReference(ref);
      setTimeout(() => {
        // Save subscription to localStorage for testing
        saveTestSubscription(plan, ref);
        setPaymentStatus("success");
        setProcessing(false);
      }, 3000);
    }
  };

  // Save subscription to localStorage for testing purposes
  const saveTestSubscription = (plan: SubscriptionPlan, reference: string) => {
    const subscription = {
      id: `sub-${Date.now()}`,
      user_id: user?.id || "1",
      plan_id: plan.id,
      plan_name: plan.name,
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + plan.duration_days * 24 * 60 * 60 * 1000).toISOString(),
      status: "active",
      meals_remaining: plan.duration_days * plan.meals_per_day,
      payment_reference: reference,
    };
    localStorage.setItem("chakula_poa_active_subscription", JSON.stringify(subscription));
  };

  const handleRetry = () => {
    setPaymentStatus("idle");
    setPaymentReference(null);
    setError(null);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="p-4 lg:p-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <p className="text-lg font-medium">Plan not found</p>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              The subscription plan you selected is not available.
            </p>
            <Button asChild>
              <Link href="/dashboard/subscriptions">View All Plans</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Payment Success Screen
  if (paymentStatus === "success") {
    return (
      <div className="p-4 lg:p-8">
        <Card className="max-w-md mx-auto border-green-200 bg-green-50/50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Payment Successful!
            </h2>
            <p className="text-sm text-muted-foreground text-center mb-6">
              Your subscription to {plan.name} has been activated.
            </p>
            
            <div className="w-full rounded-lg bg-background p-4 mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">Reference</span>
                <span className="text-sm font-mono font-medium">
                  {paymentReference}
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">Amount Paid</span>
                <span className="text-sm font-medium">{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Valid Until</span>
                <span className="text-sm font-medium">
                  {new Date(
                    Date.now() + plan.duration_days * 24 * 60 * 60 * 1000
                  ).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3 w-full">
              <Button asChild>
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard/qr-code">View QR Code</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Payment Failed Screen
  if (paymentStatus === "failed") {
    return (
      <div className="p-4 lg:p-8">
        <Card className="max-w-md mx-auto border-red-200 bg-red-50/50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Payment Failed
            </h2>
            <p className="text-sm text-muted-foreground text-center mb-6">
              We couldn&apos;t process your payment. Please try again.
            </p>
            
            {error && (
              <div className="w-full rounded-lg bg-red-100 p-3 mb-6">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="flex flex-col gap-3 w-full">
              <Button onClick={handleRetry}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard/subscriptions">Choose Different Plan</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Processing Screen
  if (paymentStatus === "processing") {
    return (
      <div className="p-4 lg:p-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="mb-6 relative">
              <div className="h-20 w-20 rounded-full border-4 border-primary/20" />
              <div className="absolute inset-0 h-20 w-20 rounded-full border-4 border-primary border-t-transparent animate-spin" />
              <Smartphone className="absolute inset-0 m-auto h-8 w-8 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">
              Processing Payment
            </h2>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Please check your phone and approve the payment request.
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>This may take a few moments...</span>
            </div>
            
            {paymentReference && (
              <div className="mt-6 w-full rounded-lg bg-muted p-3">
                <p className="text-xs text-muted-foreground text-center">
                  Reference: <span className="font-mono">{paymentReference}</span>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/dashboard/subscriptions">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Plans
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-foreground">Checkout</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Complete your subscription payment
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Payment Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Plan Summary */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <CardDescription>
                    {plan.duration_days} days subscription
                  </CardDescription>
                </div>
                {plan.tier && (
                  <Badge variant="outline" className="capitalize">
                    {PLAN_TIERS[plan.tier as PlanTier]?.label || plan.tier}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {plan.features?.map((feature, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs"
                  >
                    <Check className="h-3 w-3 text-green-600" />
                    {feature}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Payment Method Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Select Payment Method</CardTitle>
              <CardDescription>
                Choose how you want to pay
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Mobile Money Options */}
              <div>
                <p className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  Mobile Money
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <PaymentMethodCard
                    method="mpesa"
                    label="M-Pesa"
                    selected={selectedMethod === "mpesa"}
                    onClick={() => setSelectedMethod("mpesa")}
                  />
                  <PaymentMethodCard
                    method="airtel_money"
                    label="Airtel Money"
                    selected={selectedMethod === "airtel_money"}
                    onClick={() => setSelectedMethod("airtel_money")}
                  />
                  <PaymentMethodCard
                    method="halopesa"
                    label="Halopesa"
                    selected={selectedMethod === "halopesa"}
                    onClick={() => setSelectedMethod("halopesa")}
                  />
                  <PaymentMethodCard
                    method="tigopesa"
                    label="Tigo Pesa"
                    selected={selectedMethod === "tigopesa"}
                    onClick={() => setSelectedMethod("tigopesa")}
                  />
                  <PaymentMethodCard
                    method="mix_by_yas"
                    label="Mix by Yas"
                    selected={selectedMethod === "mix_by_yas"}
                    onClick={() => setSelectedMethod("mix_by_yas")}
                  />
                </div>
              </div>

              <Separator />

              {/* Bank Transfer */}
              <div>
                <p className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Bank Transfer
                </p>
                <PaymentMethodCard
                  method="bank_transfer"
                  label="Bank Transfer"
                  selected={selectedMethod === "bank_transfer"}
                  onClick={() => setSelectedMethod("bank_transfer")}
                />
              </div>

              {/* Phone Number Input */}
              {selectedMethod && selectedMethod !== "bank_transfer" && (
                <div className="mt-6 space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="0712 345 678"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Enter the phone number registered with{" "}
                    {PAYMENT_METHODS[selectedMethod]?.label || selectedMethod}
                  </p>
                </div>
              )}

              {selectedMethod === "bank_transfer" && (
                <div className="mt-6 rounded-lg bg-muted p-4">
                  <p className="text-sm font-medium mb-2">Bank Details</p>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>Bank: CRDB Bank</p>
                    <p>Account Name: Chakula Poa Ltd</p>
                    <p>Account Number: 0152XXXXXXXX</p>
                    <p>Reference: Your CPS Number</p>
                  </div>
                  <p className="text-xs text-amber-600 mt-3">
                    After transferring, send your payment receipt via WhatsApp to +255 XXX XXX XXX
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div>
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="text-lg">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Plan</span>
                <span className="font-medium">{plan.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Duration</span>
                <span>{plan.duration_days} days</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Meals per Day</span>
                <span>{plan.meals_per_day}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Meals</span>
                <span>{plan.duration_days * plan.meals_per_day}</span>
              </div>
              
              <Separator />

              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">{formatPrice(total)}</span>
              </div>

              {/* Security Badge */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Shield className="h-4 w-4" />
                <span>Secure payment powered by Selcom</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full h-12"
                size="lg"
                disabled={
                  !selectedMethod ||
                  (selectedMethod !== "bank_transfer" && !phoneNumber) ||
                  processing
                }
                onClick={handlePayment}
              >
                {processing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Pay {formatPrice(total)}
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
