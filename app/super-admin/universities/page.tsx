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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { GraduationCap, Search, Plus, MoreHorizontal, Eye, Edit, Trash2, Settings, Users, MapPin, Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { TANZANIA_REGIONS, getRegionLabel } from "@/lib/types";
import { superAdminAPI } from "@/lib/api/api";
import type { Restaurant } from "@/lib/api/api";

export default function SuperAdminUniversitiesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRegion, setFilterRegion] = useState<string>("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [universities, setUniversities] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    location: "",
    region: "",
    admin_email: "",
    contact_phone: "",
    location_type: "university",
  });

  useEffect(() => {
    fetchUniversities();
  }, []);

  const fetchUniversities = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await superAdminAPI.getRestaurants();
      const data = response.results || response || [];
      // Filter for universities
      const universities = data.filter((r: Restaurant) => r.location_type === "university");
      setUniversities(universities);
    } catch (err: any) {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      setError(`Unable to connect to backend. Please ensure Django is running at ${apiUrl}`);
      setUniversities([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUniversity = async () => {
    if (!formData.name || !formData.code || !formData.region) {
      setError("Name, code, and region are required");
      return;
    }

    setIsCreating(true);
    setError(null);
    setSuccess(null);

    try {
      await superAdminAPI.createRestaurant({
        ...formData,
        location_type: "university",
      } as any);
      
      setSuccess("University registered successfully!");
      setFormData({ name: "", code: "", location: "", region: "", admin_email: "", contact_phone: "", location_type: "university" });
      setShowAddDialog(false);
      fetchUniversities();
    } catch (err: any) {
      console.error("[v0] Failed to create university:", err);
      setError(err.message || "Failed to register university. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const filteredUniversities = universities.filter((uni) => {
    const matchesSearch = 
      uni.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      uni.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      uni.location?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRegion = filterRegion === "all" || uni.region === filterRegion;
    return matchesSearch && matchesRegion;
  });

  const totalUsers = universities.reduce((acc, u) => acc + (u.user_count || 0), 0);
  const activeCount = universities.filter(u => u.is_active).length;
  const regionsCount = new Set(universities.map(u => u.region)).size;

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground flex items-center gap-2">
          <GraduationCap className="h-6 w-6 sm:h-8 sm:w-8" />
          University Canteens
        </h1>
        <p className="mt-1 text-sm sm:text-base text-muted-foreground">
          Manage university food service locations across Tanzania
        </p>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search universities..."
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
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Add University
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md mx-4 sm:mx-auto">
            <DialogHeader>
              <DialogTitle>Add University Canteen</DialogTitle>
              <DialogDescription>Register a new university food service location</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label>University Name <span className="text-destructive">*</span></Label>
                <Input 
                  placeholder="e.g., University of Dar es Salaam" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Location Code <span className="text-destructive">*</span></Label>
                  <Input 
                    placeholder="e.g., UDSM-MAIN" 
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Area</Label>
                  <Input 
                    placeholder="e.g., Mlimani" 
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Region <span className="text-destructive">*</span></Label>
                <Select 
                  value={formData.region}
                  onValueChange={(value) => setFormData({ ...formData, region: value })}
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
                <Label>Admin Email</Label>
                <Input 
                  type="email" 
                  placeholder="admin@university.ac.tz" 
                  value={formData.admin_email}
                  onChange={(e) => setFormData({ ...formData, admin_email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Contact Phone</Label>
                <Input 
                  placeholder="+255 xxx xxx xxx" 
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                />
              </div>
              <Button className="w-full" onClick={handleCreateUniversity} disabled={isCreating}>
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  "Register University"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {success && (
        <Alert className="mb-6 border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">{success}</AlertDescription>
        </Alert>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <Card className="border-border/50">
          <CardContent className="p-3 sm:p-4 text-center">
            <p className="text-xl sm:text-2xl font-bold text-primary">{universities.length}</p>
            <p className="text-xs sm:text-sm text-muted-foreground">Universities</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3 sm:p-4 text-center">
            <p className="text-xl sm:text-2xl font-bold text-green-600">{activeCount}</p>
            <p className="text-xs sm:text-sm text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3 sm:p-4 text-center">
            <p className="text-xl sm:text-2xl font-bold text-foreground">{totalUsers.toLocaleString()}</p>
            <p className="text-xs sm:text-sm text-muted-foreground">Total Users</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3 sm:p-4 text-center">
            <p className="text-xl sm:text-2xl font-bold text-foreground">{regionsCount}</p>
            <p className="text-xs sm:text-sm text-muted-foreground">Regions</p>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredUniversities.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <GraduationCap className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No universities found</p>
            <Button className="mt-4" onClick={() => setShowAddDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add First University
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Mobile Cards View */}
          <div className="lg:hidden space-y-3">
            {filteredUniversities.map((uni) => (
              <Card key={uni.id} className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                          {uni.code?.split("-")[0] || uni.name?.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">{uni.name}</p>
                        <p className="text-xs text-muted-foreground">{uni.code}</p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Settings className="mr-2 h-4 w-4" />
                          Configure
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">{uni.location}, {getRegionLabel(uni.region)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Users className="h-3 w-3" />
                      <span>{(uni.user_count || 0).toLocaleString()} users</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t">
                    <span className="text-xs text-muted-foreground">{uni.staff_count || 0} staff</span>
                    <Badge variant={uni.is_active ? "default" : "secondary"} className="text-xs">
                      {uni.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Desktop Table View */}
          <Card className="hidden lg:block border-border/50">
            <CardHeader>
              <CardTitle>University Canteens</CardTitle>
              <CardDescription>{filteredUniversities.length} universities registered</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>University</TableHead>
                    <TableHead>Region</TableHead>
                    <TableHead>Users</TableHead>
                    <TableHead>Staff</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUniversities.map((uni) => (
                    <TableRow key={uni.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                              {uni.code?.split("-")[0] || uni.name?.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{uni.name}</p>
                            <p className="text-sm text-muted-foreground">{uni.code}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{uni.location}, {getRegionLabel(uni.region)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          {(uni.user_count || 0).toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>{uni.staff_count || 0}</TableCell>
                      <TableCell>
                        <Badge variant={uni.is_active ? "default" : "secondary"}>
                          {uni.is_active ? "Active" : "Inactive"}
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
                            <DropdownMenuItem>
                              <Settings className="mr-2 h-4 w-4" />
                              Configure
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
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
        </>
      )}
    </div>
  );
}
