
"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Zap, 
  Shield, 
  Globe, 
  Cpu, 
  ArrowRight, 
  CheckCircle2,
  Server,
  Activity
} from "lucide-react";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function LandingPage() {
  const heroImage = PlaceHolderImages.find(img => img.id === "server-hero");

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground selection:bg-primary/30 scroll-smooth">
      {/* Navigation */}
      <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Zap className="size-5 text-primary-foreground fill-primary-foreground" />
            </div>
            <span className="font-headline font-bold text-xl tracking-tight">
              STS<span className="text-primary">Cloud</span>
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <a href="#infrastructure" className="hover:text-primary transition-colors">Infrastructure</a>
            <a href="#pricing" className="hover:text-primary transition-colors">Pricing</a>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" className="hidden sm:flex">Log In</Button>
            </Link>
            <Link href="/deploy">
              <Button className="bg-primary text-white shadow-lg shadow-primary/20 gap-2">
                Deploy Now <ArrowRight className="size-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden border-b border-border/50">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))]" />
          <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-in fade-in slide-in-from-left-8 duration-700">
              <Badge variant="outline" className="py-1 px-3 border-primary/30 text-primary bg-primary/5 uppercase tracking-widest text-[10px] font-bold">
                Next-Gen Game Hosting
              </Badge>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-headline font-bold leading-tight">
                Empower Your <span className="text-primary">Gaming</span> Experience
              </h1>
              <p className="text-muted-foreground text-lg md:text-xl max-w-xl">
                Deploy, manage, and scale high-performance game servers with AI-driven intelligence and global low-latency infrastructure.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/deploy">
                  <Button size="lg" className="h-14 px-8 text-lg bg-primary text-white shadow-xl shadow-primary/25 gap-3 w-full sm:w-auto">
                    Get Started Free <ArrowRight className="size-5" />
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-border/50 hover:bg-secondary/50 w-full sm:w-auto">
                    View Demo
                  </Button>
                </Link>
              </div>
              <div className="flex items-center gap-6 pt-4 grayscale opacity-50">
                <div className="flex items-center gap-2 font-bold text-sm tracking-tighter uppercase"><CheckCircle2 className="size-4 text-primary" /> NVMe SSD</div>
                <div className="flex items-center gap-2 font-bold text-sm tracking-tighter uppercase"><CheckCircle2 className="size-4 text-primary" /> DDoS Shield</div>
                <div className="flex items-center gap-2 font-bold text-sm tracking-tighter uppercase"><CheckCircle2 className="size-4 text-primary" /> 24/7 Support</div>
              </div>
            </div>
            <div className="relative aspect-square md:aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl shadow-primary/10 border border-border/50 animate-in fade-in slide-in-from-right-8 duration-700 delay-200">
              <Image 
                src={heroImage?.imageUrl || "https://picsum.photos/seed/stshero/800/600"} 
                alt="Server Hero" 
                fill 
                className="object-cover"
                priority
                data-ai-hint="server technology"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 p-6 rounded-xl bg-background/60 backdrop-blur-md border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="size-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Activity className="size-6 text-green-500 animate-pulse" />
                  </div>
                  <div>
                    <div className="font-headline font-bold text-sm">Phoenix-01 Node</div>
                    <div className="text-[10px] text-muted-foreground uppercase">Status: Online • 15ms Latency</div>
                  </div>
                </div>
                <Badge className="bg-primary/20 text-primary border-none">99.9% Uptime</Badge>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-24 bg-secondary/10">
          <div className="container mx-auto px-4 space-y-16">
            <div className="text-center space-y-4 max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-headline font-bold">Why choose STSCloud?</h2>
              <p className="text-muted-foreground">Our platform combines cutting-edge hardware with intelligent automation to provide the best hosting experience.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { title: "AI Optimization", desc: "Our neural engine automatically adjusts JVM and server parameters for peak efficiency.", icon: <Cpu className="size-8 text-primary" /> },
                { title: "Global Network", desc: "Low-latency edge nodes deployed in over 12 locations across US, EU, and Asia.", icon: <Globe className="size-8 text-accent" /> },
                { title: "Enterprise Security", desc: "Advanced L3/L4/L7 DDoS mitigation system protects your server 24/7.", icon: <Shield className="size-8 text-green-500" /> },
                { title: "Instant Deployment", desc: "Get your server up and running in under 60 seconds with our pre-built templates.", icon: <Zap className="size-8 text-yellow-500" /> },
                { title: "Scalable Storage", desc: "NVMe-backed persistent storage that grows with your community's needs.", icon: <Server className="size-8 text-blue-500" /> },
                { title: "Full Root Access", desc: "Complete control via SFTP and our custom web-based terminal console.", icon: <Badge className="size-8 text-purple-500" /> },
              ].map((f, i) => (
                <div key={i} className="p-8 rounded-2xl bg-card border border-border/50 hover:border-primary/50 transition-all group">
                  <div className="mb-6 p-3 rounded-xl bg-secondary inline-block group-hover:scale-110 transition-transform">
                    {f.icon}
                  </div>
                  <h3 className="text-xl font-headline font-bold mb-3">{f.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-24 border-t border-border/50 overflow-hidden relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[600px] bg-primary/10 rounded-full blur-[120px] -z-10" />
          <div className="container mx-auto px-4 text-center space-y-10">
            <h2 className="text-3xl md:text-5xl font-headline font-bold">Ready to launch your world?</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Join thousands of server owners who trust STSCloud for their gaming communities. Get started today with a 3-day free trial.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/deploy">
                <Button size="lg" className="h-14 px-10 text-lg bg-primary text-white shadow-xl shadow-primary/25 gap-3">
                  Deploy Your Server <ArrowRight className="size-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t border-border/50 bg-secondary/20">
        <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 space-y-4">
             <div className="flex items-center gap-2">
              <div className="size-6 rounded-md bg-primary flex items-center justify-center">
                <Zap className="size-4 text-primary-foreground fill-primary-foreground" />
              </div>
              <span className="font-headline font-bold text-lg">STSCloud</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">Building the future of high-performance gaming infrastructure for everyone.</p>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold text-sm uppercase tracking-widest">Platform</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/deploy" className="hover:text-primary transition-colors">Deploy</Link></li>
              <li><Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Nodes</Link></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold text-sm uppercase tracking-widest">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-primary transition-colors">About</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Blog</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Terms</Link></li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto px-4 pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground uppercase font-bold tracking-widest">
          <p>© 2024 STSCloud Systems Inc.</p>
          <div className="flex gap-8">
            <Link href="#" className="hover:text-primary transition-colors">Twitter</Link>
            <Link href="#" className="hover:text-primary transition-colors">Discord</Link>
            <Link href="#" className="hover:text-primary transition-colors">Github</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

