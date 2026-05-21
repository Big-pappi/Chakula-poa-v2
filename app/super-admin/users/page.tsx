"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { 
  Users, Search, Plus, MoreHorizontal, Eye, Edit, Trash2, UserCog, 
  Building2, Loader2, AlertTriangle, CheckCircle2, RefreshCw, Key,
  Shield, UserPlus, Phone, Mail, Calendar, MapPin, UserX, UserCheck
} from "lucide-react";
import { superAdmin, restaurants as restaurantsAPI } from "@/lib/api/endpoints";
import type { User, Restaurant } from "@/lib/types";
import { TANZANIA_REGIONS, getRegionLabel } from "@/lib/types";

export default function SuperAdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [regionFilter, setRegionFilter] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showResetPasswordDialog, setShowResetPasswordDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  const [users, setUsers] = useState<User[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [newUserForm, setNewUserForm] = useState({
    full_name: "",
    phone_number: "",
    email: "",
    role: "admin" as "admin" | "staff" | "user",
    restaurant_id: "",
    password: "",
  });

  const [editUserForm, setEditUserForm] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
    email: "",
    role: "user" as string,
    restaurant_id: "",
    is_active: true,
  });

  const [resetPasswordForm, setResetPasswordForm] = useState({
    new_password: "",
  });

  useEffect(() => {
    fetchData();
  }, [roleFilter, regionFilter]);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params: { role?: string; region?: string } = {};
      if (roleFilter !== "all") params.role = roleFilter;
      if (regionFilter !== "all") params.region = regionFilter;

      const [usersRes, restaurantsRes] = await Promise.all([
        superAdmin.getAllUsers(params),
        restaurantsAPI.getAll(),
      ]);
      
      if (usersRes.data && Array.isArray(usersRes.data)) {
        setUsers(usersRes.data);
      } else if (usersRes.error) {
        setError(usersRes.error);
        setUsers([]);
      }
      
      if (restaurantsRes.data && Array.isArray(restaurantsRes.data)) {
        setRestaurants(restaurantsRes.data);
      }
    } catch (err: unknown) {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      setError(`Unable to connect to backend. Please ensure Django is running at ${apiUrl}`);
      setUsers([]);
      setRestaurants([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async () => {
    if (!newUserForm.full_name || !newUserForm.phone_number || !newUserForm.password) {
      setError("Full name, phone number, and password are required");
      return;
    }

    if (newUserForm.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      if (newUserForm.role === "admin") {
        if (!newUserForm.restaurant_id) {
          setError("Please select a restaurant for the admin");
          setIsCreating(false);
          return;
        }
        const response = await superAdmin.createAdmin({
          full_name: newUserForm.full_name,
          phone_number: newUserForm.phone_number,
          email: newUserForm.email || undefined,
          password: newUserForm.password,
          restaurant_id: newUserForm.restaurant_id,
        });
        if (response.error) {
          setError(response.error);
          setIsCreating(false);
          return;
        }
      } else {
        setError("Only admin creation is supported currently. For staff, use the Admin portal.");
        setIsCreating(false);
        return;
      }

      setSuccess(`${newUserForm.role.charAt(0).toUpperCase() + newUserForm.role.slice(1)} account created successfully. They can log in using phone: ${newUserForm.phone_number}`);
      setNewUserForm({
        full_name: "",
        phone_number: "",
        email: "",
        role: "admin",
        restaurant_id: "",
        password: "",
      });
      setShowAddDialog(false);
      fetchData();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create user";
      setError(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditUser = async () => {
    if (!selectedUser) return;
    if (!editUserForm.first_name || !editUserForm.phone_number) {
      setError("First name and phone number are required");
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const full_name = `${editUserForm.first_name} ${editUserForm.last_name}`.trim();
      
      const response = await superAdmin.updateUser(selectedUser.id, {
        full_name,
        phone_number: editUserForm.phone_number,
        email: editUserForm.email || undefined,
        is_active: editUserForm.is_active,
        restaurant_id: editUserForm.restaurant_id || undefined,
      });

      if (response.error) {
        setError(response.error);
        setIsCreating(false);
        return;
      }

      setSuccess(`User "${full_name}" updated successfully!`);
      setShowEditDialog(false);
      setSelectedUser(null);
      fetchData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update user";
      setError(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeactivateUser = async () => {
    if (!selectedUser) return;

    setIsCreating(true);
    setError(null);

    try {
      const newStatus = !selectedUser.is_active;
      const response = await superAdmin.updateUser(selectedUser.id, {
        is_active: newStatus,
      });

      if (response.error) {
        setError(response.error);
        setIsCreating(false);
        return;
      }

      setSuccess(`User "${selectedUser.full_name}" has been ${newStatus ? "activated" : "deactivated"} successfully!`);
      setShowDeactivateDialog(false);
      setSelectedUser(null);
      fetchData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update user status";
      setError(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  const handleResetPassword = async () => {
    if (!selectedUser) return;
    if (!resetPasswordForm.new_password || resetPasswordForm.new_password.length < 6) {
      setError("New password must be at least 6 characters");
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const response = await superAdmin.resetUserPassword(selectedUser.id, resetPasswordForm.new_password);
      if (response.error) {
        setError(response.error);
        setIsCreating(false);
        return;
      }
      setSuccess(`Password reset for ${selectedUser.full_name}. New password has been set. Phone: ${selectedUser.phone_number}`);
      setResetPasswordForm({ new_password: "" });
      setShowResetPasswordDialog(false);
      setSelectedUser(null);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to reset password";
      setError(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    // Split full_name into first_name and last_name
    const nameParts = (user.full_name || "").split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";
    setEditUserForm({
      first_name: firstName,
      last_name: lastName,
      phone_number: user.phone_number,
      email: user.email || "",
      role: user.role,
      restaurant_id: user.restaurant_id || "",
      is_active: user.is_active,
    });
    setShowEditDialog(true);
  };

  const openViewDialog = (user: User) => {
    setSelectedUser(user);
    setShowViewDialog(true);
  };

  const openDeactivateDialog = (user: User) => {
    setSelectedUser(user);
    setShowDeactivateDialog(true);
  };

  const openResetPasswordDialog = (user: User) => {
    setSelectedUser(user);
    setResetPasswordForm({ new_password: "" });
    setShowResetPasswordDialog(true);
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.cps_number?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Group users by role for stats
  const usersByRole = {
    super_admin: users.filter(u => u.role === "super_admin" || u.role === "developer").length,
    admin: users.filter(u => u.role === "admin").length,
    staff: users.filter(u => u.role === "staff").length,
    user: users.filter(u => u.role === "user").length,
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "super_admin":
      case "developer":
        return <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 text-xs">Super Admin</Badge>;
      case "admin":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs">Admin</Badge>;
      case "staff":
        return <Badge variant="secondary" className="text-xs">Staff</Badge>;
      case "user":
        return <Badge variant="outline" className="text-xs">Customer</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{role}</Badge>;
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "??";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground flex items-center gap-2">
          <UserCog className="h-6 w-6 sm:h-8 sm:w-8" />
          System Users
        </h1>
        <p className="mt-1 text-sm sm:text-base text-muted-foreground">
          Manage all users across the platform - admins, staff, and customers
        </p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <Alert className="mb-4 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-700 dark:text-green-300">{success}</AlertDescription>
        </Alert>
      )}
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, phone, or CPS number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="super_admin">Super Admin</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="staff">Staff</SelectItem>
              <SelectItem value="user">Customer</SelectItem>
            </SelectContent>
          </Select>
          <Select value={regionFilter} onValueChange={setRegionFilter}>
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue placeholder="Region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              {TANZANIA_REGIONS.map((region) => (
                <SelectItem key={region.value} value={region.value}>{region.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={fetchData} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="whitespace-nowrap">
                <Plus className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Add User</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Create New User
                </DialogTitle>
                <DialogDescription>
                  Create a new admin account. Staff accounts should be created by restaurant admins.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Full Name <span className="text-destructive">*</span></Label>
                  <Input 
                    placeholder="Enter full name" 
                    value={newUserForm.full_name}
                    onChange={(e) => setNewUserForm({ ...newUserForm, full_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number <span className="text-destructive">*</span></Label>
                  <Input 
                    placeholder="0712345678"
                    value={newUserForm.phone_number}
                    onChange={(e) => setNewUserForm({ ...newUserForm, phone_number: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">User will log in with this phone number</p>
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input 
                    type="email" 
                    placeholder="user@example.com"
                    value={newUserForm.email}
                    onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Role <span className="text-destructive">*</span></Label>
                  <Select 
                    value={newUserForm.role} 
                    onValueChange={(value: "admin" | "staff" | "user") => setNewUserForm({ ...newUserForm, role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-blue-600" />
                          Admin (Restaurant Manager)
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {newUserForm.role === "admin" && (
                  <div className="space-y-2">
                    <Label>Restaurant <span className="text-destructive">*</span></Label>
                    <Select 
                      value={newUserForm.restaurant_id}
                      onValueChange={(value) => setNewUserForm({ ...newUserForm, restaurant_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select restaurant" />
                      </SelectTrigger>
                      <SelectContent>
                        {restaurants.map((restaurant) => (
                          <SelectItem key={restaurant.id} value={restaurant.id}>
                            {restaurant.name} ({restaurant.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Password <span className="text-destructive">*</span></Label>
                  <Input 
                    type="password" 
                    placeholder="Min 6 characters"
                    value={newUserForm.password}
                    onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                  />
                </div>
                <Alert>
                  <AlertDescription className="text-sm">
                    After creation, the user will receive login credentials via SMS/email (future feature). 
                    For now, share the phone number and password manually.
                  </AlertDescription>
                </Alert>
                <Button className="w-full" onClick={handleCreateUser} disabled={isCreating}>
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create User"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Edit User Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Edit User
            </DialogTitle>
            <DialogDescription>
              Update details for {selectedUser?.full_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name <span className="text-destructive">*</span></Label>
                <Input 
                  placeholder="Enter first name" 
                  value={editUserForm.first_name}
                  onChange={(e) => setEditUserForm({ ...editUserForm, first_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input 
                  placeholder="Enter last name" 
                  value={editUserForm.last_name}
                  onChange={(e) => setEditUserForm({ ...editUserForm, last_name: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Phone Number <span className="text-destructive">*</span></Label>
              <Input 
                placeholder="0712345678"
                value={editUserForm.phone_number}
                onChange={(e) => setEditUserForm({ ...editUserForm, phone_number: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input 
                type="email" 
                placeholder="user@example.com"
                value={editUserForm.email}
                onChange={(e) => setEditUserForm({ ...editUserForm, email: e.target.value })}
              />
            </div>
            {(editUserForm.role === "admin" || editUserForm.role === "staff") && (
              <div className="space-y-2">
                <Label>Restaurant</Label>
                <Select 
                  value={editUserForm.restaurant_id}
                  onValueChange={(value) => setEditUserForm({ ...editUserForm, restaurant_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select restaurant" />
                  </SelectTrigger>
                  <SelectContent>
                    {restaurants.map((restaurant) => (
                      <SelectItem key={restaurant.id} value={restaurant.id}>
                        {restaurant.name} ({restaurant.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <Label className="text-sm">Active Status</Label>
                <p className="text-xs text-muted-foreground">Enable or disable user account</p>
              </div>
              <Switch
                checked={editUserForm.is_active}
                onCheckedChange={(checked) => setEditUserForm({ ...editUserForm, is_active: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancel</Button>
            <Button onClick={handleEditUser} disabled={isCreating}>
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View User Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              User Profile
            </DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6 py-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-primary/10 text-primary text-lg">
                    {getInitials(selectedUser.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{selectedUser.full_name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {getRoleBadge(selectedUser.role)}
                    <Badge variant={selectedUser.is_active ? "default" : "secondary"}>
                      {selectedUser.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="rounded-lg border p-3 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedUser.phone_number}</span>
                  </div>
                  {selectedUser.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedUser.email}</span>
                    </div>
                  )}
                  {selectedUser.cps_number && (
                    <div className="flex items-center gap-2 text-sm">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <span className="font-mono">{selectedUser.cps_number}</span>
                    </div>
                  )}
                </div>

                {selectedUser.restaurant_name && (
                  <div className="rounded-lg border p-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedUser.restaurant_name}</span>
                    </div>
                  </div>
                )}

                {selectedUser.region && (
                  <div className="rounded-lg border p-3">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{getRegionLabel(selectedUser.region)}</span>
                    </div>
                  </div>
                )}

                {selectedUser.created_at && (
                  <div className="rounded-lg border p-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Joined {new Date(selectedUser.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewDialog(false)}>Close</Button>
            <Button onClick={() => { setShowViewDialog(false); openEditDialog(selectedUser!); }}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deactivate/Activate User Dialog */}
      <Dialog open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedUser?.is_active ? (
                <>
                  <UserX className="h-5 w-5 text-destructive" />
                  Deactivate User
                </>
              ) : (
                <>
                  <UserCheck className="h-5 w-5 text-green-600" />
                  Activate User
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {selectedUser?.is_active
                ? `Are you sure you want to deactivate ${selectedUser?.full_name}? They will not be able to log in.`
                : `Are you sure you want to activate ${selectedUser?.full_name}? They will be able to log in again.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowDeactivateDialog(false)}>Cancel</Button>
            <Button
              variant={selectedUser?.is_active ? "destructive" : "default"}
              onClick={handleDeactivateUser}
              disabled={isCreating}
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : selectedUser?.is_active ? (
                "Deactivate"
              ) : (
                "Activate"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={showResetPasswordDialog} onOpenChange={setShowResetPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Reset Password
            </DialogTitle>
            <DialogDescription>
              Reset password for <strong>{selectedUser?.full_name}</strong> ({selectedUser?.phone_number})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>New Password <span className="text-destructive">*</span></Label>
              <Input
                type="password"
                placeholder="Enter new password (min 6 characters)"
                value={resetPasswordForm.new_password}
                onChange={(e) => setResetPasswordForm({ new_password: e.target.value })}
              />
            </div>
            <Alert>
              <AlertDescription className="text-sm">
                The user will need to use this new password to log in. 
                Consider sending them the new password via SMS or email.
              </AlertDescription>
            </Alert>
            <Button className="w-full" onClick={handleResetPassword} disabled={isCreating}>
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting...
                </>
              ) : (
                "Reset Password"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <Card className="border-border/50">
          <CardContent className="p-3 sm:p-4 text-center">
            <p className="text-xl sm:text-2xl font-bold text-primary">{users.length}</p>
            <p className="text-xs sm:text-sm text-muted-foreground">Total Users</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3 sm:p-4 text-center">
            <p className="text-xl sm:text-2xl font-bold text-purple-600">{usersByRole.super_admin}</p>
            <p className="text-xs sm:text-sm text-muted-foreground">Super Admins</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3 sm:p-4 text-center">
            <p className="text-xl sm:text-2xl font-bold text-blue-600">{usersByRole.admin}</p>
            <p className="text-xs sm:text-sm text-muted-foreground">Admins</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3 sm:p-4 text-center">
            <p className="text-xl sm:text-2xl font-bold text-green-600">{usersByRole.staff + usersByRole.user}</p>
            <p className="text-xs sm:text-sm text-muted-foreground">Staff & Customers</p>
          </CardContent>
        </Card>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredUsers.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No users found</p>
            <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filters</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Mobile Cards View */}
          <div className="lg:hidden space-y-3">
            {filteredUsers.map((user) => (
              <Card key={user.id} className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {getInitials(user.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">{user.full_name}</p>
                        <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {user.phone_number}
                        </p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openViewDialog(user)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEditDialog(user)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openResetPasswordDialog(user)}>
                          <Key className="mr-2 h-4 w-4" />
                          Reset Password
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className={user.is_active ? "text-destructive" : "text-green-600"}
                          onClick={() => openDeactivateDialog(user)}
                        >
                          {user.is_active ? (
                            <>
                              <UserX className="mr-2 h-4 w-4" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <UserCheck className="mr-2 h-4 w-4" />
                              Activate
                            </>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap mb-3">
                    {getRoleBadge(user.role)}
                    {user.restaurant_name && (
                      <Badge variant="outline" className="text-xs">
                        <Building2 className="mr-1 h-3 w-3" />
                        {user.restaurant_name}
                      </Badge>
                    )}
                    {user.cps_number && (
                      <Badge variant="outline" className="text-xs font-mono">
                        {user.cps_number}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t">
                    <span className="text-xs text-muted-foreground">
                      {user.email || "No email"}
                    </span>
                    <Badge variant={user.is_active ? "default" : "secondary"} className="text-xs">
                      {user.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Desktop Table View */}
          <Card className="hidden lg:block border-border/50">
            <CardHeader>
              <CardTitle>All Users</CardTitle>
              <CardDescription>{filteredUsers.length} users found</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Restaurant</TableHead>
                    <TableHead>CPS Number</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {getInitials(user.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.full_name}</p>
                            <p className="text-sm text-muted-foreground">{user.email || "No email"}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{user.phone_number}</TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>
                        {user.restaurant_name ? (
                          <div className="flex items-center gap-1">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span>{user.restaurant_name}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {user.cps_number ? (
                          <span className="font-mono text-sm">{user.cps_number}</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.is_active ? "default" : "secondary"}>
                          {user.is_active ? "Active" : "Inactive"}
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
                            <DropdownMenuItem onClick={() => openViewDialog(user)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEditDialog(user)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openResetPasswordDialog(user)}>
                              <Key className="mr-2 h-4 w-4" />
                              Reset Password
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className={user.is_active ? "text-destructive" : "text-green-600"}
                              onClick={() => openDeactivateDialog(user)}
                            >
                              {user.is_active ? (
                                <>
                                  <UserX className="mr-2 h-4 w-4" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <UserCheck className="mr-2 h-4 w-4" />
                                  Activate
                                </>
                              )}
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
