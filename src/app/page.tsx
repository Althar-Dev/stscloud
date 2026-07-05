
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
  BarChart3,
  Cloud,
  Headset,
  Database,
  HardDrive,
  HelpCircle,
  Wifi,
  WifiOff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import Lottie from "lottie-react";
import { useFirestore } from "@/firebase";
import { doc, onSnapshot } from "firebase/firestore";

const defaultPricingTiers = [
  { id: "p1", name: "Zero", ram: "1.5GB", cpu: "100%", disk: "2GB", price: "IDR 10.000", popular: false },
  { id: "p2", name: "Core", ram: "3GB", cpu: "170%", disk: "5GB", price: "IDR 17.000", popular: false },
  { id: "p3", name: "Plus", ram: "5GB", cpu: "250%", disk: "10GB", price: "IDR 27.000", popular: true },
  { id: "p4", name: "Pro", ram: "7GB", cpu: "340%", disk: "15GB", price: "IDR 30.000", popular: false },
  { id: "p5", name: "Elite", ram: "10GB", cpu: "Unlimited", disk: "25GB", price: "IDR 35.000", popular: false },
  { id: "p6", name: "Infinity", ram: "Unlimited", cpu: "Unlimited", disk: "Unlimited", price: "IDR 50.000", popular: false },
];

const defaultGlobalAgents = [
  { id: "ag1", name: "Indonesia", location: "Jakarta Region (JKT-01)", url: "stscloud.id", latency: "< 5ms", status: "active", color: "text-primary" },
  { id: "ag2", name: "Singapore", location: "SG Region (SIN-01)", url: "google.com", latency: "< 15ms", status: "active", color: "text-blue-400" },
  { id: "ag3", name: "Malaysia", location: "KL Region (KUL-01)", url: "127.0.0.1", latency: "< 20ms", status: "active", color: "text-red-400" },
];

const faqs = [
  {
    question: "How fast is the deployment process?",
    answer: "Our automated provisioning system is engineered for speed. Most instances, including complex Node.js or Python environments, are live and accessible in under 60 seconds."
  },
  {
    question: "Can I upgrade my server resources later?",
    answer: "Absolutely. You can scale your CPU, RAM, and Disk resources instantly through your dashboard. The system handles the migration seamlessly without data loss."
  },
  {
    question: "What payment methods do you support?",
    answer: "We support various local and international payment methods including QRIS, Virtual Accounts (VA), and E-Wallets (Gopay, OVO, Dana) via our SValePay integration."
  },
  {
    question: "Is my data isolated and secure?",
    answer: "Yes. Every deployment runs in its own encrypted sandbox environment. We utilize hardware-level isolation and multi-layer DDoS mitigation to ensure maximum security."
  }
];

