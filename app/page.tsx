"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMaintenanceMode } from "@/lib/hooks/use-system-settings";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { PlansSection } from "@/components/landing/plans-section";
import { CTASection } from "@/components/landing/cta-section";

export default function Home() {
  const { isMaintenanceMode, isLoading } = useMaintenanceMode();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isMaintenanceMode) {
      router.push("/maintenance");
    }
  }, [isMaintenanceMode, isLoading, router]);

  // Show loading state while checking
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // If in maintenance mode, don't render (redirect will happen)
  if (isMaintenanceMode) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <PlansSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
