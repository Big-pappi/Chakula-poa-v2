"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Settings, CreditCard, Bell, Shield, Database, Globe, Save, TrendingUp,
  Loader2, CheckCircle2, AlertTriangle, RefreshCw
} from "lucide-react";
import { superAdmin } from "@/lib/api/endpoints";

interface SystemSettings {
  system_name: string;
  support_email: string;
  default_currency: string;
  timezone: string;
  maintenance_mode: boolean;
  platform_fee_percentage: number;
  payment_enabled: boolean;
  mpesa_enabled: boolean;
  airtel_money_enabled: boolean;
  tigopesa_enabled: boolean;
  halopesa_enabled: boolean;
  mix_by_yas_enabled: boolean;
  bank_transfer_enabled: boolean;
  ussd_code: string;
  session_timeout: number;
  email_notifications: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
  admin_alerts: boolean;
  subscription_reminders: boolean;
  two_factor_auth: boolean;
  password_policy: string;
  api_rate_limit: number;
  api_documentation_public: boolean;
}

const defaultSettings: SystemSettings = {
  system_name: "Chakula Poa",
  support_email: "support@chakulapoa.co.tz",
  default_currency: "TZS",
  timezone: "EAT",
  maintenance_mode: false,
  platform_fee_percentage: 10,
  payment_enabled: true,
  mpesa_enabled: true,
  airtel_money_enabled: true,
  tigopesa_enabled: true,
  halopesa_enabled: true,
  mix_by_yas_enabled: false,
  bank_transfer_enabled: true,
  ussd_code: "*148*93#",
  session_timeout: 30,
  email_notifications: true,
  sms_notifications: true,
  push_notifications: true,
  admin_alerts: true,
  subscription_reminders: true,
  two_factor_auth: true,
  password_policy: "strong",
  api_rate_limit: 100,
  api_documentation_public: true,
};

