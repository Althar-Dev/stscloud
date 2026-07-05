
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
  Layout
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser, useAuth, useFirestore } from "@/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { doc, onSnapshot, collection, query, limit, setDoc, serverTimestamp, orderBy, updateDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

const defaultPricingTiers = [
  { id: "p1", name: "Zero", ram: "1.5GB", cpu: "100%", disk: "2GB", price: "IDR 10.000", priceValue: 10000, popular: false },
  { id: "p2", name: "Core", ram: "3GB", cpu: "170%", disk: "5GB", price: "IDR 17.000", priceValue: 17000, popular: false },
  { id: "p3", name: "Plus", ram: "5GB", cpu: "250%", disk: "10GB", price: "IDR 27.000", priceValue: 27000, popular: true },
  { id: "p4", name: "Pro", ram: "7GB", cpu: "340%", disk: "15GB", price: "IDR 30.000", priceValue: 30000, popular: false },
  { id: "p5", name: "Elite", ram: "10GB", cpu: "Unlimited", disk: "25GB", price: "IDR 35.000", priceValue: 35000, popular: false },
  { id: "p6", name: "Infinity", ram: "Unlimited", cpu: "Unlimited", disk: "Unlimited", price: "IDR 50.000", priceValue: 50000, popular: false },
];

const defaultGlobalAgents = [
  { id: "ag1", name: "Indonesia", location: "Jakarta Region (JKT-01)", latency: "< 5ms", status: "active", color: "text-primary" },
  { id: "ag2", name: "Singapore", location: "SG Region (SIN-01)", latency: "< 15ms", status: "active", color: "text-blue-400" },
  { id: "ag3", name: "Malaysia", location: "KL Region (KUL-01)", latency: "< 20ms", status: "active", color: "text-red-400" },
];

