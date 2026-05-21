import Link from "next/link";
import Image from "next/image";
import { 
  Info, 
  Sparkles, 
  CreditCard, 
  Building2, 
  HelpCircle, 
  MessageCircle, 
  Phone, 
  FileQuestion,
  Shield,
  FileText,
  RotateCcw,
  Home
} from "lucide-react";

const footerLinks = {
  product: [
    { label: "Home", href: "/", icon: Home },
    { label: "How It Works", href: "#how-it-works", icon: Info },
    { label: "Features", href: "#features", icon: Sparkles },
    { label: "Pricing", href: "#plans", icon: CreditCard },
    { label: "For Restaurants", href: "/contact", icon: Building2 },
  ],
  support: [
    { label: "Help Center", href: "/help", icon: HelpCircle },
    { label: "Contact Us", href: "/contact", icon: MessageCircle },
    { label: "USSD Guide", href: "/ussd-guide", icon: Phone },
    { label: "FAQ", href: "/faq", icon: FileQuestion },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy", icon: Shield },
    { label: "Terms of Service", href: "/terms", icon: FileText },
    { label: "Refund Policy", href: "/refund-policy", icon: RotateCcw },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="Chakula Poa"
                width={65}
                height={65}
                className="rounded-lg"
                style={{ width: 65, height: 65 }}
              />
              <span className="text-lg font-bold text-foreground">
                Chakula <span className="text-primary">Poa</span>
              </span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              University canteen management made simple. Subscribe, pre-order,
              and collect your meals hassle-free.
            </p>
            <div className="mt-4">
              <p className="text-sm font-medium text-foreground">USSD Access</p>
              <p className="text-lg font-bold text-primary">*148*93#</p>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-semibold text-foreground">Product</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="font-semibold text-foreground">Support</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold text-foreground">Legal</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Chakula Poa. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/privacy"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
