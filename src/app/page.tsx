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
  WifiOff,
  Loader2,
  Twitter,
  Github,
  Instagram,
  MessageSquare,
  ShieldCheck,
  Lock,
  Mail,
  MapPin
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
    question: "Berapa lama proses deployment di STSCloud?",
    answer: "Sistem provisi otomatis kami dirancang untuk kecepatan tinggi. Sebagian besar instans, termasuk lingkungan Node.js atau Python yang kompleks, aktif dan dapat diakses dalam waktu kurang dari 60 detik."
  },
  {
    question: "Apakah saya bisa upgrade resource server nanti?",
    answer: "Tentu saja. Anda dapat meningkatkan CPU, RAM, dan kapasitas Disk secara instan melalui dashboard. Sistem akan menangani migrasi tanpa ada kehilangan data."
  },
  {
    question: "Metode pembayaran apa saja yang didukung?",
    answer: "Kami mendukung berbagai metode pembayaran lokal Indonesia termasuk QRIS, Virtual Account (VA), dan E-Wallet seperti Gopay, OVO, serta Dana melalui integrasi SValePay."
  },
  {
    question: "Apakah data saya aman dan terisolasi?",
    answer: "Ya. Setiap deployment berjalan di lingkungan sandbox terenkripsi miliknya sendiri. Kami menggunakan isolasi tingkat hardware dan mitigasi DDoS berlapis untuk memastikan keamanan maksimum."
  }
];