export default function DevConsole() {
  const router = useRouter();
  const { user, loading: authLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [profile, setProfile] = React.useState<any>(null);
  
  // Real Data States
  const [usersList, setUsersList] = React.useState<any[]>([]);
  const [agentsList, setAgentsList] = React.useState<any[]>([]);
  const [transactions, setTransactions] = React.useState<any[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");

  // Pricing State
  const [pricingData, setPricingData] = React.useState<any[]>([]);
  const [isUpdatingPricing, setIsUpdatingPricing] = React.useState(false);

  // Landing Config State
  const [landingAgents, setLandingAgents] = React.useState<any[]>([]);
  const [isUpdatingLanding, setIsUpdatingLanding] = React.useState(false);

  // Agent Registration State (Infra nodes)
  const [isAddingAgent, setIsAddingAgent] = React.useState(false);
  const [regionName, setRegionName] = React.useState("");
  const [agentUrl, setAgentUrl] = React.useState("");
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  // Auth & Admin Check
  React.useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/auth?type=login");
      return;
    }

    const unsub = onSnapshot(
      doc(db, "users", user.uid), 
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          setProfile(data);
          if (data.dev !== true) {
            router.replace("/dashboard");
          }
        } else {
          router.replace("/dashboard");
        }
      },
      async (err) => {
        console.error("Profile Listener Error:", err);
      }
    );
    
    return () => unsub();
  }, [user, authLoading, db, router]);

  // Real-time Data Listeners
  React.useEffect(() => {
    if (!profile || profile.dev !== true) return;
    
    // Users Listener
    const unsubUsers = onSnapshot(
      query(collection(db, "users"), limit(100)), 
      (snapshot) => {
        setUsersList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      },
      (err) => console.warn("Users list permission denied")
    );

    // Infrastructure Agents (Real Nodes)
    const unsubAgents = onSnapshot(
      collection(db, "infrastructure_agents"), 
      (snapshot) => {
        setAgentsList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      },
      (err) => console.warn("Agents list permission denied")
    );

    // Transactions Listener
    const unsubTransactions = onSnapshot(
      query(collection(db, "transactions"), orderBy("createdAt", "desc"), limit(50)), 
      (snapshot) => {
        setTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      },
      (err) => console.warn("Transactions list permission denied")
    );

    // Pricing Listener
    const unsubPricing = onSnapshot(
      doc(db, "main", "product"), 
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.tiers) setPricingData(data.tiers);
        }
      }, 
      (err) => console.warn("Pricing listener error:", err)
    );

    // Landing Agents Listener
    const unsubLandingAgents = onSnapshot(
      doc(db, "main", "agents"),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.list) setLandingAgents(data.list);
        }
      },
      (err) => console.warn("Landing agents listener error:", err)
    );

    return () => {
      unsubUsers();
      unsubAgents();
      unsubTransactions();
      unsubPricing();
      unsubLandingAgents();
    };
  }, [profile, db]);

  // Pricing Functions
  const handleInitializePricing = async () => {
    setIsUpdatingPricing(true);
    const docRef = doc(db, "main", "product");
    setDoc(docRef, { tiers: defaultPricingTiers, updatedAt: serverTimestamp() })
      .then(() => {
        setPricingData(defaultPricingTiers);
        toast({ title: "Pricing Initialized", description: "Default product tiers written." });
      })
      .catch((err) => toast({ variant: "destructive", title: "Error", description: err.message }))
      .finally(() => setIsUpdatingPricing(false));
  };

  const handleUpdateTier = (tierId: string, field: string, value: any) => {
    const base = pricingData.length > 0 ? pricingData : defaultPricingTiers;
    const updated = base.map(t => t.id === tierId ? { ...t, [field]: value } : t);
    setPricingData(updated);
  };

  const savePricingToDB = async () => {
    setIsUpdatingPricing(true);
    const docRef = doc(db, "main", "product");
    const dataToSave = pricingData.length > 0 ? pricingData : defaultPricingTiers;
    setDoc(docRef, { tiers: dataToSave, updatedAt: serverTimestamp() })
      .then(() => toast({ title: "Pricing Saved", description: "Changes synchronized." }))
      .catch((err) => toast({ variant: "destructive", title: "Error", description: err.message }))
      .finally(() => setIsUpdatingPricing(false));
  };

  // Landing Agents Functions
  const handleInitializeLandingAgents = async () => {
    setIsUpdatingLanding(true);
    const docRef = doc(db, "main", "agents");
    setDoc(docRef, { list: defaultGlobalAgents, updatedAt: serverTimestamp() })
      .then(() => {
        setLandingAgents(defaultGlobalAgents);
        toast({ title: "Landing Agents Initialized", description: "Default region list written." });
      })
      .catch((err) => toast({ variant: "destructive", title: "Error", description: err.message }))
      .finally(() => setIsUpdatingLanding(false));
  };

  const handleUpdateLandingAgent = (id: string, field: string, value: any) => {
    const base = landingAgents.length > 0 ? landingAgents : defaultGlobalAgents;
    const updated = base.map(a => a.id === id ? { ...a, [field]: value } : a);
    setLandingAgents(updated);
  };

  const saveLandingAgentsToDB = async () => {
    setIsUpdatingLanding(true);
    const docRef = doc(db, "main", "agents");
    const dataToSave = landingAgents.length > 0 ? landingAgents : defaultGlobalAgents;
    setDoc(docRef, { list: dataToSave, updatedAt: serverTimestamp() })
      .then(() => toast({ title: "Landing Agents Saved", description: "Public infrastructure list updated." }))
      .catch((err) => toast({ variant: "destructive", title: "Error", description: err.message }))
      .finally(() => setIsUpdatingLanding(false));
  };

  const handleAddAgent = async () => {
    if (!regionName || !agentUrl) return;
    setIsAddingAgent(true);
    const agentId = `agent-${Math.random().toString(36).substring(2, 9)}`;
    const agentRef = doc(db, "infrastructure_agents", agentId);
    setDoc(agentRef, { regionName, agentUrl, status: "online", createdAt: serverTimestamp(), load: Math.floor(Math.random() * 20) + 5 })
      .then(() => {
        toast({ title: "Agent Registered", description: `Node active at ${regionName}.` });
        setIsDialogOpen(false);
        setRegionName("");
        setAgentUrl("");
      })
      .catch((err) => toast({ variant: "destructive", title: "Error", description: err.message }))
      .finally(() => setIsAddingAgent(false));
  };

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/auth?type=login");
  };

  if (!profile || profile.dev !== true) return null;

  const displayName = profile?.displayName || user?.displayName || user?.email?.split('@')[0] || "Dev Account";
  const userInitial = displayName.charAt(0).toUpperCase();
  const totalRevenue = transactions.reduce((acc, tx) => acc + (tx.status === 'success' ? tx.amount : 0), 0);
  const avgGlobalLoad = agentsList.length > 0 
    ? (agentsList.reduce((acc, a) => acc + (a.load || 0), 0) / agentsList.length).toFixed(1)
    : "0.0";

  return (
    <div className="bg-background min-h-screen">
      <header className="flex h-16 shrink-0 items-center justify-between px-4 md:px-8 border-b border-border/50 sticky top-0 bg-[#0c0c0f]/80 backdrop-blur-md z-40">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-[32px] h-[32px] rounded-lg overflow-hidden flex items-center justify-center">
              <Image src="/img/icons.png" alt="STSCloud" width={32} height={32} className="object-cover" />
            </div>
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
          <Badge variant="outline" className="hidden lg:flex border-primary/30 text-primary bg-primary/5 gap-2 px-3 py-1">
            <ShieldAlert className="size-3" /> System: Stable
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-auto p-1 md:pr-4 rounded-full border border-border/50 gap-3 group transition-all hover:bg-secondary/50">
                <Avatar className="size-8">
                  <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">{userInitial}</AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col items-start text-left">
                  <span className="text-xs font-bold font-headline">{displayName}</span>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest leading-none mt-1">ADMIN ROLE</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 mt-2">
              <DropdownMenuLabel>Admin Access</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2"><User className="size-4" /> Profile</DropdownMenuItem>
              <DropdownMenuItem className="gap-2"><Settings className="size-4" /> Global Settings</DropdownMenuItem>
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
          <div className="flex items-center gap-2">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary text-white gap-2 font-bold"><Plus className="size-4" /> Agent</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] w-[95vw] max-w-lg bg-card border-border/50 rounded-lg">
                <DialogHeader>
                  <DialogTitle className="font-headline font-bold text-xl">Register New Agent</DialogTitle>
                  <DialogDescription>Add a new infrastructure node to the global cluster.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Region Name</Label>
                    <Input placeholder="e.g. Singapore SG-01" className="bg-secondary/30 border-none h-11" value={regionName} onChange={(e) => setRegionName(e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Agent URL</Label>
                    <Input placeholder="node.domain.com" className="bg-secondary/30 border-none h-11" value={agentUrl} onChange={(e) => setAgentUrl(e.target.value)} />
                  </div>
                </div>
                <DialogFooter><Button className="w-full bg-primary text-white font-bold h-11" onClick={handleAddAgent} disabled={isAddingAgent}>{isAddingAgent ? <Loader2 className="size-4 animate-spin mr-2" /> : <Plus className="size-4 mr-2" />}Add Agent</Button></DialogFooter>
              </DialogContent>
            </Dialog>
            <Button variant="outline" size="sm" className="gap-2 h-10"><Terminal className="size-4" /> Global Logs</Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="bg-secondary/30 p-1 rounded-xl h-auto w-full sm:w-fit overflow-x-auto justify-start flex border border-border/50">
            <TabsTrigger value="overview" className="rounded-lg gap-2 py-2 px-6 data-[state=active]:bg-primary"><Activity className="size-4" /> Overview</TabsTrigger>
            <TabsTrigger value="pricing" className="rounded-lg gap-2 py-2 px-6 data-[state=active]:bg-primary"><Tag className="size-4" /> Pricing</TabsTrigger>
            <TabsTrigger value="landing" className="rounded-lg gap-2 py-2 px-6 data-[state=active]:bg-primary"><Layout className="size-4" /> Landing Config</TabsTrigger>
            <TabsTrigger value="agents" className="rounded-lg gap-2 py-2 px-6 data-[state=active]:bg-primary"><Globe className="size-4" /> Agents</TabsTrigger>
            <TabsTrigger value="billing" className="rounded-lg gap-2 py-2 px-6 data-[state=active]:bg-primary"><CreditCard className="size-4" /> Billing</TabsTrigger>
            <TabsTrigger value="users" className="rounded-lg gap-2 py-2 px-6 data-[state=active]:bg-primary"><Users className="size-4" /> Users</TabsTrigger>
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
              <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 pb-6">
                <div><CardTitle className="font-headline">Product Tiers Management</CardTitle><CardDescription>Configure global resources and pricing for all server plans.</CardDescription></div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-2" onClick={handleInitializePricing} disabled={isUpdatingPricing}><RefreshCw className={cn("size-4", isUpdatingPricing && "animate-spin")} /> Initialize Default</Button>
                  <Button className="bg-primary text-white gap-2 font-bold" onClick={savePricingToDB} disabled={isUpdatingPricing}><Save className="size-4" /> Save Changes</Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader><TableRow className="hover:bg-transparent border-border/50"><TableHead className="w-[100px]">Tier</TableHead><TableHead>Price Display</TableHead><TableHead>Value (IDR)</TableHead><TableHead>RAM</TableHead><TableHead>CPU</TableHead><TableHead>Disk</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {(pricingData.length > 0 ? pricingData : defaultPricingTiers).map((tier) => (
                      <TableRow key={tier.id} className="border-border/30 hover:bg-secondary/10">
                        <TableCell className="font-bold">{tier.name}</TableCell>
                        <TableCell><Input className="bg-secondary/30 border-none h-9 text-xs w-32" value={tier.price} onChange={(e) => handleUpdateTier(tier.id, 'price', e.target.value)} /></TableCell>
                        <TableCell><Input type="number" className="bg-secondary/30 border-none h-9 text-xs w-32" value={tier.priceValue} onChange={(e) => handleUpdateTier(tier.id, 'priceValue', parseInt(e.target.value) || 0)} /></TableCell>
                        <TableCell><Input className="bg-secondary/30 border-none h-9 text-xs w-24" value={tier.ram} onChange={(e) => handleUpdateTier(tier.id, 'ram', e.target.value)} /></TableCell>
                        <TableCell><Input className="bg-secondary/30 border-none h-9 text-xs w-24" value={tier.cpu} onChange={(e) => handleUpdateTier(tier.id, 'cpu', e.target.value)} /></TableCell>
                        <TableCell><Input className="bg-secondary/30 border-none h-9 text-xs w-24" value={tier.disk} onChange={(e) => handleUpdateTier(tier.id, 'disk', e.target.value)} /></TableCell>
                        <TableCell><Button variant="ghost" size="sm" className={cn("h-7 px-2 text-[10px] uppercase font-bold", tier.popular ? "text-primary bg-primary/10" : "text-muted-foreground")} onClick={() => handleUpdateTier(tier.id, 'popular', !tier.popular)}>{tier.popular ? 'Recommended' : 'Standard'}</Button></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="landing" className="space-y-6 animate-in fade-in duration-500">
            <Card className="bg-card border-border/50">
              <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 pb-6">
                <div><CardTitle className="font-headline">Landing Infrastructure List</CardTitle><CardDescription>Manage the region cards displayed in the "Global Provisioning" section.</CardDescription></div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-2" onClick={handleInitializeLandingAgents} disabled={isUpdatingLanding}><RefreshCw className={cn("size-4", isUpdatingLanding && "animate-spin")} /> Initialize Default</Button>
                  <Button className="bg-primary text-white gap-2 font-bold" onClick={saveLandingAgentsToDB} disabled={isUpdatingLanding}><Save className="size-4" /> Save Changes</Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader><TableRow className="hover:bg-transparent border-border/50"><TableHead>Region</TableHead><TableHead>Location Details</TableHead><TableHead>Latency</TableHead><TableHead>Color (Tailwind)</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {(landingAgents.length > 0 ? landingAgents : defaultGlobalAgents).map((agent) => (
                      <TableRow key={agent.id} className="border-border/30 hover:bg-secondary/10">
                        <TableCell><Input className="bg-secondary/30 border-none h-9 text-xs w-32" value={agent.name} onChange={(e) => handleUpdateLandingAgent(agent.id, 'name', e.target.value)} /></TableCell>
                        <TableCell><Input className="bg-secondary/30 border-none h-9 text-xs w-full" value={agent.location} onChange={(e) => handleUpdateLandingAgent(agent.id, 'location', e.target.value)} /></TableCell>
                        <TableCell><Input className="bg-secondary/30 border-none h-9 text-xs w-24" value={agent.latency} onChange={(e) => handleUpdateLandingAgent(agent.id, 'latency', e.target.value)} /></TableCell>
                        <TableCell><Input className="bg-secondary/30 border-none h-9 text-xs w-32" value={agent.color} onChange={(e) => handleUpdateLandingAgent(agent.id, 'color', e.target.value)} /></TableCell>
                        <TableCell><Input className="bg-secondary/30 border-none h-9 text-xs w-24" value={agent.status} onChange={(e) => handleUpdateLandingAgent(agent.id, 'status', e.target.value)} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="agents" className="animate-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
              {agentsList.map((agent) => (
                <AgentCard key={agent.id} location={agent.regionName} dc={agent.agentUrl} load={agent.load || 0} status={agent.status} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="billing" className="space-y-6">
             <Card className="bg-card border-border/50">
                <CardHeader className="flex flex-row items-center justify-between"><div className="space-y-1"><CardTitle className="font-headline">Recent Transactions</CardTitle><CardDescription>Latest payments processed via SValePay.</CardDescription></div></CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader><TableRow><TableHead>User</TableHead><TableHead>Plan</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Time</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {transactions.map((tx) => (
                        <TableRow key={tx.id}>
                          <TableCell className="font-medium text-xs truncate max-w-[200px]">{tx.userEmail}</TableCell>
                          <TableCell><Badge variant="outline" className="text-[10px]">{tx.plan || 'Custom'}</Badge></TableCell>
                          <TableCell className="font-bold text-xs">IDR {tx.amount?.toLocaleString()}</TableCell>
                          <TableCell><Badge className={cn("text-[10px] uppercase font-bold", tx.status === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500')}>{tx.status}</Badge></TableCell>
                          <TableCell className="text-right text-muted-foreground text-xs">{tx.createdAt?.toDate ? tx.createdAt.toDate().toLocaleDateString() : 'Just now'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
             </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div className="relative flex-1 mb-6"><Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" /><Input placeholder="Search users..." className="pl-10 bg-secondary/30 border-none h-11" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
               {usersList.filter(u => u.email?.toLowerCase().includes(searchQuery.toLowerCase())).map((u) => (
                 <Link key={u.id} href={`/dev/users/${u.id}`}>
                   <Card className="bg-card border-border/50 hover:bg-secondary/20 transition-all cursor-pointer h-full"><CardContent className="p-3 md:p-6"><div className="flex items-center gap-3"><Avatar className="size-8"><AvatarFallback>{u.email?.charAt(0)}</AvatarFallback></Avatar><div><div className="text-xs font-bold truncate">{u.displayName || "User"}</div><div className="text-[9px] text-muted-foreground uppercase">{u.email}</div></div></div></CardContent></Card>
                 </Link>
               ))}
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
        <div className="flex items-center justify-between mb-3 md:mb-4"><div className={cn("size-8 md:size-10 rounded-lg bg-secondary flex items-center justify-center", color)}><Icon className="size-4 md:size-5" /></div><Badge variant="outline" className="text-[8px] md:text-[10px] border-none font-bold text-green-400">{trend}</Badge></div>
        <div className="space-y-0.5 md:space-y-1"><div className="text-lg md:text-2xl font-bold font-headline">{value}</div><div className="text-[8px] md:text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{title}</div></div>
      </CardContent>
    </Card>
  );
}

function AgentCard({ location, dc, load, status }: { location: string, dc: string, load: number, status: 'online' | 'warning' | 'offline' }) {
  return (
    <Card className="bg-card border-border/50 group hover:border-primary/50 transition-colors">
      <CardContent className="p-3 md:p-6 space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 md:gap-3"><div className="size-8 md:size-10 rounded-lg bg-secondary flex items-center justify-center shrink-0"><Globe className="size-4 md:size-5 text-primary" /></div><div className="min-w-0"><div className="font-bold font-headline text-xs md:text-base truncate">{location}</div><div className="text-[8px] md:text-[10px] text-muted-foreground uppercase font-bold tracking-widest truncate">{dc}</div></div></div>
          <Badge className={cn("uppercase text-[8px] md:text-[10px] font-bold tracking-widest h-5 px-1.5", status === 'online' ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-red-500/10 text-red-500 border-red-500/20")} variant="outline">{status}</Badge>
        </div>
        <div className="space-y-1.5 md:space-y-2"><div className="flex items-center justify-between text-[8px] md:text-[10px] font-bold uppercase tracking-widest"><span className="text-muted-foreground">Load</span><span className={cn(load > 80 ? "text-red-500" : "text-primary")}>{load}%</span></div><div className="h-1 md:h-1.5 w-full bg-secondary rounded-full overflow-hidden"><div className={cn("h-full transition-all duration-1000", load > 80 ? "bg-red-500" : "bg-primary")} style={{ width: `${load}%` }} /></div></div>
      </CardContent>
    </Card>
  );
}
