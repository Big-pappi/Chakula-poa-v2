"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbLink, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UserCog, Search, Plus, MoreHorizontal, Eye, Edit, Trash2, Shield, Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { adminAPI } from "@/lib/api/api";
import type { User } from "@/lib/api/api";

export default function AdminStaffPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [staffMembers, setStaffMembers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    password: "",
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await adminAPI.getStaff();
      setStaffMembers(response || []);
    } catch (err: any) {
      console.error("[v0] Failed to fetch staff:", err);
      setError("Failed to load staff members. Please try again.");
      // Demo data for preview
      setStaffMembers([
        { id: "1", full_name: "James Mwakasege", email: "james@canteen.ac.tz", phone_number: "0712111222", role: "staff", is_active: true, cps_number: "CPS#S001", created_at: "2024-01-01" },
        { id: "2", full_name: "Anna Kimaro", email: "anna@canteen.ac.tz", phone_number: "0723222333", role: "staff", is_active: true, cps_number: "CPS#S002", created_at: "2024-01-05" },
      ] as User[]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateStaff = async () => {
    if (!formData.full_name || !formData.phone_number || !formData.password) {
      setError("Full name, phone number, and password are required");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsCreating(true);
    setError(null);
    setSuccess(null);

    try {
      await adminAPI.createStaff({
        full_name: formData.full_name,
        email: formData.email || undefined,
        phone_number: formData.phone_number,
        password: formData.password,
        role: "staff",
      } as any);

      setSuccess("Staff member created successfully. Login credentials have been generated.");
      setFormData({ full_name: "", email: "", phone_number: "", password: "" });
      setShowAddDialog(false);
      fetchStaff();
    } catch (err: any) {
      console.error("[v0] Failed to create staff:", err);
      setError(err.message || "Failed to create staff member. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const filteredStaff = staffMembers.filter((staff) =>
    staff.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.phone_number?.includes(searchTerm) ||
    staff.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              <BreadcrumbPage>Staff</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <main className="flex-1 space-y-6 p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
              <UserCog className="h-6 w-6 sm:h-8 sm:w-8" />
              Staff Management
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">Manage canteen staff members who serve customers</p>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Staff
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Staff Member</DialogTitle>
                <DialogDescription>
                  Create a new staff account. They will be able to scan QR codes and serve customers.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label>Full Name <span className="text-destructive">*</span></Label>
                  <Input
                    placeholder="Enter full name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    placeholder="Enter email (optional)"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number <span className="text-destructive">*</span></Label>
                  <Input
                    placeholder="0712345678"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">Staff will use this phone number to log in</p>
                </div>
                <div className="space-y-2">
                  <Label>Password <span className="text-destructive">*</span></Label>
                  <Input
                    type="password"
                    placeholder="Create password (min 6 characters)"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">Staff can change this after first login</p>
                </div>
                
                <Alert>
                  <AlertDescription className="text-sm">
                    After creation, staff will use their phone number and password to log in at the Staff portal.
                  </AlertDescription>
                </Alert>

                <Button className="w-full" onClick={handleCreateStaff} disabled={isCreating}>
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Staff Account"
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

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle>Staff Members</CardTitle>
                <CardDescription>
                  {isLoading ? "Loading..." : `Total ${filteredStaff.length} staff members`}
                </CardDescription>
              </div>
              <div className="relative w-full sm:w-[300px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search staff..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredStaff.length === 0 ? (
              <div className="text-center py-8">
                <UserCog className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No staff members found</p>
                <Button className="mt-4" onClick={() => setShowAddDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Staff Member
                </Button>
              </div>
            ) : (
              <>
                {/* Mobile Card View */}
                <div className="space-y-4 md:hidden">
                  {filteredStaff.map((staff) => (
                    <Card key={staff.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {staff.full_name?.split(" ").map((n) => n[0]).join("") || "S"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{staff.full_name}</p>
                            <p className="text-sm text-muted-foreground">{staff.phone_number}</p>
                          </div>
                        </div>
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
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Shield className="mr-2 h-4 w-4" />
                              Reset Password
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Deactivate
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                        <code className="bg-muted px-2 py-1 rounded text-xs">{staff.cps_number}</code>
                        <Badge variant={staff.is_active ? "default" : "secondary"} className="text-xs">
                          {staff.is_active ? "Active" : "Inactive"}
                        </Badge>
                        {staff.created_at && (
                          <span className="text-muted-foreground text-xs">
                            Joined {new Date(staff.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Staff Member</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>CPS Number</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStaff.map((staff) => (
                        <TableRow key={staff.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarFallback className="bg-primary/10 text-primary">
                                  {staff.full_name?.split(" ").map((n) => n[0]).join("") || "S"}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{staff.full_name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="text-sm">{staff.phone_number}</p>
                              {staff.email && (
                                <p className="text-xs text-muted-foreground">{staff.email}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <code className="text-sm bg-muted px-2 py-1 rounded">{staff.cps_number}</code>
                          </TableCell>
                          <TableCell>
                            {staff.created_at 
                              ? new Date(staff.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
                              : "-"}
                          </TableCell>
                          <TableCell>
                            <Badge variant={staff.is_active ? "default" : "secondary"}>
                              {staff.is_active ? "Active" : "Inactive"}
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
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Shield className="mr-2 h-4 w-4" />
                                  Reset Password
                                </DropdownMenuItem>
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
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
