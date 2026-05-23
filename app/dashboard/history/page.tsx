"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/context/auth-context";
import { meals } from "@/lib/api";
import type { MealOrder } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Utensils,
  Coffee,
  Sun,
  Moon,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";

export default function HistoryPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<MealOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await meals.getOrders();
        if (response.data && Array.isArray(response.data)) {
          setOrders(response.data);
        } else {
          setOrders([]);
        }
      } catch {
        // Demo data
        setOrders([
          {
            id: "1",
            user_id: user?.id || "",
            meal_id: "1",
            meal_name: "Pilau",
            meal_type: "lunch",
            order_date: new Date().toISOString(),
            status: "served",
            served_at: new Date().toISOString(),
          },
          {
            id: "2",
            user_id: user?.id || "",
            meal_id: "2",
            meal_name: "Chapati & Beans",
            meal_type: "breakfast",
            order_date: new Date().toISOString(),
            status: "served",
            served_at: new Date().toISOString(),
          },
          {
            id: "3",
            user_id: user?.id || "",
            meal_id: "3",
            meal_name: "Ugali & Fish",
            meal_type: "dinner",
            order_date: new Date(Date.now() - 86400000).toISOString(),
            status: "served",
            served_at: new Date(Date.now() - 86400000).toISOString(),
          },
          {
            id: "4",
            user_id: user?.id || "",
            meal_id: "4",
            meal_name: "Rice & Beans",
            meal_type: "lunch",
            order_date: new Date(Date.now() - 86400000).toISOString(),
            status: "cancelled",
          },
          {
            id: "5",
            user_id: user?.id || "",
            meal_id: "5",
            meal_name: "Uji (Porridge)",
            meal_type: "breakfast",
            order_date: new Date(Date.now() - 172800000).toISOString(),
            status: "pending",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user?.id]);

  const getMealIcon = (type: string) => {
    switch (type) {
      case "breakfast":
        return Coffee;
      case "lunch":
        return Sun;
      case "dinner":
        return Moon;
      default:
        return Utensils;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "served":
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Served
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-100">
            <XCircle className="mr-1 h-3 w-3" />
            Cancelled
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100">
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filterOrders = (status?: string) => {
    if (!status || status === "all") return orders;
    return orders.filter((o) => o.status === status);
  };

  const groupByDate = (ordersList: MealOrder[]) => {
    const groups: { [key: string]: MealOrder[] } = {};
    ordersList.forEach((order) => {
      const date = new Date(order.order_date).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      if (!groups[date]) groups[date] = [];
      groups[date].push(order);
    });
    return groups;
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
          Meal History
        </h1>
        <p className="mt-1 text-sm sm:text-base text-muted-foreground">
          View your past meal orders and their status
        </p>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-3 gap-3 sm:gap-4">
        <Card className="border-border/50">
          <CardContent className="p-3 sm:p-4 text-center">
            <p className="text-2xl sm:text-3xl font-bold text-green-600">
              {orders.filter((o) => o.status === "served").length}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground">Served</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3 sm:p-4 text-center">
            <p className="text-2xl sm:text-3xl font-bold text-amber-600">
              {orders.filter((o) => o.status === "pending").length}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3 sm:p-4 text-center">
            <p className="text-2xl sm:text-3xl font-bold text-red-600">
              {orders.filter((o) => o.status === "cancelled").length}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground">Cancelled</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="space-y-4 sm:space-y-6">
        <TabsList className="grid h-10 sm:h-12 w-full grid-cols-4">
          <TabsTrigger value="all" className="text-xs sm:text-sm">
            All
          </TabsTrigger>
          <TabsTrigger value="served" className="text-xs sm:text-sm">
            Served
          </TabsTrigger>
          <TabsTrigger value="pending" className="text-xs sm:text-sm">
            Pending
          </TabsTrigger>
          <TabsTrigger value="cancelled" className="text-xs sm:text-sm">
            Cancelled
          </TabsTrigger>
        </TabsList>

        {["all", "served", "pending", "cancelled"].map((status) => (
          <TabsContent key={status} value={status}>
            {filterOrders(status === "all" ? undefined : status).length === 0 ? (
              <Card className="border-border/50">
                <CardContent className="py-12 text-center">
                  <Calendar className="mx-auto mb-3 h-12 w-12 text-muted-foreground/50" />
                  <p className="text-muted-foreground">No orders found</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                {Object.entries(
                  groupByDate(filterOrders(status === "all" ? undefined : status))
                ).map(([date, dateOrders]) => (
                  <div key={date}>
                    <h3 className="mb-3 flex items-center gap-2 text-sm sm:text-base font-semibold text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {date}
                    </h3>
                    <div className="space-y-2 sm:space-y-3">
                      {dateOrders.map((order) => {
                        const Icon = getMealIcon(order.meal_type);
                        return (
                          <Card key={order.id} className="border-border/50">
                            <CardContent className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4">
                              <div
                                className={`flex h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 items-center justify-center rounded-xl ${
                                  order.status === "served"
                                    ? "bg-green-100 text-green-600"
                                    : order.status === "cancelled"
                                      ? "bg-red-100 text-red-600"
                                      : "bg-primary/10 text-primary"
                                }`}
                              >
                                <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm sm:text-base font-medium text-foreground">
                                  {order.meal_name}
                                </p>
                                <p className="text-xs sm:text-sm capitalize text-muted-foreground">
                                  {order.meal_type}
                                </p>
                              </div>
                              {getStatusBadge(order.status)}
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
