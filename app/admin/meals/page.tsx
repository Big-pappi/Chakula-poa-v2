"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbLink, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Edit, Trash2, UtensilsCrossed, Users, Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { adminAPI } from "@/lib/api/api";

interface Meal {
  id: string;
  name: string;
  meal_type: string;
  description?: string;
  max_servings: number;
  current_orders: number;
  is_available: boolean;
  available_date?: string;
}

export default function AdminMealsPage() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    meal_type: "lunch",
    description: "",
    max_servings: 150,
    is_available: true,
  });

  useEffect(() => {
    fetchMeals();
  }, []);

  const fetchMeals = async () => {
    setIsLoading(true);
    try {
      const response = await adminAPI.getMeals();
      setMeals(response.results || response || []);
    } catch (err: any) {
      console.error("[v0] Failed to fetch meals:", err);
      // Demo data for preview
      setMeals([
        { id: "1", name: "Rice with Beans", meal_type: "lunch", max_servings: 150, current_orders: 89, is_available: true, description: "White rice served with kidney beans stew" },
        { id: "2", name: "Ugali with Fish", meal_type: "evening", max_servings: 100, current_orders: 45, is_available: true, description: "Traditional ugali with grilled tilapia" },
        { id: "3", name: "Chapati with Beans", meal_type: "tea", max_servings: 200, current_orders: 120, is_available: true, description: "Soft chapati with bean curry" },
        { id: "4", name: "Pilau", meal_type: "lunch", max_servings: 120, current_orders: 0, is_available: false, description: "Spiced rice with meat" },
        { id: "5", name: "Wali Maharage", meal_type: "evening", max_servings: 180, current_orders: 67, is_available: true, description: "Rice with coconut beans" },
        { id: "6", name: "Mandazi with Chai", meal_type: "tea", max_servings: 250, current_orders: 156, is_available: true, description: "Fried dough with chai" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateMeal = async () => {
    if (!formData.name) {
      setError("Meal name is required");
      return;
    }

    setIsCreating(true);
    setError(null);
    setSuccess(null);

    try {
      await adminAPI.createMeal(formData);
      setSuccess("Meal created successfully!");
      setFormData({ name: "", meal_type: "lunch", description: "", max_servings: 150, is_available: true });
      setShowAddDialog(false);
      fetchMeals();
    } catch (err: any) {
      console.error("[v0] Failed to create meal:", err);
      setError(err.message || "Failed to create meal. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const getMealTypeLabel = (type: string) => {
    switch (type) {
      case "tea": return "Morning Tea";
      case "lunch": return "Lunch";
      case "evening": return "Evening";
      default: return type;
    }
  };

  const getMealTypeColor = (type: string) => {
    switch (type) {
      case "tea": return "bg-amber-100 text-amber-800";
      case "lunch": return "bg-green-100 text-green-800";
      case "evening": return "bg-blue-100 text-blue-800";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const mealStats = [
    { type: "Morning Tea", count: meals.filter(m => m.meal_type === "tea").length, color: "bg-amber-500" },
    { type: "Lunch", count: meals.filter(m => m.meal_type === "lunch").length, color: "bg-green-500" },
    { type: "Evening", count: meals.filter(m => m.meal_type === "evening").length, color: "bg-blue-500" },
  ];

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
              <BreadcrumbPage>Meals</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <main className="flex-1 space-y-6 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <UtensilsCrossed className="h-8 w-8" />
              Meal Management
            </h1>
            <p className="text-muted-foreground">Manage daily meals and menu items</p>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Meal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Meal</DialogTitle>
                <DialogDescription>Add a new meal to the menu</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label>Meal Name <span className="text-destructive">*</span></Label>
                  <Input 
                    placeholder="e.g., Rice with Beans" 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea 
                    placeholder="Brief description of the meal"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Meal Type</Label>
                    <Select 
                      value={formData.meal_type}
                      onValueChange={(value) => setFormData({ ...formData, meal_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tea">Morning Tea</SelectItem>
                        <SelectItem value="lunch">Lunch</SelectItem>
                        <SelectItem value="evening">Evening</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Max Servings</Label>
                    <Input 
                      type="number" 
                      placeholder="150"
                      value={formData.max_servings}
                      onChange={(e) => setFormData({ ...formData, max_servings: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Label>Available for ordering</Label>
                  <Switch 
                    checked={formData.is_available}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_available: checked })}
                  />
                </div>
                <Button className="w-full" onClick={handleCreateMeal} disabled={isCreating}>
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Add Meal"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">{success}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 md:grid-cols-3">
          {mealStats.map((stat) => (
            <Card key={stat.type}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{stat.type}</CardTitle>
                <div className={`h-3 w-3 rounded-full ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.count}</div>
                <p className="text-xs text-muted-foreground">menu items</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : meals.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <UtensilsCrossed className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No meals found. Add your first meal!</p>
              <Button className="mt-4" onClick={() => setShowAddDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Meal
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {meals.map((meal) => (
              <Card key={meal.id} className={!meal.is_available ? "opacity-60" : ""}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{meal.name}</CardTitle>
                      <CardDescription>{meal.description}</CardDescription>
                    </div>
                    <Badge className={getMealTypeColor(meal.meal_type)}>
                      {getMealTypeLabel(meal.meal_type)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        Servings
                      </span>
                      <span className="font-semibold">
                        {meal.current_orders}/{meal.max_servings}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div 
                        className={`h-full ${meal.current_orders / meal.max_servings > 0.8 ? 'bg-amber-500' : 'bg-green-500'}`}
                        style={{ width: `${Math.min((meal.current_orders / meal.max_servings) * 100, 100)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant={meal.is_available ? "default" : "secondary"}>
                        {meal.is_available ? "Available" : "Unavailable"}
                      </Badge>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