export default function LandingPage() {
  const db = useFirestore();
  const [planetJson, setPlanetJson] = React.useState<any>(null);
  const [worldJson, setWorldJson] = React.useState<any>(null);
  const [pricingTiers, setPricingTiers] = React.useState<any[]>(defaultPricingTiers);
  const [globalAgents, setGlobalAgents] = React.useState<any[]>(defaultGlobalAgents);
  
  // Real-time status state
  const [agentLiveInfo, setAgentLiveInfo] = React.useState<Record<string, { status: string, latency: string }>>({});

  React.useEffect(() => {
    const loadLottie = async (url: string, setter: (data: any) => void) => {
      try {
        const res = await fetch(url);
        const contentType = res.headers.get("content-type");
        if (res.ok && contentType && contentType.includes("application/json")) {
          const data = await res.json();
          setter(data);
        }
      } catch (err) {}
    };
    loadLottie("/lottie/planet.json", setPlanetJson);
    loadLottie("/lottie/world.json", setWorldJson);

    const unsubPricing = onSnapshot(doc(db, "main", "product"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.tiers && Array.isArray(data.tiers)) setPricingTiers(data.tiers);
      }
    });

    const unsubAgents = onSnapshot(doc(db, "main", "agents"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.list && Array.isArray(data.list)) setGlobalAgents(data.list);
      }
    });

    return () => {
      unsubPricing();
      unsubAgents();
    };
  }, [db]);

  // Real-time Latency & Status Logic
  React.useEffect(() => {
    const checkAgents = async () => {
      const results: Record<string, { status: string, latency: string }> = {};
      
      for (const agent of globalAgents) {
        const url = agent.url;
        if (!url) {
          results[agent.id] = { status: "DOWN", latency: "N/A" };
          continue;
        }

        const isLocal = url.includes("localhost") || url.includes("127.0.0.1");
        
        if (isLocal) {
          results[agent.id] = { status: "ACTIVE", latency: "< 1ms (Local)" };
          continue;
        }

        const start = performance.now();
        try {
          const targetUrl = url.startsWith("http") ? url : `https://${url}`;
          // Use fetch with no-cors to check reachability without CORS issues
          await fetch(targetUrl, { 
            mode: 'no-cors', 
            cache: 'no-cache',
            signal: AbortSignal.timeout(5000) 
          });
          const end = performance.now();
          results[agent.id] = { status: "ACTIVE", latency: `${Math.round(end - start)}ms` };
        } catch (e) {
          results[agent.id] = { status: "DOWN", latency: "N/A" };
        }
      }
      setAgentLiveInfo(results);
    };

    checkAgents();
    const interval = setInterval(checkAgents, 30000); // Re-check every 30s
    return () => clearInterval(interval);
  }, [globalAgents]);

  return (
    <div className="bg-background min-h-screen text-foreground selection:bg-primary/20 overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-border/50 bg-background/80 backdrop-blur-md h-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="w-[32px] h-[32px] sm:w-[36px] sm:h-[36px] rounded-lg overflow-hidden flex items-center justify-center transition-transform group-hover:scale-110">
              <Image src="/img/icons.png" alt="STSCloud" width={36} height={36} className="object-cover" />
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
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-white font-bold h-9 px-5 text-[10px] uppercase tracking-widest">
                Deploy Now
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen lg:h-screen flex flex-col items-center justify-center pt-16 overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.03),transparent_70%)] pointer-events-none" />
        
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
                <Button size="lg" className="h-10 md:h-11 px-8 text-[10px] font-bold bg-primary hover:bg-primary/90 text-white gap-2 w-full group uppercase tracking-widest">
                  Start Provisioning <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="#pricing" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="h-10 md:h-11 px-8 text-[10px] font-bold border-border/50 bg-secondary hover:bg-secondary/80 w-full backdrop-blur-sm uppercase tracking-widest">
                  View Benchmarks
                </Button>
              </Link>
            </div>
          </div>

          <div className="hidden lg:flex flex-1 items-center justify-center max-w-lg z-10 animate-fade-in [animation-delay:400ms]">
            <div className="w-full">
              {planetJson && <Lottie animationData={planetJson} loop={true} />}
            </div>
          </div>
        </div>

        <div className="relative pb-8 opacity-20 hidden md:block animate-bounce">
          <ChevronRight className="size-5 rotate-90 text-primary" />
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
            <FeatureCard icon={Zap} title="Edge Infrastructure" description="Deploy on high-performance local nodes for ultra-low latency response times." color="text-primary" />
            <FeatureCard icon={Activity} title="Real-time Telemetry" description="Full visibility into resource consumption. Monitor CPU, memory, and storage." color="text-accent" />
            <FeatureCard icon={Shield} title="Encrypted Isolation" description="Secure sandboxed file systems and multi-layer DDoS mitigation for every deployment." color="text-orange-400" />
          </div>
        </div>
      </section>

      {/* Global Provisioning */}
      <section id="infrastructure" className="py-20 bg-background border-y border-border/50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-12">
          <div className="space-y-3">
            <h2 className="text-3xl md:text-5xl font-headline font-bold">Global Provisioning</h2>
            <p className="text-muted-foreground text-sm md:text-base max-w-lg mx-auto font-medium">Nodes deployed across major internet hubs for 99.9% uptime and real-time connectivity tracking.</p>
          </div>
          
          <div className="relative max-w-4xl mx-auto flex items-center justify-center">
            {worldJson ? (
              <Lottie animationData={worldJson} loop={true} className="w-full h-auto max-w-3xl opacity-30 grayscale" />
            ) : (
              <div className="w-full aspect-video flex items-center justify-center opacity-10"><Globe className="size-20 animate-pulse" /></div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto">
             {globalAgents.map((agent) => {
                const live = agentLiveInfo[agent.id];
                const isActive = live?.status === "ACTIVE";
                
                return (
                  <Card key={agent.id} className="bg-card border-border/50 p-6 text-left group hover:border-primary/50 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <div className="size-10 rounded-lg bg-secondary flex items-center justify-center">
                          <Globe className={cn("size-5", isActive ? "text-primary" : "text-muted-foreground")} />
                      </div>
                      <Badge className={cn(
                        "text-[8px] uppercase font-bold",
                        isActive ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
                      )}>
                        {live?.status || "CHECKING..."}
                      </Badge>
                    </div>
                    <h4 className="font-headline font-bold text-lg">{agent.name}</h4>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1">{agent.location}</p>
                    <p className="text-[8px] font-code text-muted-foreground opacity-50 mb-4 truncate">{agent.url}</p>
                    
                    <div className={cn(
                      "flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )}>
                      {isActive ? <Wifi className="size-3" /> : <WifiOff className="size-3" />}
                      Latency: {live?.latency || agent.latency}
                    </div>
                  </Card>
                );
             })}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-3 mb-16 px-4">
            <Badge variant="outline" className="border-primary/20 text-primary uppercase font-bold tracking-widest px-2 py-0.5 text-[9px]">Fair Pricing</Badge>
            <h2 className="text-3xl md:text-5xl font-headline font-bold">Scale Your Potential</h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-xs sm:text-sm font-medium">Choose the perfect tier for your application. No hidden costs.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {pricingTiers.map((tier) => (
              <Card key={tier.id} className={cn(
                "border-border/50 bg-card transition-all duration-500 hover:border-primary/50 hover:-translate-y-2 relative overflow-hidden group flex flex-col h-full",
                tier.popular && "border-primary/50 ring-1 ring-primary/20 scale-[1.03] z-10"
              )}>
                {tier.popular && (
                  <div className="absolute top-0 right-0 bg-primary text-white text-[8px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 rounded-bl-xl shadow-lg">Recommended</div>
                )}
                <CardHeader className="p-6 md:px-8 md:pt-8 md:pb-0 space-y-0 relative">
                  <div className="flex items-start justify-between mb-4 md:mb-6">
                    <div className="flex items-center gap-4">
                      <div className={cn("size-10 rounded-xl bg-secondary flex items-center justify-center group-hover:scale-110 transition-transform duration-500", tier.popular ? "text-primary" : "text-muted-foreground")}>
                        <ServerIcon className="size-5" />
                      </div>
                      <div className="space-y-0.5">
                        <CardTitle className="font-headline font-bold text-xl md:text-2xl leading-none">{tier.name}</CardTitle>
                        <CardDescription className="text-[9px] uppercase font-bold tracking-[0.3em] opacity-60">Provision Tier</CardDescription>
                      </div>
                    </div>
                    <div className="absolute top-6 right-6 md:top-8 md:right-8 flex items-baseline gap-1 shrink-0">
                      <span className="text-lg md:text-xl font-headline font-bold text-primary">{tier.price}</span>
                      <span className="text-muted-foreground text-[7px] uppercase font-bold tracking-widest">/mo</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6 p-6 md:p-8 pt-0 flex-1">
                  <div className="flex items-center justify-between py-6 border-y border-border/50 -mx-6 md:-mx-8 px-6 md:px-8 bg-[#0A0A0A]">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-lg bg-secondary flex items-center justify-center shrink-0"><Database className="size-4 text-primary" /></div>
                      <div className="flex flex-col leading-none"><span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Ram</span><span className="text-[11px] font-bold">{tier.ram}</span></div>
                    </div>
                    <div className="flex items-center gap-3 border-x border-border/50 px-4 h-10">
                      <div className="size-8 rounded-lg bg-secondary flex items-center justify-center shrink-0"><Cpu className="size-4 text-primary" /></div>
                      <div className="flex flex-col leading-none"><span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground mb-1">CPU</span><span className="text-[11px] font-bold">{tier.cpu}</span></div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-lg bg-secondary flex items-center justify-center shrink-0"><HardDrive className="size-4 text-primary" /></div>
                      <div className="flex flex-col leading-none"><span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Disk</span><span className="text-[11px] font-bold">{tier.disk}</span></div>
                    </div>
                  </div>
                  <Link href="/auth?type=signup" className="block w-full pt-2">
                    <Button className={cn("w-full h-11 font-bold gap-2 text-[10px] uppercase tracking-widest transition-all duration-300", tier.popular ? "bg-primary hover:bg-primary/90 text-white" : "bg-secondary hover:bg-secondary/80 text-foreground border border-border/50")}>
                      Select {tier.name} <ChevronRight className="size-3" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 bg-secondary/20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-12">
            <Badge variant="outline" className="border-primary/20 text-primary uppercase font-bold tracking-widest px-2 py-0.5 text-[9px]">FAQ</Badge>
            <h2 className="text-3xl md:text-5xl font-headline font-bold">Frequently Asked Questions</h2>
          </div>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-border/50 bg-card/50 px-6 rounded-xl mb-4">
                <AccordionTrigger className="font-headline font-bold text-base md:text-lg hover:no-underline hover:text-primary transition-colors py-6">
                  <div className="flex items-center gap-3 text-left"><HelpCircle className="size-5 text-primary shrink-0" />{faq.question}</div>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm md:text-base leading-relaxed font-medium pb-8 pl-8">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Ready to Scale */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 -z-10" />
        <div className="max-w-5xl mx-auto px-4 text-center space-y-8">
          <h2 className="text-4xl md:text-6xl font-headline font-bold tracking-tighter">Ready to scale your vision?</h2>
          <p className="text-muted-foreground text-sm md:text-lg max-w-2xl mx-auto font-medium leading-relaxed">Join thousands of developers deploying high-performance applications on STSCloud.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth?type=signup" className="w-full sm:w-auto"><Button size="lg" className="h-14 px-10 text-xs font-bold bg-primary hover:bg-primary/90 text-white gap-2 w-full uppercase tracking-widest">Deploy Your First Instance <ArrowRight className="size-5" /></Button></Link>
            <Link href="/support" className="w-full sm:w-auto"><Button size="lg" variant="outline" className="h-14 px-10 text-xs font-bold border-border/50 bg-secondary hover:bg-secondary/80 w-full uppercase tracking-widest">Contact Sales</Button></Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-background border-t border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-[32px] h-[32px] rounded-lg overflow-hidden flex items-center justify-center">
                <Image src="/img/icons.png" alt="STSCloud" width={24} height={24} className="object-cover" />
              </div>
              <span className="text-primary font-headline font-bold text-xl tracking-tight">Cloud</span>
            </div>
            <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-[0.2em]">© {new Date().getFullYear()} STSCloud. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description, color }: { icon: any, title: string, description: string, color: string }) {
  return (
    <Card className="border-border/50 bg-card hover:bg-secondary transition-all duration-500 group hover:border-primary/30 hover:-translate-y-1.5 flex flex-col">
      <CardContent className="p-8 space-y-4 flex-1">
        <div className={cn("size-10 rounded-xl bg-secondary flex items-center justify-center group-hover:scale-110 transition-transform duration-500", color)}>
          <Icon className="size-5" />
        </div>
        <h3 className="font-headline font-bold text-lg md:text-xl">{title}</h3>
        <p className="text-muted-foreground text-xs md:text-sm leading-relaxed font-medium">{description}</p>
      </CardContent>
    </Card>
  );
}
