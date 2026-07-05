
"use client";

import * as React from "react";
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
  WifiOff
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser, useAuth, useFirestore } from "@/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { doc, onSnapshot, collection, query, limit, setDoc, serverTimestamp, orderBy, updateDoc, deleteDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

const defaultPricingTiers = [
  { id: "p1", name: "Zero", ram: "1.5GB", cpu: "100%", disk: "2GB", price: "IDR 10.000", priceValue: 10000, popular: false },
  { id: "p2", name: "Core", ram: "3GB", cpu: "170%", disk: "5GB", price: "IDR 17.000", priceValue: 17000, popular: false },
  { id: "p3", name: "Plus", ram: "5GB", cpu: "250%", disk: "10GB", price: "IDR 27.000", priceValue: 27000, popular: true },
  { id: "p4", name: "Pro", ram: "7GB", cpu: "340%", disk: "15GB", price: "IDR 30.000", priceValue: 30000, popular: false },
  { id: "p5", name: "Elite", ram: "10GB", cpu: "Unlimited", disk: "25GB", price: "IDR 35.000", priceValue: 35000, popular: false },
  { id: "p6", name: "Infinity", ram: "Unlimited", cpu: "Unlimited", disk: "Unlimited", price: "IDR 50.000", priceValue: 50000, popular: false },
];

const defaultGlobalAgents = [
  { id: "ag1", name: "Indonesia", location: "Jakarta Region (JKT-01)", url: "stscloud.id", latency: "< 5ms", status: "active", color: "text-primary" },
  { id: "ag2", name: "Singapore", location: "SG Region (SIN-01)", url: "google.com", latency: "< 15ms", status: "active", color: "text-blue-400" },
  { id: "ag3", name: "Malaysia", location: "KL Region (KUL-01)", url: "127.0.0.1", latency: "< 20ms", status: "active", color: "text-red-400" },
];

