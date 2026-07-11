
"use client";

import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  Terminal, 
  Cpu, 
  Activity, 
  ShieldAlert, 
  Globe, 
  Settings,
  ArrowLeft,
  User,
  LogOut,
  CreditCard,
  Users,
  Search,
  ChevronRight,
  Plus,
  Loader2,
  Tag,
  Save,
  RefreshCw,
  Database,
  HardDrive,
  Layout,
  Trash2,
  PlusCircle,
  X,
  Wifi,
  WifiOff,
  AlertTriangle,
  Bot,
  Power,
  CheckCircle2,
  Server as ServerIcon,
  Monitor,
  Package,
  Share2,
  Link as LinkIcon,
  FileText,
  Key,
  Wrench
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser, useAuth, useFirestore } from "@/firebase";
import { signOut } from "firebase/auth";
import { useRouter as useNextRouter } from "next/navigation";
import { doc, onSnapshot, collection, query, limit, setDoc, serverTimestamp, orderBy, updateDoc, deleteDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { getSystemHardwareInfo } from "@/app/actions/system-info";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Loader } from "@/components/loader";

const defaultPricingTiers = [
  { id: "p1", name: "Zero", ram: "1.5GB", cpu: "100%", disk: "2GB", price: "IDR 10.000", priceValue: 10000, popular: false, stock: 10 },
  { id: "p2", name: "Core", ram: "3GB", cpu: "170%", disk: "5GB", price: "IDR 17.000", priceValue: 17000, popular: false, stock: 5 },
  { id: "p3", name: "Plus", ram: "5GB", cpu: "250%", disk: "10GB", price: "IDR 27.000", priceValue: 27000, popular: true, stock: 8 },
  { id: "p4", name: "Pro", ram: "7GB", cpu: "340%", disk: "15GB", price: "IDR 30.000", priceValue: 30000, popular: false, stock: 12 },
  { id: "p5", name: "Elite", ram: "10GB", cpu: "Unlimited", disk: "25GB", price: "IDR 35.000", priceValue: 35000, popular: false, stock: 3 },
  { id: "p6", name: "Infinity", ram: "Unlimited", cpu: "Unlimited", disk: "Unlimited", price: "IDR 50.000", priceValue: 50000, popular: false, stock: 99 },
];

const defaultGlobalAgents = [
  { id: "ag1", name: "Indonesia", location: "Jakarta Region (JKT-01)", url: "stscloud.id", latency: "Checking...", status: "active" },
  { id: "ag2", name: "Singapore", location: "SG Region (SIN-01)", url: "google.com", latency: "Checking...", status: "active" },
  { id: "ag3", name: "Malaysia", location: "KL Region (KUL-01)", url: "127.0.0.1", latency: "Checking...", status: "active" },
];

const defaultTemplates = [
  { id: "website", name: "Website", group: "Cloud", icon: "Globe", status: "active" },
  { id: "bots", name: "Bots", group: "Cloud", icon: "Bot", status: "active" },
];

const defaultSocials = {
  twitter: "#",
  linkedin: "#",
  instagram: "#",
  whatsapp: "#"
};

function DevConsoleContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const { toast } = useToast();
  
  const currentView = searchParams.get("view") || "overview";

  const [profile, setProfile] = React.useState<any>(null);
  const [mounted, setMounted] = React.useState(false);
  
  const [usersList, setUsersList] = React.useState<any[]>([]);
  const [agentsList, setAgentsList] = React.useState<any[]>([]);
  const [transactions, setTransactions] = React.useState<any[]>([]);

  const [pricingData, setPricingData] = React.useState<any[]>([]);
  const [landingAgents, setLandingAgents] = React.useState<any[]>([]);
  const [templatesData, setTemplatesData] = React.useState<any[]>([]);
  const [socialsData, setSocialsData] = React.useState<any>(defaultSocials);
  const [systemSettings, setSystemSettings] = React.useState<any>({ maintenance: false });
  
  const [isPricingDirty, setIsPricingDirty] = React.useState(false);
  const [isLandingDirty, setIsLandingDirty] = React.useState(false);
  const [isTemplatesDirty, setIsTemplatesDirty] = React.useState(false);
  const [isSocialsDirty, setIsSocialsDirty] = React.useState(false);
  
  const [isUpdatingPricing, setIsUpdatingPricing] = React.useState(false);
  const [isUpdatingLanding, setIsUpdatingLanding] = React.useState(false);
  const [isUpdatingTemplates, setIsUpdatingTemplates] = React.useState(false);
  const [isUpdatingSocials, setIsUpdatingSocials] = React.useState(false);
  const [isUpdatingSystem, setIsUpdatingSystem] = React.useState(false);

  const [agentLiveInfo, setAgentLiveInfo] = React.useState<Record<string, { status: string, latency: string, isChecking: boolean }>>({});
  const [vpsMetrics, setVpsMetrics] = React.useState<any>(null);

  const [isAddingAgent, setIsAddingAgent] = React.useState(false);
  const [regionName, setRegionName] = React.useState("");
  const [agentDomain, setAgentDomain] = React.useState("");
  const [agentIp, setAgentIp] = React.useState("");
  const [agentSecret, setAgentSecret] = React.useState("");
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", value);
    router.replace(`/dev?${params.toString()}`, { scroll: false });
  };

  React.useEffect(() => {
    setMounted(true);
    if (authLoading) return;
    if (!user) {
      router.replace("/auth?type=login");
      return;
    }

    const unsub = onSnapshot(doc(db, "users", user.uid), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProfile(data);
        if (data.dev !== true) router.replace("/dashboard");
      } else {
        router.replace("/dashboard");
      }
    }, (err) => {
      console.warn("DevConsole Auth Listener Error:", err.message);
    });
    
    return () => unsub();
  }, [user, authLoading, db, router]);

  React.useEffect(() => {
    if (!profile || profile.dev !== true) return;
    
    const refreshMetrics = () => {
      getSystemHardwareInfo().then(res => {
        if (res.success) setVpsMetrics(res.data);
      });
    };
    refreshMetrics();
    const metricsInt = setInterval(refreshMetrics, 30000);

    const unsubUsers = onSnapshot(query(collection(db, "users"), limit(100)), (snapshot) => {
      setUsersList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => console.warn("Users list permission denied"));

    const unsubAgents = onSnapshot(collection(db, "infrastructure_agents"), (snapshot) => {
      setAgentsList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => console.warn("Agents list permission denied"));

    const unsubTransactions = onSnapshot(query(collection(db, "transactions"), orderBy("createdAt", "desc"), limit(50)), (snapshot) => {
      setTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => console.warn("Transactions list permission denied"));

    const unsubPricing = onSnapshot(doc(db, "main", "product"), (docSnap) => {
      if (!isPricingDirty) {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.tiers) setPricingData(data.tiers);
        } else {
          setPricingData(defaultPricingTiers);
        }
      }
    });

    const unsubLandingAgents = onSnapshot(doc(db, "main", "agents"), (docSnap) => {
      if (!isLandingDirty) {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.list) setLandingAgents(data.list);
        } else {
          setLandingAgents(defaultGlobalAgents);
        }
      }
    });

    const unsubTemplates = onSnapshot(doc(db, "main", "templates"), (docSnap) => {
      if (!isTemplatesDirty) {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.list) setTemplatesData(data.list);
        } else {
          setTemplatesData(defaultTemplates);
        }
      }
    });

    const unsubSocials = onSnapshot(doc(db, "main", "socials"), (docSnap) => {
      if (!isSocialsDirty) {
        if (docSnap.exists()) {
          setSocialsData(docSnap.data());
        } else {
          setSocialsData(defaultSocials);
        }
      }
    });

    const unsubSystem = onSnapshot(doc(db, "main", "settings"), (docSnap) => {
      if (docSnap.exists()) {
        setSystemSettings(docSnap.data());
      }
    });

    return () => {
      clearInterval(metricsInt);
      unsubUsers();
      unsubAgents();
      unsubTransactions();
      unsubPricing();
      unsubLandingAgents();
      unsubTemplates();
      unsubSocials();
      unsubSystem();
    };
  }, [profile, db, isPricingDirty, isLandingDirty, isTemplatesDirty, isSocialsDirty]);

  React.useEffect(() => {
    if (landingAgents.length === 0) return;

    const checkAgent = async (agent: any) => {
      const url = agent.url || agent.domain;
      if (!url) return;

      setAgentLiveInfo(prev => ({ 
        ...prev, 
        [agent.id]: { ...(prev[agent.id] || {}), isChecking: true } 
      }));

      const isLocal = url.includes("localhost") || url.includes("127.0.0.1");
      if (isLocal) {
        setAgentLiveInfo(prev => ({ 
          ...prev, 
          [agent.id]: { status: "ACTIVE", latency: "< 1ms (Local)", isChecking: false } 
        }));
        return;
      }

      const start = performance.now();
      try {
        const targetUrl = url.startsWith("http") ? url : `https://${url}`;
        await fetch(targetUrl, { mode: 'no-cors', cache: 'no-cache', signal: AbortSignal.timeout(5000) });
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

    landingAgents.forEach(checkAgent);
    const interval = setInterval(() => landingAgents.forEach(checkAgent), 15000);
    return () => clearInterval(interval);
  }, [landingAgents]);

  if (authLoading || !user || !profile || profile.dev !== true) {
    return <Loader />;
  }

  const handleToggleMaintenance = async (val: boolean) => {
    setIsUpdatingSystem(true);
    try {
      await setDoc(doc(db, "main", "settings"), { maintenance: val, updatedAt: serverTimestamp() }, { merge: true });
      toast({ title: val ? "Maintenance Active" : "Maintenance Disabled", description: val ? "Platform locked for users." : "Platform is now public." });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally {
      setIsUpdatingSystem(false);
    }
  };

  const handleUpdateTier = (tierId: string, field: string, value: any) => {
    setIsPricingDirty(true);
    setPricingData(prev => prev.map(t => t.id === tierId ? { ...t, [field]: value } : t));
  };

  const handleAddTierRow = () => {
    setIsPricingDirty(true);
    const newTier = {
      id: `p-${Math.random().toString(36).substring(2, 7)}`,
      name: "New Tier",
      ram: "1GB",
      cpu: "100%",
      disk: "1GB",
      price: "IDR 0",
      priceValue: 0,
      popular: false,
      stock: 0
    };
    setPricingData(prev => [...prev, newTier]);
  };

  const handleDeleteTier = (id: string) => {
    setIsPricingDirty(true);
    setPricingData(prev => prev.filter(t => t.id !== id));
    toast({ title: "Tier removed locally", description: "Changes will be permanent once you click Save Changes." });
  };

  const savePricingToDB = async () => {
    setIsUpdatingPricing(true);
    setDoc(doc(db, "main", "product"), { tiers: pricingData, updatedAt: serverTimestamp() })
      .then(() => {
        setIsPricingDirty(false);
        toast({ title: "Pricing Saved", description: "Changes synchronized with production." });
      })
      .catch((err) => toast({ variant: "destructive", title: "Save Error", description: err.message }))
      .finally(() => setIsUpdatingPricing(false));
  };

  const handleUpdateLandingAgent = (id: string, field: string, value: any) => {
    setIsLandingDirty(true);
    setLandingAgents(prev => prev.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  const handleAddLandingAgentRow = () => {
    setIsLandingDirty(true);
    const newAgent = {
      id: `ag-${Math.random().toString(36).substring(2, 7)}`,
      name: "New Region",
      location: "City, Country",
      url: "localhost",
      latency: "Checking...",
      status: "active"
    };
    setLandingAgents(prev => [...prev, newAgent]);
  };

  const handleDeleteLandingAgent = (id: string) => {
    setIsLandingDirty(true);
    setLandingAgents(prev => prev.filter(a => a.id !== id));
    toast({ title: "Region removed locally", description: "Changes will be permanent once you click Save Changes." });
  };

  const saveLandingAgentsToDB = async () => {
    setIsUpdatingLanding(true);
    setDoc(doc(db, "main", "agents"), { list: landingAgents, updatedAt: serverTimestamp() })
      .then(() => {
        setIsLandingDirty(false);
        toast({ title: "Landing Agents Saved", description: "Public infrastructure list updated." });
      })
      .catch((err) => toast({ variant: "destructive", title: "Save Error", description: err.message }))
      .finally(() => setIsUpdatingLanding(false));
  };

  const handleUpdateTemplate = (id: string, field: string, value: any) => {
    setIsTemplatesDirty(true);
    setTemplatesData(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const handleAddTemplateRow = () => {
    setIsTemplatesDirty(true);
    const newTemplate = {
      id: `tmpl-${Math.random().toString(36).substring(2, 7)}`,
      name: "New Template",
      group: "Cloud",
      icon: "Layout",
      status: "active"
    };
    setTemplatesData(prev => [...prev, newTemplate]);
  };

  const handleDeleteTemplate = (id: string) => {
    setIsTemplatesDirty(true);
    setTemplatesData(prev => prev.filter(t => t.id !== id));
    toast({ title: "Template removed locally", description: "Click Save to confirm." });
  };

  const saveTemplatesToDB = async () => {
    setIsUpdatingTemplates(true);
    setDoc(doc(db, "main", "templates"), { list: templatesData, updatedAt: serverTimestamp() })
      .then(() => {
        setIsTemplatesDirty(false);
        toast({ title: "Templates Saved", description: "Deployment categories updated." });
      })
      .catch((err) => toast({ variant: "destructive", title: "Save Error", description: err.message }))
      .finally(() => setIsUpdatingTemplates(false));
  };

  const handleUpdateSocial = (field: string, value: string) => {
    setIsSocialsDirty(true);
    setSocialsData(prev => ({ ...prev, [field]: value }));
  };

  const saveSocialsToDB = async () => {
    setIsUpdatingSocials(true);
    setDoc(doc(db, "main", "socials"), { ...socialsData, updatedAt: serverTimestamp() })
      .then(() => {
        setIsSocialsDirty(false);
        toast({ title: "Socials Saved", description: "Footer links updated successfully." });
      })
      .catch((err) => toast({ variant: "destructive", title: "Save Error", description: err.message }))
      .finally(() => setIsUpdatingSocials(false));
  };

  const handleAddAgent = async () => {
    if (!regionName || !agentDomain || !agentIp || !agentSecret) {
      toast({ variant: "destructive", title: "Validation Error", description: "Please fill all fields including Secret Key." });
      return;
    }
    setIsAddingAgent(true);
    const agentId = `agent-${Math.random().toString(36).substring(2, 9)}`;
    setDoc(doc(db, "infrastructure_agents", agentId), { 
      regionName, 
      domain: agentDomain, 
      ip: agentIp,
      secretKey: agentSecret,
      status: "online", 
      createdAt: serverTimestamp(), 
      load: Math.floor(Math.random() * 20) + 5 
    })
      .then(() => {
        toast({ title: "Agent Registered", description: `Node active at ${regionName}.` });
        setIsDialogOpen(false);
        setRegionName("");
        setAgentDomain("");
        setAgentIp("");
        setAgentSecret("");
      })
      .catch((err) => toast({ variant: "destructive", title: "Error", description: err.message }))
      .finally(() => setIsAddingAgent(false));
  };

  const handleDeleteInfraAgent = async (id: string) => {
    try {
      await deleteDoc(doc(db, "infrastructure_agents", id));
      toast({ title: "Agent Removed", description: "Infrastructure node decommissioned." });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/auth?type=login");
  };

  const displayName = mounted ? (profile?.displayName || user?.displayName || user?.email?.split('@')[0] || "Admin") : "Admin";
  const totalRevenue = transactions.reduce((acc, tx) => acc + (tx.status === 'success' ? tx.amount : 0), 0);
  const avgGlobalLoad = agentsList.length > 0 
    ? (agentsList.reduce((acc, a) => acc + (a.load || 0), 0) / agentsList.length).toFixed(1)
    : "0.0";

  return (
    <div className="bg-background min-h-screen">
      <header className="flex h-16 shrink-0 items-center justify-between px-4 md:px-8 border-b border-border/50 sticky top-0 bg-[#0c0c0f]/80 backdrop-blur-md z-40">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/img/icons.png" alt="STSCloud" width={32} height={32} className="object-contain" />
            <span className="font-headline font-bold text-lg tracking-tight">
              <span className="text-primary">Dev</span>Console
            </span>
          </Link>
          <div className="h-4 w-px bg-border hidden sm:block" />
          <button onClick={() => router.back()} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" />
          </button>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/dev/docs">
             <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hidden md:flex hover:text-primary">
                <FileText className="size-4" /> Docs & Setup
             </Button>
          </Link>
          <Badge variant="outline" className="hidden lg:flex border-primary/30 text-primary bg-primary/5 gap-2 px-3 py-1">
            <ShieldAlert className="size-3" /> System: Stable
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-auto p-1 md:pr-4 rounded-full border border-border/50 gap-3 group transition-all hover:bg-secondary/50">
                <Avatar className="size-8"><AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">{displayName.charAt(0).toUpperCase()}</AvatarFallback></Avatar>
                <div className="hidden md:flex flex-col items-start text-left">
                  <span className="text-xs font-bold font-headline">{displayName}</span>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest leading-none mt-1">ADMIN ROLE</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 mt-2">
              <DropdownMenuLabel>Admin Access</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2 text-destructive" onClick={handleSignOut}>
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
            <p className="text-sm text-muted-foreground">Monitor global agent clusters and optimize internal configurations.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dev/docs" className="md:hidden">
               <Button variant="outline" size="sm" className="gap-2"><FileText className="size-4" /> Docs</Button>
            </Link>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary text-white gap-2 font-bold">
                  <Plus className="size-4" /> Register Agent
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] w-[95vw] bg-card border-border/50 rounded-lg">
                <DialogHeader>
                  <DialogTitle className="font-headline font-bold text-xl">Register New Agent</DialogTitle>
                  <DialogDescription>Add a new edge storage node to the infrastructure cluster.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label className="text-xs font-bold uppercase text-muted-foreground">Region Name</Label>
                    <Input placeholder="e.g., Jakarta Region" className="bg-secondary/30 border-none h-11" value={regionName} onChange={(e) => setRegionName(e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-xs font-bold uppercase text-muted-foreground">Domain (HTTPS)</Label>
                    <Input placeholder="e.g., node-jkt.stscloud.id" className="bg-secondary/30 border-none h-11" value={agentDomain} onChange={(e) => setAgentDomain(e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-xs font-bold uppercase text-muted-foreground">IP Address</Label>
                    <Input placeholder="e.g., 103.11.x.x" className="bg-secondary/30 border-none h-11" value={agentIp} onChange={(e) => setAgentIp(e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-xs font-bold uppercase text-muted-foreground">Secret Key</Label>
                    <div className="relative">
                       <Key className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                       <Input 
                        placeholder="Shared secret token..." 
                        className="bg-secondary/30 border-none h-11 pl-10" 
                        value={agentSecret} 
                        onChange={(e) => setAgentSecret(e.target.value)} 
                       />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button className="w-full bg-primary text-white font-bold h-11" onClick={handleAddAgent} disabled={isAddingAgent}>
                    {isAddingAgent ? <Loader2 className="size-4 animate-spin mr-2" /> : <Plus className="size-4 mr-2" />}Register Agent
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs value={currentView} onValueChange={handleTabChange} className="space-y-8">
          <TabsList className="bg-secondary/30 p-1 rounded-xl h-auto w-full sm:w-fit overflow-x-auto justify-start flex border border-border/50">
            <TabsTrigger value="overview" className="rounded-lg gap-2 py-2 px-6 data-[state=active]:bg-primary"><Activity className="size-4" /> Overview</TabsTrigger>
            <TabsTrigger value="users" className="rounded-lg gap-2 py-2 px-6 data-[state=active]:bg-primary"><Users className="size-4" /> Users</TabsTrigger>
            <TabsTrigger value="billing" className="rounded-lg gap-2 py-2 px-6 data-[state=active]:bg-primary"><CreditCard className="size-4" /> Billing</TabsTrigger>
            <TabsTrigger value="pricing" className="rounded-lg gap-2 py-2 px-6 data-[state=active]:bg-primary"><Tag className="size-4" /> Pricing</TabsTrigger>
            <TabsTrigger value="templates" className="rounded-lg gap-2 py-2 px-6 data-[state=active]:bg-primary"><Layout className="size-4" /> Templates</TabsTrigger>
            <TabsTrigger value="socials" className="rounded-lg gap-2 py-2 px-6 data-[state=active]:bg-primary"><Share2 className="size-4" /> Socials</TabsTrigger>
            <TabsTrigger value="agents" className="rounded-lg gap-2 py-2 px-6 data-[state=active]:bg-primary"><Globe className="size-4" /> Agents</TabsTrigger>
            <TabsTrigger value="system" className="rounded-lg gap-2 py-2 px-6 data-[state=active]:bg-primary"><Settings className="size-4" /> System</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-12 animate-in fade-in duration-500">
            {/* Logic Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              <StatCard title="Total Revenue" value={`IDR ${(totalRevenue / 1000).toFixed(1)}K`} trend="Live" icon={CreditCard} color="text-green-400" />
              <StatCard title="Avg Agent Load" value={`${avgGlobalLoad}%`} trend={parseFloat(avgGlobalLoad) > 80 ? "Critical" : "Stable"} icon={Cpu} color="text-primary" />
              <StatCard title="Active Agents" value={agentsList.filter(a => a.status === 'online').length} trend="Online" icon={Activity} color="text-primary" />
              <StatCard title="Total Users" value={usersList.length} trend="+New" icon={Users} color="text-yellow-400" />
            </div>

            {/* Hardware Metrics Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 px-1">
                <div className="size-10 rounded-xl bg-secondary flex items-center justify-center text-primary shadow-inner">
                  <Monitor className="size-5" />
                </div>
                <div>
                  <h3 className="text-xl font-headline font-bold">Physical Resources</h3>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Host Hardware Metrics</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-card border-border/50 relative overflow-hidden group">
                  <CardContent className="p-6">
                     <div className="flex items-center justify-between mb-4">
                       <Cpu className="size-5 text-primary" />
                       <Badge variant="outline" className="text-[8px] uppercase border-primary/20 text-primary">Processor</Badge>
                     </div>
                     <div className="space-y-1">
                        <div className="text-lg font-bold font-headline truncate max-w-full" title={vpsMetrics?.cpuModel || "Loading..."}>
                          {vpsMetrics ? vpsMetrics.cpuModel : "---"}
                        </div>
                        <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Model Identifier</div>
                     </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border/50 relative overflow-hidden group">
                  <CardContent className="p-6">
                     <div className="flex items-center justify-between mb-4">
                       <Activity className="size-5 text-accent" />
                       <Badge variant="outline" className="text-[8px] uppercase border-accent/20 text-accent">Concurrency</Badge>
                     </div>
                     <div className="space-y-1">
                        <div className="text-2xl font-bold font-headline">
                          {vpsMetrics ? vpsMetrics.cpuCores : "--"} Cores
                        </div>
                        <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Total Logical CPU</div>
                     </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border/50 relative overflow-hidden group">
                  <CardContent className="p-6">
                     <div className="flex items-center justify-between mb-4">
                       <Database className="size-5 text-green-400" />
                       <Badge variant="outline" className="text-[8px] uppercase border-green-400/20 text-green-400">Memory</Badge>
                     </div>
                     <div className="space-y-1">
                        <div className="text-2xl font-bold font-headline">
                          {vpsMetrics ? vpsMetrics.totalRam : "-- GB"}
                        </div>
                        <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Total Physical RAM</div>
                     </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border/50 relative overflow-hidden group">
                  <CardContent className="p-6">
                     <div className="flex items-center justify-between mb-4">
                       <HardDrive className="size-5 text-orange-400" />
                       <Badge variant="outline" className="text-[8px] uppercase border-orange-400/20 text-orange-400">Storage</Badge>
                     </div>
                     <div className="space-y-1">
                        <div className="text-2xl font-bold font-headline text-orange-400">
                           {vpsMetrics ? (vpsMetrics.freeDiskBytes / (1024 * 1024 * 1024)).toFixed(1) : "--"} GB
                        </div>
                        <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Free Root Storage</div>
                     </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="system" className="space-y-6 animate-in fade-in duration-500">
            <Card className="bg-card border-border/50">
               <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <Wrench className="size-5 text-primary" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Global Control</span>
                  </div>
                  <CardTitle className="font-headline">System Settings</CardTitle>
                  <CardDescription>Manage application-wide states and maintenance controls.</CardDescription>
               </CardHeader>
               <CardContent className="space-y-8 p-8">
                  <div className="flex items-center justify-between p-6 rounded-2xl bg-secondary/20 border border-border/50">
                    <div className="space-y-1">
                      <div className="font-bold flex items-center gap-2">
                        Maintenance Mode
                        {isUpdatingSystem && <Loader2 className="size-3 animate-spin text-primary" />}
                      </div>
                      <p className="text-sm text-muted-foreground">Redirect all non-developer users to a maintenance page.</p>
                    </div>
                    <Switch 
                      checked={systemSettings.maintenance || false} 
                      onCheckedChange={handleToggleMaintenance}
                      disabled={isUpdatingSystem}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20 space-y-4">
                        <div className="flex items-center gap-3">
                           <ShieldAlert className="size-5 text-primary" />
                           <h4 className="font-bold">Access Policy</h4>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          When maintenance is enabled, ordinary users will be blocked from accessing the Dashboard and Server Deployment. 
                          Account creation and logins will also be restricted to prevent data inconsistencies.
                        </p>
                     </div>
                     <div className="p-6 rounded-2xl bg-accent/5 border border-accent/20 space-y-4">
                        <div className="flex items-center gap-3">
                           <Monitor className="size-5 text-accent" />
                           <h4 className="font-bold">Dev Bypass</h4>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Users with the <strong>DEVELOPER</strong> role will see a notice at the top of the site but can continue to use all features normally. 
                          This allows you to test fixes in a live environment.
                        </p>
                     </div>
                  </div>
               </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6 animate-in fade-in duration-500">
            <Card className="bg-card border-border/50">
              <CardHeader>
                <CardTitle className="font-headline">User Directory</CardTitle>
                <CardDescription>Manage application users and roles.</CardDescription>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usersList.map((u) => (
                      <TableRow key={u.id} className="hover:bg-secondary/10">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="size-8">
                              <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
                                {(u.displayName || u.email || "?").charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-bold text-xs">{u.displayName || "Standard User"}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{u.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn("text-[8px] uppercase px-1.5", u.dev ? "border-primary text-primary bg-primary/5" : "text-muted-foreground")}>
                            {u.dev ? "DEVELOPER" : "USER"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {u.createdAt?.toDate ? u.createdAt.toDate().toLocaleDateString() : "N/A"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/dev/users/${u.id}`}>
                            <Button variant="ghost" size="sm" className="h-8 gap-2 text-xs">
                              Detail <ChevronRight className="size-3" />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing" className="space-y-6 animate-in fade-in duration-500">
            <Card className="bg-card border-border/50">
              <CardHeader>
                <CardTitle className="font-headline">Transaction History</CardTitle>
                <CardDescription>Monitor platform revenue and payments.</CardDescription>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((tx) => (
                      <TableRow key={tx.id} className="hover:bg-secondary/10">
                        <TableCell className="font-code text-[10px] text-primary">{tx.externalId || tx.id}</TableCell>
                        <TableCell className="text-xs">{tx.userEmail || "Anonymous"}</TableCell>
                        <TableCell className="text-xs font-bold">IDR {tx.amount?.toLocaleString()}</TableCell>
                        <TableCell className="text-xs uppercase font-bold text-muted-foreground">{tx.plan || "N/A"}</TableCell>
                        <TableCell>
                          <Badge className={cn(
                            "text-[8px] font-bold uppercase",
                            tx.status === "success" ? "bg-green-500/10 text-green-500 border-green-500/20" :
                            tx.status === "pending" ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" :
                            "bg-red-500/10 text-red-500 border-red-500/20"
                          )}>
                            {tx.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {tx.createdAt?.toDate ? tx.createdAt.toDate().toLocaleDateString() : "N/A"}
                        </TableCell>
                      </TableRow>
                    ))}
                    {transactions.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-20 opacity-50 text-sm">No transactions found.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pricing" className="space-y-6 animate-in fade-in duration-500">
            <Card className="bg-card border-border/50">
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-border/50 pb-6 gap-4">
                <div>
                  <CardTitle className="font-headline">Product Tiers Management</CardTitle>
                  <CardDescription>
                    Configure resources and pricing. 
                    {isPricingDirty && <span className="text-primary font-bold ml-2">(Unsaved Changes)</span>}
                  </CardDescription>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button variant="outline" size="sm" className="gap-2 flex-1 sm:flex-none" onClick={handleAddTierRow}>
                    <PlusCircle className="size-4" /> Add Row
                  </Button>
                  <Button className="bg-primary text-white gap-2 font-bold flex-1 sm:flex-none" onClick={savePricingToDB} disabled={isUpdatingPricing}>
                    {isUpdatingPricing ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Save Changes
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tier Name</TableHead>
                      <TableHead>Price Display</TableHead>
                      <TableHead>Value (IDR)</TableHead>
                      <TableHead>RAM</TableHead>
                      <TableHead>CPU</TableHead>
                      <TableHead>Disk</TableHead>
                      <TableHead>Manual Stock</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pricingData.map((tier) => (
                      <TableRow key={tier.id} className="hover:bg-secondary/10">
                        <TableCell><Input className="bg-secondary/30 border-none h-9 text-xs font-bold" value={tier.name} onChange={(e) => handleUpdateTier(tier.id, 'name', e.target.value)} /></TableCell>
                        <TableCell><Input className="bg-secondary/30 border-none h-9 text-xs w-28" value={tier.price} onChange={(e) => handleUpdateTier(tier.id, 'price', e.target.value)} /></TableCell>
                        <TableCell><Input type="number" className="bg-secondary/30 border-none h-9 text-xs w-28" value={tier.priceValue} onChange={(e) => handleUpdateTier(tier.id, 'priceValue', parseInt(e.target.value) || 0)} /></TableCell>
                        <TableCell><Input className="bg-secondary/30 border-none h-9 text-xs w-20" value={tier.ram} onChange={(e) => handleUpdateTier(tier.id, 'ram', e.target.value)} /></TableCell>
                        <TableCell><Input className="bg-secondary/30 border-none h-9 text-xs w-20" value={tier.cpu} onChange={(e) => handleUpdateTier(tier.id, 'cpu', e.target.value)} /></TableCell>
                        <TableCell><Input className="bg-secondary/30 border-none h-9 text-xs w-20" value={tier.disk} onChange={(e) => handleUpdateTier(tier.id, 'disk', e.target.value)} /></TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 px-2">
                             <Package className="size-3.5 text-muted-foreground" />
                             <Input 
                               type="number"
                               className="bg-secondary/30 border-none h-9 text-xs w-16 font-bold font-code" 
                               value={tier.stock || 0}
                               onChange={(e) => handleUpdateTier(tier.id, 'stock', parseInt(e.target.value) || 0)}
                               onKeyDown={(e) => (e.key === 'ArrowUp' || e.key === 'ArrowDown') && e.preventDefault()}
                               onWheel={(e) => (e.target as HTMLInputElement).blur()}
                             />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" className={cn("h-7 px-2 text-[10px] font-bold uppercase", tier.popular ? "text-primary bg-primary/10" : "text-muted-foreground")} onClick={() => handleUpdateTier(tier.id, 'popular', !tier.popular)}>
                            {tier.popular ? 'Popular' : 'Standard'}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteTier(tier.id)}>
                            <Trash2 className="size-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="space-y-6 animate-in fade-in duration-500">
            <Card className="bg-card border-border/50">
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-border/50 pb-6 gap-4">
                <div>
                  <CardTitle className="font-headline">Deployment Templates</CardTitle>
                  <CardDescription>Manage available categories for server creation. {isTemplatesDirty && <span className="text-primary font-bold">(Unsaved)</span>}</CardDescription>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button variant="outline" size="sm" className="gap-2 flex-1 sm:flex-none" onClick={handleAddTemplateRow}>
                    <PlusCircle className="size-4" /> Add Template
                  </Button>
                  <Button className="bg-primary text-white gap-2 font-bold flex-1 sm:flex-none" onClick={saveTemplatesToDB} disabled={isUpdatingTemplates}>
                    {isUpdatingTemplates ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Save Changes
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Template Name</TableHead>
                      <TableHead>Group</TableHead>
                      <TableHead>Icon (Lucide)</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {templatesData.map((tmpl) => (
                      <TableRow key={tmpl.id} className="hover:bg-secondary/10">
                        <TableCell><Input className="bg-secondary/30 border-none h-9 text-xs font-bold" value={tmpl.name} onChange={(e) => handleUpdateTemplate(tmpl.id, 'name', e.target.value)} /></TableCell>
                        <TableCell><Input className="bg-secondary/30 border-none h-9 text-xs" value={tmpl.group} onChange={(e) => handleUpdateTemplate(tmpl.id, 'group', e.target.value)} /></TableCell>
                        <TableCell><Input className="bg-secondary/30 border-none h-9 text-xs font-code" value={tmpl.icon} onChange={(e) => handleUpdateTemplate(tmpl.id, 'icon', e.target.value)} /></TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className={cn(
                              "h-8 gap-2 text-[10px] font-bold uppercase px-3",
                              tmpl.status === "active" ? "text-green-500 bg-green-500/10" : "text-muted-foreground bg-secondary/50"
                            )}
                            onClick={() => handleUpdateTemplate(tmpl.id, 'status', tmpl.status === 'active' ? 'inactive' : 'active')}
                          >
                            <Power className="size-3" />
                            {tmpl.status === "active" ? "Active" : "Inactive"}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteTemplate(tmpl.id)}>
                            <Trash2 className="size-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {templatesData.length === 0 && (
                       <TableRow><TableCell colSpan={5} className="text-center py-10 opacity-50 text-xs">No templates defined.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="socials" className="space-y-6 animate-in fade-in duration-500">
            <Card className="bg-card border-border/50">
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-border/50 pb-6 gap-4">
                <div>
                  <CardTitle className="font-headline">Social Media Links</CardTitle>
                  <CardDescription>Configure platform presence on footer. {isSocialsDirty && <span className="text-primary font-bold">(Unsaved)</span>}</CardDescription>
                </div>
                <Button className="bg-primary text-white gap-2 font-bold w-full sm:w-auto" onClick={saveSocialsToDB} disabled={isUpdatingSocials}>
                  {isUpdatingSocials ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Save Changes
                </Button>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Twitter (X) URL</Label>
                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input 
                        placeholder="https://x.com/..." 
                        className="bg-secondary/30 border-none pl-10 h-11"
                        value={socialsData.twitter || ''}
                        onChange={(e) => handleUpdateSocial('twitter', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">LinkedIn URL</Label>
                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input 
                        placeholder="https://linkedin.com/in/..." 
                        className="bg-secondary/30 border-none pl-10 h-11"
                        value={socialsData.linkedin || ''}
                        onChange={(e) => handleUpdateSocial('linkedin', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Instagram URL</Label>
                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input 
                        placeholder="https://instagram.com/..." 
                        className="bg-secondary/30 border-none pl-10 h-11"
                        value={socialsData.instagram || ''}
                        onChange={(e) => handleUpdateSocial('instagram', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">WhatsApp Link</Label>
                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input 
                        placeholder="https://wa.me/..." 
                        className="bg-secondary/30 border-none pl-10 h-11"
                        value={socialsData.whatsapp || ''}
                        onChange={(e) => handleUpdateSocial('whatsapp', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="agents" className="space-y-12 animate-in slide-in-from-bottom-4 duration-500">
            <Card className="bg-card border-border/50">
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-border/50 pb-6 gap-4">
                <div>
                  <CardTitle className="font-headline">Public Map Configuration</CardTitle>
                  <CardDescription>Real-time status tracking for agents on Landing Page. {isLandingDirty && <span className="text-primary font-bold">(Unsaved Changes)</span>}</CardDescription>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button variant="outline" size="sm" className="gap-2 flex-1 sm:flex-none" onClick={handleAddLandingAgentRow}>
                    <PlusCircle className="size-4" /> Add Region
                  </Button>
                  <Button className="bg-primary text-white font-bold flex-1 sm:flex-none" onClick={saveLandingAgentsToDB} disabled={isUpdatingLanding}>
                    {isUpdatingLanding ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Save Changes
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Region</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Url/Domain</TableHead>
                      <TableHead>Latency (Live)</TableHead>
                      <TableHead>Status (Live)</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {landingAgents.map((agent) => {
                      const live = agentLiveInfo[agent.id];
                      const isChecking = live?.isChecking || !live;
                      const isActive = live?.status === "ACTIVE";

                      return (
                        <TableRow key={agent.id} className="hover:bg-secondary/10">
                          <TableCell><Input className="bg-secondary/30 border-none h-9 text-xs w-32 font-bold" value={agent.name} onChange={(e) => handleUpdateLandingAgent(agent.id, 'name', e.target.value)} /></TableCell>
                          <TableCell><Input className="bg-secondary/30 border-none h-9 text-xs w-full" value={agent.location} onChange={(e) => handleUpdateLandingAgent(agent.id, 'location', e.target.value)} /></TableCell>
                          <TableCell><Input className="bg-secondary/30 border-none h-9 text-xs w-full font-code" value={agent.url || agent.domain || ''} placeholder="node.domain.com" onChange={(e) => handleUpdateLandingAgent(agent.id, 'domain', e.target.value)} /></TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-primary px-2">
                              {isChecking ? (
                                <Loader2 className="size-3 animate-spin opacity-50" />
                              ) : (
                                <span className={cn(isActive ? "text-primary" : "text-destructive")}>{live?.latency || "N/A"}</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={cn(
                              "text-[8px] uppercase font-bold tracking-widest px-2 h-5",
                              isChecking ? "bg-secondary text-muted-foreground animate-pulse" :
                              isActive ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
                            )}>
                              {isChecking ? "PROBING" : live?.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteLandingAgent(agent.id)}>
                              <Trash2 className="size-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <h3 className="text-xl font-headline font-bold">Live Cluster Agents</h3>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                {agentsList.map((agent) => (
                  <AgentCard 
                    key={agent.id} 
                    id={agent.id} 
                    location={agent.regionName} 
                    domain={agent.domain} 
                    ip={agent.ip}
                    load={agent.load || 0} 
                    status={agent.status} 
                    onDelete={() => handleDeleteInfraAgent(agent.id)} 
                  />
                ))}
              </div>
            </div>
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
          <div className={cn("size-8 md:size-10 rounded-lg bg-secondary flex items-center justify-center", color)}>
            <Icon className="size-4 md:size-5" />
          </div>
          <Badge variant="outline" className="text-[8px] border-none font-bold text-green-400">{trend}</Badge>
        </div>
        <div className="space-y-0.5">
          <div className="text-lg md:text-2xl font-bold font-headline">{value}</div>
          <div className="text-[8px] md:text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{title}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function AgentCard({ id, location, domain, ip, load, status, onDelete }: any) {
  return (
    <Card className="bg-card border-border/50 group relative hover:border-primary/50 transition-colors overflow-hidden">
      <div className="absolute top-2 right-2 z-20">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="size-7 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
              <X className="size-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="w-[95vw] max-w-md rounded-xl border-border/50">
            <AlertDialogHeader>
              <div className="size-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive mb-2">
                <AlertTriangle className="size-6" />
              </div>
              <AlertDialogTitle className="font-headline font-bold">Decommission Agent?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently remove the infrastructure agent <strong>{location}</strong> from the live cluster. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-lg">Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onDelete} className="bg-destructive text-white rounded-lg">Yes, Remove Node</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      <CardContent className="p-3 md:p-6 space-y-4">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="size-8 md:size-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
            <Globe className="size-4 md:size-5 text-primary" />
          </div>
          <div className="min-w-0">
            <div className="font-bold font-headline text-xs md:text-base truncate">{location}</div>
            <div className="text-[8px] md:text-[10px] text-muted-foreground uppercase font-bold truncate">{domain}</div>
            <div className="text-[7px] md:text-[8px] text-primary/70 font-code font-bold truncate">{ip}</div>
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[8px] md:text-[10px] font-bold uppercase tracking-widest">
            <span className="text-muted-foreground">Load</span>
            <span className={cn(load > 80 ? "text-red-500" : "text-primary")}>{load}%</span>
          </div>
          <div className="h-1 md:h-1.5 w-full bg-secondary rounded-full overflow-hidden">
            <div className={cn("h-full transition-all duration-1000", load > 80 ? "bg-red-500" : "bg-primary")} style={{ width: `${load}%` }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DevConsole() {
  return (
    <React.Suspense fallback={<Loader />}>
      <DevConsoleContent />
    </React.Suspense>
  );
}
