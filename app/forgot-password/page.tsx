"use client";

import React from "react";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
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
import { authAPI } from "@/lib/api/client";
import { Loader2, Mail, ArrowLeft, CheckCircle2, Home, Info, Sparkles, CreditCard, HelpCircle } from "lucide-react";

const navLinks = [
  { label: "Home", href: "/", icon: Home },
  { label: "How It Works", href: "/#how-it-works", icon: Info },
  { label: "Features", href: "/#features", icon: Sparkles },
  { label: "Pricing", href: "/#plans", icon: CreditCard },
  { label: "Help", href: "/help", icon: HelpCircle },
];

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Detect if input is email or phone
  const isEmail = identifier.includes("@");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!identifier) {
      setError("Please enter your email or phone number");
      return;
    }

    setIsLoading(true);
    try {
      // TODO: VERIFICATION FOR PASSWORD RESET
      // The forgotPassword API should:
      // 1. Send OTP via SMS to the phone number OR reset link to email
      // 2. Redirect to /reset-password page with phone/email state
      // 3. User enters OTP + new password on reset page
      // Implementation:
      // - Create /app/reset-password/page.tsx with OTP input and new password fields
      // - Add authAPI.verifyResetCode(identifier, code) and authAPI.resetPassword(identifier, code, newPassword)
      await authAPI.forgotPassword(identifier);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send reset code");
    } finally {
      setIsLoading(false);
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
              {isEmail ? "Check Your Email" : "Check Your Phone"}
            </CardTitle>
            <CardDescription>Password reset instructions sent</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground">
              {isEmail 
                ? "We've sent a password reset link to your email address. Please check your inbox and follow the instructions."
                : "We've sent a password reset code to your phone number. Please check your SMS and follow the instructions."}
            </p>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button asChild className="w-full h-12 font-semibold">
              <Link href="/login">Back to Login</Link>
            </Button>
            <Button
              variant="outline"
              onClick={() => setSuccess(false)}
              className="w-full h-12 font-semibold"
            >
              Try Different {isEmail ? "Email" : "Number"}
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

      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Back Link */}
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </Link>

          {/* Logo */}
          <div className="mt-6 flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Chakula Poa"
              width={48}
              height={48}
              className="rounded-xl"
              style={{ width: 48, height: 48 }}
            />
            <div>
              <span className="text-lg font-bold text-foreground">
                Chakula <span className="text-primary">Poa</span>
              </span>
              <p className="text-xs text-muted-foreground">Password Recovery</p>
            </div>
          </div>

          <Card className="mt-6 border-border/50 shadow-xl">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl font-bold">Forgot Password?</CardTitle>
              <CardDescription className="text-muted-foreground">
                Enter your email or phone number and we will send you a reset code
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
                      placeholder="Enter your email or phone number"
                      className="pl-10 h-12"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {isEmail 
                      ? "We will send a reset link to your email" 
                      : "We will send a reset code via SMS"}
                  </p>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col gap-4 pt-2">
                <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Reset Code"
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
                  Remember your password?{" "}
                  <Link href="/login" className="font-semibold text-primary hover:underline">
                    Sign in
                  </Link>
                </p>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
