"use client";

import { useState } from "react";
import { useAuth } from "@/lib/context/auth-context";
import { auth } from "@/lib/api";
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
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Lock,
  Bell,
  Smartphone,
  Shield,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [passwordData, setPasswordData] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [notifications, setNotifications] = useState({
    sms_reminders: true,
    meal_confirmations: true,
    subscription_alerts: true,
    promotional: false,
  });

  const handleChangePassword = async () => {
    setError("");

    if (passwordData.new_password !== passwordData.confirm_password) {
      setError("New passwords do not match");
      return;
    }

    if (passwordData.new_password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setSaving(true);
    try {
      await auth.changePassword(
        passwordData.old_password,
        passwordData.new_password
      );
      setSuccess(true);
      setPasswordData({
        old_password: "",
        new_password: "",
        confirm_password: "",
      });
      setTimeout(() => {
        setShowPasswordDialog(false);
        setSuccess(false);
      }, 2000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to change password"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
          Settings
        </h1>
        <p className="mt-1 text-sm sm:text-base text-muted-foreground">
          Manage your account preferences and security
        </p>
      </div>

      <div className="mx-auto max-w-2xl space-y-6">
        {/* Notification Settings */}
        <Card className="border-border/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base sm:text-lg">
                  Notifications
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Manage how you receive updates
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <Label className="text-sm sm:text-base font-medium">
                  SMS Meal Reminders
                </Label>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Get reminded to select your meals before deadline
                </p>
              </div>
              <Switch
                checked={notifications.sms_reminders}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, sms_reminders: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <Label className="text-sm sm:text-base font-medium">
                  Meal Confirmations
                </Label>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Receive SMS when your meal selection is confirmed
                </p>
              </div>
              <Switch
                checked={notifications.meal_confirmations}
                onCheckedChange={(checked) =>
                  setNotifications({
                    ...notifications,
                    meal_confirmations: checked,
                  })
                }
              />
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <Label className="text-sm sm:text-base font-medium">
                  Subscription Alerts
                </Label>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Get notified when your subscription is about to expire
                </p>
              </div>
              <Switch
                checked={notifications.subscription_alerts}
                onCheckedChange={(checked) =>
                  setNotifications({
                    ...notifications,
                    subscription_alerts: checked,
                  })
                }
              />
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <Label className="text-sm sm:text-base font-medium">
                  Promotional Messages
                </Label>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Receive news about special offers and promotions
                </p>
              </div>
              <Switch
                checked={notifications.promotional}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, promotional: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="border-border/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base sm:text-lg">Security</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Keep your account secure
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-3 rounded-lg bg-muted/50 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
              <div className="flex items-center gap-3">
                <Lock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm sm:text-base font-medium text-foreground">
                    Password
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Last changed 30 days ago
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPasswordDialog(true)}
                className="bg-transparent"
              >
                Change
              </Button>
            </div>
            <div className="flex flex-col gap-3 rounded-lg bg-muted/50 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
              <div className="flex items-center gap-3">
                <Smartphone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm sm:text-base font-medium text-foreground">
                    Phone Number
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {user?.phone_number || "Not set"}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled
                className="bg-transparent"
              >
                Verified
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* USSD Access */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <Smartphone className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <div>
                <h3 className="mb-1 text-sm sm:text-base font-semibold text-foreground">
                  USSD Access
                </h3>
                <p className="mb-3 text-xs sm:text-sm text-muted-foreground">
                  Access your account from any phone by dialing our USSD code
                </p>
                <div className="inline-flex items-center gap-2 rounded-lg bg-background px-3 py-1.5 sm:px-4 sm:py-2">
                  <span className="text-xl sm:text-2xl font-bold text-primary">
                    *148*93#
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <CardTitle className="text-base sm:text-lg text-destructive">
                  Danger Zone
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Irreversible actions
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3 rounded-lg border border-destructive/20 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
              <div>
                <p className="text-sm sm:text-base font-medium text-foreground">
                  Delete Account
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Permanently delete your account and all data
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
                className="w-full sm:w-auto"
              >
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Change Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="mx-4 sm:mx-0 sm:max-w-md">
          {success ? (
            <div className="py-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <DialogTitle className="mb-2 text-xl">
                Password Changed!
              </DialogTitle>
              <DialogDescription>
                Your password has been updated successfully.
              </DialogDescription>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Change Password</DialogTitle>
                <DialogDescription>
                  Enter your current password and choose a new one
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {error && (
                  <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    {error}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="old_password">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="old_password"
                      type={showOldPassword ? "text" : "password"}
                      value={passwordData.old_password}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          old_password: e.target.value,
                        })
                      }
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      {showOldPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new_password">New Password</Label>
                  <div className="relative">
                    <Input
                      id="new_password"
                      type={showNewPassword ? "text" : "password"}
                      value={passwordData.new_password}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          new_password: e.target.value,
                        })
                      }
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm_password">Confirm New Password</Label>
                  <Input
                    id="confirm_password"
                    type="password"
                    value={passwordData.confirm_password}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirm_password: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <DialogFooter className="flex-col gap-2 sm:flex-row">
                <Button
                  variant="outline"
                  onClick={() => setShowPasswordDialog(false)}
                  className="w-full bg-transparent sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleChangePassword}
                  disabled={saving}
                  className="w-full sm:w-auto"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Change Password"
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="mx-4 sm:mx-0 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive">
              Delete Account
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete your account? This action cannot
              be undone and all your data will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              className="w-full bg-transparent sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => logout()}
              className="w-full sm:w-auto"
            >
              Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
