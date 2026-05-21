"use client";

import { useAuth } from "@/lib/context/auth-context";
import { subscriptions } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  Share2,
  Smartphone,
  CheckCircle2,
  Copy,
  AlertCircle,
  CreditCard,
} from "lucide-react";
import { useState, useEffect } from "react";
import type { Subscription } from "@/lib/types";
import Link from "next/link";

export default function QRCodePage() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  // Generate daily code based on date and user ID (changes daily)
  // Format: CPS-XXXXXX where X is alphanumeric for easy reading
  const generateDailyCode = (userId: string, subscriptionId: string) => {
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const seed = `${userId}-${subscriptionId}-${today}`;
    
    // Create a hash-like number from the seed
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      const char = seed.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    // Convert to positive number and format as readable code
    const num = Math.abs(hash);
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed confusing chars like 0,O,1,I
    let code = "";
    let tempNum = num;
    for (let i = 0; i < 6; i++) {
      code += chars[tempNum % chars.length];
      tempNum = Math.floor(tempNum / chars.length);
    }
    
    return `CPS-${code}`;
  };

  // Get user's CPS number from their profile or generate daily code
  const getUserCPSNumber = () => {
    if (user?.cps_number) {
      return user.cps_number;
    }
    // Fallback: generate from user ID
    if (user?.id) {
      const prefix = user.id.slice(0, 6).toUpperCase().replace(/[^A-Z0-9]/g, "X");
      return `CPS-${prefix}`;
    }
    return null;
  };

  // Get today's CPS code (only for subscribed users)
  // The QR contains the user's CPS number which staff can verify
  const cpsCode = subscription && user 
    ? getUserCPSNumber() || generateDailyCode(user.id, subscription.id)
    : null;

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        // First check localStorage for test subscription
        const storedSubscription = localStorage.getItem("chakula_poa_active_subscription");
        if (storedSubscription) {
          const parsed = JSON.parse(storedSubscription);
          // Check if subscription is still active (not expired)
          if (new Date(parsed.end_date) > new Date() && parsed.status === "active") {
            setSubscription(parsed);
            setLoading(false);
            return;
          }
        }

        // Then try API
        const response = await subscriptions.getCurrent();
        if (response.data && response.data.status === "active") {
          setSubscription(response.data);
        } else {
          setSubscription(null);
        }
      } catch {
        // No subscription found
        setSubscription(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [user?.id]);

  // Generate QR code when CPS code changes
  useEffect(() => {
    if (cpsCode) {
      // Dynamic import to avoid SSR issues
      import("qrcode").then((QRCode) => {
        QRCode.toDataURL(cpsCode, {
          width: 280,
          margin: 2,
          color: {
            dark: "#000000",
            light: "#ffffff",
          },
          errorCorrectionLevel: "H",
        }).then(setQrDataUrl).catch(console.error);
      });
    }
  }, [cpsCode]);

  const handleCopy = () => {
    if (cpsCode) {
      navigator.clipboard.writeText(cpsCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    if (navigator.share && cpsCode) {
      try {
        await navigator.share({
          title: "My Chakula Poa Daily Code",
          text: `My today's meal code: ${cpsCode}`,
        });
      } catch {
        // User cancelled or error
      }
    }
  };

  const handleDownload = () => {
    if (qrDataUrl && cpsCode) {
      const link = document.createElement("a");
      link.href = qrDataUrl;
      link.download = `chakula-poa-qr-${cpsCode}.png`;
      link.click();
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // No active subscription - show prompt to subscribe
  if (!subscription || subscription.status !== "active") {
    return (
      <div className="p-4 lg:p-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl font-bold text-foreground sm:text-2xl lg:text-3xl">
            My QR Code
          </h1>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">
            Your daily meal verification code
          </p>
        </div>

        <div className="mx-auto max-w-md">
          <Card className="border-2 border-dashed border-amber-300 bg-amber-50/50">
            <CardContent className="flex flex-col items-center py-12 px-6">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
                <AlertCircle className="h-8 w-8 text-amber-600" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2 text-center">
                No Active Subscription
              </h2>
              <p className="text-sm text-muted-foreground text-center mb-6">
                You need an active meal subscription to get your daily QR code and CPS number.
              </p>
              <Button asChild className="w-full">
                <Link href="/dashboard/subscriptions">
                  <CreditCard className="mr-2 h-4 w-4" />
                  View Subscription Plans
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* What is CPS */}
          <Card className="mt-6 border-border/50">
            <CardHeader className="pb-2 sm:pb-4">
              <CardTitle className="text-base sm:text-lg">What is CPS?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                CPS (Chakula Poa System) is your unique daily verification code that:
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Changes every day for security</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Works both as QR code and number</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Only available with active subscription</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl font-bold text-foreground sm:text-2xl lg:text-3xl">
          My QR Code
        </h1>
        <p className="mt-1 text-sm text-muted-foreground sm:text-base">
          Show this at the canteen to collect your meals
        </p>
      </div>

      <div className="mx-auto max-w-md">
        {/* QR Code Card */}
        <Card className="overflow-hidden border-0 shadow-xl">
          <div className="bg-gradient-to-br from-primary to-primary/80 p-4 text-center sm:p-6">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 backdrop-blur-sm sm:mb-4 sm:px-4 sm:py-1.5">
              <CheckCircle2 className="h-3 w-3 text-primary-foreground sm:h-4 sm:w-4" />
              <span className="text-xs font-medium text-primary-foreground sm:text-sm">
                Active Subscriber
              </span>
            </div>
            <h2 className="mb-1 text-lg font-bold text-primary-foreground sm:text-xl">
              {user?.first_name && user?.last_name 
                ? `${user.first_name} ${user.last_name}` 
                : user?.full_name || user?.phone_number || "User"}
            </h2>
            <p className="text-xs text-primary-foreground/80 sm:text-sm">
              {subscription.plan_name || "Meal Plan"}
            </p>
          </div>

          <CardContent className="p-4 sm:p-6 lg:p-8">
            {/* Daily Badge */}
            <div className="mb-4 flex justify-center">
              <Badge variant="secondary" className="text-xs">
                Valid for today only - {new Date().toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </Badge>
            </div>

            {/* QR Code */}
            <div className="mb-4 flex aspect-square items-center justify-center rounded-2xl bg-white p-4 shadow-inner sm:mb-6 sm:p-6">
              <div className="text-center">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt={`QR Code: ${cpsCode}`}
                    className="mx-auto mb-3 sm:mb-4"
                    width={200}
                    height={200}
                  />
                ) : (
                  <div className="mx-auto mb-3 sm:mb-4 w-[200px] h-[200px] bg-muted rounded-lg flex items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  </div>
                )}
                <p className="text-xs text-muted-foreground">Scan to verify</p>
              </div>
            </div>

            {/* CPS Number - Same as QR code */}
            <div className="mb-4 rounded-xl bg-muted/50 p-3 text-center sm:mb-6 sm:p-4">
              <p className="mb-1 text-xs text-muted-foreground sm:text-sm">
                Your CPS Number
              </p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl font-bold tracking-wider text-primary sm:text-3xl font-mono">
                  {cpsCode}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Staff will scan this QR or enter this code to verify your subscription
              </p>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-10 bg-transparent sm:h-12"
                onClick={handleDownload}
              >
                <Download className="mr-2 h-4 w-4" />
                <span className="text-sm">Download</span>
              </Button>
              <Button
                variant="outline"
                className="h-10 bg-transparent sm:h-12"
                onClick={handleShare}
              >
                <Share2 className="mr-2 h-4 w-4" />
                <span className="text-sm">Share</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Info */}
        <Card className="mt-6 border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">
                  {subscription.plan_name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {subscription.meals_remaining} meals remaining
                </p>
              </div>
              <Badge variant={subscription.meals_remaining > 10 ? "default" : "destructive"}>
                {subscription.meals_remaining > 10 ? "Active" : "Low Balance"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="mt-6 border-border/50">
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="text-base sm:text-lg">How to Use</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3 sm:gap-4">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 sm:h-10 sm:w-10">
                <span className="text-xs font-bold text-primary sm:text-sm">
                  1
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground sm:text-base">
                  Go to the canteen
                </p>
                <p className="text-xs text-muted-foreground sm:text-sm">
                  Visit during your meal time (breakfast, lunch, or dinner)
                </p>
              </div>
            </div>
            <div className="flex gap-3 sm:gap-4">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 sm:h-10 sm:w-10">
                <span className="text-xs font-bold text-primary sm:text-sm">
                  2
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground sm:text-base">
                  Show your QR code or CPS number
                </p>
                <p className="text-xs text-muted-foreground sm:text-sm">
                  The staff will scan your code or enter your CPS number
                </p>
              </div>
            </div>
            <div className="flex gap-3 sm:gap-4">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 sm:h-10 sm:w-10">
                <span className="text-xs font-bold text-primary sm:text-sm">
                  3
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground sm:text-base">
                  Collect your meal
                </p>
                <p className="text-xs text-muted-foreground sm:text-sm">
                  {"Once verified, you'll receive your pre-selected meal"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Offline Access */}
        <Card className="mt-6 border-primary/20 bg-primary/5">
          <CardContent className="flex items-start gap-3 p-3 sm:p-4">
            <Smartphone className="mt-0.5 h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium text-foreground sm:text-base">
                No internet? No problem!
              </p>
              <p className="text-xs text-muted-foreground sm:text-sm">
                Just tell the staff your CPS number:{" "}
                <span className="font-semibold text-primary font-mono">
                  {cpsCode}
                </span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
