"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/context/auth-context";
import { auth, subscriptions } from "@/lib/api";
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
import {
  User,
  Phone,
  Mail,
  GraduationCap,
  Building2,
  Calendar,
  Edit2,
  Save,
  X,
  Loader2,
  CheckCircle2,
  QrCode,
} from "lucide-react";
import type { Subscription } from "@/lib/types";

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [activeSubscription, setActiveSubscription] = useState<Subscription | null>(null);
  const [formData, setFormData] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    email: user?.email || "",
    phone_number: user?.phone_number || "",
  });

  // Check for active subscription
  useEffect(() => {
    const checkSubscription = async () => {
      // Check localStorage first (for test subscriptions)
      const storedSub = localStorage.getItem("chakula_poa_active_subscription");
      if (storedSub) {
        const parsed = JSON.parse(storedSub);
        if (new Date(parsed.end_date) > new Date() && parsed.status === "active") {
          setActiveSubscription(parsed);
          return;
        }
      }
      // Then check API
      try {
        const response = await subscriptions.getCurrent();
        if (response.data && response.data.status === "active") {
          setActiveSubscription(response.data);
        }
      } catch {
        // No subscription
      }
    };
    checkSubscription();
  }, []);

  // Helper to get display name
  const getDisplayName = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    if (user?.full_name) {
      return user.full_name;
    }
    if (user?.phone_number) {
      return user.phone_number;
    }
    return "User";
  };

  // Helper to get avatar initial
  const getAvatarInitial = () => {
    if (user?.first_name) return user.first_name.charAt(0).toUpperCase();
    if (user?.full_name) return user.full_name.charAt(0).toUpperCase();
    if (user?.phone_number) return user.phone_number.slice(-2);
    return "U";
  };

  // Helper to get CPS number (only if subscribed)
  const getCPSNumber = () => {
    if (!activeSubscription) return null;
    if (user?.cps_number) return user.cps_number;
    if (user?.id) {
      const prefix = user.id.slice(0, 6).toUpperCase().replace(/[^A-Z0-9]/g, "X");
      return `CPS-${prefix}`;
    }
    return null;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await auth.updateProfile(formData);
      await refreshUser();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      setIsEditing(false);
    } catch {
      // Handle error
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
      email: user?.email || "",
      phone_number: user?.phone_number || "",
    });
    setIsEditing(false);
  };

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
          My Profile
        </h1>
        <p className="mt-1 text-sm sm:text-base text-muted-foreground">
          View and manage your account information
        </p>
      </div>

      <div className="mx-auto max-w-2xl space-y-6">
        {/* Success Message */}
        {success && (
          <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-3 sm:p-4">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <p className="text-sm sm:text-base text-green-700">
              Profile updated successfully!
            </p>
          </div>
        )}

        {/* Profile Card */}
        <Card className="overflow-hidden border-border/50">
          {/* Cover & Avatar */}
          <div className="h-24 sm:h-32 bg-gradient-to-r from-primary to-primary/70" />
          <div className="relative px-4 pb-4 sm:px-6 sm:pb-6">
            <div className="absolute -top-10 left-4 sm:-top-12 sm:left-6">
              <div className="flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-2xl border-4 border-background bg-background shadow-lg">
                <span className="text-3xl sm:text-4xl font-bold text-primary">
                  {getAvatarInitial()}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-2 pt-12 sm:flex-row sm:items-start sm:justify-between sm:pt-14">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-foreground">
                  {getDisplayName()}
                </h2>
                {activeSubscription ? (
                  <p className="font-semibold text-primary">
                    {getCPSNumber()}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No active subscription
                  </p>
                )}
              </div>
              <Badge variant="secondary" className="w-fit capitalize">
                {user?.role || "user"}
              </Badge>
            </div>
          </div>
        </Card>

        {/* Personal Information */}
        <Card className="border-border/50">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base sm:text-lg">
                Personal Information
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Your personal details
              </CardDescription>
            </div>
            {!isEditing ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="w-full bg-transparent sm:w-auto"
              >
                <Edit2 className="mr-2 h-4 w-4" />
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  className="flex-1 bg-transparent sm:flex-none"
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 sm:flex-none"
                >
                  {saving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Save
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:gap-6 sm:grid-cols-2">
              {/* First Name */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  First Name
                </Label>
                {isEditing ? (
                  <Input
                    value={formData.first_name}
                    onChange={(e) =>
                      setFormData({ ...formData, first_name: e.target.value })
                    }
                    className="h-10"
                  />
                ) : (
                  <p className="text-sm sm:text-base font-medium text-foreground">
                    {user?.first_name || "-"}
                  </p>
                )}
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  Last Name
                </Label>
                {isEditing ? (
                  <Input
                    value={formData.last_name}
                    onChange={(e) =>
                      setFormData({ ...formData, last_name: e.target.value })
                    }
                    className="h-10"
                  />
                ) : (
                  <p className="text-sm sm:text-base font-medium text-foreground">
                    {user?.last_name || "-"}
                  </p>
                )}
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  Phone Number
                </Label>
                {isEditing ? (
                  <Input
                    value={formData.phone_number}
                    onChange={(e) =>
                      setFormData({ ...formData, phone_number: e.target.value })
                    }
                    className="h-10"
                  />
                ) : (
                  <p className="text-sm sm:text-base font-medium text-foreground">
                    {user?.phone_number || "-"}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  Email Address
                </Label>
                {isEditing ? (
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="h-10"
                  />
                ) : (
                  <p className="text-sm sm:text-base font-medium text-foreground">
                    {user?.email || "-"}
                  </p>
                )}
              </div>

              {/* Registration Number */}
              <div className="space-y-2 sm:col-span-2">
                <Label className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                  <GraduationCap className="h-4 w-4" />
                  Registration Number
                </Label>
                <p className="text-sm sm:text-base font-medium text-foreground">
                  {user?.registration_number || "-"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Restaurant/Location Information */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">
              Restaurant Information
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Your registered restaurant/location
            </CardDescription>
          </CardHeader>
          <CardContent>
            {user?.restaurant_name ? (
              <div className="flex items-center gap-3 sm:gap-4 rounded-lg bg-muted/50 p-3 sm:p-4">
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm sm:text-base font-semibold text-foreground">
                    {user.restaurant_name}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {user.region ? `${user.region.charAt(0).toUpperCase() + user.region.slice(1).replace(/_/g, ' ')}, Tanzania` : 'Tanzania'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-lg bg-muted/50 p-4 text-center">
                <Building2 className="mx-auto h-8 w-8 text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">No restaurant assigned</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Contact support if you need to update your restaurant
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">
              Account Information
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Your account details and status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:gap-6 sm:grid-cols-2">
              {/* CPS Number - Only show if subscribed */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                  <QrCode className="h-4 w-4" />
                  CPS Number
                </Label>
                {activeSubscription ? (
                  <p className="text-lg sm:text-xl font-bold text-primary font-mono">
                    {getCPSNumber()}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    Subscribe to get your CPS number
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-xs sm:text-sm text-muted-foreground">
                  Account Status
                </Label>
                <Badge variant={user?.is_active ? "default" : "secondary"}>
                  {user?.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Member Since
                </Label>
                <p className="text-sm sm:text-base font-medium text-foreground">
                  {user?.created_at
                    ? new Date(user.created_at).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "-"}
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-xs sm:text-sm text-muted-foreground">
                  Role
                </Label>
                <p className="text-sm sm:text-base font-medium capitalize text-foreground">
                  {user?.role || "User"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
