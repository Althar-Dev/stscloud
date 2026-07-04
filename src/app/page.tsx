
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
  Code2,
  Terminal,
  Layers,
  BarChart3,
  Cloud,
  Headset
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Lottie from "lottie-react";

const pricingTiers = [
  { id: "p1", name: "Entry", ram: "1.5GB", cpu: "100%", disk: "2GB", price: "IDR 10.000", popular: false },
  { id: "p2", name: "Basic", ram: "3GB", cpu: "170%", disk: "5GB", price: "IDR 17.000", popular: false },
  { id: "p3", name: "Pro", ram: "5GB", cpu: "250%", disk: "10GB", price: "IDR 27.000", popular: true },
  { id: "p4", name: "Elite", ram: "7GB", cpu: "340%", disk: "15GB", price: "IDR 30.000", popular: false },
  { id: "p5", name: "Extreme", ram: "10GB", cpu: "Unlimited", disk: "25GB", price: "IDR 35.000", popular: false },
  { id: "p6", name: "Infinite", ram: "Unlimited", cpu: "Unlimited", disk: "Unlimited", price: "IDR 50.000", popular: false },
];

export default function LandingPage() {
  const [planetJson, setPlanetJson] = React.useState<any>(null);

  React.useEffect(() => {
    const loadLottie = async () => {
      try {
        const res = await fetch("/lottie/planet.json");
        const contentType = res.headers.get("content-type");
        if (res.ok && contentType && contentType.includes("application/json")) {
          const data = await res.json();
          setPlanetJson(data);
        } else {
          console.warn("Lottie data not found or invalid format at /lottie/planet.json");
        }
      } catch (err) {
        // Fail silently to prevent crashing
      }
    };
    loadLottie();
  }, []);

  return (
    <div className="bg-background min-h-screen text-foreground selection:bg-primary/20 overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-border/50 bg-background/80 backdrop-blur-md h-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="w-[32px] h-[32px] sm:w-[36px] sm:h-[36px] rounded-lg overflow-hidden flex items-center justify-center transition-transform group-hover:scale-110">
              <Image src="/img/icon.png" alt="STSCloud" width={36} height={36} className="object-cover" />
            </div>
            <span className="font-headline font-bold text-lg sm:text-xl tracking-tight">
              <span className="text-primary">Cloud</span>
            </span>
          </div>
          
          <div className="hidden lg:flex items-center gap-8 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">
            <Link href="#features" className="hover:text-primary transition-colors">Features</Link>
            <Link href="#infrastructure" className="hover:text-primary transition-colors">Nodes</Link>
            <Link href="#pricing" className="hover:text-primary transition-colors">Pricing</Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/auth?type=login">
              <Button variant="ghost" size="sm" className="text-[10px] font-bold uppercase tracking-widest px-4">Login</Button>
            </Link>
            <Link href="/auth?type=signup">
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-white font-bold h-9 px-5 text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20">
                Deploy Now
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen lg:h-screen flex flex-col items-center justify-center pt-16 overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.03),transparent_50%)]" />
        
        {/* Mobile Lottie Background */}
        <div className="lg:hidden absolute inset-0 z-0 flex items-center justify-center opacity-60 pointer-events-none overflow-hidden">
          <div className="w-[200%] max-w-none transform scale-110">
            {planetJson && <Lottie animationData={planetJson} loop={true} />}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full flex flex-col lg:flex-row items-center justify-center lg:justify-between flex-1 gap-8">
          <div className="max-w-2xl lg:text-left text-center space-y-6 animate-fade-in z-10">
            <div className="flex justify-center lg:justify-start">
              <Badge variant="outline" className="px-3 py-1 border-primary/20 bg-primary/5 text-primary text-[9px] font-bold uppercase tracking-[0.2em]">
                <Cloud className="size-3 mr-2 animate-pulse" /> STSCloud
              </Badge>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-headline font-bold tracking-tighter leading-[1.1] [animation-delay:200ms]">
              The Next Generation <br className="hidden md:block" /> <span className="text-primary italic">Cloud Hosting</span> Platform.
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed max-w-xl lg:mx-0 mx-auto font-medium [animation-delay:400ms] px-4 lg:px-0">
              STSCloud delivers high performance; deploy complex bots and web applications in under 60 seconds. Powered by local edge infrastructure.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-4 [animation-delay:600ms] px-6 lg:px-0">
              <Link href="/auth?type=signup" className="w-full sm:w-auto">
                <Button size="lg" className="h-10 md:h-11 px-8 text-[10px] font-bold bg-primary hover:bg-primary/90 text-white gap-2 w-full shadow-xl shadow-primary/20 group uppercase tracking-widest">
                  Start Provisioning <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="#pricing" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="h-10 md:h-11 px-8 text-[10px] font-bold border-border/50 bg-secondary/20 hover:bg-secondary/40 w-full backdrop-blur-sm uppercase tracking-widest">
                  View Benchmarks
                </Button>
              </Link>
            </div>
          </div>

          {/* Desktop Lottie Right Side */}
          <div className="hidden lg:flex flex-1 items-center justify-center max-w-lg z-10 animate-fade-in [animation-delay:400ms]">
            <div className="w-full">
              {planetJson && <Lottie animationData={planetJson} loop={true} />}
            </div>
          </div>
        </div>

        {/* Animated Scroll Indicator */}
        <div className="relative pb-8 opacity-20 hidden md:block animate-bounce">
          <ChevronRight className="size-5 rotate-90 text-primary" />
        </div>
      </section>

      {/* Trust & Stats */}
      <section className="py-8 md:py-12 border-b border-border/50 bg-secondary/10">
        <div className="max-w-7xl mx-auto px-4 overflow-hidden">
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-16 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-700">
            <div className="flex items-center gap-2 font-headline font-bold text-[10px] sm:text-xs uppercase tracking-widest transition-colors hover:text-primary">
              <Rocket className="size-4 text-primary" /> INSTANT DEPLOYMENT
            </div>
            <div className="flex items-center gap-2 font-headline font-bold text-[10px] sm:text-xs uppercase tracking-widest transition-colors hover:text-primary">
              <Activity className="size-4 text-primary" /> 99.9% UPTIME
            </div>
            <div className="flex items-center gap-2 font-headline font-bold text-[10px] sm:text-xs uppercase tracking-widest transition-colors hover:text-primary">
              <Shield className="size-4 text-primary" /> DDOS MITIGATION
            </div>
            <div className="flex items-center gap-2 font-headline font-bold text-[10px] sm:text-xs uppercase tracking-widest transition-colors hover:text-primary">
              <Headset className="size-4 text-primary" /> 24/7 SUPPORT
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 sm:py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-16 px-1">
            <div className="space-y-4 max-w-xl">
              <Badge variant="outline" className="border-primary/20 text-primary uppercase font-bold tracking-widest px-2 py-0.5 text-[9px] w-fit">Infrastructure</Badge>
              <h2 className="text-3xl md:text-5xl font-headline font-bold leading-tight">Engineered for <br /> Peak Performance</h2>
            </div>
            <p className="text-muted-foreground text-xs sm:text-sm max-w-sm font-medium leading-relaxed pb-1">
              Our platform abstracts complex DevOps into a single, beautiful dashboard designed for humans. No more manual configuration.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <FeatureCard 
              icon={Terminal} 
              title="Real-time Execution" 
              description="Access real-time process logs with ANSI color support and instant command execution via our web-terminal."
              color="text-primary"
            />
            <FeatureCard 
              icon={BarChart3} 
              title="Advanced Analytics" 
              description="Monitor CPU, RAM, and Disk metrics with sub-second precision. Get alerts before bottlenecks occur."
              color="text-accent"
            />
            <FeatureCard 
              icon={Layers} 
              title="Sub-folder Isolation" 
              description="Every server gets a dedicated, isolated file system. Upload, zip, and manage files with our intuitive explorer."
              color="text-orange-400"
            />
          </div>
        </div>
      </section>

      {/* Infrastructure Section */}
      <section id="infrastructure" className="py-20 bg-secondary/5 border-y border-border/50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-12">
          <div className="space-y-3">
            <h3 className="text-2xl md:text-4xl font-headline font-bold">Global Provisioning</h3>
            <p className="text-muted-foreground text-xs sm:text-sm max-w-lg mx-auto font-medium">Nodes deployed across major internet hubs for 99.9% uptime and low latency.</p>
          </div>
          <div className="relative group max-w-4xl mx-auto rounded-2xl overflow-hidden border border-border/50 shadow-[0_0_40px_rgba(99,102,241,0.08)] transition-all duration-700 hover:scale-[1.01]">
            <Image 
              src="https://picsum.photos/seed/stscloud-map/1200/600" 
              alt="Global Map" 
              width={1200} 
              height={600} 
              className="object-cover opacity-60 grayscale group-hover:grayscale-0 transition-all duration-700" 
              data-ai-hint="world map"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
              <div className="size-16 md:size-24 rounded-full bg-primary/20 flex items-center justify-center animate-ping absolute" />
              <div className="size-8 md:size-12 rounded-full bg-primary flex items-center justify-center relative shadow-2xl">
                <Globe className="size-4 md:size-6 text-white" />
              </div>
              <Badge className="mt-4 bg-primary text-white font-bold uppercase tracking-[0.2em] px-3 py-0.5 text-[9px]">Active Node SG-01</Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-16 px-4">
            <Badge variant="outline" className="border-primary/20 text-primary uppercase font-bold tracking-widest px-2 py-0.5 text-[9px]">Fair Pricing</Badge>
            <h2 className="text-3xl md:text-5xl font-headline font-bold">Scale Your Potential</h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-xs sm:text-sm font-medium">
              Choose the perfect tier for your application. No hidden costs. Pay only for what you need.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {pricingTiers.map((tier) => (
              <Card key={tier.id} className={cn(
                "border-border/50 bg-card/50 backdrop-blur-md transition-all duration-500 hover:border-primary/50 hover:-translate-y-2 relative overflow-hidden group flex flex-col h-full",
                tier.popular && "border-primary/50 ring-1 ring-primary/20 bg-primary/[0.01] scale-[1.03] z-10"
              )}>
                {tier.popular && (
                  <div className="absolute top-0 right-0 bg-primary text-white text-[8px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 rounded-bl-xl shadow-lg">
                    Recommended
                  </div>
                )}
                <CardHeader className="space-y-1.5 p-6 md:p-8">
                  <div className={cn(
                    "size-10 rounded-xl bg-secondary mb-3 flex items-center justify-center group-hover:scale-110 transition-transform duration-500",
                    tier.popular ? "text-primary" : "text-muted-foreground"
                  )}>
                    <ServerIcon className="size-5" />
                  </div>
                  <CardTitle className="font-headline font-bold text-xl md:text-2xl">{tier.name}</CardTitle>
                  <CardDescription className="text-[9px] uppercase font-bold tracking-[0.3em] opacity-60">Provision Tier</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 p-6 md:p-8 pt-0 flex-1">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl md:text-3xl font-headline font-bold text-primary">{tier.price}</span>
                    <span className="text-muted-foreground text-[8px] uppercase font-bold tracking-widest">/mo</span>
                  </div>
                  
                  <div className="space-y-3.5 py-6 border-y border-border/50">
                    <PricingItem label="Memory" value={tier.ram} />
                    <PricingItem label="Compute" value={tier.cpu} />
                    <PricingItem label="SSD RAID" value={tier.disk} />
                    <PricingItem label="DDoS Shield" value="Included" />
                    <PricingItem label="Daily Snap" value="Enabled" />
                  </div>

                  <Link href="/auth?type=signup" className="block w-full pt-2">
                    <Button className={cn(
                      "w-full h-11 font-bold gap-2 text-[10px] uppercase tracking-widest transition-all duration-300",
                      tier.popular ? "bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20" : "bg-secondary hover:bg-secondary/80 text-foreground border border-border/50"
                    )}>
                      Select {tier.name} <ChevronRight className="size-3" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-background border-t border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 md:gap-8">
            <div className="col-span-1 md:col-span-2 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-[32px] h-[32px] rounded-lg overflow-hidden flex items-center justify-center bg-primary/10">
                  <Image src="/img/icon.png" alt="STSCloud" width={24} height={24} className="object-cover" />
                </div>
                <span className="text-primary font-headline font-bold text-xl tracking-tight">Cloud</span>
              </div>
              <p className="text-muted-foreground max-w-xs leading-relaxed text-xs sm:text-sm font-medium">
                Premier cloud delivery network engineered for the modern web. Built with security, speed, and simplicity in mind.
              </p>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-headline font-bold text-[9px] uppercase tracking-[0.3em] text-primary">Service</h4>
              <ul className="space-y-3 text-[11px] text-muted-foreground font-medium">
                <li><Link href="#features" className="hover:text-primary transition-colors uppercase tracking-widest">Infrastructure</Link></li>
                <li><Link href="#infrastructure" className="hover:text-primary transition-colors uppercase tracking-widest">Global Map</Link></li>
                <li><Link href="#pricing" className="hover:text-primary transition-colors uppercase tracking-widest">Pricing Tiers</Link></li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-headline font-bold text-[9px] uppercase tracking-[0.3em] text-primary">Portal</h4>
              <ul className="space-y-3 text-[11px] text-muted-foreground font-medium">
                <li><Link href="/support" className="hover:text-primary transition-colors uppercase tracking-widest">Help Center</Link></li>
                <li><Link href="/auth?type=login" className="hover:text-primary transition-colors uppercase tracking-widest">Client Area</Link></li>
                <li><Link href="/auth?type=signup" className="hover:text-primary transition-colors uppercase tracking-widest">Registration</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-12 mt-16 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-[0.2em] text-center">
              © {new Date().getFullYear()} STSCloud Infrastructure. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center gap-6 grayscale opacity-40 hover:opacity-100 transition-opacity duration-500">
              <Badge variant="outline" className="border-none text-[8px] font-bold uppercase tracking-[0.3em]">PCI-DSS Secure</Badge>
              <Badge variant="outline" className="border-none text-[8px] font-bold uppercase tracking-[0.3em]">AES-256 Auth</Badge>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description, color }: { icon: any, title: string, description: string, color: string }) {
  return (
    <Card className="border-border/50 bg-secondary/5 hover:bg-secondary/10 transition-all duration-500 group hover:border-primary/30 hover:-translate-y-1.5 flex flex-col">
      <CardContent className="p-8 space-y-4 flex-1">
        <div className={cn("size-10 rounded-xl bg-secondary flex items-center justify-center group-hover:scale-110 transition-transform duration-500", color)}>
          <Icon className="size-5" />
        </div>
        <h3 className="font-headline font-bold text-lg md:text-xl">{title}</h3>
        <p className="text-muted-foreground text-xs md:text-sm leading-relaxed font-medium">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

function PricingItem({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <div className="flex items-center gap-2 text-muted-foreground">
        <CheckCircle2 className="size-3 text-primary" />
        <span className="font-medium">{label}</span>
      </div>
      <span className="font-bold">{value}</span>
    </div>
  );
}