export default function LandingPage() {
  const db = useFirestore();
  const [planetJson, setPlanetJson] = React.useState<any>(null);
  const [worldJson, setWorldJson] = React.useState<any>(null);
  const [pricingTiers, setPricingTiers] = React.useState<any[]>(defaultPricingTiers);
  const [globalAgents, setGlobalAgents] = React.useState<any[]>(defaultGlobalAgents);
  
  const [agentLiveInfo, setAgentLiveInfo] = React.useState<Record<string, { status: string, latency: string, isChecking: boolean }>>({});

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

  React.useEffect(() => {
    if (globalAgents.length === 0) return;

    const checkAgent = async (agent: any) => {
      const url = agent.url;
      setAgentLiveInfo(prev => ({ 
        ...prev, 
        [agent.id]: { ...(prev[agent.id] || {}), isChecking: true } 
      }));

      if (!url) {
        setAgentLiveInfo(prev => ({ 
          ...prev, 
          [agent.id]: { status: "DOWN", latency: "N/A", isChecking: false } 
        }));
        return;
      }

      const isLocal = url.includes("localhost") || url.includes("127.0.0.1");
      if (isLocal) {
        await new Promise(r => setTimeout(r, 800));
        setAgentLiveInfo(prev => ({ 
          ...prev, 
          [agent.id]: { status: "ACTIVE", latency: "< 1ms (Lokal)", isChecking: false } 
        }));
        return;
      }

      const start = performance.now();
      try {
        const targetUrl = url.startsWith("http") ? url : `https://${url}`;
        await fetch(targetUrl, { 
          mode: 'no-cors', 
          cache: 'no-cache',
          signal: AbortSignal.timeout(5000) 
        });
        const end = performance.now();
        setAgentLiveInfo(prev => ({ 
          ...prev, 
          [agent.id]: { status: "ACTIVE", latency: `${Math.round(end - start)}ms`, isChecking: false } 
        }));
      } catch (e) {
        setAgentLiveInfo(prev => ({ 
          ...prev, 
          [agent.id]: { status: "DOWN", latency: "TIMEOUT", isChecking: false } 
        }));
      }
    };

    globalAgents.forEach(agent => checkAgent(agent));
    const interval = setInterval(() => globalAgents.forEach(agent => checkAgent(agent)), 15000);
    return () => clearInterval(interval);
  }, [globalAgents]);

  return (
    <div className="bg-background min-h-screen text-foreground selection:bg-primary/20 overflow-x-hidden">
      <nav className="fixed top-0 w-full z-50 border-b border-border/50 bg-background/80 backdrop-blur-md h-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group cursor-pointer">
            <div className="w-[32px] h-[32px] sm:w-[36px] sm:h-[36px] rounded-lg overflow-hidden flex items-center justify-center transition-transform group-hover:scale-110">
              <Image src="/img/icons.png" alt="STSCloud Logo" width={36} height={36} className="object-cover" />
            </div>
            <span className="font-headline font-bold text-lg sm:text-xl tracking-tight">
              <span className="text-primary">Cloud</span>
            </span>
          </Link>
          
          <div className="hidden lg:flex items-center gap-8 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">
            <Link href="#features" className="hover:text-primary transition-colors">Fitur</Link>
            <Link href="#infrastructure" className="hover:text-primary transition-colors">Infrastruktur</Link>
            <Link href="#pricing" className="hover:text-primary transition-colors">Harga</Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/auth?type=login">
              <Button variant="ghost" size="sm" className="text-[10px] font-bold uppercase tracking-widest px-4">Masuk</Button>
            </Link>
            <Link href="/auth?type=signup">
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-white font-bold h-9 px-5 text-[10px] uppercase tracking-widest">
                Daftar Sekarang
              </Button>
            </Link>
          </div>
        </div>
      </nav>

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
                <Cloud className="size-3 mr-2 animate-pulse" /> Cloud Hosting Indonesia
              </Badge>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-headline font-bold tracking-tighter leading-[1.1] [animation-delay:200ms]">
              Platform Cloud <br className="hidden md:block" /> <span className="text-primary italic">Generasi Baru</span> Indonesia.
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed max-w-xl lg:mx-0 mx-auto font-medium [animation-delay:400ms] px-4 lg:px-0">
              STSCloud memberikan performa tinggi untuk deployment bot, web app, dan game server di bawah 60 detik. Didukung oleh infrastruktur edge lokal Jakarta.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-4 [animation-delay:600ms] px-6 lg:px-0">
              <Link href="/auth?type=signup" className="w-full sm:w-auto">
                <Button size="lg" className="h-10 md:h-11 px-8 text-[10px] font-bold bg-primary hover:bg-primary/90 text-white gap-2 w-full group uppercase tracking-widest">
                  Mulai Provisi <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="#pricing" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="h-10 md:h-11 px-8 text-[10px] font-bold border-border/50 bg-secondary hover:bg-secondary/80 w-full backdrop-blur-sm uppercase tracking-widest">
                  Lihat Harga
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

      <section id="features" className="py-20 sm:py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-16 px-1">
            <div className="space-y-4 max-w-xl">
              <Badge variant="outline" className="border-primary/20 text-primary uppercase font-bold tracking-widest px-2 py-0.5 text-[9px] w-fit">Teknologi Lokal</Badge>
              <h2 className="text-3xl md:text-5xl font-headline font-bold leading-tight">Performa Puncak <br /> Untuk Developer</h2>
            </div>
            <p className="text-muted-foreground text-xs sm:text-sm max-w-sm font-medium leading-relaxed pb-1">
              Platform kami menyederhanakan DevOps kompleks menjadi satu dashboard elegan. Tidak ada lagi konfigurasi manual yang membosankan.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <FeatureCard icon={Zap} title="Infrastruktur Edge" description="Deploy di node lokal berperforma tinggi untuk waktu respon ultra-cepat di wilayah Indonesia." color="text-primary" />
            <FeatureCard icon={Activity} title="Telemetri Real-time" description="Visibilitas penuh penggunaan resource. Monitor CPU, RAM, dan penyimpanan secara langsung." color="text-accent" />
            <FeatureCard icon={Shield} title="Isolasi Terenkripsi" description="Sistem file sandbox yang aman dan mitigasi DDoS berlapis untuk setiap server." color="text-orange-400" />
          </div>
        </div>
      </section>

      <section id="infrastructure" className="py-20 bg-background border-y border-border/50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-12">
          <div className="space-3">
            <h2 className="text-3xl md:text-5xl font-headline font-bold">Node Infrastruktur Global</h2>
            <p className="text-muted-foreground text-sm md:text-base max-w-lg mx-auto font-medium">Node strategis di hub internet utama (Jakarta, Singapura, Malaysia) untuk jaminan uptime 99.9%.</p>
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
                const isChecking = live?.isChecking || !live;
                
                return (
                  <Card key={agent.id} className="bg-card border-border/50 p-6 text-left group hover:border-primary/50 transition-all duration-300">
                    <div className="flex justify-between items-start mb-4">
                      <div className="size-10 rounded-lg bg-secondary flex items-center justify-center">
                          <Globe className={cn("size-5", isActive ? "text-primary" : "text-muted-foreground")} />
                      </div>
                      <Badge className={cn(
                        "text-[8px] uppercase font-bold tracking-widest px-2 h-5",
                        isChecking ? "bg-secondary text-muted-foreground animate-pulse" :
                        isActive ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
                      )}>
                        {isChecking ? "PROBING..." : live.status}
                      </Badge>
                    </div>
                    <h4 className="font-headline font-bold text-lg">{agent.name}</h4>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1">{agent.location}</p>
                    <p className="text-[8px] font-code text-muted-foreground opacity-50 mb-4 truncate">{agent.url}</p>
                    
                    <div className={cn(
                      "flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest min-h-[1.5rem]",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )}>
                      {isChecking ? (
                        <div className="flex items-center gap-2 opacity-50">
                           <Loader2 className="size-3 animate-spin" />
                           <span>Menghitung Latency...</span>
                        </div>
                      ) : (
                        <>
                          {isActive ? <Wifi className="size-3" /> : <WifiOff className="size-3" />}
                          Latency: {live.latency}
                        </>
                      )}
                    </div>
                  </Card>
                );
             })}
          </div>
        </div>
      </section>

      <section id="pricing" className="py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-16 px-4">
            <Badge variant="outline" className="border-primary/20 text-primary uppercase font-bold tracking-widest px-2 py-0.5 text-[9px]">Transparansi Biaya</Badge>
            <h2 className="text-3xl md:text-5xl font-headline font-bold">Skalakan Potensi Anda</h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-xs sm:text-sm font-medium">Pilih paket terbaik untuk aplikasi Anda. Tidak ada biaya tersembunyi.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {pricingTiers.map((tier) => (
              <Card key={tier.id} className={cn(
                "border-border/50 bg-card transition-all duration-500 hover:border-primary/50 hover:-translate-y-2 relative overflow-hidden group flex flex-col h-full",
                tier.popular && "border-primary/50 ring-1 ring-primary/20 scale-[1.03] z-10"
              )}>
                {tier.popular && (
                  <div className="absolute top-0 right-0 bg-primary text-white text-[8px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 rounded-bl-xl shadow-lg">Rekomendasi</div>
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
                      <span className="text-muted-foreground text-[7px] uppercase font-bold tracking-widest">/bln</span>
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
                      Pilih {tier.name} <ChevronRight className="size-3" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="py-20 bg-secondary/20">
        <div className="max-w-3xl auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-12">
            <Badge variant="outline" className="border-primary/20 text-primary uppercase font-bold tracking-widest px-2 py-0.5 text-[9px]">FAQ</Badge>
            <h2 className="text-3xl md:text-5xl font-headline font-bold">Pertanyaan Umum</h2>
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

      <footer className="pt-20 pb-10 bg-card border-t border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-16">
            <div className="space-y-6">
              <Link href="/" className="flex items-center gap-3">
                <div className="w-[40px] h-[40px] rounded-xl overflow-hidden flex items-center justify-center bg-primary">
                  <Image src="/img/icons.png" alt="STSCloud" width={40} height={40} className="object-cover" />
                </div>
                <span className="font-headline font-bold text-2xl tracking-tight">STS<span className="text-primary">Cloud</span></span>
              </Link>
              <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                Penyedia infrastruktur cloud berperforma tinggi untuk game server, bot, dan aplikasi web dengan latensi terendah di Asia Tenggara.
              </p>
              <div className="flex items-center gap-4">
                <Link href="#" className="size-9 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all">
                  <Twitter className="size-4" />
                </Link>
                <Link href="#" className="size-9 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all">
                  <Github className="size-4" />
                </Link>
                <Link href="#" className="size-9 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all">
                  <Instagram className="size-4" />
                </Link>
                <Link href="#" className="size-9 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all">
                  <MessageSquare className="size-4" />
                </Link>
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="font-headline font-bold text-sm uppercase tracking-widest text-primary">Layanan</h4>
              <ul className="space-y-4 text-sm text-muted-foreground">
                <li><Link href="#pricing" className="hover:text-primary transition-colors">Pricing & Plans</Link></li>
                <li><Link href="#features" className="hover:text-primary transition-colors">Cloud Bot Hosting</Link></li>
                <li><Link href="#features" className="hover:text-primary transition-colors">Web App Deployment</Link></li>
                <li><Link href="#features" className="hover:text-primary transition-colors">Game Server Nodes</Link></li>
                <li><Link href="/support" className="hover:text-primary transition-colors">Pusat Bantuan</Link></li>
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="font-headline font-bold text-sm uppercase tracking-widest text-primary">Legal & Security</h4>
              <ul className="space-y-4 text-sm text-muted-foreground">
                <li><Link href="/legal" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                <li><Link href="/legal" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                <li><Link href="/legal" className="hover:text-primary transition-colors">Legal Agreement</Link></li>
                <li className="flex items-center gap-3 pt-2">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50 border border-border/50">
                      <ShieldCheck className="size-3 text-green-500" />
                      <span className="text-[10px] font-bold uppercase tracking-tight">PCI-DSS Compliant</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50 border border-border/50">
                      <Lock className="size-3 text-primary" />
                      <span className="text-[10px] font-bold uppercase tracking-tight">AES-256 Encrypted</span>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-border/50 flex flex-col items-center justify-center text-center gap-2">
            <p className="text-[11px] text-muted-foreground font-bold tracking-widest">
              © 2026- Present | STSCloud Infrastructure • All rights reserved
            </p>
            <p className="text-[11px] text-muted-foreground font-bold tracking-widest">
              Powered by <Link href="https://starvale.my.id" target="_blank" className="text-foreground hover:underline">StarVale</Link>
            </p>
            <p className="text-[11px] text-muted-foreground font-bold tracking-widest mt-2">
              Build with 💙 by <Link href="https://althar.dev" target="_blank" className="text-primary hover:underline">AltharDev</Link>
            </p>
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
