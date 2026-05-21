"use client";

import { useState, useEffect, Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Scan, Users, UtensilsCrossed, CheckCircle2, XCircle, Clock, Search, QrCode, Hash, Loader2, AlertTriangle, Calendar, Leaf } from "lucide-react";
import { staffAPI } from "@/lib/api/api";
import { useAuth } from "@/lib/context/auth-context";
import type { User, Subscription } from "@/lib/api/api";

interface VerificationResult {
  valid: boolean;
  user?: User;
  subscription?: Subscription;
  current_meal_type?: string;
  meal_window?: string;
  message?: string;
  todays_order?: {
    id: string;
    status: string;
  };
}

interface StaffStats {
  served_today: number;
  pending_today: number;
  my_served_today: number;
}

export default function StaffDashboard() {
  const { user } = useAuth();
  const [cpsNumber, setCpsNumber] = useState("");
  const [searchResult, setSearchResult] = useState<VerificationResult | null>(null);
  const [showServeDialog, setShowServeDialog] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isServing, setIsServing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<StaffStats>({ served_today: 0, pending_today: 0, my_served_today: 0 });
  const [recentServes, setRecentServes] = useState<any[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // Fetch stats and recent activity on mount
  useEffect(() => {
    fetchStats();
    fetchRecentActivity();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await staffAPI.getStats();
      setStats(response);
    } catch (err) {
      console.error("[v0] Failed to fetch stats:", err);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const response = await staffAPI.getTodayOrders();
      setRecentServes(response.slice(0, 5));
    } catch (err) {
      console.error("[v0] Failed to fetch recent activity:", err);
    }
  };

  const handleSearch = async () => {
    if (!cpsNumber.trim()) {
      setError("Please enter a CPS number or daily code");
      return;
    }

    setIsSearching(true);
    setError(null);
    setSearchResult(null);

    try {
      const response = await staffAPI.verify(cpsNumber.trim());
      setSearchResult(response);
      
      if (!response.valid) {
        setError(response.message || "Invalid code or user not found");
      }
    } catch (err: any) {
      console.error("[v0] Verification failed:", err);
      setError(err.message || "Failed to verify user. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleServeMeal = async () => {
    if (!searchResult?.valid || !searchResult.user) return;

    setIsServing(true);
    setError(null);

    try {
      await staffAPI.serve({ cps_code: cpsNumber.trim() });
      
      // Reset and refresh
      setShowServeDialog(false);
      setSearchResult(null);
      setCpsNumber("");
      
      // Refresh stats and recent activity
      fetchStats();
      fetchRecentActivity();
    } catch (err: any) {
      console.error("[v0] Serve failed:", err);
      setError(err.message || "Failed to serve meal. Please try again.");
    } finally {
      setIsServing(false);
    }
  };

  const statsCards = [
    { title: "Total Served Today", value: stats.served_today.toString(), icon: UtensilsCrossed, color: "text-primary" },
    { title: "My Served Today", value: stats.my_served_today.toString(), icon: CheckCircle2, color: "text-green-600" },
    { title: "Pending Queue", value: stats.pending_today.toString(), icon: Clock, color: "text-amber-600" },
  ];

  const getMealTypeLabel = (mealType?: string) => {
    switch (mealType) {
      case "tea": return "Morning Tea";
      case "lunch": return "Lunch";
      case "evening": return "Evening";
      default: return mealType || "Unknown";
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
              <BreadcrumbPage>Staff Dashboard</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <main className="flex-1 space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome, {user?.full_name || "Staff Member"}</h1>
          <p className="text-muted-foreground">Verify users and serve meals efficiently</p>
        </div>

        {/* Current Meal Window Alert */}
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertTitle>Meal Service Windows</AlertTitle>
          <AlertDescription className="flex flex-wrap gap-4 mt-2">
            <span className="inline-flex items-center gap-1.5 text-sm">
              <Badge variant="outline">Morning Tea</Badge> 6:00 AM - 10:00 AM
            </span>
            <span className="inline-flex items-center gap-1.5 text-sm">
              <Badge variant="outline">Lunch</Badge> 11:30 AM - 2:30 PM
            </span>
            <span className="inline-flex items-center gap-1.5 text-sm">
              <Badge variant="outline">Evening</Badge> 5:00 PM - 8:00 PM
            </span>
          </AlertDescription>
        </Alert>

        <div className="grid gap-4 md:grid-cols-3">
          {statsCards.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {isLoadingStats ? <Loader2 className="h-6 w-6 animate-spin" /> : stat.value}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scan className="h-5 w-5" />
                Verify User
              </CardTitle>
              <CardDescription>
                Enter CPS number or daily code to verify user. Scanning is time-restricted.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Hash className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Enter CPS Number (e.g., CPS#A1B2)"
                    value={cpsNumber}
                    onChange={(e) => setCpsNumber(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="pl-9"
                  />
                </div>
                <Button onClick={handleSearch} disabled={isSearching}>
                  {isSearching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Verify
                    </>
                  )}
                </Button>
              </div>

              <div className="flex items-center gap-4">
                <Separator className="flex-1" />
                <span className="text-sm text-muted-foreground">or</span>
                <Separator className="flex-1" />
              </div>

              <Button variant="outline" className="w-full bg-transparent">
                <QrCode className="mr-2 h-4 w-4" />
                Scan QR Code
              </Button>

              {searchResult && (
                <Card className={searchResult.valid ? "border-green-500" : "border-destructive"}>
                  <CardContent className="pt-6">
                    {searchResult.valid && searchResult.user ? (
                      <>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16">
                              <AvatarFallback className="bg-primary/10 text-primary text-xl">
                                {searchResult.user.full_name?.split(" ").map((n) => n[0]).join("") || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="text-lg font-semibold">{searchResult.user.full_name}</h3>
                              <p className="text-sm text-muted-foreground font-mono">{searchResult.user.cps_number}</p>
                              <div className="mt-1 flex flex-wrap items-center gap-2">
                                {searchResult.subscription && (
                                  <Badge variant="secondary">{searchResult.subscription.plan?.name}</Badge>
                                )}
                                <Badge className="bg-green-100 text-green-800">Active</Badge>
                                {searchResult.current_meal_type && (
                                  <Badge variant="outline">{getMealTypeLabel(searchResult.current_meal_type)}</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Days Left</p>
                            <p className={`text-2xl font-bold ${
                              searchResult.subscription?.days_left && searchResult.subscription.days_left <= 3 
                                ? "text-destructive" 
                                : "text-primary"
                            }`}>
                              {searchResult.subscription?.days_left || 0}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {searchResult.subscription?.remaining_meals || 0} meals left
                            </p>
                          </div>
                        </div>
                        
                        {/* Dietary Plan Alert */}
                        {searchResult.subscription?.dietary_plan && (
                          <Alert className="mt-4 border-amber-200 bg-amber-50">
                            <Leaf className="h-4 w-4 text-amber-600" />
                            <AlertTitle className="text-amber-800">Special Dietary Requirements</AlertTitle>
                            <AlertDescription className="text-amber-700">
                              <strong>{searchResult.subscription.dietary_plan.name}</strong>
                              {searchResult.subscription.dietary_plan.foods_to_avoid && (
                                <p className="text-sm mt-1">
                                  <span className="font-medium">Avoid:</span> {searchResult.subscription.dietary_plan.foods_to_avoid}
                                </p>
                              )}
                            </AlertDescription>
                          </Alert>
                        )}
                        
                        {/* Warning if subscription ending soon */}
                        {searchResult.subscription?.days_left && searchResult.subscription.days_left <= 3 && (
                          <Alert className="mt-4" variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                              Subscription ending in {searchResult.subscription.days_left} day(s). Remind user to renew.
                            </AlertDescription>
                          </Alert>
                        )}

                        <Button 
                          className="mt-4 w-full" 
                          onClick={() => setShowServeDialog(true)}
                          disabled={searchResult.todays_order?.status === "served"}
                        >
                          {searchResult.todays_order?.status === "served" ? (
                            <>
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Already Served for {getMealTypeLabel(searchResult.current_meal_type)}
                            </>
                          ) : (
                            <>
                              <UtensilsCrossed className="mr-2 h-4 w-4" />
                              Serve {getMealTypeLabel(searchResult.current_meal_type)}
                            </>
                          )}
                        </Button>
                      </>
                    ) : (
                      <div className="flex items-center gap-4 text-destructive">
                        <XCircle className="h-12 w-12" />
                        <div>
                          <h3 className="text-lg font-semibold">Cannot Serve</h3>
                          <p className="text-sm">{searchResult.message}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>Latest meal serving activity</CardDescription>
            </CardHeader>
            <CardContent>
              {recentServes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <UtensilsCrossed className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No meals served today yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentServes.map((serve) => (
                    <div key={serve.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {serve.user?.full_name?.split(" ").map((n: string) => n[0]).join("") || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{serve.user?.full_name || "Unknown"}</p>
                          <p className="text-sm text-muted-foreground font-mono">{serve.user?.cps_number || "-"}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={serve.status === "served" ? "default" : "secondary"}>
                          {getMealTypeLabel(serve.meal_type)}
                        </Badge>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {serve.served_at ? new Date(serve.served_at).toLocaleTimeString() : "-"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Dialog open={showServeDialog} onOpenChange={setShowServeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Meal Service</DialogTitle>
            <DialogDescription>
              You are about to serve <strong>{getMealTypeLabel(searchResult?.current_meal_type)}</strong> to{" "}
              <strong>{searchResult?.user?.full_name}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {searchResult?.subscription?.dietary_plan && (
              <Alert className="border-amber-200 bg-amber-50">
                <Leaf className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-700">
                  <strong>Dietary Plan:</strong> {searchResult.subscription.dietary_plan.name}
                </AlertDescription>
              </Alert>
            )}
            
            <div className="rounded-lg bg-muted p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">User:</span>
                <span className="font-medium">{searchResult?.user?.full_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">CPS:</span>
                <span className="font-mono">{searchResult?.user?.cps_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Meal:</span>
                <span className="font-medium">{getMealTypeLabel(searchResult?.current_meal_type)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Days Left:</span>
                <span className={`font-medium ${
                  searchResult?.subscription?.days_left && searchResult.subscription.days_left <= 3 
                    ? "text-destructive" 
                    : ""
                }`}>
                  {searchResult?.subscription?.days_left || 0} days
                </span>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button onClick={handleServeMeal} className="w-full" disabled={isServing}>
              {isServing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Serving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Confirm & Serve
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
