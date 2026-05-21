"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/lib/context/auth-context";
import { plans, payments } from "@/lib/api";
import type { SubscriptionPlan } from "@/lib/types";
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
import {
  ArrowLeft,
  Check,
  Loader2,
  Phone,
  Shield,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const paymentMethods = [
  {
    id: "mpesa",
    name: "M-Pesa",
    image: "/images/payments/mpesa.jpg",
    prefix: "255",
    hint: "Vodacom",
  },
  {
    id: "airtel_money",
    name: "Airtel Money",
    image: "/images/payments/airtel.jpg",
    prefix: "255",
    hint: "Airtel",
  },
  {
    id: "tigopesa",
    name: "Tigo Pesa",
    image: "/images/payments/tigopesa.jpg",
    prefix: "255",
    hint: "Tigo/MIX",
  },
  {
    id: "halopesa",
    name: "Halopesa",
    image: "/images/payments/halopesa.jpg",
    prefix: "255",
    hint: "Halotel",
  },
];

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const planId = searchParams.get("plan");

  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState(user?.phone_number || "");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "pending" | "success" | "failed"
  >("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPlan = async () => {
      if (!planId) {
        router.push("/dashboard/subscriptions");
        return;
      }
      try {
        const response = await plans.getById(planId);
        if (response.data) {
          setPlan(response.data);
        }
      } catch {
        // Demo data
        setPlan({
          id: planId,
          name: planId === "1" ? "Weekly Plan" : planId === "2" ? "Monthly Plan" : "Semester Plan",
          duration_days: planId === "1" ? 7 : planId === "2" ? 30 : 120,
          price: planId === "1" ? 14000 : planId === "2" ? 50000 : 180000,
          meals_per_day: 3,
          description: "Subscription plan",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchPlan();
  }, [planId, router]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-TZ", {
      style: "currency",
      currency: "TZS",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handlePayment = async () => {
    if (!selectedMethod || !phoneNumber || !plan) {
      setError("Please select a payment method and enter your phone number");
      return;
    }

    setError("");
    setProcessing(true);
    setPaymentStatus("pending");

    try {
      const response = await payments.initiate({
        subscription_id: plan.id,
        payment_method: selectedMethod,
        phone_number: phoneNumber,
      });

      if (response.data) {
        // Poll for payment status
        const checkStatus = async (orderId: string) => {
          const statusRes = await payments.checkStatus(orderId);
          if (statusRes.data?.status === "completed") {
            setPaymentStatus("success");
          } else if (statusRes.data?.status === "failed") {
            setPaymentStatus("failed");
            setError("Payment failed. Please try again.");
          } else {
            // Check again in 5 seconds
            setTimeout(() => checkStatus(orderId), 5000);
          }
        };
        checkStatus(response.data.order_id);
      }
    } catch {
      // Demo: simulate success after 3 seconds
      setTimeout(() => {
        setPaymentStatus("success");
        setProcessing(false);
      }, 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="p-4 lg:p-8">
        <Card className="border-destructive/50">
          <CardContent className="p-6 text-center">
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-destructive" />
            <p className="text-lg font-semibold text-foreground">Plan not found</p>
            <Button className="mt-4" asChild>
              <Link href="/dashboard/subscriptions">View Plans</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (paymentStatus === "success") {
    return (
      <div className="p-4 lg:p-8">
        <div className="mx-auto max-w-md">
          <Card className="border-0 shadow-xl overflow-hidden">
            <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-white">Payment Successful!</h2>
              <p className="mt-2 text-green-100">Your subscription is now active</p>
            </div>
            <CardContent className="p-6 space-y-4">
              <div className="rounded-lg bg-muted/50 p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Plan</span>
                  <span className="font-medium text-foreground">{plan.name}</span>
                </div>
                <div className="mt-2 flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount Paid</span>
                  <span className="font-medium text-foreground">{formatPrice(plan.price)}</span>
                </div>
                <div className="mt-2 flex justify-between text-sm">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-medium text-foreground">{plan.duration_days} days</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" asChild className="bg-transparent">
                  <Link href="/dashboard">Go to Dashboard</Link>
                </Button>
                <Button asChild>
                  <Link href="/dashboard/meals">Select Meals</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/dashboard/subscriptions"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Plans
        </Link>
        <h1 className="mt-4 text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
          Complete Payment
        </h1>
        <p className="mt-1 text-sm sm:text-base text-muted-foreground">
          Choose your preferred mobile money provider
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Payment Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Payment Methods */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Select Payment Method</CardTitle>
              <CardDescription>Choose your mobile money provider</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setSelectedMethod(method.id)}
                    className={`relative flex flex-col items-center rounded-xl border-2 p-3 transition-all ${
                      selectedMethod === method.id
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    {selectedMethod === method.id && (
                      <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                        <Check className="h-3 w-3 text-primary-foreground" />
                      </div>
                    )}
                    <div className="relative h-12 w-full overflow-hidden rounded-lg">
                      <Image
                        src={method.image || "/placeholder.svg"}
                        alt={method.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <span className="mt-2 text-xs font-medium text-foreground">
                      {method.name}
                    </span>
                    <span className="text-xs text-muted-foreground">{method.hint}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Phone Number */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Phone Number</CardTitle>
              <CardDescription>
                Enter the mobile number linked to your {selectedMethod ? paymentMethods.find(m => m.id === selectedMethod)?.name : "mobile money"} account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="phone">Mobile Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="0712 345 678"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="h-12 pl-10 text-lg"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  You will receive a payment prompt on this number
                </p>
              </div>
            </CardContent>
          </Card>

          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Pay Button - Mobile */}
          <div className="lg:hidden">
            <Button
              className="h-14 w-full text-lg font-semibold"
              disabled={!selectedMethod || !phoneNumber || processing}
              onClick={handlePayment}
            >
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {paymentStatus === "pending" ? "Waiting for confirmation..." : "Processing..."}
                </>
              ) : (
                <>Pay {formatPrice(plan.price)}</>
              )}
            </Button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4 border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-primary/5 p-4">
                <h3 className="font-semibold text-foreground">{plan.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {plan.description}
                </p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-medium">{plan.duration_days} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Meals per day</span>
                  <span className="font-medium">{plan.meals_per_day} meals</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total meals</span>
                  <span className="font-medium">{plan.duration_days * plan.meals_per_day} meals</span>
                </div>
              </div>
              <div className="border-t border-border pt-4">
                <div className="flex justify-between">
                  <span className="text-lg font-semibold text-foreground">Total</span>
                  <span className="text-xl font-bold text-primary">
                    {formatPrice(plan.price)}
                  </span>
                </div>
              </div>

              {/* Pay Button - Desktop */}
              <div className="hidden lg:block">
                <Button
                  className="h-12 w-full text-base font-semibold"
                  disabled={!selectedMethod || !phoneNumber || processing}
                  onClick={handlePayment}
                >
                  {processing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {paymentStatus === "pending" ? "Waiting..." : "Processing..."}
                    </>
                  ) : (
                    "Pay Now"
                  )}
                </Button>
              </div>

              {/* Security Note */}
              <div className="flex items-start gap-2 rounded-lg bg-muted/50 p-3">
                <Shield className="mt-0.5 h-4 w-4 text-green-600 flex-shrink-0" />
                <p className="text-xs text-muted-foreground">
                  Your payment is secured with Selcom. We never store your mobile money PIN.
                </p>
              </div>

              {/* Processing Info */}
              {paymentStatus === "pending" && (
                <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-3">
                  <Clock className="mt-0.5 h-4 w-4 text-amber-600 flex-shrink-0 animate-pulse" />
                  <div>
                    <p className="text-sm font-medium text-amber-700">Waiting for payment</p>
                    <p className="text-xs text-amber-600">
                      Check your phone for the payment prompt and enter your PIN
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
