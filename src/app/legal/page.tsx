
"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  ShieldCheck, 
  Scale, 
  FileText, 
  Lock, 
  Globe, 
  CheckCircle2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function LegalPage() {
  const router = useRouter();

  return (
    <div className="bg-background min-h-screen text-foreground selection:bg-primary/20">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()}
              className="text-muted-foreground hover:text-foreground transition-colors p-2 hover:bg-secondary/50 rounded-lg"
            >
              <ArrowLeft className="size-5" />
            </button>
            <Link href="/" className="flex items-center gap-2">
              <div className="w-[32px] h-[32px] rounded-lg overflow-hidden flex items-center justify-center">
                <Image src="/img/icon.png" alt="STSCloud" width={32} height={32} className="object-cover" />
              </div>
              <span className="font-headline font-bold text-lg tracking-tight">
                <span className="text-primary">Legal</span>
              </span>
            </Link>
          </div>
          <Link href="/auth?type=signup">
            <Button variant="outline" size="sm" className="font-bold uppercase tracking-widest text-[10px]">Back to Signup</Button>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto pt-32 pb-20 px-4">
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl md:text-5xl font-headline font-bold">Legal Agreement</h1>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm md:text-base">
            Please review our Terms of Service and Privacy Policy carefully before using STSCloud Infrastructure.
          </p>
        </div>

        <Tabs defaultValue="terms" className="w-full space-y-8">
          <TabsList className="grid w-full grid-cols-2 bg-secondary/30 p-1 rounded-xl h-14 border border-border/50">
            <TabsTrigger value="terms" className="rounded-lg gap-2 text-sm font-bold data-[state=active]:bg-primary data-[state=active]:text-white">
              <Scale className="size-4" /> Terms of Service
            </TabsTrigger>
            <TabsTrigger value="privacy" className="rounded-lg gap-2 text-sm font-bold data-[state=active]:bg-primary data-[state=active]:text-white">
              <Lock className="size-4" /> Privacy Policy
            </TabsTrigger>
          </TabsList>

          <TabsContent value="terms" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="border-border/50 bg-card overflow-hidden">
              <CardHeader className="bg-secondary/20 p-8 border-b border-border/50">
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="size-5 text-primary" />
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Revised October 2023</span>
                </div>
                <CardTitle className="font-headline text-2xl">Terms of Service</CardTitle>
                <CardDescription>Rules and guidelines for using the STSCloud platform.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[600px] p-8">
                  <div className="space-y-8 text-sm md:text-base leading-relaxed text-muted-foreground">
                    <section className="space-y-4">
                      <h3 className="text-foreground font-headline font-bold text-xl flex items-center gap-2">
                        <CheckCircle2 className="size-5 text-primary" /> 1. Acceptance of Terms
                      </h3>
                      <p>
                        By accessing or using the services provided by STSCloud ("we," "us," or "our"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
                      </p>
                    </section>

                    <section className="space-y-4">
                      <h3 className="text-foreground font-headline font-bold text-xl flex items-center gap-2">
                        <CheckCircle2 className="size-5 text-primary" /> 2. Service Description
                      </h3>
                      <p>
                        STSCloud provides cloud infrastructure, including but not limited to virtual private servers, game node hosting, and automated bot deployment tools. We reserve the right to modify or discontinue any service at our discretion.
                      </p>
                    </section>

                    <section className="space-y-4">
                      <h3 className="text-foreground font-headline font-bold text-xl flex items-center gap-2">
                        <CheckCircle2 className="size-5 text-primary" /> 3. User Responsibility
                      </h3>
                      <p>
                        You are responsible for maintaining the security of your account and all activities that occur under your account. You agree not to use the service for any illegal or unauthorized purpose, including but not limited to:
                      </p>
                      <ul className="list-disc pl-6 space-y-2">
                        <li>DDoS attacks or network interference</li>
                        <li>Hosting malware or malicious scripts</li>
                        <li>Copyright infringement</li>
                        <li>Unsolicited commercial emailing (Spam)</li>
                      </ul>
                    </section>

                    <section className="space-y-4">
                      <h3 className="text-foreground font-headline font-bold text-xl flex items-center gap-2">
                        <CheckCircle2 className="size-5 text-primary" /> 4. Payments and Refunds
                      </h3>
                      <p>
                        All payments are processed through SValePay or other integrated providers. Due to the nature of digital provisioning, refunds are generally not provided once an instance has been deployed, except where required by law.
                      </p>
                    </section>

                    <section className="space-y-4">
                      <h3 className="text-foreground font-headline font-bold text-xl flex items-center gap-2">
                        <CheckCircle2 className="size-5 text-primary" /> 5. Termination
                      </h3>
                      <p>
                        We reserve the right to suspend or terminate your account without notice if you violate any of these terms. Upon termination, all your data on our servers will be permanently deleted.
                      </p>
                    </section>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="border-border/50 bg-card overflow-hidden">
              <CardHeader className="bg-secondary/20 p-8 border-b border-border/50">
                <div className="flex items-center gap-3 mb-2">
                  <ShieldCheck className="size-5 text-primary" />
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Updated October 2023</span>
                </div>
                <CardTitle className="font-headline text-2xl">Privacy Policy</CardTitle>
                <CardDescription>How we collect, use, and protect your data.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[600px] p-8">
                  <div className="space-y-8 text-sm md:text-base leading-relaxed text-muted-foreground">
                    <section className="space-y-4">
                      <h3 className="text-foreground font-headline font-bold text-xl flex items-center gap-2">
                        <Globe className="size-5 text-primary" /> 1. Data Collection
                      </h3>
                      <p>
                        We collect information you provide directly to us, such as your name, email address, and payment information. We also collect technical data including IP addresses, browser types, and usage metrics to improve our infrastructure.
                      </p>
                    </section>

                    <section className="space-y-4">
                      <h3 className="text-foreground font-headline font-bold text-xl flex items-center gap-2">
                        <Globe className="size-5 text-primary" /> 2. Use of Information
                      </h3>
                      <p>
                        Your data is used solely to provide and improve STSCloud services, process transactions, and communicate with you about your account and security updates.
                      </p>
                    </section>

                    <section className="space-y-4">
                      <h3 className="text-foreground font-headline font-bold text-xl flex items-center gap-2">
                        <Globe className="size-5 text-primary" /> 3. Data Protection
                      </h3>
                      <p>
                        We implement industry-standard security measures including 256-bit AES encryption and firewalls to protect your data. However, no method of transmission over the internet is 100% secure.
                      </p>
                    </section>

                    <section className="space-y-4">
                      <h3 className="text-foreground font-headline font-bold text-xl flex items-center gap-2">
                        <Globe className="size-5 text-primary" /> 4. Third-Party Services
                      </h3>
                      <p>
                        We use Firebase for authentication and database services, and SValePay for payment processing. These third parties have their own privacy policies governing how they handle your data.
                      </p>
                    </section>

                    <section className="space-y-4">
                      <h3 className="text-foreground font-headline font-bold text-xl flex items-center gap-2">
                        <Globe className="size-5 text-primary" /> 5. Your Rights
                      </h3>
                      <p>
                        You have the right to access, update, or delete your personal information at any time through your account dashboard or by contacting our support team.
                      </p>
                    </section>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <footer className="mt-12 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} STSCloud Infrastructure. All rights reserved.
        </footer>
      </main>
    </div>
  );
}
