"use client";

import React, { useState, useEffect } from "react";
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
import { useAuth } from "@/lib/context/auth-context";
import { Loader2, Mail, Lock, ArrowLeft, Eye, EyeOff, Home, HelpCircle, CreditCard, Info, Sparkles } from "lucide-react";

const navLinks = [
  { label: "Home", href: "/", icon: Home },
  { label: "How It Works", href: "/#how-it-works", icon: Info },
  { label: "Features", href: "/#features", icon: Sparkles },
  { label: "Pricing", href: "/#plans", icon: CreditCard },
  { label: "Help", href: "/help", icon: HelpCircle },
];

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, user } = useAuth();
  const [formData, setFormData] = useState({
    identifier: "", // Can be email or phone
    password: "",
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Redirect after successful login based on role - use useEffect to avoid render-time navigation
  useEffect(() => {
    if (user) {
      switch (user.role) {
        case "super_admin":
          router.push("/super-admin");
          break;
        case "admin":
          router.push("/admin");
          break;
        case "staff":
          router.push("/staff");
          break;
        default:
          router.push("/dashboard");
      }
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.identifier || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    const result = await login({
      identifier: formData.identifier,
      password: formData.password,
    });

    if (!result.success) {
      // TODO: VERIFICATION CHECK
      // If login returns "unverified" status, redirect to verification page:
      // if (result.error === "Account not verified") {
      //   router.push(`/verify?phone=${formData.identifier}`);
      //   return;
      // }
      setError(result.error || "Login failed. Please try again.");
    }
  };

  // Show loading while redirecting
  if (user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="Chakula Poa"
              width={32}
              height={32}
              className="rounded-lg"
              style={{ width: 32, height: 32 }}
            />
            <span className="text-base font-bold text-foreground">
              Chakula <span className="text-primary">Poa</span>
            </span>
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
        {/* Left Panel - Form */}
        <div className="flex w-full flex-col justify-center px-4 py-8 lg:w-1/2 lg:px-8">
          <div className="mx-auto w-full max-w-md">
            {/* Logo - Larger on form */}
            <div className="flex items-center gap-3 mb-2">
              <Image
                src="/logo.png"
                alt="Chakula Poa"
                width={56}
                height={56}
                className="rounded-xl"
                style={{ width: 56, height: 56 }}
              />
              <div>
                <span className="text-xl font-bold text-foreground">
                  Chakula <span className="text-primary">Poa</span>
                </span>
                <p className="text-xs text-muted-foreground">Meal Subscription Platform</p>
              </div>
            </div>

            {/* Form Card */}
            <Card className="mt-6 border-border/50 shadow-xl">
              <CardHeader className="space-y-1 pb-4">
                <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Enter your credentials to access your account
                </CardDescription>
              </CardHeader>

              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-5">
                  {error && (
                    <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
                      {error}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="identifier" className="text-sm font-medium">
                      Email or Phone Number
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="identifier"
                        type="text"
                        placeholder="Enter your email or phone"
                        className="pl-10 h-12"
                        value={formData.identifier}
                        onChange={(e) =>
                          setFormData({ ...formData, identifier: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-sm font-medium">
                        Password
                      </Label>
                      <Link
                        href="/forgot-password"
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        className="pl-10 pr-10 h-12"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
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
                </CardContent>

                <CardFooter className="flex flex-col gap-4 pt-2">
                  <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
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
                    {"Don't have an account? "}
                    <Link href="/register" className="font-semibold text-primary hover:underline">
                      Sign up
                    </Link>
                  </p>
                </CardFooter>
              </form>
            </Card>

            {/* USSD Alternative */}
            <div className="mt-6 rounded-xl border border-primary/20 bg-primary/5 p-4 text-center">
              <p className="text-sm text-muted-foreground">
                No smartphone? Dial{" "}
                <span className="font-bold text-primary">*148*93#</span> to
                access your account via USSD
              </p>
            </div>
          </div>
        </div>

        {/* Right Panel - Image */}
        <div className="relative hidden lg:block lg:w-1/2">
          <Image
            src="/images/hero-food.jpg"
            alt="Delicious meals at Chakula Poa"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/50 to-foreground/20" />
          <div className="absolute bottom-12 left-12 right-12">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/20 px-4 py-2 backdrop-blur-sm">
              <span className="text-sm font-medium text-primary-foreground">Trusted by 15,000+ users across Tanzania</span>
            </div>
            <blockquote className="text-xl font-medium text-background leading-relaxed">
              &ldquo;Chakula Poa makes meal planning so easy. Whether at work or university, 
              I never have to worry about lunch anymore!&rdquo;
            </blockquote>
            <p className="mt-4 text-sm text-background/80">
              — Sarah M., Office Worker, Dar es Salaam
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
