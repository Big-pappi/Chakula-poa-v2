"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MapPin, Search, Plus, MoreHorizontal, Eye, Edit, Trash2, Settings, Users, 
  Building2, GraduationCap, ShoppingBag, Briefcase, Building, Factory, 
  Loader2, AlertTriangle, UserPlus, CheckCircle2, RefreshCw, Shield,
  Phone, Mail, Globe, CreditCard
} from "lucide-react";
import { LOCATION_TYPE_LABELS, TANZANIA_REGIONS, getRegionLabel, type LocationType, type Restaurant, type User } from "@/lib/types";
import { superAdmin } from "@/lib/api/endpoints";

// Icons for each location type
const locationTypeIcons: Record<LocationType, React.ElementType> = {
  restaurant: Building2,
  university: GraduationCap,
  market: ShoppingBag,
  office: Briefcase,
  hospital: Building,
  industrial: Factory,
};

export default function SuperAdminLocationsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterRegion, setFilterRegion] = useState<string>("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showAssignAdminDialog, setShowAssignAdminDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [locations, setLocations] = useState<Restaurant[]>([]);
  const [availableAdmins, setAvailableAdmins] = useState<User[]>([]);
  
  const [newLocation, setNewLocation] = useState({
    name: "",
    code: "",
    location_type: "restaurant" as LocationType,
    area: "",
    region: "",
    contact_email: "",
    contact_phone: "",
  });

  const [editLocation, setEditLocation] = useState({
    name: "",
    code: "",
    location_type: "restaurant" as LocationType,
    area: "",
    region: "",
    contact_email: "",
    contact_phone: "",
    is_active: true,
  });

  const [configSettings, setConfigSettings] = useState({
    is_active: true,
    accept_mobile_money: true,
    accept_bank_transfer: true,
    payout_account_name: "",
    payout_account_number: "",
    payout_bank_name: "",
  });

  const [newAdminForm, setNewAdminForm] = useState({
    full_name: "",
    phone_number: "",
    email: "",
    password: "",
  });

  const [assignMode, setAssignMode] = useState<"new" | "existing">("new");
  const [selectedAdminId, setSelectedAdminId] = useState<string>("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Use superAdmin.getRestaurants() to get ALL locations (including inactive)
      const [locationsRes, usersRes] = await Promise.all([
        superAdmin.getRestaurants(),
        superAdmin.getAllUsers({ role: "admin" }),
      ]);
      
      console.log("[v0] Locations API response:", locationsRes);
      
      if (locationsRes.data && Array.isArray(locationsRes.data)) {
        setLocations(locationsRes.data);
      } else if (locationsRes.error) {
        setError(locationsRes.error);
        setLocations([]);
      }
      
      if (usersRes.data && Array.isArray(usersRes.data)) {
        setAvailableAdmins(usersRes.data);
      }
    } catch (err) {
      console.log("[v0] Fetch error:", err);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      setError(`Unable to connect to backend. Please ensure Django is running at ${apiUrl}`);
      setLocations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLocation = async () => {
    if (!newLocation.name || !newLocation.code) {
      setError("Name and code are required");
      return;
    }
    
    setActionLoading(true);
    setError(null);
    
    try {
      const response = await superAdmin.createRestaurant({
        name: newLocation.name,
        code: newLocation.code,
        location_type: newLocation.location_type,
        area: newLocation.area,
        region: newLocation.region,
        contact_email: newLocation.contact_email,
        contact_phone: newLocation.contact_phone,
        is_active: true,
      });
      
      if (response.data) {
        setLocations([...locations, response.data]);
        setShowAddDialog(false);
        setNewLocation({
          name: "",
          code: "",
          location_type: "restaurant",
          area: "",
          region: "",
          contact_email: "",
          contact_phone: "",
        });
        setSuccess("Location created successfully!");
        setTimeout(() => setSuccess(null), 3000);
      } else if (response.error) {
        setError(response.error);
      }
    } catch (err) {
      setError("Failed to create location");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditLocation = async () => {
    if (!selectedLocation) return;
    if (!editLocation.name || !editLocation.code) {
      setError("Name and code are required");
      return;
    }
    
    setActionLoading(true);
    setError(null);
    
    try {
      const response = await superAdmin.updateRestaurant(selectedLocation.id, {
        name: editLocation.name,
        code: editLocation.code,
        location_type: editLocation.location_type,
        area: editLocation.area,
        region: editLocation.region,
        contact_email: editLocation.contact_email,
        contact_phone: editLocation.contact_phone,
        is_active: editLocation.is_active,
      });
      
      if (response.data) {
        setLocations(locations.map(loc => loc.id === selectedLocation.id ? response.data! : loc));
        setShowEditDialog(false);
        setSelectedLocation(null);
        setSuccess("Location updated successfully!");
        setTimeout(() => setSuccess(null), 3000);
      } else if (response.error) {
        setError(response.error);
      }
    } catch (err) {
      setError("Failed to update location");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveConfig = async () => {
    if (!selectedLocation) return;
    
    setActionLoading(true);
    setError(null);
    
    try {
      const response = await superAdmin.updateRestaurant(selectedLocation.id, {
        is_active: configSettings.is_active,
        payout_account_name: configSettings.payout_account_name,
        payout_account_number: configSettings.payout_account_number,
        payout_bank_name: configSettings.payout_bank_name,
      });
      
      if (response.data) {
        setLocations(locations.map(loc => loc.id === selectedLocation.id ? response.data! : loc));
        setShowConfigDialog(false);
        setSelectedLocation(null);
        setSuccess("Configuration saved successfully!");
        setTimeout(() => setSuccess(null), 3000);
      } else if (response.error) {
        setError(response.error);
      }
    } catch (err) {
      setError("Failed to save configuration");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteLocation = async () => {
    if (!selectedLocation) return;
    
    setActionLoading(true);
    setError(null);
    
    try {
      await superAdmin.deleteRestaurant(selectedLocation.id);
      setLocations(locations.filter(loc => loc.id !== selectedLocation.id));
      setShowDeleteConfirm(false);
      setSelectedLocation(null);
      setSuccess("Location deleted successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError("Failed to delete location");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignAdmin = async () => {
    if (!selectedLocation) return;
    
    setActionLoading(true);
    setError(null);
    
    try {
      if (assignMode === "new") {
        if (!newAdminForm.full_name || !newAdminForm.phone_number || !newAdminForm.password) {
          setError("Full name, phone number, and password are required");
          setActionLoading(false);
          return;
        }
        
        const response = await superAdmin.createAdmin({
          full_name: newAdminForm.full_name,
          phone_number: newAdminForm.phone_number,
          email: newAdminForm.email || undefined,
          password: newAdminForm.password,
          restaurant_id: selectedLocation.id,
        });
        
        if (response.data) {
          setSuccess(`Admin "${newAdminForm.full_name}" created and assigned to ${selectedLocation.name}! Login: ${newAdminForm.phone_number}`);
          setNewAdminForm({ full_name: "", phone_number: "", email: "", password: "" });
        } else if (response.error) {
          setError(response.error);
          setActionLoading(false);
          return;
        }
      } else {
        if (!selectedAdminId) {
          setError("Please select an admin to assign");
          setActionLoading(false);
          return;
        }
        
        const response = await superAdmin.assignAdminToRestaurant(selectedAdminId, selectedLocation.id);
        
        if (response.data) {
          const admin = availableAdmins.find(a => a.id === selectedAdminId);
          setSuccess(`Admin "${admin?.full_name}" assigned to ${selectedLocation.name}!`);
        } else if (response.error) {
          setError(response.error);
          setActionLoading(false);
          return;
        }
      }
      
      setShowAssignAdminDialog(false);
      setSelectedLocation(null);
      setSelectedAdminId("");
      fetchData();
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to assign admin";
      setError(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const openEditDialog = (location: Restaurant) => {
    setSelectedLocation(location);
    setEditLocation({
      name: location.name,
      code: location.code || "",
      location_type: location.location_type,
      area: location.area || "",
      region: location.region || "",
      contact_email: location.contact_email || "",
      contact_phone: location.contact_phone || "",
      is_active: location.is_active,
    });
    setShowEditDialog(true);
  };

  const openViewDialog = (location: Restaurant) => {
    setSelectedLocation(location);
    setShowViewDialog(true);
  };

  const openConfigDialog = (location: Restaurant) => {
    setSelectedLocation(location);
    setConfigSettings({
      is_active: location.is_active,
      accept_mobile_money: true,
      accept_bank_transfer: true,
      payout_account_name: location.payout_account_name || "",
      payout_account_number: location.payout_account_number || "",
      payout_bank_name: location.payout_bank_name || "",
    });
    setShowConfigDialog(true);
  };

  const openDeleteConfirm = (location: Restaurant) => {
    setSelectedLocation(location);
    setShowDeleteConfirm(true);
  };

  const openAssignAdminDialog = (location: Restaurant) => {
    setSelectedLocation(location);
    setAssignMode("new");
    setShowAssignAdminDialog(true);
  };

  const filteredLocations = locations.filter((loc) => {
    const matchesSearch =
      loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.area?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || loc.location_type === filterType;
    const matchesRegion = filterRegion === "all" || loc.region === filterRegion;
    return matchesSearch && matchesType && matchesRegion;
  });

  const getLocationIcon = (type: LocationType) => {
    const Icon = locationTypeIcons[type] || Building2;
    return <Icon className="h-4 w-4" />;
  };

  if (loading) {
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
          <MapPin className="h-6 w-6 sm:h-8 sm:w-8" />
          Locations
        </h1>
        <p className="mt-1 text-sm sm:text-base text-muted-foreground">
          Manage all registered restaurants, universities, markets, and other food service locations across Tanzania
        </p>
      </div>

      {/* Success Message */}
      {success && (
        <Alert className="mb-4 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-700 dark:text-green-300">{success}</AlertDescription>
        </Alert>
      )}

      {/* Error Message */}
      {error && (
        <Card className="mb-6 border-destructive/20 bg-destructive/5">
          <CardContent className="flex items-center gap-3 p-4">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <p className="text-sm text-destructive">{error}</p>
            <Button variant="ghost" size="sm" className="ml-auto" onClick={() => setError(null)}>
              Dismiss
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Location Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {Object.entries(LOCATION_TYPE_LABELS).map(([type, label]) => (
              <SelectItem key={type} value={type}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
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
        <Button variant="outline" size="icon" onClick={fetchData} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Add Location
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md mx-4 sm:mx-auto max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Location</DialogTitle>
              <DialogDescription>Register a new food service location to Chakula Poa</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Location Name <span className="text-destructive">*</span></Label>
                <Input
                  placeholder="e.g., Mama Lishe Kariakoo"
                  value={newLocation.name}
                  onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Code <span className="text-destructive">*</span></Label>
                  <Input
                    placeholder="e.g., KARIAKOO-001"
                    value={newLocation.code}
                    onChange={(e) => setNewLocation({ ...newLocation, code: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Location Type</Label>
                  <Select
                    value={newLocation.location_type}
                    onValueChange={(value: LocationType) => setNewLocation({ ...newLocation, location_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(LOCATION_TYPE_LABELS).map(([type, label]) => (
                        <SelectItem key={type} value={type}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Area</Label>
                  <Input
                    placeholder="e.g., Kariakoo"
                    value={newLocation.area}
                    onChange={(e) => setNewLocation({ ...newLocation, area: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Region</Label>
                  <Select
                    value={newLocation.region}
                    onValueChange={(value) => setNewLocation({ ...newLocation, region: value })}
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
              </div>
              <div className="space-y-2">
                <Label>Contact Email</Label>
                <Input
                  type="email"
                  placeholder="admin@location.co.tz"
                  value={newLocation.contact_email}
                  onChange={(e) => setNewLocation({ ...newLocation, contact_email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Contact Phone</Label>
                <Input
                  placeholder="+255 xxx xxx xxx"
                  value={newLocation.contact_phone}
                  onChange={(e) => setNewLocation({ ...newLocation, contact_phone: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
              <Button onClick={handleCreateLocation} disabled={actionLoading}>
                {actionLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating...</> : "Register Location"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Location Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md mx-4 sm:mx-auto max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Edit Location
            </DialogTitle>
            <DialogDescription>Update location details for {selectedLocation?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Location Name <span className="text-destructive">*</span></Label>
              <Input
                placeholder="e.g., Mama Lishe Kariakoo"
                value={editLocation.name}
                onChange={(e) => setEditLocation({ ...editLocation, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Code <span className="text-destructive">*</span></Label>
                <Input
                  placeholder="e.g., KARIAKOO-001"
                  value={editLocation.code}
                  onChange={(e) => setEditLocation({ ...editLocation, code: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Location Type</Label>
                <Select
                  value={editLocation.location_type}
                  onValueChange={(value: LocationType) => setEditLocation({ ...editLocation, location_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(LOCATION_TYPE_LABELS).map(([type, label]) => (
                      <SelectItem key={type} value={type}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Area</Label>
                <Input
                  placeholder="e.g., Kariakoo"
                  value={editLocation.area}
                  onChange={(e) => setEditLocation({ ...editLocation, area: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Region</Label>
                <Select
                  value={editLocation.region}
                  onValueChange={(value) => setEditLocation({ ...editLocation, region: value })}
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
            </div>
            <div className="space-y-2">
              <Label>Contact Email</Label>
              <Input
                type="email"
                placeholder="admin@location.co.tz"
                value={editLocation.contact_email}
                onChange={(e) => setEditLocation({ ...editLocation, contact_email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Contact Phone</Label>
              <Input
                placeholder="+255 xxx xxx xxx"
                value={editLocation.contact_phone}
                onChange={(e) => setEditLocation({ ...editLocation, contact_phone: e.target.value })}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <Label className="text-sm">Active Status</Label>
                <p className="text-xs text-muted-foreground">Enable or disable this location</p>
              </div>
              <Switch
                checked={editLocation.is_active}
                onCheckedChange={(checked) => setEditLocation({ ...editLocation, is_active: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancel</Button>
            <Button onClick={handleEditLocation} disabled={actionLoading}>
              {actionLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Location Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-lg mx-4 sm:mx-auto max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Location Details
            </DialogTitle>
          </DialogHeader>
          {selectedLocation && (
            <div className="space-y-6 py-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                    {selectedLocation.code?.substring(0, 3) || selectedLocation.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{selectedLocation.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {getLocationIcon(selectedLocation.location_type)}
                    <span className="text-sm text-muted-foreground">
                      {LOCATION_TYPE_LABELS[selectedLocation.location_type] || selectedLocation.location_type}
                    </span>
                    <Badge variant={selectedLocation.is_active ? "default" : "secondary"}>
                      {selectedLocation.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Code</p>
                  <p className="font-mono font-medium">{selectedLocation.code}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Users</p>
                  <p className="font-medium">{(selectedLocation.user_count || 0).toLocaleString()}</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-sm">Location Info</h4>
                <div className="rounded-lg border p-3 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedLocation.area}, {getRegionLabel(selectedLocation.region)}</span>
                  </div>
                  {selectedLocation.contact_email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedLocation.contact_email}</span>
                    </div>
                  )}
                  {selectedLocation.contact_phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedLocation.contact_phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {(selectedLocation.payout_account_name || selectedLocation.payout_bank_name) && (
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Payout Information</h4>
                  <div className="rounded-lg border p-3 space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedLocation.payout_account_name}</span>
                    </div>
                    <p className="text-sm text-muted-foreground ml-6">
                      {selectedLocation.payout_bank_name} - {selectedLocation.payout_account_number}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewDialog(false)}>Close</Button>
            <Button onClick={() => { setShowViewDialog(false); openEditDialog(selectedLocation!); }}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Configure Location Dialog */}
      <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
        <DialogContent className="max-w-lg mx-4 sm:mx-auto max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configure {selectedLocation?.name}
            </DialogTitle>
            <DialogDescription>Configure payment and operational settings</DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="general" className="py-4">
            <TabsList className="w-full">
              <TabsTrigger value="general" className="flex-1">General</TabsTrigger>
              <TabsTrigger value="payments" className="flex-1">Payments</TabsTrigger>
            </TabsList>
            <TabsContent value="general" className="space-y-4 mt-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <Label className="text-sm">Active Status</Label>
                  <p className="text-xs text-muted-foreground">Enable or disable this location</p>
                </div>
                <Switch
                  checked={configSettings.is_active}
                  onCheckedChange={(checked) => setConfigSettings({ ...configSettings, is_active: checked })}
                />
              </div>
            </TabsContent>
            <TabsContent value="payments" className="space-y-4 mt-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <Label className="text-sm">Accept Mobile Money</Label>
                  <p className="text-xs text-muted-foreground">M-Pesa, Airtel Money, Tigo Pesa</p>
                </div>
                <Switch
                  checked={configSettings.accept_mobile_money}
                  onCheckedChange={(checked) => setConfigSettings({ ...configSettings, accept_mobile_money: checked })}
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <Label className="text-sm">Accept Bank Transfer</Label>
                  <p className="text-xs text-muted-foreground">Direct bank transfers</p>
                </div>
                <Switch
                  checked={configSettings.accept_bank_transfer}
                  onCheckedChange={(checked) => setConfigSettings({ ...configSettings, accept_bank_transfer: checked })}
                />
              </div>
              <div className="space-y-3 rounded-lg border p-4">
                <h4 className="font-medium text-sm">Payout Account</h4>
                <div className="space-y-2">
                  <Label className="text-xs">Account Name</Label>
                  <Input
                    placeholder="e.g., Mama Lishe Restaurant"
                    value={configSettings.payout_account_name}
                    onChange={(e) => setConfigSettings({ ...configSettings, payout_account_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Bank Name</Label>
                  <Input
                    placeholder="e.g., CRDB Bank"
                    value={configSettings.payout_bank_name}
                    onChange={(e) => setConfigSettings({ ...configSettings, payout_bank_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Account Number</Label>
                  <Input
                    placeholder="e.g., 0150XXXXXXXX"
                    value={configSettings.payout_account_number}
                    onChange={(e) => setConfigSettings({ ...configSettings, payout_account_number: e.target.value })}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfigDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveConfig} disabled={actionLoading}>
              {actionLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : "Save Configuration"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="max-w-sm mx-4 sm:mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Delete Location
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{selectedLocation?.name}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteLocation} disabled={actionLoading}>
              {actionLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Deleting...</> : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Admin Dialog */}
      <Dialog open={showAssignAdminDialog} onOpenChange={setShowAssignAdminDialog}>
        <DialogContent className="max-w-lg mx-4 sm:mx-auto max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Assign Admin to {selectedLocation?.name}
            </DialogTitle>
            <DialogDescription>
              Create a new admin account or assign an existing admin to manage this location.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex gap-2 p-1 bg-muted rounded-lg">
            <Button
              variant={assignMode === "new" ? "default" : "ghost"}
              size="sm"
              className="flex-1"
              onClick={() => setAssignMode("new")}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Create New Admin
            </Button>
            <Button
              variant={assignMode === "existing" ? "default" : "ghost"}
              size="sm"
              className="flex-1"
              onClick={() => setAssignMode("existing")}
            >
              <Shield className="mr-2 h-4 w-4" />
              Assign Existing
            </Button>
          </div>
          
          <div className="space-y-4 py-4">
            {assignMode === "new" ? (
              <>
                <div className="space-y-2">
                  <Label>Full Name <span className="text-destructive">*</span></Label>
                  <Input
                    placeholder="Enter admin's full name"
                    value={newAdminForm.full_name}
                    onChange={(e) => setNewAdminForm({ ...newAdminForm, full_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number <span className="text-destructive">*</span></Label>
                  <Input
                    placeholder="0712345678"
                    value={newAdminForm.phone_number}
                    onChange={(e) => setNewAdminForm({ ...newAdminForm, phone_number: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">Admin will use this to log in</p>
                </div>
                <div className="space-y-2">
                  <Label>Email (Optional)</Label>
                  <Input
                    type="email"
                    placeholder="admin@example.com"
                    value={newAdminForm.email}
                    onChange={(e) => setNewAdminForm({ ...newAdminForm, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Password <span className="text-destructive">*</span></Label>
                  <Input
                    type="password"
                    placeholder="Min 6 characters"
                    value={newAdminForm.password}
                    onChange={(e) => setNewAdminForm({ ...newAdminForm, password: e.target.value })}
                  />
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <Label>Select Admin <span className="text-destructive">*</span></Label>
                <Select value={selectedAdminId} onValueChange={setSelectedAdminId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an admin to assign" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableAdmins.length === 0 ? (
                      <div className="p-2 text-sm text-muted-foreground text-center">
                        No admins available. Create a new one instead.
                      </div>
                    ) : (
                      availableAdmins.map((admin) => (
                        <SelectItem key={admin.id} value={admin.id}>
                          <div className="flex items-center gap-2">
                            <span>{admin.full_name}</span>
                            <span className="text-muted-foreground text-xs">({admin.phone_number})</span>
                            {admin.restaurant_name && (
                              <Badge variant="outline" className="text-xs">
                                {admin.restaurant_name}
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {availableAdmins.length > 0 && selectedAdminId && (
                  <Alert className="mt-2">
                    <AlertDescription className="text-xs">
                      This will reassign the admin to {selectedLocation?.name}. They will manage this location instead.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignAdminDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssignAdmin} disabled={actionLoading}>
              {actionLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Assigning...</>
              ) : (
                <><UserPlus className="mr-2 h-4 w-4" />Assign Admin</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <Card className="border-border/50">
          <CardContent className="p-3 sm:p-4 text-center">
            <p className="text-xl sm:text-2xl font-bold text-primary">{locations.length}</p>
            <p className="text-xs sm:text-sm text-muted-foreground">Total Locations</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3 sm:p-4 text-center">
            <p className="text-xl sm:text-2xl font-bold text-green-600">
              {locations.filter(u => u.is_active).length}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3 sm:p-4 text-center">
            <p className="text-xl sm:text-2xl font-bold text-foreground">
              {locations.reduce((acc, u) => acc + (u.user_count || 0), 0).toLocaleString()}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground">Total Users</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3 sm:p-4 text-center">
            <p className="text-xl sm:text-2xl font-bold text-foreground">
              {new Set(locations.map(l => l.region)).size}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground">Regions</p>
          </CardContent>
        </Card>
      </div>

      {/* Empty State */}
      {filteredLocations.length === 0 && !error && (
        <Card className="border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">No locations found</p>
          </CardContent>
        </Card>
      )}

      {/* Mobile Cards View */}
      {filteredLocations.length > 0 && (
        <div className="lg:hidden space-y-3">
          {filteredLocations.map((loc, index) => (
            <Card key={loc.id || `loc-${index}`} className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                        {loc.code?.substring(0, 3) || loc.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{loc.name}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        {getLocationIcon(loc.location_type)}
                        <span>{LOCATION_TYPE_LABELS[loc.location_type] || loc.location_type}</span>
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openViewDialog(loc)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openAssignAdminDialog(loc)}>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Assign Admin
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => openConfigDialog(loc)}>
                        <Settings className="mr-2 h-4 w-4" />
                        Configure
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openEditDialog(loc)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600" onClick={() => openDeleteConfirm(loc)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate">{loc.area}, {getRegionLabel(loc.region)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Users className="h-3 w-3" />
                    <span>{(loc.user_count || 0).toLocaleString()} users</span>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t">
                  <span className="text-xs text-muted-foreground">Code: {loc.code}</span>
                  <Badge variant={loc.is_active ? "default" : "secondary"} className="text-xs">
                    {loc.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Desktop Table View */}
      {filteredLocations.length > 0 && (
        <Card className="hidden lg:block border-border/50">
          <CardHeader>
            <CardTitle>All Locations</CardTitle>
            <CardDescription>{filteredLocations.length} locations registered</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Location</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead>Users</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLocations.map((loc, index) => (
                  <TableRow key={loc.id || `loc-${index}`}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                            {loc.code?.substring(0, 3) || loc.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{loc.name}</p>
                          <p className="text-sm text-muted-foreground">{loc.code}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getLocationIcon(loc.location_type)}
                        <span className="text-sm">{LOCATION_TYPE_LABELS[loc.location_type] || loc.location_type}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{loc.area}, {getRegionLabel(loc.region)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        {(loc.user_count || 0).toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={loc.is_active ? "default" : "secondary"}>
                        {loc.is_active ? "Active" : "Inactive"}
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
                          <DropdownMenuItem onClick={() => openViewDialog(loc)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openAssignAdminDialog(loc)}>
                            <UserPlus className="mr-2 h-4 w-4" />
                            Assign Admin
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => openConfigDialog(loc)}>
                            <Settings className="mr-2 h-4 w-4" />
                            Configure
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEditDialog(loc)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600" onClick={() => openDeleteConfirm(loc)}>
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
      )}
    </div>
  );
}
