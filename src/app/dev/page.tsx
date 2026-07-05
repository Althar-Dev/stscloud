
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
  HardDrive
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

  // Agent Registration State
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
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: `users/${user.uid}`,
          operation: 'get'
        }));
      }
    );
    
    return () => unsub();
  }, [user, authLoading, db, router]);

  // Real-time Data Listeners
  React.useEffect(() => {
    if (!profile || profile.dev !== true) return;
    
    // Users Listener
    const usersRef = collection(db, "users");
    const unsubUsers = onSnapshot(
      query(usersRef, limit(100)), 
      (snapshot) => {
        setUsersList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      },
      async (err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: usersRef.path,
          operation: 'list'
        }));
      }
    );

    // Agents Listener
    const agentsRef = collection(db, "infrastructure_agents");
    const unsubAgents = onSnapshot(
      agentsRef, 
      (snapshot) => {
        setAgentsList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      },
      async (err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: agentsRef.path,
          operation: 'list'
        }));
      }
    );

    // Transactions Listener
    const txRef = collection(db, "transactions");
    const unsubTransactions = onSnapshot(
      query(txRef, orderBy("createdAt", "desc"), limit(50)), 
      (snapshot) => {
        setTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      },
      async (err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: txRef.path,
          operation: 'list'
        }));
      }
    );

    // Pricing Listener
    const pricingDocRef = doc(db, "main", "product");
    const unsubPricing = onSnapshot(pricingDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.tiers) setPricingData(data.tiers);
      }
    });

    return () => {
      unsubUsers();
      unsubAgents();
      unsubTransactions();
      unsubPricing();
    };
  }, [profile, db]);

  const handleInitializePricing = async () => {
    setIsUpdatingPricing(true);
    const docRef = doc(db, "main", "product");
    setDoc(docRef, { tiers: defaultPricingTiers, updatedAt: serverTimestamp() })
      .then(() => {
        toast({ title: "Pricing Initialized", description: "Default product tiers have been written to database." });
      })
      .catch((err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: docRef.path,
          operation: 'create',
          requestResourceData: { tiers: defaultPricingTiers }
        }));
      })
      .finally(() => setIsUpdatingPricing(false));
  };

  const handleUpdateTier = async (tierId: string, field: string, value: any) => {
    const updatedTiers = pricingData.map(t => t.id === tierId ? { ...t, [field]: value } : t);
    setPricingData(updatedTiers);
  };

  const savePricingToDB = async () => {
    setIsUpdatingPricing(true);
    const docRef = doc(db, "main", "product");
    setDoc(docRef, { tiers: pricingData, updatedAt: serverTimestamp() })
      .then(() => {
        toast({ title: "Pricing Saved", description: "All changes have been synchronized to production." });
      })
      .catch((err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: docRef.path,
          operation: 'write',
          requestResourceData: { tiers: pricingData }
        }));
      })
      .finally(() => setIsUpdatingPricing(false));
  };

  const handleAddAgent = async () => {
    if (!regionName || !agentUrl) {
      toast({ variant: "destructive", title: "Missing Info", description: "Please enter Region Name and Agent URL." });
      return;
    }

    setIsAddingAgent(true);
    const agentId = `agent-${Math.random().toString(36).substring(2, 9)}`;
    const agentRef = doc(db, "infrastructure_agents", agentId);
    const agentData = {
      regionName,
      agentUrl,
      status: "online",
      createdAt: serverTimestamp(),
      load: Math.floor(Math.random() * 20) + 5
    };

    setDoc(agentRef, agentData)
      .then(() => {
        toast({ title: "Agent Registered", description: `New agent cluster at ${regionName} is now active.` });
        setIsDialogOpen(false);
        setRegionName("");
        setAgentUrl("");
      })
      .catch(async (err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: agentRef.path,
          operation: 'create',
          requestResourceData: agentData
        }));
      })
      .finally(() => {
        setIsAddingAgent(false);
      });
  };

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/auth?type=login");
  };

  if (!profile || profile.dev !== true) return null;

  const displayName = profile?.displayName || user?.displayName || user?.email?.split('@')[0] || "Dev Account";
  const userInitial = displayName.charAt(0).toUpperCase();

  const filteredUsers = usersList.filter(u => 
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.displayName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate real-time stats
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
                  <DialogDescription>
                    Add a new infrastructure node to the global cluster.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="region-name" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Region Name</Label>
                    <Input 
                      id="region-name" 
                      placeholder="e.g. Singapore SG-01" 
                      className="bg-secondary/30 border-none h-11"
                      value={regionName}
                      onChange={(e) => setRegionName(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="agent-url" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Agent URL</Label>
                    <Input 
                      id="agent-url" 
                      placeholder="node.domain.com" 
                      className="bg-secondary/30 border-none h-11"
                      value={agentUrl}
                      onChange={(e) => setAgentUrl(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    className="w-full bg-primary text-white font-bold h-11" 
                    onClick={handleAddAgent}
                    disabled={isAddingAgent}
                  >
                    {isAddingAgent ? <Loader2 className="size-4 animate-spin mr-2" /> : <Plus className="size-4 mr-2" />}
                    Add Agent
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button variant="outline" size="sm" className="gap-2 h-10"><Terminal className="size-4" /> Global Logs</Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="bg-secondary/30 p-1 rounded-xl h-auto w-full sm:w-fit overflow-x-auto justify-start flex border border-border/50">
            <TabsTrigger value="overview" className="rounded-lg gap-2 py-2 px-6 data-[state=active]:bg-primary">
              <Activity className="size-4" /> Overview
            </TabsTrigger>
            <TabsTrigger value="agents" className="rounded-lg gap-2 py-2 px-6 data-[state=active]:bg-primary">
              <Globe className="size-4" /> Agents
            </TabsTrigger>
            <TabsTrigger value="pricing" className="rounded-lg gap-2 py-2 px-6 data-[state=active]:bg-primary">
              <Tag className="size-4" /> Pricing
            </TabsTrigger>
            <TabsTrigger value="billing" className="rounded-lg gap-2 py-2 px-6 data-[state=active]:bg-primary">
              <CreditCard className="size-4" /> Billing
            </TabsTrigger>
            <TabsTrigger value="users" className="rounded-lg gap-2 py-2 px-6 data-[state=active]:bg-primary">
              <Users className="size-4" /> Users
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 animate-in fade-in duration-500">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              <StatCard title="Total Revenue" value={`IDR ${(totalRevenue / 1000).toFixed(1)}K`} trend="Live" icon={CreditCard} color="text-green-400" />
              <StatCard title="Avg Agent Load" value={`${avgGlobalLoad}%`} trend={parseFloat(avgGlobalLoad) > 80 ? "Critical" : "Stable"} icon={Cpu} color="text-primary" />
              <StatCard title="Active Agents" value={agentsList.filter(a => a.status === 'online').length} trend="Online" icon={Activity} color="text-primary" />
              <StatCard title="Total Users" value={usersList.length} trend="+New" icon={Users} color="text-yellow-400" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 bg-card border-border/50 flex flex-col">
                <CardHeader>
                  <CardTitle className="font-headline flex items-center gap-2">
                    <Terminal className="size-5 text-primary" /> Global Live Feed
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 min-h-[300px] font-code text-xs space-y-2 overflow-y-auto max-h-[400px] p-6 bg-black/40 rounded-xl m-4 border border-border/30 custom-scrollbar">
                  {transactions.slice(0, 10).map((tx, i) => (
                    <div key={i} className="flex gap-4 border-b border-border/10 pb-2">
                      <span className="text-muted-foreground tabular-nums">[{tx.createdAt?.toDate ? tx.createdAt.toDate().toLocaleTimeString() : 'RECENT'}]</span>
                      <span className={cn(
                        "font-bold uppercase px-1.5 rounded bg-green-500/10 text-green-400"
                      )}>Payment</span>
                      <span className="text-foreground">Verified for {tx.userEmail} ({tx.amount})</span>
                    </div>
                  ))}
                  {agentsList.map((agent, i) => (
                    <div key={`agent-${i}`} className="flex gap-4 border-b border-border/10 pb-2">
                      <span className="text-muted-foreground tabular-nums">[{agent.createdAt?.toDate ? agent.createdAt.toDate().toLocaleTimeString() : 'INIT'}]</span>
                      <span className={cn(
                        "font-bold uppercase px-1.5 rounded bg-blue-500/10 text-blue-400"
                      )}>Agent</span>
                      <span className="text-foreground">Cluster registered in {agent.regionName}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-card border-border/50">
                <CardHeader>
                  <CardTitle className="font-headline text-lg">System Integrity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <IntegrityItem name="Authentication API" status="online" />
                  <IntegrityItem name="SValePay Connector" status="online" />
                  <IntegrityItem name="Agent Provisioner" status="online" />
                  <IntegrityItem 
                    name="Global Agents" 
                    status={agentsList.some(a => a.status === 'offline') ? 'warning' : 'online'} 
                    message={agentsList.some(a => a.status === 'offline') ? 'Partial Downtime' : 'All Systems GO'} 
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="pricing" className="space-y-6 animate-in fade-in duration-500">
            <Card className="bg-card border-border/50">
              <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 pb-6">
                <div>
                  <CardTitle className="font-headline">Product Tiers Management</CardTitle>
                  <CardDescription>Configure global resources and pricing for all server plans.</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-2" onClick={handleInitializePricing} disabled={isUpdatingPricing}>
                    <RefreshCw className={cn("size-4", isUpdatingPricing && "animate-spin")} /> Initialize Default
                  </Button>
                  <Button className="bg-primary text-white gap-2 font-bold" onClick={savePricingToDB} disabled={isUpdatingPricing}>
                    <Save className="size-4" /> Save Changes
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-border/50">
                      <TableHead className="w-[100px]">Tier Name</TableHead>
                      <TableHead>Price Display</TableHead>
                      <TableHead>Value (IDR)</TableHead>
                      <TableHead>RAM</TableHead>
                      <TableHead>CPU</TableHead>
                      <TableHead>Disk</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(pricingData.length > 0 ? pricingData : defaultPricingTiers).map((tier) => (
                      <TableRow key={tier.id} className="border-border/30 hover:bg-secondary/10">
                        <TableCell className="font-bold">{tier.name}</TableCell>
                        <TableCell>
                          <Input 
                            className="bg-secondary/30 border-none h-9 text-xs w-32" 
                            value={tier.price} 
                            onChange={(e) => handleUpdateTier(tier.id, 'price', e.target.value)}
                          />
                        </TableCell>
                        <TableCell>
                          <Input 
                            type="number"
                            className="bg-secondary/30 border-none h-9 text-xs w-32" 
                            value={tier.priceValue} 
                            onChange={(e) => handleUpdateTier(tier.id, 'priceValue', parseInt(e.target.value))}
                          />
                        </TableCell>
                        <TableCell>
                          <Input 
                            className="bg-secondary/30 border-none h-9 text-xs w-24" 
                            value={tier.ram} 
                            onChange={(e) => handleUpdateTier(tier.id, 'ram', e.target.value)}
                          />
                        </TableCell>
                        <TableCell>
                          <Input 
                            className="bg-secondary/30 border-none h-9 text-xs w-24" 
                            value={tier.cpu} 
                            onChange={(e) => handleUpdateTier(tier.id, 'cpu', e.target.value)}
                          />
                        </TableCell>
                        <TableCell>
                          <Input 
                            className="bg-secondary/30 border-none h-9 text-xs w-24" 
                            value={tier.disk} 
                            onChange={(e) => handleUpdateTier(tier.id, 'disk', e.target.value)}
                          />
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className={cn("h-7 px-2 text-[10px] uppercase font-bold", tier.popular ? "text-primary bg-primary/10" : "text-muted-foreground")}
                            onClick={() => handleUpdateTier(tier.id, 'popular', !tier.popular)}
                          >
                            {tier.popular ? 'Recommended' : 'Standard'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {pricingData.length === 0 && (
                  <div className="p-12 text-center text-muted-foreground italic border-t border-border/50">
                    Database empty. Click "Initialize Default" to populate pricing data.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="agents" className="animate-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
              {agentsList.map((agent) => (
                <AgentCard key={agent.id} location={agent.regionName} dc={agent.agentUrl} load={agent.load || 0} status={agent.status} />
              ))}
              {agentsList.length === 0 && (
                <div className="col-span-full py-20 text-center opacity-50 border border-dashed border-border/50 rounded-2xl">
                  <Globe className="size-12 mx-auto mb-3" />
                  <p>No infrastructure agents registered yet.</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="billing" className="space-y-6">
             <Card className="bg-card border-border/50">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="font-headline">Recent Transactions</CardTitle>
                    <CardDescription>Latest payments processed via SValePay.</CardDescription>
                  </div>
                  <Button variant="outline" size="sm">Export CSV</Button>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Plan</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((tx) => (
                        <TableRow key={tx.id}>
                          <TableCell className="font-medium text-xs truncate max-w-[200px]">{tx.userEmail}</TableCell>
                          <TableCell><Badge variant="outline" className="text-[10px]">{tx.plan || 'Custom'}</Badge></TableCell>
                          <TableCell className="font-bold text-xs">IDR {tx.amount?.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge className={cn("text-[10px] uppercase font-bold", tx.status === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500')}>
                              {tx.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground text-xs">
                            {tx.createdAt?.toDate ? tx.createdAt.toDate().toLocaleDateString() : 'Just now'}
                          </TableCell>
                        </TableRow>
                      ))}
                      {transactions.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-10 text-muted-foreground italic">No transactions recorded.</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
             </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div className="flex items-center gap-4 mb-6 px-1">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input 
                  placeholder="Search users by email or name..." 
                  className="pl-10 bg-secondary/30 border-none h-11" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
               {filteredUsers.map((u, i) => (
                 <Link key={u.id} href={`/dev/users/${u.id}`}>
                   <Card className="bg-card border-border/50 hover:bg-secondary/20 hover:border-primary/30 transition-all cursor-pointer group h-full">
                     <CardContent className="p-3 md:p-6">
                       <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
                         <div className="flex items-center gap-3">
                           <Avatar className="size-8 md:size-10">
                             <AvatarFallback className="bg-primary/10 text-primary text-xs">
                               {u.displayName?.charAt(0) || u.email?.charAt(0) || "U"}
                             </AvatarFallback>
                           </Avatar>
                           <div className="min-w-0">
                             <div className="text-xs md:text-sm font-bold truncate pr-4">{u.displayName || "No Name"}</div>
                             <div className="text-[9px] md:text-[10px] text-muted-foreground uppercase font-bold tracking-widest truncate">{u.email}</div>
                           </div>
                         </div>
                         <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                            {u.dev && <Badge className="bg-primary/10 text-primary border-primary/20 text-[8px] uppercase">Admin</Badge>}
                            <ChevronRight className="size-4 text-muted-foreground group-hover:text-primary transition-colors hidden sm:block" />
                         </div>
                       </div>
                       <div className="flex gap-2">
                          <div className="flex-1 text-center p-1.5 md:p-2 bg-background/50 rounded-lg border border-border/30">
                             <div className="text-xs md:text-lg font-bold">--</div>
                             <div className="text-[7px] md:text-[8px] text-muted-foreground uppercase font-bold">Servers</div>
                          </div>
                          <div className="flex-1 text-center p-1.5 md:p-2 bg-background/50 rounded-lg border border-border/30">
                             <div className="text-xs md:text-lg font-bold">Active</div>
                             <div className="text-[7px] md:text-[8px] text-muted-foreground uppercase font-bold">Status</div>
                          </div>
                       </div>
                     </CardContent>
                   </Card>
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
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <div className={cn("size-8 md:size-10 rounded-lg md:rounded-xl bg-secondary flex items-center justify-center", color)}>
            <Icon className="size-4 md:size-5" />
          </div>
          <Badge variant="outline" className={cn(
            "text-[8px] md:text-[10px] border-none font-bold px-1.5 md:px-2.5",
            trend === "Live" || trend === "Online" || trend === "Stable" || trend === "+New" ? "text-green-400" : "text-red-400"
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

function AgentCard({ location, dc, load, status }: { location: string, dc: string, load: number, status: 'online' | 'warning' | 'offline' }) {
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
