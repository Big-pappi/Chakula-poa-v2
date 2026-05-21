import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, AlertCircle, Clock, Mail, Phone } from "lucide-react";

export default function RefundPolicyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-muted/30 py-12 lg:py-16">
          <div className="container mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground mb-4">
              <Clock className="h-4 w-4" />
              Last updated: January 2026
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              Refund Policy
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              We want you to be satisfied with our service. Here is our clear and transparent refund policy.
            </p>
          </div>
        </section>

        {/* Quick Reference */}
        <section className="py-10 lg:py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-center text-xl font-semibold text-foreground mb-6">Quick Reference Guide</h2>
            <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
              <Card className="border-green-500/30 bg-green-50/50 dark:bg-green-950/30 overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50">
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <CardTitle className="text-base font-semibold text-green-800 dark:text-green-200">
                      Full Refund Eligible
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-2 text-sm text-green-700 dark:text-green-300">
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green-500" />
                      Technical errors causing double payment
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green-500" />
                      Service unavailable at your location
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green-500" />
                      Account created in error (within 24 hours)
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/30 overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/50">
                      <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <CardTitle className="text-base font-semibold text-amber-800 dark:text-amber-200">
                      Partial Refund
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-2 text-sm text-amber-700 dark:text-amber-300">
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                      Unused meals (pro-rated calculation)
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                      Location withdrawal (with proof)
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                      Medical emergencies (with documentation)
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-red-500/30 bg-red-50/50 dark:bg-red-950/30 overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50">
                      <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                    </div>
                    <CardTitle className="text-base font-semibold text-red-800 dark:text-red-200">
                      Not Eligible
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-2 text-sm text-red-700 dark:text-red-300">
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                      Meals already ordered or consumed
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                      Change of mind after 7 days
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                      Account violations or fraud
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="border-t border-border py-10 lg:py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl space-y-10">
              {/* Section 1 */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">1</span>
                  <h2 className="text-xl font-semibold text-foreground">Overview</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed pl-11">
                  At Chakula Poa, we strive to provide reliable meal subscription services to all users across Tanzania. This Refund Policy outlines the conditions under which refunds may be granted for subscription payments.
                </p>
              </div>

              {/* Section 2 */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">2</span>
                  <h2 className="text-xl font-semibold text-foreground">Refund Eligibility</h2>
                </div>
                <div className="pl-11 space-y-6">
                  <div className="rounded-lg border border-border bg-card p-4">
                    <h3 className="font-semibold text-foreground mb-3">2.1 Full Refund</h3>
                    <p className="text-sm text-muted-foreground mb-3">You may be eligible for a full refund in the following cases:</p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 mt-0.5 text-green-500 shrink-0" />
                        <span><strong className="text-foreground">Technical Errors:</strong> Multiple charges for the same subscription due to a system error.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 mt-0.5 text-green-500 shrink-0" />
                        <span><strong className="text-foreground">Service Unavailability:</strong> Chakula Poa services not available at your location at purchase time.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 mt-0.5 text-green-500 shrink-0" />
                        <span><strong className="text-foreground">Account Error:</strong> Accidental account creation within 24 hours without service use.</span>
                      </li>
                    </ul>
                  </div>

                  <div className="rounded-lg border border-border bg-card p-4">
                    <h3 className="font-semibold text-foreground mb-3">2.2 Partial Refund (Pro-rated)</h3>
                    <p className="text-sm text-muted-foreground mb-3">You may be eligible for a partial refund based on unused meal credits:</p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 mt-0.5 text-amber-500 shrink-0" />
                        <span><strong className="text-foreground">Location Withdrawal:</strong> Withdrawal with official documentation for unused meals.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 mt-0.5 text-amber-500 shrink-0" />
                        <span><strong className="text-foreground">Medical Emergency:</strong> Extended illness or hospitalization with medical documentation.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 mt-0.5 text-amber-500 shrink-0" />
                        <span><strong className="text-foreground">Relocation:</strong> Transfer to a location where Chakula Poa is not available.</span>
                      </li>
                    </ul>
                  </div>

                  <div className="rounded-lg border border-border bg-card p-4">
                    <h3 className="font-semibold text-foreground mb-3">2.3 Non-Refundable</h3>
                    <p className="text-sm text-muted-foreground mb-3">Refunds will NOT be granted for:</p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <XCircle className="h-4 w-4 mt-0.5 text-red-500 shrink-0" />
                        <span>Meals that have been ordered or served</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <XCircle className="h-4 w-4 mt-0.5 text-red-500 shrink-0" />
                        <span>Meals not collected due to user absence</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <XCircle className="h-4 w-4 mt-0.5 text-red-500 shrink-0" />
                        <span>Change of mind after 7 days of subscription</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <XCircle className="h-4 w-4 mt-0.5 text-red-500 shrink-0" />
                        <span>Accounts terminated due to policy violations</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <XCircle className="h-4 w-4 mt-0.5 text-red-500 shrink-0" />
                        <span>Promotional or discounted subscriptions (unless otherwise stated)</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Section 3 */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">3</span>
                  <h2 className="text-xl font-semibold text-foreground">Refund Request Process</h2>
                </div>
                <div className="pl-11 space-y-6">
                  <div className="rounded-lg border border-border bg-card p-4">
                    <h3 className="font-semibold text-foreground mb-3">3.1 How to Request</h3>
                    <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                      <li>Contact our support team via email at support-team@chakulapoa.co.tz</li>
                      <li>Include your CPS number and phone number</li>
                      <li>Provide the transaction reference/receipt</li>
                      <li>Explain the reason for your refund request</li>
                      <li>Attach any supporting documentation (if applicable)</li>
                    </ol>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-lg border border-border bg-card p-4">
                      <h3 className="font-semibold text-foreground mb-2">3.2 Processing Time</h3>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>Review: 3-5 business days</li>
                        <li>Processing: 7-14 business days</li>
                        <li>Method: Original payment (M-Pesa, Airtel Money, Bank)</li>
                      </ul>
                    </div>
                    <div className="rounded-lg border border-border bg-card p-4">
                      <h3 className="font-semibold text-foreground mb-2">3.3 Refund Calculation</h3>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>Original subscription amount</li>
                        <li>Meals already used or ordered</li>
                        <li>Processing fee (max TSh 5,000)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 4 */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">4</span>
                  <h2 className="text-xl font-semibold text-foreground">Cancellation Policy</h2>
                </div>
                <div className="pl-11 rounded-lg border border-border bg-card p-4 space-y-4">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">4.1 Cancellation Window</h3>
                    <p className="text-sm text-muted-foreground">
                      You may cancel your subscription within 7 days of purchase for a full refund, provided no meals have been ordered or consumed.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">4.2 How to Cancel</h3>
                    <p className="text-sm text-muted-foreground">
                      Contact support with your CPS number and reason for cancellation. Note that cancellation does not automatically trigger a refund; you must separately request one.
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 5 */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">5</span>
                  <h2 className="text-xl font-semibold text-foreground">Disputes</h2>
                </div>
                <div className="pl-11 rounded-lg border border-border bg-card p-4">
                  <p className="text-sm text-muted-foreground mb-3">If you disagree with a refund decision:</p>
                  <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                    <li>Request a review by emailing appeals@chakulapoa.co.tz</li>
                    <li>Provide additional documentation supporting your case</li>
                    <li>Our team will review and respond within 10 business days</li>
                  </ol>
                </div>
              </div>

              {/* Section 6 */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">6</span>
                  <h2 className="text-xl font-semibold text-foreground">Special Circumstances</h2>
                </div>
                <div className="pl-11 rounded-lg border border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/30 p-4">
                  <p className="text-sm text-muted-foreground mb-3">We evaluate refund requests on a case-by-case basis for:</p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 mt-0.5 text-amber-500 shrink-0" />
                      Natural disasters affecting operations
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 mt-0.5 text-amber-500 shrink-0" />
                      Location closures or strikes
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 mt-0.5 text-amber-500 shrink-0" />
                      Pandemic-related disruptions
                    </li>
                  </ul>
                  <p className="text-sm text-muted-foreground mt-3">
                    Special policies will be communicated via SMS and our website.
                  </p>
                </div>
              </div>

              {/* Section 7 - Contact */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">7</span>
                  <h2 className="text-xl font-semibold text-foreground">Contact Us</h2>
                </div>
                <div className="pl-11 grid gap-4 sm:grid-cols-2">
                  <Card className="border-border">
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <Mail className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">Email Support</p>
                        <p className="text-sm text-muted-foreground">support-team@chakulapoa.co.tz</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-border">
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <Phone className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">Phone Support</p>
                        <p className="text-sm text-muted-foreground">+255 620 636 893</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <p className="pl-11 text-sm text-muted-foreground">
                  Response time: Within 24-48 hours
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-border bg-muted/30 py-10 lg:py-12">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-xl font-bold text-foreground">
                Need to Request a Refund?
              </h2>
              <p className="mt-2 text-muted-foreground">
                Our support team is ready to assist you with any refund inquiries.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button asChild>
                  <Link href="/contact">Contact Support</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/faq">View FAQ</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
