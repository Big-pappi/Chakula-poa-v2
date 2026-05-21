"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Store, Search, Plus, MoreHorizontal, Eye, Edit, Trash2, Settings, Users, MapPin, UserPlus, Loader2, AlertTriangle, CheckCircle2, Shield } from "lucide-react";
import { superAdminAPI, restaurantsAPI } from "@/lib/api/api";
import type { Restaurant, User } from "@/lib/api/api";
import { LOCATION_TYPE_LABELS, TANZANIA_REGIONS, getRegionLabel } from "@/lib/types";

const LOCATION_TYPES = [
  { value: "restaurant", label: "Restaurant" },
  { value: "university", label: "University" },
  { value: "market", label: "Market" },
  { value: "office", label: "Office" },
  { value: "hospital", label: "Hospital" },
  { value: "industrial", label: "Industrial" },
];

export default function SuperAdminRestaurantsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRegion, setFilterRegion] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [showAddRestaurantDialog, setShowAddRestaurantDialog] = useState(false);
  const [showAddAdminDialog, setShowAddAdminDialog] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Restaurant form
  const [restaurantForm, setRestaurantForm] = useState({
    name: "",
    code: "",
    location_type: "",
    region: "",
    area: "",
    city: "",
    contact_email: "",
    contact_phone: "",
    capacity: "",
  });

  // Admin form
  const [adminForm, setAdminForm] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    password: "",
  });

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    setIsLoading(true);
    try {
      const params: { region?: string; location_type?: any } = {};
      if (filterRegion !== "all") params.region = filterRegion;
      if (filterType !== "all") params.location_type = filterType;
      
      const response = await restaurantsAPI.list(params);
      if (response && response.length > 0) {
        setRestaurants(response);
      } else {
        setRestaurants([]);
      }
    } catch (err) {
      console.log("[v0] API unavailable:", err);
      setRestaurants([]);
      setError("Unable to fetch restaurants. Please check backend connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRestaurant = async () => {
    if (!restaurantForm.name || !restaurantForm.code || !restaurantForm.location_type || !restaurantForm.region) {
      setError("Name, code, location type, and region are required");
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      await superAdminAPI.createRestaurant({
        name: restaurantForm.name,
        code: restaurantForm.code,
        location_type: restaurantForm.location_type as any,
        region: restaurantForm.region,
        area: restaurantForm.area || undefined,
        city: restaurantForm.city || undefined,
        contact_email: restaurantForm.contact_email || undefined,
        contact_phone: restaurantForm.contact_phone || undefined,
        capacity: restaurantForm.capacity ? parseInt(restaurantForm.capacity) : undefined,
        is_active: true,
      } as any);

      setSuccess("Restaurant created successfully");
      setRestaurantForm({ name: "", code: "", location_type: "", region: "", area: "", city: "", contact_email: "", contact_phone: "", capacity: "" });
      setShowAddRestaurantDialog(false);
      fetchRestaurants();
    } catch (err: any) {
      setError(err.message || "Failed to create restaurant");
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreateAdmin = async () => {
    if (!selectedRestaurant) return;
    if (!adminForm.full_name || !adminForm.phone_number || !adminForm.password) {
      setError("Full name, phone number, and password are required");
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      await superAdminAPI.createAdmin({
        full_name: adminForm.full_name,
        email: adminForm.email || undefined,
        phone_number: adminForm.phone_number,
        password: adminForm.password,
        restaurant_id: selectedRestaurant.id,
      } as any);

      setSuccess(`Admin created for ${selectedRestaurant.name}. They can now log in and manage the restaurant.`);
      setAdminForm({ full_name: "", email: "", phone_number: "", password: "" });
      setShowAddAdminDialog(false);
      setSelectedRestaurant(null);
    } catch (err: any) {
      setError(err.message || "Failed to create admin");
    } finally {
      setIsCreating(false);
    }
  };

  const filteredRestaurants = restaurants.filter((restaurant) => {
    const matchesSearch = 
      restaurant.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.area?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRegion = filterRegion === "all" || restaurant.region === filterRegion;
    const matchesType = filterType === "all" || restaurant.location_type === filterType;
    return matchesSearch && matchesRegion && matchesType;
  });

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground flex items-center gap-2">
          <Store className="h-6 w-6 sm:h-8 sm:w-8" />
          Restaurant Management
        </h1>
        <p className="mt-1 text-sm sm:text-base text-muted-foreground">
          Register restaurants and food suppliers, assign administrators
        </p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <Alert className="mb-4 border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">{success}</AlertDescription>
        </Alert>
      )}
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Info Alert */}
      <Alert className="mb-6">
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Restaurant owners contact you for registration. After creating a restaurant, assign an admin who can then add their own staff members.
        </AlertDescription>
      </Alert>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search restaurants..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterRegion} onValueChange={setFilterRegion}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Region" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Regions</SelectItem>
            {TANZANIA_REGIONS.map((region) => (
              <SelectItem key={region.value} value={region.value}>{region.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {LOCATION_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Dialog open={showAddRestaurantDialog} onOpenChange={setShowAddRestaurantDialog}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Add Restaurant
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Register New Restaurant</DialogTitle>
              <DialogDescription>
                Add a new restaurant or food supplier to the platform
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
              <div className="space-y-2">
                <Label>Restaurant Name <span className="text-destructive">*</span></Label>
                <Input
                  placeholder="e.g., Mama Lishe Kitchen"
                  value={restaurantForm.name}
                  onChange={(e) => setRestaurantForm({ ...restaurantForm, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Code <span className="text-destructive">*</span></Label>
                  <Input
                    placeholder="e.g., MLK-DSM"
                    value={restaurantForm.code}
                    onChange={(e) => setRestaurantForm({ ...restaurantForm, code: e.target.value.toUpperCase() })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type <span className="text-destructive">*</span></Label>
                  <Select
                    value={restaurantForm.location_type}
                    onValueChange={(value) => setRestaurantForm({ ...restaurantForm, location_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {LOCATION_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Region <span className="text-destructive">*</span></Label>
                  <Select
                    value={restaurantForm.region}
                    onValueChange={(value) => setRestaurantForm({ ...restaurantForm, region: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      {TANZANIA_REGIONS.map((region) => (
                        <SelectItem key={region.value} value={region.value}>{region.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Area</Label>
                  <Input
                    placeholder="e.g., Kariakoo"
                    value={restaurantForm.area}
                    onChange={(e) => setRestaurantForm({ ...restaurantForm, area: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input
                    placeholder="e.g., Dar es Salaam"
                    value={restaurantForm.city}
                    onChange={(e) => setRestaurantForm({ ...restaurantForm, city: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Daily Capacity</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 500"
                    value={restaurantForm.capacity}
                    onChange={(e) => setRestaurantForm({ ...restaurantForm, capacity: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Contact Email</Label>
                <Input
                  type="email"
                  placeholder="owner@restaurant.com"
                  value={restaurantForm.contact_email}
                  onChange={(e) => setRestaurantForm({ ...restaurantForm, contact_email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Contact Phone</Label>
                <Input
                  placeholder="0712345678"
                  value={restaurantForm.contact_phone}
                  onChange={(e) => setRestaurantForm({ ...restaurantForm, contact_phone: e.target.value })}
                />
              </div>

              <Button className="w-full" onClick={handleCreateRestaurant} disabled={isCreating}>
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Restaurant"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <Card className="border-border/50">
          <CardContent className="p-3 sm:p-4 text-center">
            <p className="text-xl sm:text-2xl font-bold text-primary">{restaurants.length}</p>
            <p className="text-xs sm:text-sm text-muted-foreground">Total Restaurants</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3 sm:p-4 text-center">
            <p className="text-xl sm:text-2xl font-bold text-green-600">
              {restaurants.filter(r => r.is_active).length}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3 sm:p-4 text-center">
            <p className="text-xl sm:text-2xl font-bold text-foreground">
              {new Set(restaurants.map(r => r.region)).size}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground">Regions</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3 sm:p-4 text-center">
            <p className="text-xl sm:text-2xl font-bold text-foreground">
              {new Set(restaurants.map(r => r.location_type)).size}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground">Types</p>
          </CardContent>
        </Card>
      </div>

      {/* Restaurants List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredRestaurants.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="py-12 text-center">
            <Store className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No restaurants found</p>
            <Button className="mt-4" onClick={() => setShowAddRestaurantDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add First Restaurant
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Restaurants</CardTitle>
            <CardDescription>{filteredRestaurants.length} restaurants registered</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Restaurant</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRestaurants.map((restaurant) => (
                  <TableRow key={restaurant.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                            {restaurant.code?.slice(0, 3) || restaurant.name?.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{restaurant.name}</p>
                          <p className="text-sm text-muted-foreground font-mono">{restaurant.code}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {LOCATION_TYPE_LABELS[restaurant.location_type] || restaurant.location_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{restaurant.area ? `${restaurant.area}, ` : ""}{getRegionLabel(restaurant.region)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={restaurant.is_active ? "default" : "secondary"}>
                        {restaurant.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedRestaurant(restaurant);
                              setShowAddAdminDialog(true);
                            }}
                          >
                            <UserPlus className="mr-2 h-4 w-4" />
                            Add Admin
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Settings className="mr-2 h-4 w-4" />
                            Configure
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Deactivate
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Add Admin Dialog */}
      <Dialog open={showAddAdminDialog} onOpenChange={setShowAddAdminDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Restaurant Admin</DialogTitle>
            <DialogDescription>
              Create an admin account for <strong>{selectedRestaurant?.name}</strong>. 
              They will be able to manage staff and view reports.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Full Name <span className="text-destructive">*</span></Label>
              <Input
                placeholder="Restaurant owner name"
                value={adminForm.full_name}
                onChange={(e) => setAdminForm({ ...adminForm, full_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="admin@restaurant.com"
                value={adminForm.email}
                onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Phone Number <span className="text-destructive">*</span></Label>
              <Input
                placeholder="0712345678"
                value={adminForm.phone_number}
                onChange={(e) => setAdminForm({ ...adminForm, phone_number: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">Admin will use this phone number to log in</p>
            </div>
            <div className="space-y-2">
              <Label>Password <span className="text-destructive">*</span></Label>
              <Input
                type="password"
                placeholder="Create password (min 6 characters)"
                value={adminForm.password}
                onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
              />
            </div>

            <Alert>
              <AlertDescription className="text-sm">
                After creation, the admin can log in at the Admin portal using their phone number and password.
                They can add staff members who will serve customers.
              </AlertDescription>
            </Alert>

            <Button className="w-full" onClick={handleCreateAdmin} disabled={isCreating}>
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Admin Account"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
