"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, UtensilsCrossed, Home, Sparkles, CreditCard, HelpCircle, Info } from "lucide-react";

const navLinks = [
  { label: "Home", href: "/", icon: Home },
  { label: "How It Works", href: "#how-it-works", icon: Info },
  { label: "Features", href: "#features", icon: Sparkles },
  { label: "Pricing", href: "#plans", icon: CreditCard },
  { label: "Help", href: "/help", icon: HelpCircle },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on ESC key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="Chakula Poa"
            width={40}
            height={40}
            className="rounded-lg"
            style={{ width: 40, height: 40 }}
          />
            <span className="text-lg font-bold text-foreground">
              Chakula <span className="text-primary">Poa</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-6 md:flex">
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

          {/* Desktop CTA */}
          <div className="hidden items-center gap-4 md:flex">
            <Button variant="ghost" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Get Started</Link>
            </Button>
          </div>

          {/* Mobile Hamburger */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Open navigation menu"
            onClick={() => setIsOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Backdrop overlay */}
      <div
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Left-side Drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-background shadow-2xl transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="flex h-16 items-center justify-between border-b border-border px-5">
          <Link
            href="/"
            className="flex items-center gap-2"
            onClick={() => setIsOpen(false)}
          >
            <Image
              src="/logo.png"
              alt="Chakula Poa"
              width={36}
              height={36}
              className="rounded-lg"
              style={{ width: 36, height: 36 }}
            />
            <span className="text-base font-bold text-foreground">
              Chakula <span className="text-primary">Poa</span>
            </span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Close navigation menu"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Drawer Nav Links */}
        <nav className="flex flex-col gap-1 px-3 py-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <link.icon className="h-5 w-5 text-primary" />
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Divider */}
        <div className="mx-5 border-t border-border" />

        {/* USSD Badge */}
        <div className="mx-5 mt-4 flex items-center gap-3 rounded-xl bg-primary/10 px-4 py-3">
          <UtensilsCrossed className="h-5 w-5 text-primary shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">USSD Access</p>
            <p className="text-base font-bold text-primary">*148*93#</p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="mt-auto flex flex-col gap-3 px-5 pb-8 pt-4">
          <Button variant="outline" className="w-full" asChild>
            <Link href="/login" onClick={() => setIsOpen(false)}>
              Sign In
            </Link>
          </Button>
          <Button className="w-full" asChild>
            <Link href="/register" onClick={() => setIsOpen(false)}>
              Get Started
            </Link>
          </Button>
        </div>
      </aside>
    </>
  );
}
