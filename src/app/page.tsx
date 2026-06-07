
"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Rocket, 
  Zap, 
  Shield, 
  Globe, 
  Cpu, 
  CheckCircle2, 
  ArrowRight,
  ChevronRight,
  Server as ServerIcon,
  Activity,
  Code2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const pricingTiers = [
  { id: "p1", name: "Entry", ram: "1.5GB", cpu: "100%", disk: "2GB", price: "IDR 10.000", popular: false },
  { id: "p2", name: "Basic", ram: "3GB", cpu: "170%", disk: "5GB", price: "IDR 17.000", popular: false },
  { id: "p3", name: "Pro", ram: "5GB", cpu: "250%", disk: "10GB", price: "IDR 27.000", popular: true },
  { id: "p4", name: "Elite", ram: "7GB", cpu: "340%", disk: "15GB", price: "IDR 30.000", popular: false },
  { id: "p5", name: "Extreme", ram: "10GB", cpu: "Unlimited", disk: "25GB", price: "IDR 35.000", popular: false },
  { id: "p6", name: "Infinite", ram: "Unlimited", cpu: "Unlimited", disk: "Unlimited", price: "IDR 50.000", popular: false },
];

export default function LandingPage() {
  return (
    <div className="bg-background min-h-screen text-foreground selection:bg-primary/20">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-[32px] h-[32px] sm:w-[40px] sm:h-[40px] rounded-lg overflow-hidden flex items-center justify-center">
              <Image src="/img/icon.png" alt="STSCloud" width={40} height={40} className="object-cover" />
            </div>
            <span className="font-headline font-bold text-lg sm:text-xl tracking-tight">
              <span className="text-primary">Cloud</span>
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <Link href="#features" className="hover:text-primary transition-colors">Features</Link>
            <Link href="#pricing" className="hover:text-primary transition-colors">Pricing</Link>
            <Link href="/support" className="hover:text-primary transition-colors">Support</Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/auth?type=login">
              <Button variant="ghost" size="sm" className="text-xs sm:text-sm font-bold">Login</Button>
            </Link>
            <Link href="/auth?type=signup">
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-white font-bold h-8 sm:h-9 px-3 sm:px-5 text-xs sm:text-sm">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[95vh] flex items-center justify-center pt-20 pb-12 overflow-hidden border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-8">
            <div className="animate-fade-in">
              <Badge variant="outline" className="px-3 py-1 sm:px-4 sm:py-1.5 border-primary/20 bg-primary/5 text-primary text-[10px] sm:text-xs font-bold uppercase tracking-widest">
                Next-Gen Infrastructure
              </Badge>
            </div>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-headline font-bold tracking-tight leading-[1.1] animate-fade-in [animation-delay:200ms]">
              Empower Your Projects with <span className="text-primary italic">STSCloud</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto animate-fade-in [animation-delay:400ms]">
              Deploy websites, bots, and complex game nodes on high-performance infrastructure. Scalable, secure, and ready for whatever you build next.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-4 animate-fade-in [animation-delay:600ms]">
              <Link href="/auth?type=signup" className="w-full sm:w-auto">
                <Button size="lg" className="h-12 sm:h-14 px-8 sm:px-10 text-base sm:text-lg font-bold bg-primary hover:bg-primary/90 text-white gap-2 w-full">
                  Start Deploying <ArrowRight className="size-5" />
                </Button>
              </Link>
              <Link href="#pricing" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="h-12 sm:h-14 px-8 sm:px-10 text-base sm:text-lg font-bold border-border/50 hover:bg-secondary/50 w-full">
                  View Pricing
                </Button>
              </Link>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 pt-8 sm:pt-12 opacity-50 animate-fade-in [animation-delay:800ms]">
              <div className="flex flex-col items-center">
                <span className="text-xl sm:text-2xl font-bold font-headline">99.9%</span>
                <span className="text-[9px] sm:text-[10px] uppercase tracking-widest font-bold">Uptime Guaranteed</span>
              </div>
              <div className="hidden sm:block h-8 w-px bg-border" />
              <div className="flex flex-col items-center">
                <span className="text-xl sm:text-2xl font-bold font-headline">24/7</span>
                <span className="text-[9px] sm:text-[10px] uppercase tracking-widest font-bold">Expert Support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats/Logos */}
      <section className="py-10 sm:py-12 border-b border-border/50 bg-secondary/10 overflow-x-auto whitespace-nowrap">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-8 md:gap-24 grayscale opacity-60">
          <div className="flex items-center gap-2 font-headline font-bold text-base sm:text-xl"><Zap className="size-5 sm:size-6 text-primary" /> Lightning Fast</div>
          <div className="flex items-center gap-2 font-headline font-bold text-base sm:text-xl"><Shield className="size-5 sm:size-6 text-primary" /> DDoS Protected</div>
          <div className="flex items-center gap-2 font-headline font-bold text-base sm:text-xl"><Globe className="size-5 sm:size-6 text-primary" /> Global Edge</div>
          <div className="flex items-center gap-2 font-headline font-bold text-base sm:text-xl"><Cpu className="size-5 sm:size-6 text-primary" /> Intel Core i9</div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 sm:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-12 sm:mb-20">
            <h2 className="text-3xl md:text-5xl font-headline font-bold">Built for Creators</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base">
              Everything you need to manage and scale your digital applications in one unified platform.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <FeatureCard 
              icon={Activity} 
              title="Real-time Metrics" 
              description="Monitor CPU, RAM, and Disk usage with live-updating charts and precise analytics."
            />
            <FeatureCard 
              icon={Code2} 
              title="Multi-Runtime" 
              description="Optimized support for Node.js, Python, PHP, and high-performance game binaries."
            />
            <FeatureCard 
              icon={ServerIcon} 
              title="Instant Deploy" 
              description="From configuration to production in under 60 seconds. Our automated nodes handle the rest."
            />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-16 sm:py-24 bg-secondary/10 border-t border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-12 sm:mb-20">
            <h2 className="text-3xl md:text-5xl font-headline font-bold">Simple, Fair Pricing</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base">
              Transparent tiers designed to grow with your project. No hidden fees.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pricingTiers.map((tier) => (
              <Card key={tier.id} className={cn(
                "border-border/50 bg-card transition-all duration-300 hover:-translate-y-1 relative overflow-hidden",
                tier.popular && "border-primary/50 ring-1 ring-primary/20"
              )}>
                {tier.popular && (
                  <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-bl-lg">
                    Most Popular
                  </div>
                )}
                <CardHeader className="space-y-1">
                  <CardTitle className="font-headline font-bold text-xl">{tier.name}</CardTitle>
                  <CardDescription className="text-sm font-medium">Resources for {tier.name.toLowerCase()} apps</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl sm:text-3xl font-headline font-bold text-primary">{tier.price}</span>
                    <span className="text-muted-foreground text-[10px] sm:text-xs uppercase font-bold">/ month</span>
                  </div>
                  
                  <div className="space-y-3 py-6 border-y border-border/50">
                    <PricingItem label="RAM" value={tier.ram} />
                    <PricingItem label="CPU" value={tier.cpu} />
                    <PricingItem label="SSD Disk" value={tier.disk} />
                    <PricingItem label="DDoS Protection" value="Included" />
                    <PricingItem label="Automatic Backups" value="Daily" />
                  </div>

                  <Link href="/auth?type=signup" className="block">
                    <Button className={cn(
                      "w-full h-11 sm:h-12 font-bold gap-2 text-sm",
                      tier.popular ? "bg-primary hover:bg-primary/90 text-white" : "bg-secondary hover:bg-secondary/80 text-foreground border border-border/50"
                    )}>
                      Choose {tier.name} <ChevronRight className="size-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 sm:py-20 bg-background border-t border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 sm:gap-12">
            <div className="col-span-1 md:col-span-2 space-y-6">
              <div className="flex items-center gap-2">
                <div className="w-[40px] h-[40px] rounded-lg overflow-hidden flex items-center justify-center">
                  <Image src="/img/icon.png" alt="STSCloud" width={40} height={40} className="object-cover" />
                </div>
                <span className="text-primary font-headline font-bold text-xl tracking-tight">Cloud</span>
              </div>
              <p className="text-muted-foreground max-w-sm leading-relaxed text-sm">
                Premium cloud infrastructure designed for high-performance applications and high-traffic projects.
              </p>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-headline font-bold text-xs sm:text-sm uppercase tracking-widest text-primary">Product</h4>
              <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground font-medium">
                <li><Link href="#features" className="hover:text-primary transition-colors">Features</Link></li>
                <li><Link href="#pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
                <li><Link href="/deploy" className="hover:text-primary transition-colors">Deployment</Link></li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-headline font-bold text-xs sm:text-sm uppercase tracking-widest text-primary">Company</h4>
              <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground font-medium">
                <li><Link href="/support" className="hover:text-primary transition-colors">Support</Link></li>
                <li><Link href="/auth?type=login" className="hover:text-primary transition-colors">Login</Link></li>
                <li><Link href="/auth?type=signup" className="hover:text-primary transition-colors">Register</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 sm:pt-12 mt-8 sm:mt-12 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[10px] sm:text-xs text-muted-foreground text-center">
              © {new Date().getFullYear()} STSCloud Infrastructure. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 grayscale opacity-40">
              <Badge variant="outline" className="border-none text-[9px] sm:text-[10px] font-bold uppercase tracking-widest">PCI-DSS Compliant</Badge>
              <Badge variant="outline" className="border-none text-[9px] sm:text-[10px] font-bold uppercase tracking-widest">256-bit AES</Badge>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <Card className="border-border/50 bg-secondary/5 hover:bg-secondary/10 transition-all duration-300 group">
      <CardContent className="p-6 sm:p-8 space-y-4">
        <div className="size-10 sm:size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
          <Icon className="size-5 sm:size-6" />
        </div>
        <h3 className="font-headline font-bold text-lg sm:text-xl">{title}</h3>
        <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

function PricingItem({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex items-center justify-between text-xs sm:text-sm">
      <div className="flex items-center gap-2 text-muted-foreground">
        <CheckCircle2 className="size-3.5 sm:size-4 text-primary" />
        <span>{label}</span>
      </div>
      <span className="font-bold">{value}</span>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
