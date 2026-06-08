
"use client";

import * as React from "react";
import { 
  Terminal, 
  Cpu, 
  Activity, 
  Zap, 
  ShieldAlert, 
  Globe, 
  Server,
  Settings,
  ArrowLeft,
  ChevronRight,
  Database,
  BarChart3,
  BrainCircuit,
  Lock,
  Headset,
  User,
  LogOut,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AIConfigTool } from "@/components/ai-config-tool";
import { useUser, useAuth, useFirestore } from "@/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { doc, onSnapshot } from "firebase/firestore";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

export default function DevConsole() {
  const router = useRouter();
  const { user, loading: authLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const [profile, setProfile] = React.useState<any>(null);
  const [profileLoading, setProfileLoading] = React.useState(true);
  const [loadingProgress, setLoadingProgress] = React.useState(0);

  // Simulate progress for Cloudflare-like effect
  React.useEffect(() => {
    if (authLoading || profileLoading) {
      const interval = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= 100) return 100;
          return prev + 2;
        });
      }, 30);
      return () => clearInterval(interval);
    }
  }, [authLoading, profileLoading]);

  React.useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/auth?type=login");
      return;
    }

    const unsub = onSnapshot(doc(db, "users", user.uid), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setProfile(data);
        
        // Access Control: Only allow if dev flag is true
        if (data.dev !== true) {
          router.replace("/dashboard");
        }
      } else {
        router.replace("/dashboard");
      }
      setProfileLoading(false);
    });
    
    return () => unsub();
  }, [user, authLoading, db, router]);

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/auth?type=login");
  };

  // Branded Loading State (Matched with Auth page)
  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 sm:p-8">
        <div className="w-full max-w-[160px] sm:max-w-[240px] flex flex-col items-center animate-in fade-in duration-700">
          <div className="relative w-full aspect-square mb-2">
            <Image 
              src="/img/icon.png" 
              alt="STSCloud" 
              fill 
              className="object-contain grayscale opacity-60" 
              priority
            />
          </div>
          <div className="w-full">
            <div className="h-[4px] w-full bg-secondary overflow-hidden rounded-full">
              <div 
                className="h-full bg-primary transition-all duration-300 ease-out" 
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Double check if we should even render (in case redirect hasn't happened yet)
  if (!profile || profile.dev !== true) {
    return null;
  }

  const displayName = profile?.displayName || user?.displayName || user?.email?.split('@')[0] || "Dev Account";
  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <div className="bg-background min-h-screen">
      {/* Dev Header */}
      <header className="flex h-16 shrink-0 items-center justify-between px-4 md:px-8 border-b border-border/50 sticky top-0 bg-[#0c0c0f]/80 backdrop-blur-md z-40">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-[32px] h-[32px] rounded-lg overflow-hidden flex items-center justify-center bg-primary">
              <Image src="/img/icon.png" alt="STSCloud" width={32} height={32} className="invert brightness-0" />
            </div>
            <span className="font-headline font-bold text-lg tracking-tight">
              <span className="text-primary">Dev</span>Console
            </span>
          </Link>
          <div className="h-4 w-px bg-border hidden sm:block" />
          <button 
            onClick={() => router.back()}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
          </button>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <Badge variant="outline" className="hidden lg:flex border-primary/30 text-primary bg-primary/5 gap-2 px-3 py-1">
            <ShieldAlert className="size-3" /> System: Stable
          </Badge>
          <div className="h-4 w-px bg-border" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-auto p-1 md:pr-4 rounded-full border border-border/50 gap-3 group transition-all hover:bg-secondary/50">
                <Avatar className="size-8 md:size-9">
                  <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
                    {userInitial}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col items-start text-left">
                  <span className="text-xs font-bold font-headline leading-none truncate max-w-[120px]">
                    {displayName}
                  </span>
                  <span className="text-[10px] text-muted-foreground leading-none mt-1 truncate max-w-[120px]">
                    ADMIN ROLE
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 mt-2">
              <DropdownMenuLabel className="font-headline">Admin Access</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2">
                <User className="size-4" /> Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2">
                <Settings className="size-4" /> Global Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive" onClick={handleSignOut}>
                <LogOut className="size-4" /> Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-2xl md:text-4xl font-headline font-bold">Infrastructure Control</h2>
            <p className="text-sm text-muted-foreground">Monitor global node clusters and optimize internal configurations.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Terminal className="size-4" /> Global Logs
            </Button>
            <Button size="sm" className="bg-primary text-white gap-2">
              <Zap className="size-4" /> Node Restart
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="bg-secondary/30 p-1 rounded-xl h-auto w-full sm:w-fit overflow-x-auto justify-start flex">
            <TabsTrigger value="overview" className="rounded-lg gap-2 py-2 px-6 data-[state=active]:bg-primary data-[state=active]:text-white">
              <Activity className="size-4" /> Overview
            </TabsTrigger>
            <TabsTrigger value="ai" className="rounded-lg gap-2 py-2 px-6 data-[state=active]:bg-primary data-[state=active]:text-white">
              <BrainCircuit className="size-4" /> AI Optimizer
            </TabsTrigger>
            <TabsTrigger value="nodes" className="rounded-lg gap-2 py-2 px-6 data-[state=active]:bg-primary data-[state=active]:text-white">
              <Globe className="size-4" /> Global Nodes
            </TabsTrigger>
            <TabsTrigger value="security" className="rounded-lg gap-2 py-2 px-6 data-[state=active]:bg-primary data-[state=active]:text-white">
              <Lock className="size-4" /> Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 animate-in fade-in duration-500">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              <StatCard title="Global CPU" value="32.4%" trend="+2.1%" icon={Cpu} color="text-primary" />
              <StatCard title="Mem Reserved" value="1.2 TB" trend="-0.4%" icon={Database} color="text-accent" />
              <StatCard title="Active Connections" value="45.2k" trend="+12%" icon={Activity} color="text-green-400" />
              <StatCard title="Latency (Avg)" value="12ms" trend="Stable" icon={Zap} color="text-yellow-400" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 bg-card border-border/50">
                <CardHeader>
                  <CardTitle className="font-headline flex items-center gap-2">
                    <BarChart3 className="size-5 text-primary" /> Network Throughput
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center bg-black/20 rounded-xl m-4 md:m-6 border border-border/30">
                  <div className="text-center space-y-2 opacity-50">
                    <Activity className="size-12 mx-auto animate-pulse" />
                    <p className="text-sm">Real-time throughput data loading...</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border/50">
                <CardHeader>
                  <CardTitle className="font-headline text-lg">System Integrity</CardTitle>
                  <CardDescription>Status of core internal services.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <IntegrityItem name="Authentication API" status="online" />
                  <IntegrityItem name="Payment Gateway" status="online" />
                  <IntegrityItem name="Server Provisioner" status="online" />
                  <IntegrityItem name="Database Cluster" status="warning" message="Degraded on Node-04" />
                  <IntegrityItem name="AI Engine" status="online" />
                  <IntegrityItem name="Backup Systems" status="online" />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="ai" className="animate-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-6">
              <div className="max-w-3xl">
                <h3 className="text-xl font-headline font-bold mb-2">AI Configuration Intelligence</h3>
                <p className="text-muted-foreground text-sm">Use our LLM-powered engine to generate optimized launch parameters and environment settings for any application type.</p>
              </div>
              <AIConfigTool />
            </div>
          </TabsContent>

          <TabsContent value="nodes" className="animate-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
              <NodeCard location="Singapore" dc="Equinix SG1" load={45} status="online" />
              <NodeCard location="Jakarta" dc="Cyber 1" load={78} status="online" />
              <NodeCard location="Tokyo" dc="Digital Realty" load={12} status="online" />
              <NodeCard location="USA East" dc="AWS us-east-1" load={92} status="warning" />
              <NodeCard location="Europe" dc="Hetzner DE" load={30} status="online" />
              <NodeCard location="Sydney" dc="Vultr AU" load={0} status="offline" />
            </div>
          </TabsContent>

          <TabsContent value="security" className="animate-in slide-in-from-bottom-4 duration-500">
             <Card className="bg-card border-border/50 max-w-2xl">
                <CardHeader>
                  <CardTitle className="font-headline text-xl">Security & Compliance</CardTitle>
                  <CardDescription>Manage global security flags and DDoS mitigation.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl border border-border/50">
                    <div className="space-y-1">
                      <div className="font-bold">Maintenance Mode</div>
                      <div className="text-xs text-muted-foreground">Redirect all users to maintenance page.</div>
                    </div>
                    <Button variant="outline" size="sm">Enable</Button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl border border-border/50">
                    <div className="space-y-1">
                      <div className="font-bold">Strict API Shield</div>
                      <div className="text-xs text-muted-foreground">Enforce rate limiting on all public endpoints.</div>
                    </div>
                    <Button size="sm">Active</Button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl border border-border/50">
                    <div className="space-y-1">
                      <div className="font-bold">Firewall Lockdown</div>
                      <div className="text-xs text-muted-foreground">Block all non-essential ingress traffic.</div>
                    </div>
                    <Button variant="destructive" size="sm">Emergency</Button>
                  </div>
                </CardContent>
             </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function StatCard({ title, value, trend, icon: Icon, color }: any) {
  return (
    <Card className="bg-card border-border/50 overflow-hidden relative group">
      <CardContent className="p-3 md:p-6">
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <div className={cn("size-8 md:size-10 rounded-lg md:rounded-xl bg-secondary flex items-center justify-center", color)}>
            <Icon className="size-4 md:size-5" />
          </div>
          <Badge variant="outline" className={cn(
            "text-[8px] md:text-[10px] border-none font-bold px-1.5 md:px-2.5",
            trend.startsWith('+') ? "text-green-400" : trend === "Stable" ? "text-primary" : "text-red-400"
          )}>{trend}</Badge>
        </div>
        <div className="space-y-0.5 md:space-y-1">
          <div className="text-lg md:text-2xl font-bold font-headline">{value}</div>
          <div className="text-[8px] md:text-[10px] text-muted-foreground font-bold uppercase tracking-widest leading-tight">{title}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function IntegrityItem({ name, status, message }: { name: string, status: 'online' | 'warning' | 'offline', message?: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className={cn(
        "size-2 mt-1.5 rounded-full shrink-0",
        status === 'online' ? "bg-green-500 animate-pulse" : status === 'warning' ? "bg-yellow-500" : "bg-red-500"
      )} />
      <div className="space-y-0.5">
        <div className="text-sm font-bold">{name}</div>
        {message && <div className="text-[10px] text-yellow-500 uppercase font-bold tracking-wider">{message}</div>}
      </div>
    </div>
  );
}

function NodeCard({ location, dc, load, status }: { location: string, dc: string, load: number, status: 'online' | 'warning' | 'offline' }) {
  return (
    <Card className="bg-card border-border/50 group hover:border-primary/50 transition-colors">
      <CardContent className="p-3 md:p-6 space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="size-8 md:size-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
              <Globe className="size-4 md:size-5 text-primary" />
            </div>
            <div className="min-w-0">
              <div className="font-bold font-headline text-xs md:text-base truncate">{location}</div>
              <div className="text-[8px] md:text-[10px] text-muted-foreground uppercase font-bold tracking-widest truncate">{dc}</div>
            </div>
          </div>
          <Badge className={cn(
            "uppercase text-[8px] md:text-[10px] font-bold tracking-widest h-5 px-1.5 md:px-2.5 w-fit",
            status === 'online' ? "bg-green-500/10 text-green-500 border-green-500/20" : status === 'warning' ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
          )} variant="outline">{status}</Badge>
        </div>

        <div className="space-y-1.5 md:space-y-2">
          <div className="flex items-center justify-between text-[8px] md:text-[10px] font-bold uppercase tracking-widest">
            <span className="text-muted-foreground">Load</span>
            <span className={cn(load > 80 ? "text-red-500" : "text-primary")}>{load}%</span>
          </div>
          <div className="h-1 md:h-1.5 w-full bg-secondary rounded-full overflow-hidden">
            <div 
              className={cn("h-full transition-all duration-1000", load > 80 ? "bg-red-500" : "bg-primary")} 
              style={{ width: `${load}%` }} 
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
