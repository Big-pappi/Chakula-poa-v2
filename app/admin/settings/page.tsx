"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbLink, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Settings, Building2, Clock, Bell, Shield, Loader2, CheckCircle2, Save } from "lucide-react";
import { useAuth } from "@/lib/context/auth-context";

interface RestaurantSettings {
  name: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  meal_times: {
    breakfast: { start: string; end: string; enabled: boolean };
    lunch: { start: string; end: string; enabled: boolean };
    dinner: { start: string; end: string; enabled: boolean };
  };
  notifications: {
    new_subscription: boolean;
    low_stock_alert: boolean;
    daily_report: boolean;
    expiring_subscriptions: boolean;
  };
}

const defaultSettings: RestaurantSettings = {
  name: "",
  contact_email: "",
  contact_phone: "",
  address: "",
  meal_times: {
    breakfast: { start: "06:00", end: "10:00", enabled: true },
    lunch: { start: "12:00", end: "14:30", enabled: true },
    dinner: { start: "18:00", end: "21:00", enabled: true },
  },
  notifications: {
    new_subscription: true,
    low_stock_alert: true,
    daily_report: true,
    expiring_subscriptions: true,
  },
};

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<RestaurantSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    // Load saved settings from localStorage
    if (typeof window !== "undefined" && user?.restaurant_id) {
      const savedSettings = localStorage.getItem(`admin_settings_${user.restaurant_id}`);
      if (savedSettings) {
        try {
          setSettings({ ...defaultSettings, ...JSON.parse(savedSettings) });
        } catch (e) {
          // Use defaults
        }
      }
      // Load restaurant name from user context
      if (user.restaurant_name) {
        setSettings(prev => ({ ...prev, name: user.restaurant_name || "" }));
      }
    }
    setIsLoading(false);
  }, [user?.restaurant_id, user?.restaurant_name]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save to localStorage (in production, this would be an API call)
      if (typeof window !== "undefined" && user?.restaurant_id) {
        localStorage.setItem(`admin_settings_${user.restaurant_id}`, JSON.stringify(settings));
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("[v0] Failed to save settings:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const updateMealTime = (meal: "breakfast" | "lunch" | "dinner", field: string, value: string | boolean) => {
    setSettings({
      ...settings,
      meal_times: {
        ...settings.meal_times,
        [meal]: {
          ...settings.meal_times[meal],
          [field]: value,
        },
      },
    });
  };

  const updateNotification = (key: keyof RestaurantSettings["notifications"], value: boolean) => {
    setSettings({
      ...settings,
      notifications: {
        ...settings.notifications,
        [key]: value,
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

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
              <BreadcrumbPage>Settings</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <main className="flex-1 space-y-6 p-4 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
              <Settings className="h-6 w-6 sm:h-8 sm:w-8" />
              Restaurant Settings
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">Configure your restaurant&apos;s preferences</p>
          </div>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>

        {saveSuccess && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">Settings saved successfully!</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Restaurant Info */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base sm:text-lg">Restaurant Information</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Basic details about your restaurant</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Restaurant Name</Label>
                <Input
                  id="name"
                  value={settings.name}
                  onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                  placeholder="Enter restaurant name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_email">Contact Email</Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={settings.contact_email}
                  onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                  placeholder="contact@restaurant.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_phone">Contact Phone</Label>
                <Input
                  id="contact_phone"
                  value={settings.contact_phone}
                  onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
                  placeholder="+255 XXX XXX XXX"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={settings.address}
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                  placeholder="Enter restaurant address"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Meal Times */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base sm:text-lg">Meal Serving Times</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Configure when meals are served</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {(["breakfast", "lunch", "dinner"] as const).map((meal) => (
                <div key={meal} className="space-y-3 rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium capitalize">{meal}</Label>
                    <Switch
                      checked={settings.meal_times[meal].enabled}
                      onCheckedChange={(checked) => updateMealTime(meal, "enabled", checked)}
                    />
                  </div>
                  {settings.meal_times[meal].enabled && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Start Time</Label>
                        <Input
                          type="time"
                          value={settings.meal_times[meal].start}
                          onChange={(e) => updateMealTime(meal, "start", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">End Time</Label>
                        <Input
                          type="time"
                          value={settings.meal_times[meal].end}
                          onChange={(e) => updateMealTime(meal, "end", e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Bell className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base sm:text-lg">Admin Notifications</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Configure what alerts you receive</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">New Subscriptions</Label>
                    <p className="text-xs text-muted-foreground">Get notified when customers subscribe</p>
                  </div>
                  <Switch
                    checked={settings.notifications.new_subscription}
                    onCheckedChange={(checked) => updateNotification("new_subscription", checked)}
                  />
                </div>
                <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Low Stock Alert</Label>
                    <p className="text-xs text-muted-foreground">Alert when meal capacity is low</p>
                  </div>
                  <Switch
                    checked={settings.notifications.low_stock_alert}
                    onCheckedChange={(checked) => updateNotification("low_stock_alert", checked)}
                  />
                </div>
                <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Daily Report</Label>
                    <p className="text-xs text-muted-foreground">Receive daily summary report</p>
                  </div>
                  <Switch
                    checked={settings.notifications.daily_report}
                    onCheckedChange={(checked) => updateNotification("daily_report", checked)}
                  />
                </div>
                <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Expiring Subscriptions</Label>
                    <p className="text-xs text-muted-foreground">Alert for subscriptions about to expire</p>
                  </div>
                  <Switch
                    checked={settings.notifications.expiring_subscriptions}
                    onCheckedChange={(checked) => updateNotification("expiring_subscriptions", checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
