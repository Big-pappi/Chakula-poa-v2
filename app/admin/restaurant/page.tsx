"use client";

import { useEffect, useState } from "react";
import {
  Building2,
  Loader2,
  Mail,
  MapPin,
  Phone,
  RefreshCcw,
  Store,
  Users,
} from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { restaurantsAPI, type Restaurant } from "@/lib/api/api";
import { useAuth } from "@/lib/context/auth-context";

export default function AdminRestaurantPage() {
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRestaurant = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (!user?.restaurant_id) {
        setRestaurant(null);
        return;
      }

      const response = await restaurantsAPI.get(user.restaurant_id);
      setRestaurant(response);
    } catch (err) {
      console.error("[v0] Failed to fetch restaurant:", err);
      setError("Failed to load restaurant details.");
      setRestaurant(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurant();
  }, [user?.restaurant_id]);

  const displayName = restaurant?.name || user?.restaurant_name || "Restaurant";
  const details = [
    {
      label: "Type",
      value: restaurant?.location_type_display || restaurant?.location_type || "Restaurant",
      icon: Store,
    },
    {
      label: "Region",
      value: restaurant?.region_display || restaurant?.region || user?.region || "Not set",
      icon: MapPin,
    },
    {
      label: "Area",
      value: restaurant?.area || restaurant?.city || "Not set",
      icon: Building2,
    },
    {
      label: "Capacity",
      value: restaurant?.capacity ? restaurant.capacity.toLocaleString() : "Not set",
      icon: Users,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Restaurant</h1>
          <p className="text-muted-foreground">
            View the restaurant assigned to your admin account.
          </p>
        </div>
        <Button variant="outline" onClick={fetchRestaurant} disabled={isLoading}>
          <RefreshCcw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : !user?.restaurant_id && user?.role !== "super_admin" ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Store className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="text-lg font-medium">No restaurant assigned</h3>
            <p className="mt-1 max-w-md text-muted-foreground">
              This admin account is not linked to a restaurant yet. A super admin can assign one from the locations or users area.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <Store className="h-6 w-6" />
                    {displayName}
                  </CardTitle>
                  <CardDescription>
                    {restaurant?.code ? `Code: ${restaurant.code}` : "Restaurant profile"}
                  </CardDescription>
                </div>
                <Badge variant={restaurant?.is_active === false ? "secondary" : "default"}>
                  {restaurant?.is_active === false ? "Inactive" : "Active"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                {details.map((item) => (
                  <div key={item.label} className="rounded-lg border p-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </div>
                    <p className="mt-2 font-medium">{item.value}</p>
                  </div>
                ))}
              </div>

              {restaurant?.address && (
                <div className="mt-4 rounded-lg border p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    Address
                  </div>
                  <p className="mt-2">{restaurant.address}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact</CardTitle>
              <CardDescription>Restaurant contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{restaurant?.contact_phone || "Not set"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{restaurant?.contact_email || "Not set"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
