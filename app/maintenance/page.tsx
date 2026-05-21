"use client";

import Link from "next/link";
import { Wrench, Clock, Mail, Phone, Shield } from "lucide-react";
import { useSystemSettings } from "@/lib/hooks/use-system-settings";
import { Button } from "@/components/ui/button";

export default function MaintenancePage() {
  const { settings } = useSystemSettings();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center">
        {/* Icon */}
        <div className="mx-auto mb-8 relative">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Wrench className="w-12 h-12 text-primary animate-pulse" />
          </div>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
            Maintenance
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
          {settings.system_name || "Chakula Poa"} is Under Maintenance
        </h1>

        {/* Description */}
        <p className="text-muted-foreground text-base sm:text-lg mb-8 leading-relaxed">
          We&apos;re currently performing scheduled maintenance to improve your experience. 
          The system will be back online shortly.
        </p>

        {/* Estimated Time */}
        <div className="inline-flex items-center gap-2 bg-muted/50 rounded-full px-4 py-2 mb-8">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Estimated downtime: 30 minutes - 1 hour
          </span>
        </div>

        {/* Contact Info */}
        <div className="bg-card border border-border rounded-xl p-6 mb-8">
          <h3 className="text-sm font-semibold text-foreground mb-4">
            Need Urgent Assistance?
          </h3>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a 
              href={`mailto:${settings.support_email || "support@chakulapoa.co.tz"}`}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <Mail className="w-4 h-4" />
              {settings.support_email || "support@chakulapoa.co.tz"}
            </a>
            <a 
              href="tel:+255620636893"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <Phone className="w-4 h-4" />
              +255 620 636 893
            </a>
          </div>
        </div>

        {/* Refresh Button */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button 
            variant="outline" 
            className="bg-transparent"
            onClick={() => window.location.reload()}
          >
            Check Again
          </Button>
          
          {/* Super Admin Login Link */}
          <Button variant="ghost" size="sm" asChild className="text-muted-foreground">
            <Link href="/login" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Admin Login
            </Link>
          </Button>
        </div>

        {/* Footer */}
        <p className="mt-8 text-xs text-muted-foreground">
          Thank you for your patience. We apologize for any inconvenience.
        </p>
      </div>
    </div>
  );
}
