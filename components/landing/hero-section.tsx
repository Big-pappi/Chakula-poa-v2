import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Smartphone, QrCode, Clock, MapPin, Utensils, Users } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-background">
      {/* Background Pattern */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,hsl(var(--muted))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--muted))_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      
      <div className="container mx-auto px-4 py-16 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Content */}
          <div className="flex flex-col items-start">
            {/* <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              Serving 31 Regions Across Tanzania
            </div> */}
            
            <h1 className="mt-6 text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Your Daily Meals,{" "}
              <span className="text-primary">Simplified</span>
            </h1>
            
            <p className="mt-6 max-w-xl text-pretty text-lg text-muted-foreground">
              Subscribe to meal plans at restaurants, universities, markets, offices, 
              and more. Collect your food instantly using your daily CPS code or QR code. 
              No queues, no cash, no waste.
            </p>
            
            {/* Quick Stats */}
            <div className="mt-8 grid grid-cols-2 gap-4 sm:flex sm:flex-wrap sm:gap-6">
              <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-card p-3 sm:border-0 sm:bg-transparent sm:p-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Utensils className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">3 Meals/Day</p>
                  <p className="text-xs text-muted-foreground">Tea, Lunch, Evening</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-card p-3 sm:border-0 sm:bg-transparent sm:p-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <QrCode className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">QR + CPS Code</p>
                  <p className="text-xs text-muted-foreground">Instant verification</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-card p-3 sm:border-0 sm:bg-transparent sm:p-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">500+ Locations</p>
                  <p className="text-xs text-muted-foreground">All regions covered</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-card p-3 sm:border-0 sm:bg-transparent sm:p-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Smartphone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">USSD Access</p>
                  <p className="text-xs text-muted-foreground">Any phone works</p>
                </div>
              </div>
            </div>
            
            {/* CTA Buttons */}
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Button size="lg" asChild>
                <Link href="/register">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#how-it-works">See How It Works</Link>
              </Button>
            </div>
            
            {/* Trust Indicators */}
            <div className="mt-6 flex items-center gap-4">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-primary/10 text-xs font-semibold text-primary"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">15,000+</span> users across Tanzania
              </p>
            </div>
          </div>
          
          {/* Hero Image */}
          <div className="relative">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted shadow-2xl ring-1 ring-border/10">
              <Image
                src="/images/hero-students.jpg"
                alt="People enjoying meals at food service locations"
                fill
                className="object-cover"
                priority
              />
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
            
            {/* Floating Card - Food Waste Stats */}
            <div className="absolute -bottom-4 left-4 right-4 rounded-xl border border-border bg-card/95 p-4 shadow-xl backdrop-blur-sm sm:-bottom-6 sm:-left-6 sm:right-auto">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <span className="text-lg font-bold">40%</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Less Food Waste</p>
                  <p className="text-xs text-muted-foreground">Demand-based preparation</p>
                </div>
              </div>
            </div>
            
            {/* CPS Code Badge */}
            <div className="absolute -right-2 top-4 rounded-xl border border-border bg-card/95 p-3 shadow-xl backdrop-blur-sm sm:-right-4 sm:top-8">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  CPS
                </div>
                <div>
                  <span className="text-sm font-bold text-foreground">#9796</span>
                  <p className="text-[10px] text-muted-foreground">Daily Code</p>
                </div>
              </div>
            </div>
            
            {/* Location Types Badge */}
            <div className="absolute -left-2 top-4 hidden rounded-xl border border-border bg-card/95 px-3 py-2 shadow-xl backdrop-blur-sm sm:-left-4 sm:top-8 sm:block">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs font-semibold text-foreground">All Location Types</p>
                  <p className="text-[10px] text-muted-foreground">Restaurants, Markets, Offices</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