export default function DevConsole() {
  const router = useRouter();
  const { user, loading: authLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [profile, setProfile] = React.useState<any>(null);
  
  const [usersList, setUsersList] = React.useState<any[]>([]);
  const [agentsList, setAgentsList] = React.useState<any[]>([]);
  const [transactions, setTransactions] = React.useState<any[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");

  const [pricingData, setPricingData] = React.useState<any[]>([]);
  const [isUpdatingPricing, setIsUpdatingPricing] = React.useState(false);

  const [landingAgents, setLandingAgents] = React.useState<any[]>([]);
  const [isUpdatingLanding, setIsUpdatingLanding] = React.useState(false);

  // Real-time probing for management table
  const [agentLiveInfo, setAgentLiveInfo] = React.useState<Record<string, { status: string, latency: string, isChecking: boolean }>>({});

  const [isAddingAgent, setIsAddingAgent] = React.useState(false);
  const [regionName, setRegionName] = React.useState("");
  const [agentUrl, setAgentUrl] = React.useState("");
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  React.useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/auth?type=login");
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
    });
    
    return () => unsub();
  }, [user, authLoading, db, router]);

  React.useEffect(() => {
    if (!profile || profile.dev !== true) return;
    
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
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.tiers) setPricingData(data.tiers);
      } else {
        setPricingData(defaultPricingTiers);
      }
    });

    const unsubLandingAgents = onSnapshot(doc(db, "main", "agents"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.list) setLandingAgents(data.list);
      } else {
        setLandingAgents(defaultGlobalAgents);
      }
    });

    return () => {
      unsubUsers();
      unsubAgents();
      unsubTransactions();
      unsubPricing();
      unsubLandingAgents();
    };
  }, [profile, db]);

  // Probing effect for management table
  React.useEffect(() => {
    if (landingAgents.length === 0) return;

    const checkAgent = async (agent: any) => {
      const url = agent.url;
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

  const handleUpdateTier = (tierId: string, field: string, value: any) => {
    const updated = pricingData.map(t => t.id === tierId ? { ...t, [field]: value } : t);
    setPricingData(updated);
  };

  const handleAddTierRow = () => {
    const newTier = {
      id: `p-${Math.random().toString(36).substring(2, 7)}`,
      name: "New Tier",
      ram: "1GB",
      cpu: "100%",
      disk: "1GB",
      price: "IDR 0",
      priceValue: 0,
      popular: false
    };
    setPricingData([...pricingData, newTier]);
  };

  const handleDeleteTier = (id: string) => {
    setPricingData(pricingData.filter(t => t.id !== id));
  };

  const savePricingToDB = async () => {
    setIsUpdatingPricing(true);
    setDoc(doc(db, "main", "product"), { tiers: pricingData, updatedAt: serverTimestamp() })
      .then(() => toast({ title: "Pricing Saved", description: "Changes synchronized." }))
      .catch((err) => toast({ variant: "destructive", title: "Error", description: err.message }))
      .finally(() => setIsUpdatingPricing(false));
  };

  const handleUpdateLandingAgent = (id: string, field: string, value: any) => {
    const updated = landingAgents.map(a => a.id === id ? { ...a, [field]: value } : a);
    setLandingAgents(updated);
  };

  const handleAddLandingAgentRow = () => {
    const newAgent = {
      id: `ag-${Math.random().toString(36).substring(2, 7)}`,
      name: "New Region",
      location: "City, Country",
      url: "localhost",
      latency: "Checking...",
      status: "active",
      color: "text-primary"
    };
    setLandingAgents([...landingAgents, newAgent]);
  };

  const handleDeleteLandingAgent = (id: string) => {
    setLandingAgents(landingAgents.filter(a => a.id !== id));
  };

  const saveLandingAgentsToDB = async () => {
    setIsUpdatingLanding(true);
    setDoc(doc(db, "main", "agents"), { list: landingAgents, updatedAt: serverTimestamp() })
      .then(() => toast({ title: "Landing Agents Saved", description: "Public infrastructure list updated." }))
      .catch((err) => toast({ variant: "destructive", title: "Error", description: err.message }))
      .finally(() => setIsUpdatingLanding(false));
  };

  const handleAddAgent = async () => {
    if (!regionName || !agentUrl) return;
    setIsAddingAgent(true);
    const agentId = `agent-${Math.random().toString(36).substring(2, 9)}`;
    setDoc(doc(db, "infrastructure_agents", agentId), { regionName, agentUrl, status: "online", createdAt: serverTimestamp(), load: Math.floor(Math.random() * 20) + 5 })
      .then(() => {
        toast({ title: "Agent Registered", description: `Node active at ${regionName}.` });
        setIsDialogOpen(false);
        setRegionName("");
        setAgentUrl("");
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

  if (!profile || profile.dev !== true) return null;

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
          <button onClick={() => router.back()} className="text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /></button>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="hidden lg:flex border-primary/30 text-primary bg-primary/5 gap-2 px-3 py-1"><ShieldAlert className="size-3" /> System: Stable</Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-auto p-1 md:pr-4 rounded-full border border-border/50 gap-3 group transition-all hover:bg-secondary/50">
                <Avatar className="size-8"><AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">{(profile.displayName || "A").charAt(0).toUpperCase()}</AvatarFallback></Avatar>
                <div className="hidden md:flex flex-col items-start text-left"><span className="text-xs font-bold font-headline">{profile.displayName || "Admin"}</span><span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest leading-none mt-1">ADMIN ROLE</span></div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 mt-2">
              <DropdownMenuLabel>Admin Access</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2 text-destructive" onClick={handleSignOut}><LogOut className="size-4" /> Sign Out</DropdownMenuItem>
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
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild><Button className="bg-primary text-white gap-2 font-bold"><Plus className="size-4" /> Register Node</Button></DialogTrigger>
            <DialogContent className="sm:max-w-[425px] w-[95vw] bg-card border-border/50 rounded-lg">
              <DialogHeader><DialogTitle className="font-headline font-bold text-xl">Register New Agent</DialogTitle><DialogDescription>Add a new node to the cluster.</DialogDescription></DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2"><Label className="text-xs font-bold uppercase text-muted-foreground">Region Name</Label><Input placeholder="Jakarta Region" className="bg-secondary/30 border-none h-11" value={regionName} onChange={(e) => setRegionName(e.target.value)} /></div>
                <div className="grid gap-2"><Label className="text-xs font-bold uppercase text-muted-foreground">Agent URL</Label><Input placeholder="node.stscloud.id" className="bg-secondary/30 border-none h-11" value={agentUrl} onChange={(e) => setAgentUrl(e.target.value)} /></div>
              </div>
              <DialogFooter><Button className="w-full bg-primary text-white font-bold h-11" onClick={handleAddAgent} disabled={isAddingAgent}>{isAddingAgent ? <Loader2 className="size-4 animate-spin mr-2" /> : <Plus className="size-4 mr-2" />}Add Agent</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="bg-secondary/30 p-1 rounded-xl h-auto w-full sm:w-fit overflow-x-auto justify-start flex border border-border/50">
            <TabsTrigger value="overview" className="rounded-lg gap-2 py-2 px-6 data-[state=active]:bg-primary"><Activity className="size-4" /> Overview</TabsTrigger>
            <TabsTrigger value="pricing" className="rounded-lg gap-2 py-2 px-6 data-[state=active]:bg-primary"><Tag className="size-4" /> Pricing</TabsTrigger>
            <TabsTrigger value="agents" className="rounded-lg gap-2 py-2 px-6 data-[state=active]:bg-primary"><Globe className="size-4" /> Agents</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 animate-in fade-in duration-500">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              <StatCard title="Total Revenue" value={`IDR ${(totalRevenue / 1000).toFixed(1)}K`} trend="Live" icon={CreditCard} color="text-green-400" />
              <StatCard title="Avg Agent Load" value={`${avgGlobalLoad}%`} trend={parseFloat(avgGlobalLoad) > 80 ? "Critical" : "Stable"} icon={Cpu} color="text-primary" />
              <StatCard title="Active Agents" value={agentsList.filter(a => a.status === 'online').length} trend="Online" icon={Activity} color="text-primary" />
              <StatCard title="Total Users" value={usersList.length} trend="+New" icon={Users} color="text-yellow-400" />
            </div>
          </TabsContent>

          <TabsContent value="pricing" className="space-y-6 animate-in fade-in duration-500">
            <Card className="bg-card border-border/50">
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-border/50 pb-6 gap-4">
                <div><CardTitle className="font-headline">Product Tiers Management</CardTitle><CardDescription>Configure resources and pricing.</CardDescription></div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button variant="outline" size="sm" className="gap-2 flex-1 sm:flex-none" onClick={handleAddTierRow}><PlusCircle className="size-4" /> Add Row</Button>
                  <Button className="bg-primary text-white gap-2 font-bold flex-1 sm:flex-none" onClick={savePricingToDB} disabled={isUpdatingPricing}><Save className="size-4" /> Save Changes</Button>
                </div>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader><TableRow><TableHead>Tier Name</TableHead><TableHead>Price Display</TableHead><TableHead>Value (IDR)</TableHead><TableHead>RAM</TableHead><TableHead>CPU</TableHead><TableHead>Disk</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow></TableHeader>
                  <TableBody>
                    {pricingData.map((tier) => (
                      <TableRow key={tier.id} className="hover:bg-secondary/10">
                        <TableCell><Input className="bg-secondary/30 border-none h-9 text-xs font-bold" value={tier.name} onChange={(e) => handleUpdateTier(tier.id, 'name', e.target.value)} /></TableCell>
                        <TableCell><Input className="bg-secondary/30 border-none h-9 text-xs w-28" value={tier.price} onChange={(e) => handleUpdateTier(tier.id, 'price', e.target.value)} /></TableCell>
                        <TableCell><Input type="number" className="bg-secondary/30 border-none h-9 text-xs w-28" value={tier.priceValue} onChange={(e) => handleUpdateTier(tier.id, 'priceValue', parseInt(e.target.value) || 0)} /></TableCell>
                        <TableCell><Input className="bg-secondary/30 border-none h-9 text-xs w-20" value={tier.ram} onChange={(e) => handleUpdateTier(tier.id, 'ram', e.target.value)} /></TableCell>
                        <TableCell><Input className="bg-secondary/30 border-none h-9 text-xs w-20" value={tier.cpu} onChange={(e) => handleUpdateTier(tier.id, 'cpu', e.target.value)} /></TableCell>
                        <TableCell><Input className="bg-secondary/30 border-none h-9 text-xs w-20" value={tier.disk} onChange={(e) => handleUpdateTier(tier.id, 'disk', e.target.value)} /></TableCell>
                        <TableCell><Button variant="ghost" size="sm" className={cn("h-7 px-2 text-[10px] font-bold uppercase", tier.popular ? "text-primary bg-primary/10" : "text-muted-foreground")} onClick={() => handleUpdateTier(tier.id, 'popular', !tier.popular)}>{tier.popular ? 'Popular' : 'Standard'}</Button></TableCell>
                        <TableCell><Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteTier(tier.id)}><Trash2 className="size-4" /></Button></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="agents" className="space-y-12 animate-in slide-in-from-bottom-4 duration-500">
            <Card className="bg-card border-border/50">
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-border/50 pb-6 gap-4">
                <div><CardTitle className="font-headline">Public Map Configuration</CardTitle><CardDescription>Real-time status tracking for agents on Landing Page.</CardDescription></div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button variant="outline" size="sm" className="gap-2 flex-1 sm:flex-none" onClick={handleAddLandingAgentRow}><PlusCircle className="size-4" /> Add Region</Button>
                  <Button className="bg-primary text-white gap-2 font-bold flex-1 sm:flex-none" onClick={saveLandingAgentsToDB} disabled={isUpdatingLanding}><Save className="size-4" /> Save Changes</Button>
                </div>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader><TableRow><TableHead>Region</TableHead><TableHead>Location</TableHead><TableHead>Url</TableHead><TableHead>Latency (Live)</TableHead><TableHead>Status (Live)</TableHead><TableHead></TableHead></TableRow></TableHeader>
                  <TableBody>
                    {landingAgents.map((agent) => {
                      const live = agentLiveInfo[agent.id];
                      const isChecking = live?.isChecking || !live;
                      const isActive = live?.status === "ACTIVE";

                      return (
                        <TableRow key={agent.id} className="hover:bg-secondary/10">
                          <TableCell><Input className="bg-secondary/30 border-none h-9 text-xs w-32 font-bold" value={agent.name} onChange={(e) => handleUpdateLandingAgent(agent.id, 'name', e.target.value)} /></TableCell>
                          <TableCell><Input className="bg-secondary/30 border-none h-9 text-xs w-full" value={agent.location} onChange={(e) => handleUpdateLandingAgent(agent.id, 'location', e.target.value)} /></TableCell>
                          <TableCell><Input className="bg-secondary/30 border-none h-9 text-xs w-full font-code" value={agent.url || ''} placeholder="node.domain.com" onChange={(e) => handleUpdateLandingAgent(agent.id, 'url', e.target.value)} /></TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-primary px-2">
                              {isChecking ? (
                                <Loader2 className="size-3 animate-spin opacity-50" />
                              ) : (
                                <span className={cn(isActive ? "text-primary" : "text-destructive")}>{live.latency}</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={cn(
                              "text-[8px] uppercase font-bold tracking-widest px-2 h-5",
                              isChecking ? "bg-secondary text-muted-foreground animate-pulse" :
                              isActive ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
                            )}>
                              {isChecking ? "PROBING" : live.status}
                            </Badge>
                          </TableCell>
                          <TableCell><Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteLandingAgent(agent.id)}><Trash2 className="size-4" /></Button></TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <h3 className="text-xl font-headline font-bold">Live Cluster Nodes</h3>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                {agentsList.map((agent) => (
                  <AgentCard key={agent.id} id={agent.id} location={agent.regionName} dc={agent.agentUrl} load={agent.load || 0} status={agent.status} onDelete={() => handleDeleteInfraAgent(agent.id)} />
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
        <div className="flex items-center justify-between mb-3 md:mb-4"><div className={cn("size-8 md:size-10 rounded-lg bg-secondary flex items-center justify-center", color)}><Icon className="size-4 md:size-5" /></div><Badge variant="outline" className="text-[8px] border-none font-bold text-green-400">{trend}</Badge></div>
        <div className="space-y-0.5"><div className="text-lg md:text-2xl font-bold font-headline">{value}</div><div className="text-[8px] md:text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{title}</div></div>
      </CardContent>
    </Card>
  );
}

function AgentCard({ id, location, dc, load, status, onDelete }: any) {
  return (
    <Card className="bg-card border-border/50 group relative hover:border-primary/50 transition-colors overflow-hidden">
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"><Button variant="ghost" size="icon" className="size-7 text-muted-foreground hover:text-destructive" onClick={onDelete}><X className="size-4" /></Button></div>
      <CardContent className="p-3 md:p-6 space-y-4">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="size-8 md:size-10 rounded-lg bg-secondary flex items-center justify-center shrink-0"><Globe className="size-4 md:size-5 text-primary" /></div>
          <div className="min-w-0"><div className="font-bold font-headline text-xs md:text-base truncate">{location}</div><div className="text-[8px] md:text-[10px] text-muted-foreground uppercase font-bold truncate">{dc}</div></div>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[8px] md:text-[10px] font-bold uppercase tracking-widest"><span className="text-muted-foreground">Load</span><span className={cn(load > 80 ? "text-red-500" : "text-primary")}>{load}%</span></div>
          <div className="h-1 md:h-1.5 w-full bg-secondary rounded-full overflow-hidden"><div className={cn("h-full transition-all duration-1000", load > 80 ? "bg-red-500" : "bg-primary")} style={{ width: `${load}%` }} /></div>
        </div>
      </CardContent>
    </Card>
  );
}