export default function SuperAdminSystemPage() {
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings);
  const [originalSettings, setOriginalSettings] = useState<SystemSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    // Check if settings have changed
    const changed = JSON.stringify(settings) !== JSON.stringify(originalSettings);
    setHasChanges(changed);
  }, [settings, originalSettings]);

  const fetchSettings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch settings from Django backend API
      const response = await superAdmin.getSystemSettings();
      if (response.data) {
        // Merge with defaults for any missing settings
        const mergedSettings = { ...defaultSettings, ...response.data };
        setSettings(mergedSettings);
        setOriginalSettings(mergedSettings);
      } else {
        // Use defaults if API fails
        setSettings(defaultSettings);
        setOriginalSettings(defaultSettings);
      }
    } catch (err) {
      console.error("Failed to fetch settings:", err);
      setSettings(defaultSettings);
      setOriginalSettings(defaultSettings);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (settingKey: string, value: unknown) => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Save to Django backend API
      const response = await superAdmin.updateSystemSetting(settingKey, value);
      
      if (response.data || !response.error) {
        setOriginalSettings({ ...settings });
        setSuccess("Settings saved successfully!");
        // Dispatch event for other components to know settings changed
        window.dispatchEvent(new CustomEvent("system-settings-change", { detail: { key: settingKey, value } }));
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError("Failed to save settings. Please try again.");
      }
    } catch (err) {
      setError("Failed to save settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const saveAllSettings = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // Save all settings to Django backend API
      const updates = Object.entries(settings).map(([key, value]) =>
        superAdmin.updateSystemSetting(key, value)
      );
      
      await Promise.all(updates);
      setOriginalSettings({ ...settings });
      setSuccess("All settings saved successfully!");
      // Dispatch event for other components
      window.dispatchEvent(new CustomEvent("system-settings-change", { detail: settings }));
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError("Failed to save some settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const updateSetting = <K extends keyof SystemSettings>(key: K, value: SystemSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground flex items-center gap-2">
          <Settings className="h-6 w-6 sm:h-8 sm:w-8" />
          System Configuration
        </h1>
        <p className="mt-1 text-sm sm:text-base text-muted-foreground">
          Manage system-wide settings and configurations
        </p>
      </div>

      {/* Save Bar */}
      {hasChanges && (
        <div className="sticky top-0 z-10 mb-6 flex items-center justify-between rounded-lg bg-primary/10 p-4 border border-primary/20">
          <p className="text-sm font-medium">You have unsaved changes</p>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setSettings(originalSettings)}
              disabled={isSaving}
            >
              Discard
            </Button>
            <Button size="sm" onClick={saveAllSettings} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save All Changes
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Success/Error Messages */}
      {success && (
        <Alert className="mb-6 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-700 dark:text-green-300">{success}</AlertDescription>
        </Alert>
      )}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="w-full overflow-x-auto flex justify-start h-auto p-1 bg-muted/50">
          <TabsTrigger value="general" className="text-xs sm:text-sm px-3 py-2">
            <Globe className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">General</span>
          </TabsTrigger>
          <TabsTrigger value="payment" className="text-xs sm:text-sm px-3 py-2">
            <CreditCard className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Payment</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="text-xs sm:text-sm px-3 py-2">
            <Bell className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="text-xs sm:text-sm px-3 py-2">
            <Shield className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="api" className="text-xs sm:text-sm px-3 py-2">
            <Database className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">API</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card className="border-border/50">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Globe className="h-5 w-5" />
                General Settings
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Configure basic system settings that affect the entire platform
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-sm">System Name</Label>
                  <Input 
                    value={settings.system_name}
                    onChange={(e) => updateSetting("system_name", e.target.value)}
                    placeholder="Chakula Poa"
                  />
                  <p className="text-xs text-muted-foreground">
                    This name appears in the header and emails
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Support Email</Label>
                  <Input 
                    value={settings.support_email}
                    onChange={(e) => updateSetting("support_email", e.target.value)}
                    placeholder="support@chakulapoa.co.tz"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Default Currency</Label>
                  <Select 
                    value={settings.default_currency}
                    onValueChange={(value) => updateSetting("default_currency", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TZS">TZS - Tanzanian Shilling</SelectItem>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="KES">KES - Kenyan Shilling</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Timezone</Label>
                  <Select 
                    value={settings.timezone}
                    onValueChange={(value) => updateSetting("timezone", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EAT">East Africa Time (EAT)</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="CAT">Central Africa Time (CAT)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-lg border p-4">
                <div>
                  <Label className="text-sm">Maintenance Mode</Label>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Disable access for all users except super admins
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {settings.maintenance_mode && (
                    <Badge variant="destructive">Active</Badge>
                  )}
                  <Switch 
                    checked={settings.maintenance_mode}
                    onCheckedChange={(checked) => updateSetting("maintenance_mode", checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="space-y-6">
          {/* Payment Master Switch */}
          <Card className="border-border/50 border-primary/30">
            <CardHeader className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <CreditCard className="h-5 w-5" />
                    Payment System
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Enable or disable the entire payment system
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={settings.payment_enabled ? "default" : "secondary"}>
                    {settings.payment_enabled ? "Enabled" : "Disabled"}
                  </Badge>
                  <Switch 
                    checked={settings.payment_enabled}
                    onCheckedChange={(checked) => updateSetting("payment_enabled", checked)}
                  />
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Platform Fee Configuration */}
          <Card className="border-border/50">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <TrendingUp className="h-5 w-5" />
                Platform Fee Settings
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Configure the platform fee deducted from each payment
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 space-y-6">
              <div className="rounded-lg bg-muted p-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Platform Fee Percentage</Label>
                    <div className="flex items-center gap-2">
                      <Input 
                        type="number" 
                        min="0" 
                        max="50" 
                        step="0.5" 
                        value={settings.platform_fee_percentage}
                        onChange={(e) => updateSetting("platform_fee_percentage", parseFloat(e.target.value) || 0)}
                        className="w-24" 
                      />
                      <span className="text-sm text-muted-foreground">%</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      This percentage will be deducted from each payment. The remainder goes to the restaurant.
                    </p>
                  </div>
                  <Separator />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-sm font-medium">Example Calculation</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        User pays: TSh 50,000<br />
                        Platform fee ({settings.platform_fee_percentage}%): TSh {(50000 * settings.platform_fee_percentage / 100).toLocaleString()}<br />
                        Restaurant receives: TSh {(50000 - (50000 * settings.platform_fee_percentage / 100)).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Payout Schedule</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Restaurants receive payouts automatically after successful payment verification.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <CreditCard className="h-5 w-5" />
                Payment Gateway Settings
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Configure payment providers and settings
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 space-y-6">
              <div className="space-y-4">
                {[
                  { key: "mpesa_enabled" as const, name: "M-Pesa", desc: "Vodacom M-Pesa Integration", color: "red" },
                  { key: "airtel_money_enabled" as const, name: "Airtel Money", desc: "Airtel Money Integration", color: "red" },
                  { key: "halopesa_enabled" as const, name: "Halopesa", desc: "Halopesa Integration", color: "blue" },
                  { key: "tigopesa_enabled" as const, name: "Tigo Pesa", desc: "Tigo Pesa Integration", color: "blue" },
                  { key: "mix_by_yas_enabled" as const, name: "Mix by Yas", desc: "Mix by Yas Integration", color: "yellow" },
                  { key: "bank_transfer_enabled" as const, name: "Bank Transfer", desc: "Direct Bank Transfer", color: "green" },
                ].map((provider) => (
                  <div key={provider.name} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border p-4">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className={`rounded-lg bg-${provider.color}-100 dark:bg-${provider.color}-900 p-2`}>
                        <CreditCard className={`h-5 w-5 text-${provider.color}-600 dark:text-${provider.color}-400`} />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{provider.name}</p>
                        <p className="text-xs text-muted-foreground">{provider.desc}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-2">
                      <Badge variant={settings[provider.key] ? "default" : "secondary"} className="text-xs">
                        {settings[provider.key] ? "Active" : "Inactive"}
                      </Badge>
                      <Switch 
                        checked={settings[provider.key]}
                        onCheckedChange={(checked) => updateSetting(provider.key, checked)}
                        disabled={!settings.payment_enabled}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="space-y-4">
                <h4 className="font-medium text-sm">USSD Configuration</h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-sm">USSD Code</Label>
                    <Input 
                      value={settings.ussd_code}
                      onChange={(e) => updateSetting("ussd_code", e.target.value)}
                      placeholder="*148*93#"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Session Timeout (seconds)</Label>
                    <Input 
                      type="number" 
                      value={settings.session_timeout}
                      onChange={(e) => updateSetting("session_timeout", parseInt(e.target.value) || 30)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card className="border-border/50">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Bell className="h-5 w-5" />
                Notification Settings
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Configure system notifications and alerts
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
              {[
                { key: "email_notifications" as const, label: "Email Notifications", desc: "Send email notifications for important events" },
                { key: "sms_notifications" as const, label: "SMS Notifications", desc: "Send SMS alerts for payments and subscriptions" },
                { key: "push_notifications" as const, label: "Push Notifications", desc: "Send push notifications to mobile apps" },
                { key: "admin_alerts" as const, label: "Admin Alerts", desc: "Alert admins for system issues" },
                { key: "subscription_reminders" as const, label: "Subscription Reminders", desc: "Remind customers before subscription expires" },
              ].map((item) => (
                <div key={item.key} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-lg border p-4">
                  <div>
                    <Label className="text-sm">{item.label}</Label>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch 
                    checked={settings[item.key]}
                    onCheckedChange={(checked) => updateSetting(item.key, checked)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card className="border-border/50">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Configure security policies
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-lg border p-4">
                <div>
                  <Label className="text-sm">Two-Factor Authentication</Label>
                  <p className="text-xs text-muted-foreground">Require 2FA for all admin accounts</p>
                </div>
                <Switch 
                  checked={settings.two_factor_auth}
                  onCheckedChange={(checked) => updateSetting("two_factor_auth", checked)}
                />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-lg border p-4">
                <div>
                  <Label className="text-sm">Session Timeout</Label>
                  <p className="text-xs text-muted-foreground">Auto logout after inactivity</p>
                </div>
                <Select 
                  value={settings.session_timeout.toString()}
                  onValueChange={(value) => updateSetting("session_timeout", parseInt(value))}
                >
                  <SelectTrigger className="w-full sm:w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-lg border p-4">
                <div>
                  <Label className="text-sm">Password Policy</Label>
                  <p className="text-xs text-muted-foreground">Minimum password requirements</p>
                </div>
                <Select 
                  value={settings.password_policy}
                  onValueChange={(value) => updateSetting("password_policy", value)}
                >
                  <SelectTrigger className="w-full sm:w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="strong">Strong</SelectItem>
                    <SelectItem value="very-strong">Very Strong</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-6">
          <Card className="border-border/50">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Database className="h-5 w-5" />
                API Configuration
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Manage API keys and endpoints
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
              <div className="space-y-2">
                <Label className="text-sm">API Base URL</Label>
                <Input 
                  value={process.env.NEXT_PUBLIC_API_URL || "https://api.chakulapoa.co.tz/v1"} 
                  readOnly 
                  className="text-xs sm:text-sm bg-muted" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Rate Limit (requests/minute)</Label>
                <Input 
                  type="number" 
                  value={settings.api_rate_limit}
                  onChange={(e) => updateSetting("api_rate_limit", parseInt(e.target.value) || 100)}
                />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-lg border p-4">
                <div>
                  <Label className="text-sm">API Documentation</Label>
                  <p className="text-xs text-muted-foreground">Public API documentation access</p>
                </div>
                <Switch 
                  checked={settings.api_documentation_public}
                  onCheckedChange={(checked) => updateSetting("api_documentation_public", checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
