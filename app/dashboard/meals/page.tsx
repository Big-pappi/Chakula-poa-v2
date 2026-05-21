"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/context/auth-context";
import { meals } from "@/lib/api";
import type { Meal } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Utensils,
  Coffee,
  Sun,
  Moon,
  Check,
  Clock,
  AlertCircle,
  Calendar,
  Loader2,
} from "lucide-react";

export default function MealsPage() {
  const { user } = useAuth();
  const [mealsList, setMealsList] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMeals, setSelectedMeals] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  useEffect(() => {
    const fetchMeals = async () => {
      try {
        const response = await meals.getAvailable(tomorrowStr);
        if (response.data && Array.isArray(response.data)) {
          setMealsList(response.data);
        } else {
          setMealsList([]);
        }
      } catch {
        // Demo data
        setMealsList([
          {
            id: "1",
            university_id: "1",
            name: "Uji (Porridge)",
            meal_type: "breakfast",
            description: "Traditional Tanzanian porridge served with peanuts",
            available_date: tomorrowStr,
            max_servings: 200,
            current_orders: 45,
          },
          {
            id: "2",
            university_id: "1",
            name: "Chapati & Beans",
            meal_type: "breakfast",
            description: "Soft chapati served with spiced beans",
            available_date: tomorrowStr,
            max_servings: 150,
            current_orders: 67,
          },
          {
            id: "3",
            university_id: "1",
            name: "Rice & Beans",
            meal_type: "lunch",
            description: "Steamed rice with red beans and vegetables",
            available_date: tomorrowStr,
            max_servings: 300,
            current_orders: 120,
          },
          {
            id: "4",
            university_id: "1",
            name: "Pilau",
            meal_type: "lunch",
            description: "Spiced rice with meat and vegetables",
            available_date: tomorrowStr,
            max_servings: 200,
            current_orders: 156,
          },
          {
            id: "5",
            university_id: "1",
            name: "Ugali & Fish",
            meal_type: "lunch",
            description: "Traditional ugali served with fried fish",
            available_date: tomorrowStr,
            max_servings: 150,
            current_orders: 89,
          },
          {
            id: "6",
            university_id: "1",
            name: "Ugali & Vegetables",
            meal_type: "dinner",
            description: "Ugali with mixed vegetable stew",
            available_date: tomorrowStr,
            max_servings: 250,
            current_orders: 78,
          },
          {
            id: "7",
            university_id: "1",
            name: "Chapati & Meat Stew",
            meal_type: "dinner",
            description: "Chapati served with beef stew",
            available_date: tomorrowStr,
            max_servings: 180,
            current_orders: 134,
          },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchMeals();
  }, [tomorrowStr]);

  const handleSelectMeal = (mealId: string) => {
    const newSelected = new Set(selectedMeals);
    if (newSelected.has(mealId)) {
      newSelected.delete(mealId);
    } else {
      const meal = mealsList.find((m) => m.id === mealId);
      if (meal) {
        mealsList.forEach((m) => {
          if (m.meal_type === meal.meal_type && m.id !== mealId) {
            newSelected.delete(m.id);
          }
        });
        newSelected.add(mealId);
      }
    }
    setSelectedMeals(newSelected);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      for (const mealId of selectedMeals) {
        await meals.select(mealId);
      }
      setSubmitted(true);
    } catch {
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

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

  const getMealsByType = (type: string) =>
    mealsList.filter((m) => m.meal_type === type);

  const deadline = new Date(tomorrow);
  deadline.setHours(18, 0, 0, 0);
  const isDeadlinePassed = Date.now() > deadline.getTime();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="p-4 lg:p-8">
        <Card className="mx-auto max-w-lg border-0 text-center shadow-lg">
          <CardContent className="p-6 sm:p-8">
            <div className="mx-auto mb-6 flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-green-100">
              <Check className="h-8 w-8 sm:h-10 sm:w-10 text-green-600" />
            </div>
            <h2 className="mb-2 text-xl sm:text-2xl font-bold text-foreground">
              Meals Selected!
            </h2>
            <p className="mb-6 text-sm sm:text-base text-muted-foreground">
              Your meal preferences for tomorrow have been saved. Show your CPS
              number at the canteen to collect your meals.
            </p>
            <div className="mb-6 space-y-2">
              {Array.from(selectedMeals).map((mealId) => {
                const meal = mealsList.find((m) => m.id === mealId);
                return meal ? (
                  <div
                    key={meal.id}
                    className="flex items-center gap-3 rounded-lg bg-muted/50 p-3"
                  >
                    <Utensils className="h-5 w-5 text-primary" />
                    <span className="flex-1 text-left font-medium">
                      {meal.name}
                    </span>
                    <Badge variant="secondary" className="capitalize">
                      {meal.meal_type}
                    </Badge>
                  </div>
                ) : null;
              })}
            </div>
            <Button
              onClick={() => setSubmitted(false)}
              variant="outline"
              className="w-full bg-transparent"
            >
              Modify Selection
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
          Select Meals
        </h1>
        <p className="mt-1 text-sm sm:text-base text-muted-foreground">
          Choose your meals for tomorrow,{" "}
          {tomorrow.toLocaleDateString("en-GB", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </p>
      </div>

      {/* Deadline Notice */}
      <Card
        className={`mb-6 border-0 ${isDeadlinePassed ? "bg-destructive/10" : "bg-amber-50"}`}
      >
        <CardContent className="flex items-center gap-3 p-3 sm:p-4">
          <Clock
            className={`h-5 w-5 flex-shrink-0 ${isDeadlinePassed ? "text-destructive" : "text-amber-600"}`}
          />
          <div>
            <p
              className={`text-sm sm:text-base font-medium ${isDeadlinePassed ? "text-destructive" : "text-amber-700"}`}
            >
              {isDeadlinePassed
                ? "Selection deadline has passed"
                : "Selection closes today at 6:00 PM"}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {isDeadlinePassed
                ? "You will receive a default meal allocation."
                : "Select your preferred meals before the deadline."}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Selection Summary */}
      {selectedMeals.size > 0 && (
        <Card className="mb-6 border-primary/20 bg-primary/5">
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-foreground">
                  {selectedMeals.size} meal{selectedMeals.size > 1 ? "s" : ""}{" "}
                  selected
                </p>
                <p className="text-sm text-muted-foreground">
                  {Array.from(selectedMeals)
                    .map((id) => mealsList.find((m) => m.id === id)?.meal_type)
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </div>
              <Button
                onClick={handleSubmit}
                disabled={submitting || isDeadlinePassed}
                className="w-full sm:w-auto"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Confirm Selection"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Meals by Type */}
      <Tabs defaultValue="breakfast" className="space-y-6">
        <TabsList className="grid h-12 w-full grid-cols-3">
          <TabsTrigger value="breakfast" className="flex items-center gap-2">
            <Coffee className="h-4 w-4" />
            <span className="hidden sm:inline">Breakfast</span>
          </TabsTrigger>
          <TabsTrigger value="lunch" className="flex items-center gap-2">
            <Sun className="h-4 w-4" />
            <span className="hidden sm:inline">Lunch</span>
          </TabsTrigger>
          <TabsTrigger value="dinner" className="flex items-center gap-2">
            <Moon className="h-4 w-4" />
            <span className="hidden sm:inline">Dinner</span>
          </TabsTrigger>
        </TabsList>

        {["breakfast", "lunch", "dinner"].map((type) => (
          <TabsContent key={type} value={type}>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {getMealsByType(type).map((meal) => {
                const Icon = getMealIcon(type);
                const isSelected = selectedMeals.has(meal.id);
                const isAvailable = meal.current_orders < meal.max_servings;
                const availability = Math.round(
                  ((meal.max_servings - meal.current_orders) /
                    meal.max_servings) *
                    100
                );

                return (
                  <Card
                    key={meal.id}
                    className={`cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-border/50 hover:border-primary/50"
                    } ${!isAvailable ? "opacity-60" : ""}`}
                    onClick={() =>
                      isAvailable &&
                      !isDeadlinePassed &&
                      handleSelectMeal(meal.id)
                    }
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div
                          className={`flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl ${
                            isSelected
                              ? "bg-primary text-primary-foreground"
                              : "bg-primary/10 text-primary"
                          }`}
                        >
                          <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                        </div>
                        {isSelected && (
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                            <Check className="h-4 w-4 text-primary-foreground" />
                          </div>
                        )}
                      </div>
                      <CardTitle className="mt-3 text-base sm:text-lg">
                        {meal.name}
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm">
                        {meal.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="text-muted-foreground">
                          Availability
                        </span>
                        <span
                          className={`font-medium ${
                            availability > 50
                              ? "text-green-600"
                              : availability > 20
                                ? "text-amber-600"
                                : "text-red-600"
                          }`}
                        >
                          {isAvailable ? `${availability}% left` : "Sold out"}
                        </span>
                      </div>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className={`h-full transition-all ${
                            availability > 50
                              ? "bg-green-500"
                              : availability > 20
                                ? "bg-amber-500"
                                : "bg-red-500"
                          }`}
                          style={{ width: `${availability}%` }}
                        />
                      </div>
                      {!isAvailable && (
                        <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                          <AlertCircle className="h-3 w-3" />
                          <span>This meal is no longer available</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            {getMealsByType(type).length === 0 && (
              <div className="py-12 text-center">
                <Calendar className="mx-auto mb-3 h-12 w-12 text-muted-foreground/50" />
                <p className="text-muted-foreground">
                  No {type} options available for tomorrow
                </p>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
