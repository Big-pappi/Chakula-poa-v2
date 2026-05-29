"use client";

import React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/lib/context/auth-context";
import { restaurants as restaurantsAPI } from "@/lib/api/endpoints";
import type { Restaurant } from "@/lib/types";
import { LOCATION_TYPE_LABELS, TANZANIA_REGIONS, getRegionLabel } from "@/lib/types";
import {
  Loader2,
  Phone,
  Lock,
  User,
  Mail,
  GraduationCap,
  Eye,
  EyeOff,
  CheckCircle2,
  MapPin,
  Building2,
  Home,
  Info,
  Sparkles,
  CreditCard,
  HelpCircle,
} from "lucide-react";

const navLinks = [
  { label: "Home", href: "/", icon: Home },
  { label: "How It Works", href: "/#how-it-works", icon: Info },
  { label: "Features", href: "/#features", icon: Sparkles },
  { label: "Pricing", href: "/#plans", icon: CreditCard },
  { label: "Help", href: "/help", icon: HelpCircle },
];

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading } = useAuth();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loadingRestaurants, setLoadingRestaurants] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
    email: "",
    registration_number: "",
    restaurant_id: "",
    region: "",
    password: "",
    confirm_password: "",
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState<boolean>(false);

  const [restaurantError, setRestaurantError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await restaurantsAPI.getAll();
        if (response.data && Array.isArray(response.data)) {
          setRestaurants(response.data);
          setRestaurantError(null);
        } else if (response.error) {
          setRestaurantError(response.error);
          setRestaurants([]);
        } else {
          setRestaurantError("No restaurants available. Please try again later.");
          setRestaurants([]);
        }
      } catch (err) {
        setRestaurantError("Unable to connect to server. Please ensure the backend is running at " + (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"));
        setRestaurants([]);
      } finally {
        setLoadingRestaurants(false);
      }
    };
    fetchRestaurants();
  }, []);

  // Filter restaurants by selected region (backend uses underscored values like 'dar_es_salaam')
  const filteredRestaurants = selectedRegion 
    ? restaurants.filter(r => r.region === selectedRegion || r.region?.toLowerCase().replace(/ /g, '_') === selectedRegion)
    : restaurants;

  // Get selected restaurant to show location type
  const selectedRestaurant = restaurants.find(r => r.id === formData.restaurant_id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation - all main fields are required
    if (!formData.first_name.trim()) {
      setError("First name is required");
      return;
    }

    if (!formData.last_name.trim()) {
      setError("Last name is required");
      return;
    }

    if (!formData.phone_number.trim()) {
      setError("Phone number is required");
      return;
    }

    // Validate phone number format (Tanzania numbers)
    const phoneRegex = /^(\+?255|0)?[67]\d{8}$/;
    if (!phoneRegex.test(formData.phone_number.replace(/\s/g, ""))) {
      setError("Please enter a valid Tanzanian phone number");
      return;
    }

    if (!formData.email.trim()) {
      setError("Email is required");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (!selectedRegion) {
      setError("Please select your region");
      return;
    }

    if (!formData.restaurant_id) {
      setError("Please select a restaurant");
      return;
    }

    if (!formData.password) {
      setError("Password is required");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match");
      return;
    }

    const result = await register({
      first_name: formData.first_name,
      last_name: formData.last_name,
      phone_number: formData.phone_number,
      email: formData.email,
      registration_number: formData.registration_number || undefined,
      restaurant_id: formData.restaurant_id,
      region: selectedRegion,
      password: formData.password,
    });

    if (result.success) {
      // Registration successful - redirect to subscription page
      setSuccess(true);
    } else {
      setError(result.error || "Registration failed. Please try again.");
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md border-border/50 shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold">
              Registration Successful!
            </CardTitle>
            <CardDescription>Welcome to Chakula Poa</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4 text-muted-foreground">
              Your account has been created successfully. You can now subscribe to a meal plan to start enjoying meals.
            </p>
            <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 p-4 text-left mb-4">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-1">Next Step:</p>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Subscribe to a meal plan to get your CPS Number and daily QR code for meal verification. Without a subscription, you cannot collect meals.
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              A confirmation SMS has been sent to your phone number.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button
              onClick={() => router.push("/dashboard/subscriptions")}
              className="h-11 w-full font-semibold"
            >
              Choose a Subscription Plan
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard")}
              className="h-11 w-full font-semibold"
            >
              Go to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.png"
              alt="Chakula Poa"
              width={44}
              height={44}
              className="rounded-lg h-10 w-10 object-contain"
            />
          </Link>
          <nav className="hidden items-center gap-4 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
          </nav>
          <Button variant="outline" size="sm" asChild className="md:hidden">
            <Link href="/">
              <Home className="mr-1.5 h-4 w-4" />
              Home
            </Link>
          </Button>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Left Panel - Image */}
        <div className="relative hidden lg:block lg:w-1/2">
          <Image
            src="/images/meals-preview.jpg"
            alt="Delicious meals"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/50 to-foreground/20" />
          <div className="absolute bottom-12 left-12 right-12">
            <h2 className="mb-4 text-3xl font-bold text-background">
              Join 15,000+ Users Across Tanzania
            </h2>
            <ul className="space-y-3 text-background/90">
              <li className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>Available at universities, markets, offices & more</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>Affordable meal plans starting from TSh 14,000/week</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>Pay easily with M-Pesa, Airtel Money or TigoPesa</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>Daily QR codes for secure meal verification</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="flex w-full flex-col justify-center px-4 py-6 lg:w-1/2 lg:px-8">
          <div className="mx-auto w-full max-w-md">
            {/* Logo - Centered */}
            <div className="flex flex-col items-center justify-center mb-4">
              <Image
                src="/logo.png"
                alt="Chakula Poa"
                width={72}
                height={72}
                className="rounded-xl h-18 w-18 object-contain"
              />
              <p className="mt-2 text-sm text-muted-foreground">Meal Subscription Platform</p>
            </div>

            {/* Form Card */}
            <Card className="mt-4 border-border/50 shadow-xl">
              <CardHeader className="space-y-1 pb-3">
                <CardTitle className="text-xl font-bold">
                  Create an account
                </CardTitle>
                <CardDescription className="text-muted-foreground text-sm">
                  Sign up to start enjoying delicious meals across Tanzania
                </CardDescription>
              </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                {error && (
                  <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    {error}
                  </div>
                )}

                {/* First Name */}
                <div className="space-y-2">
                  <Label htmlFor="first_name" className="text-sm font-medium">
                    First Name <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="first_name"
                      type="text"
                      placeholder="Philip"
                      className="h-11 pl-10"
                      value={formData.first_name}
                      onChange={(e) =>
                        setFormData({ ...formData, first_name: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                {/* Last Name */}
                <div className="space-y-2">
                  <Label htmlFor="last_name" className="text-sm font-medium">
                    Last Name <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="last_name"
                      type="text"
                      placeholder="Steven"
                      className="h-11 pl-10"
                      value={formData.last_name}
                      onChange={(e) =>
                        setFormData({ ...formData, last_name: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium">
                    Phone Number <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="0620 636 893"
                      className="h-11 pl-10"
                      value={formData.phone_number}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          phone_number: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="chedybreezy@gmail.com"
                      className="h-11 pl-10"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                {/* Region */}
                <div className="space-y-2">
                  <Label htmlFor="region" className="text-sm font-medium">
                    Region <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={selectedRegion}
                    onValueChange={(value) => {
                      setSelectedRegion(value);
                      setFormData({ ...formData, restaurant_id: "" });
                    }}
                  >
                    <SelectTrigger className="h-11">
                      <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                      <SelectValue placeholder="Select your region" />
                    </SelectTrigger>
                    <SelectContent>
                      {TANZANIA_REGIONS.map((region) => (
                        <SelectItem key={region.value} value={region.value}>
                          {region.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Restaurant Selection */}
                <div className="space-y-2">
                  <Label htmlFor="restaurant" className="text-sm font-medium">
                    Restaurant <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.restaurant_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, restaurant_id: value })
                    }
                    disabled={loadingRestaurants || !selectedRegion}
                  >
                    <SelectTrigger className="h-11">
                      <Building2 className="mr-2 h-4 w-4 text-muted-foreground" />
                      <SelectValue placeholder={
                        loadingRestaurants 
                          ? "Loading restaurants..." 
                          : !selectedRegion 
                            ? "Select a region first" 
                            : "Select your preferred restaurant"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredRestaurants.length === 0 ? (
                        <SelectItem value="none" disabled>
                          {selectedRegion ? "No restaurants in this region" : "Select a region first"}
                        </SelectItem>
                      ) : (
                        filteredRestaurants.map((restaurant) => (
                          <SelectItem key={restaurant.id} value={restaurant.id}>
                            <div className="flex items-center gap-2">
                              <span>{restaurant.name}</span>
                              <span className="text-xs text-muted-foreground">
                                ({LOCATION_TYPE_LABELS[restaurant.location_type]})
                              </span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {selectedRestaurant && (
                    <p className="text-xs text-muted-foreground">
                      {LOCATION_TYPE_LABELS[selectedRestaurant.location_type]} in {selectedRestaurant.area}, {getRegionLabel(selectedRestaurant.region)}
                    </p>
                  )}
                  {restaurantError && (
                    <p className="text-xs text-destructive">
                      {restaurantError}
                    </p>
                  )}
                </div>

                {/* Registration Number - only show for university locations */}
                {selectedRestaurant?.location_type === "university" && (
                  <div className="space-y-2">
                    <Label htmlFor="reg_number" className="text-sm font-medium">
                      Registration/ID Number{" "}
                      <span className="text-muted-foreground">(For university users)</span>
                    </Label>
                    <div className="relative">
                      <GraduationCap className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="reg_number"
                        type="text"
                        placeholder="BCS/18869/2101/DT"
                        className="h-11 pl-10"
                        value={formData.registration_number}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            registration_number: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                )}

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      className="h-11 pl-10 pr-10"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label
                    htmlFor="confirm_password"
                    className="text-sm font-medium"
                  >
                    Confirm Password <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="confirm_password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      className="h-11 pl-10 pr-10"
                      value={formData.confirm_password}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          confirm_password: e.target.value,
                        })
                      }
                      required
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col gap-4 pt-2">
                <Button
                  type="submit"
                  className="h-12 w-full text-base font-semibold"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>

                <div className="relative w-full">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">or</span>
                  </div>
                </div>

                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="font-semibold text-primary hover:underline"
                  >
                    Sign in
                  </Link>
                </p>
              </CardFooter>
            </form>
          </Card>

          {/* Terms */}
          <p className="mt-4 text-center text-xs text-muted-foreground">
            By creating an account, you agree to our{" "}
            <Link href="/terms" className="text-primary hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </p>
          </div>
        </div>
      </div>
    </div>
  );
}
