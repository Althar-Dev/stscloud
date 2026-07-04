
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
  HardDrive
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Lottie from "lottie-react";

const pricingTiers = [
  { id: "p1", name: "Zero", ram: "1.5GB", cpu: "100%", disk: "2GB", price: "IDR 10.000", popular: false },
  { id: "p2", name: "Core", ram: "3GB", cpu: "170%", disk: "5GB", price: "IDR 17.000", popular: false },
  { id: "p3", name: "Plus", ram: "5GB", cpu: "250%", disk: "10GB", price: "IDR 27.000", popular: true },
  { id: "p4", name: "Pro", ram: "7GB", cpu: "340%", disk: "15GB", price: "IDR 30.000", popular: false },
  { id: "p5", name: "Elite", ram: "10GB", cpu: "Unlimited", disk: "25GB", price: "IDR 35.000", popular: false },
  { id: "p6", name: "Infinity", ram: "Unlimited", cpu: "Unlimited", disk: "Unlimited", price: "IDR 50.000", popular: false },
];

export default function LandingPage() {
  const [planetJson, setPlanetJson] = React.useState<any>(null);
  const [worldJson, setWorldJson] = React.useState<any>(null);

  React.useEffect(() => {
    const loadLottie = async (url: string, setter: (data: any) => void) => {
      try {
        const res = await fetch(url);
        const contentType = res.headers.get("content-type");
        if (res.ok && contentType && contentType.includes("application/json")) {
          const data = await res.json();
          setter(data);
        }
      } catch (err) {
        // Fail silently
      }
    };
    loadLottie("/lottie/planet.json", setPlanetJson);
    loadLottie("/lottie/world.json", setWorldJson);
  }, []);

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
        {/* Background Dot Pattern Decor - Restricted to Hero only */}
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:40px_40px]" />
        
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.03),transparent_50%)]" />
        
        {/* Mobile Lottie Background - 200% width, opacity 60% */}
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

      {/* Trust & Stats Marquee - 20s speed with blur edges */}
      <section className="py-12 border-b border-border/50 bg-secondary relative overflow-hidden">
        <div className="absolute inset-y-0 left-0 w-24 md:w-48 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-24 md:w-48 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
        
        <div className="flex whitespace-nowrap animate-marquee">
          <div className="flex items-center gap-16 md:gap-32 px-12 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-700">
            <StatMarqueeItem icon={Rocket} text="INSTANT DEPLOYMENT" />
            <StatMarqueeItem icon={Activity} text="99.9% UPTIME" />
            <StatMarqueeItem icon={Shield} text="DDOS MITIGATION" />
            <StatMarqueeItem icon={Headset} text="24/7 SUPPORT" />
            <StatMarqueeItem icon={Rocket} text="INSTANT DEPLOYMENT" />
            <StatMarqueeItem icon={Activity} text="99.9% UPTIME" />
            <StatMarqueeItem icon={Shield} text="DDOS MITIGATION" />
            <StatMarqueeItem icon={Headset} text="24/7 SUPPORT" />
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
              icon={Zap} 
              title="Edge Infrastructure" 
              description="Deploy on high-performance local nodes for ultra-low latency response times and deterministic consistency."
              color="text-primary"
            />
            <FeatureCard 
              icon={Activity} 
              title="Real-time Telemetry" 
              description="Full visibility into resource consumption. Monitor CPU, memory, and storage with precise updates."
              color="text-accent"
            />
            <FeatureCard 
              icon={Shield} 
              title="Encrypted Isolation" 
              description="Secure sandboxed file systems and multi-layer DDoS mitigation for every deployment, ensuring complete integrity."
              color="text-orange-400"
            />
          </div>
        </div>
      </section>

      {/* UI Showcase / Command Center Section */}
      <section className="py-24 relative overflow-hidden border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                 <div className="space-y-4">
                    <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary text-[9px] font-bold uppercase tracking-[0.2em] px-3 py-1">Command Center</Badge>
                    <h2 className="text-3xl md:text-5xl font-headline font-bold leading-tight">Total Control <br /> At Your Fingertips</h2>
                    <p className="text-muted-foreground text-sm md:text-base max-w-lg leading-relaxed font-medium">
                      Our dashboard provides a surgical view of your infrastructure. Monitor performance, manage files, and execute commands in a unified, beautiful interface.
                    </p>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-card border border-border/50 space-y-2">
                       <BarChart3 className="size-5 text-primary" />
                       <div className="font-headline font-bold text-sm">Real-time Metrics</div>
                    </div>
                    <div className="p-4 rounded-xl bg-card border border-border/50 space-y-2">
                       <Terminal className="size-5 text-accent" />
                       <div className="font-headline font-bold text-sm">SSH Web Terminal</div>
                    </div>
                 </div>
              </div>

              <div className="relative group">
                 <div className="relative z-10 bg-[#0c0c0f] border border-border/50 rounded-2xl shadow-[0_0_50px_rgba(99,102,241,0.15)] overflow-hidden transition-transform duration-700 hover:scale-[1.02]">
                    <div className="flex items-center justify-between p-4 border-b border-border/50 bg-secondary">
                       <div className="flex gap-1.5">
                          <div className="size-2.5 rounded-full bg-red-500/50" />
                          <div className="size-2.5 rounded-full bg-yellow-500/50" />
                          <div className="size-2.5 rounded-full bg-green-500/50" />
                       </div>
                       <div className="text-[10px] font-code text-muted-foreground opacity-50">stscloud.id/dashboard</div>
                       <div className="w-8" />
                    </div>
                    
                    <div className="p-6 space-y-6">
                       <div className="p-4 rounded-xl bg-secondary border border-primary/20 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                             <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                <ServerIcon className="size-5" />
                             </div>
                             <div>
                                <div className="text-sm font-bold font-headline">Production JKT-01</div>
                                <div className="text-[8px] uppercase tracking-widest text-muted-foreground font-bold">Node.js Infinity Plan</div>
                             </div>
                          </div>
                          <Badge className="bg-green-500/20 text-green-500 border-green-500/20 text-[8px] px-2 py-0">ONLINE</Badge>
                       </div>

                       <div className="grid grid-cols-3 gap-4">
                          <MockMetric label="CPU" value="42%" color="bg-primary" />
                          <MockMetric label="RAM" value="1.2GB" color="bg-accent" />
                          <MockMetric label="DISK" value="15%" color="bg-orange-400" />
                       </div>

                       <div className="bg-black rounded-lg p-4 font-code text-[10px] space-y-1 border border-border/30">
                          <div className="flex gap-2"><span className="text-primary">[STS]</span> <span className="text-muted-foreground">[12:44:01]</span> <span className="text-green-400">Boot successful.</span></div>
                          <div className="flex gap-2"><span className="text-primary">[STS]</span> <span className="text-muted-foreground">[12:44:02]</span> Listening on port 8080.</div>
                          <div className="flex gap-2"><span className="text-primary">[STS]</span> <span className="text-muted-foreground">[12:44:15]</span> <span className="text-blue-400">GET /api/v1/deploy 200 OK</span></div>
                          <div className="animate-pulse w-1.5 h-3 bg-white ml-1 inline-block" />
                       </div>
                    </div>
                 </div>
                 
                 <div className="absolute -top-6 -right-6 w-full h-full bg-primary/5 border border-primary/10 rounded-2xl -z-10 translate-x-4 translate-y-4" />
                 <div className="absolute -bottom-6 -left-6 w-full h-full bg-accent/5 border border-accent/10 rounded-2xl -z-20 -translate-x-4 -translate-y-4" />
              </div>
           </div>
        </div>
      </section>

      {/* Infrastructure Section */}
      <section id="infrastructure" className="py-20 bg-background border-y border-border/50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-12">
          <div className="space-y-3">
            <h2 className="text-3xl md:text-5xl font-headline font-bold">Global Provisioning</h2>
            <p className="text-muted-foreground text-sm md:text-base max-w-lg mx-auto font-medium">Nodes deployed across major internet hubs for 99.9% uptime and low latency.</p>
          </div>
          
          <div className="relative max-w-4xl mx-auto flex items-center justify-center">
            {worldJson ? (
              <Lottie 
                animationData={worldJson} 
                loop={true} 
                className="w-full h-auto max-w-3xl opacity-30 grayscale" 
              />
            ) : (
              <div className="w-full aspect-video flex items-center justify-center opacity-10">
                <Globe className="size-20 animate-pulse" />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto">
             <Card className="bg-card border-border/50 p-6 text-left group hover:border-primary/50 transition-colors">
                <div className="flex justify-between items-start mb-4">
                   <div className="size-10 rounded-lg bg-secondary flex items-center justify-center">
                      <Globe className="size-5 text-primary" />
                   </div>
                   <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-[8px]">ACTIVE</Badge>
                </div>
                <h4 className="font-headline font-bold text-lg">Indonesia</h4>
                <p className="text-xs text-muted-foreground font-medium mb-4">Jakarta Region (JKT-01)</p>
                <div className="flex items-center gap-2 text-[10px] font-bold text-primary uppercase tracking-widest">
                   <Activity className="size-3" /> Latency: &lt; 5ms
                </div>
             </Card>

             <Card className="bg-card border-border/50 p-6 text-left group hover:border-primary/50 transition-colors">
                <div className="flex justify-between items-start mb-4">
                   <div className="size-10 rounded-lg bg-secondary flex items-center justify-center">
                      <Globe className="size-5 text-blue-400" />
                   </div>
                   <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-[8px]">ACTIVE</Badge>
                </div>
                <h4 className="font-headline font-bold text-lg">Singapore</h4>
                <p className="text-xs text-muted-foreground font-medium mb-4">SG Region (SIN-01)</p>
                <div className="flex items-center gap-2 text-[10px] font-bold text-primary uppercase tracking-widest">
                   <Activity className="size-3" /> Latency: &lt; 15ms
                </div>
             </Card>

             <Card className="bg-card border-border/50 p-6 text-left group hover:border-primary/50 transition-colors">
                <div className="flex justify-between items-start mb-4">
                   <div className="size-10 rounded-lg bg-secondary flex items-center justify-center">
                      <Globe className="size-5 text-red-400" />
                   </div>
                   <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-[8px]">ACTIVE</Badge>
                </div>
                <h4 className="font-headline font-bold text-lg">Malaysia</h4>
                <p className="text-xs text-muted-foreground font-medium mb-4">KL Region (KUL-01)</p>
                <div className="flex items-center gap-2 text-[10px] font-bold text-primary uppercase tracking-widest">
                   <Activity className="size-3" /> Latency: &lt; 20ms
                </div>
             </Card>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-3 mb-16 px-4">
            <Badge variant="outline" className="border-primary/20 text-primary uppercase font-bold tracking-widest px-2 py-0.5 text-[9px]">Fair Pricing</Badge>
            <h2 className="text-3xl md:text-5xl font-headline font-bold">Scale Your Potential</h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-xs sm:text-sm font-medium">
              Choose the perfect tier for your application. No hidden costs. Pay only for what you need.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {pricingTiers.map((tier) => (
              <Card key={tier.id} className={cn(
                "border-border/50 bg-card transition-all duration-500 hover:border-primary/50 hover:-translate-y-2 relative overflow-hidden group flex flex-col h-full",
                tier.popular && "border-primary/50 ring-1 ring-primary/20 scale-[1.03] z-10"
              )}>
                {tier.popular && (
                  <div className="absolute top-0 right-0 bg-primary text-white text-[8px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 rounded-bl-xl shadow-lg">
                    Recommended
                  </div>
                )}
                <CardHeader className="p-6 md:px-8 md:pt-8 md:pb-0 space-y-0">
                  <div className="flex items-start justify-between mb-4 md:mb-6">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "size-10 rounded-xl bg-secondary flex items-center justify-center group-hover:scale-110 transition-transform duration-500",
                        tier.popular ? "text-primary" : "text-muted-foreground"
                      )}>
                        <ServerIcon className="size-5" />
                      </div>
                      <div className="space-y-0.5">
                        <CardTitle className="font-headline font-bold text-xl md:text-2xl leading-none">{tier.name}</CardTitle>
                        <CardDescription className="text-[9px] uppercase font-bold tracking-[0.3em] opacity-60">Provision Tier</CardDescription>
                      </div>
                    </div>
                    
                    <div className="flex items-baseline gap-1 pt-1 shrink-0">
                      <span className="text-lg md:text-xl font-headline font-bold text-primary">{tier.price}</span>
                      <span className="text-muted-foreground text-[7px] uppercase font-bold tracking-widest">/mo</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6 p-6 md:p-8 pt-0 flex-1">
                  {/* Resource Specs: Full-width border-y container with #0A0A0A background */}
                  <div className="flex items-center justify-between py-6 border-y border-border/50 -mx-6 md:-mx-8 px-6 md:px-8 bg-[#0A0A0A]">
                    <div className="flex items-center gap-3">
                      <Database className="size-5 text-primary shrink-0" />
                      <div className="flex flex-col leading-none">
                        <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Ram</span>
                        <span className="text-[11px] font-bold">{tier.ram}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 border-x border-border/50 px-4 h-10">
                      <Cpu className="size-5 text-primary shrink-0" />
                      <div className="flex flex-col leading-none">
                        <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground mb-1">CPU</span>
                        <span className="text-[11px] font-bold">{tier.cpu}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <HardDrive className="size-5 text-primary shrink-0" />
                      <div className="flex flex-col leading-none">
                        <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Disk</span>
                        <span className="text-[11px] font-bold">{tier.disk}</span>
                      </div>
                    </div>
                  </div>

                  <Link href="/auth?type=signup" className="block w-full pt-2">
                    <Button className={cn(
                      "w-full h-11 font-bold gap-2 text-[10px] uppercase tracking-widest transition-all duration-300",
                      tier.popular ? "bg-primary hover:bg-primary/90 text-white" : "bg-secondary hover:bg-secondary/80 text-foreground border border-border/50"
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
                  <Image src="/img/icons.png" alt="STSCloud" width={24} height={24} className="object-cover" />
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

function MockMetric({ label, value, color }: { label: string, value: string, color: string }) {
   return (
      <div className="space-y-1.5">
         <div className="flex justify-between items-center text-[7px] font-bold uppercase tracking-wider text-muted-foreground">
            <span>{label}</span>
            <span className="text-white">{value}</span>
         </div>
         <div className="h-1 w-full bg-secondary rounded-full overflow-hidden">
            <div className={cn("h-full rounded-full transition-all duration-1000", color)} style={{ width: value }} />
         </div>
      </div>
   );
}

function StatMarqueeItem({ icon: Icon, text }: { icon: any, text: string }) {
  return (
    <div className="flex items-center gap-3 md:gap-4 transition-colors hover:text-primary shrink-0">
      <Icon className="size-5 md:size-7 text-primary" />
      <span className="font-headline font-bold text-xs sm:text-sm md:text-base uppercase tracking-[0.2em] whitespace-nowrap">
        {text}
      </span>
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
        <p className="text-muted-foreground text-xs md:text-sm leading-relaxed font-medium">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}
