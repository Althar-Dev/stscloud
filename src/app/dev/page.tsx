
"use client";

import * as React from "react";
import { 
  Terminal, 
  Cpu, 
  Activity, 
  Zap, 
  ShieldAlert, 
  Globe, 
  Settings,
  ArrowLeft,
  Database,
  Lock,
  User,
  LogOut,
  CreditCard,
  Users,
  Search,
  ChevronRight,
  Plus,
  Loader2,
  Server as ServerIcon
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser, useAuth, useFirestore } from "@/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { doc, onSnapshot, collection, query, limit, setDoc, serverTimestamp } from "firebase/firestore";
import { provisionServerFiles } from "@/app/actions/server-provisioning";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

const mockTransactions = [
  { id: "TX-901", user: "ahmad@example.com", plan: "Elite", amount: "IDR 35.000", status: "success", time: "2m ago" },
  { id: "TX-902", user: "budi@dev.id", plan: "Pro", amount: "IDR 27.000", status: "success", time: "15m ago" },
  { id: "TX-903", user: "citra@cloud.net", plan: "Zero", amount: "IDR 10.000", status: "pending", time: "45m ago" },
];

const mockEvents = [
  { type: 'deploy', msg: 'New Node provisioned in SG-01', time: '10:45:21' },
  { type: 'payment', msg: 'Payment verified for TX-901', time: '10:44:05' },
  { type: 'alert', msg: 'High CPU detected on US-East Node', time: '10:42:10' },
  { type: 'auth', msg: 'Admin login from 192.168.1.1', time: '10:40:00' },
];

const resourcePresets = [
  { id: "p1", name: "Zero", ram: "1.5GB", cpu: "100%", disk: "2GB" },
  { id: "p2", name: "Core", ram: "3GB", cpu: "170%", disk: "5GB" },
  { id: "p3", name: "Plus", ram: "5GB", cpu: "250%", disk: "10GB" },
  { id: "p4", name: "Pro", ram: "7GB", cpu: "340%", disk: "15GB" },
  { id: "p5", name: "Elite", ram: "10GB", cpu: "Unlimited", disk: "25GB" },
];

export default function DevConsole() {
  const router = useRouter();
  const { user, loading: authLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [profile, setProfile] = React.useState<any>(null);
  const [profileLoading, setProfileLoading] = React.useState(true);
  const [usersList, setUsersList] = React.useState<any[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [loadingProgress, setLoadingProgress] = React.useState(0);

  // Provisioning State
  const [isProvisioning, setIsProvisioning] = React.useState(false);
  const [provisionUserId, setProvisionUserId] = React.useState("");
  const [provisionPlanId, setProvisionPlanId] = React.useState("p1");
  const [provisionServerName, setProvisionServerName] = React.useState("");
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

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

  React.useEffect(() => {
    if (!profile || profile.dev !== true) return;
    
    const usersQuery = query(collection(db, "users"), limit(100));
    const unsub = onSnapshot(usersQuery, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsersList(list);
    });

    return () => unsub();
  }, [profile, db]);

  const handleAdminProvision = async () => {
    if (!provisionUserId || !provisionServerName) {
      toast({ variant: "destructive", title: "Missing Info", description: "Please select a user and server name." });
      return;
    }

    setIsProvisioning(true);
    const plan = resourcePresets.find(p => p.id === provisionPlanId);
    const serverId = `sts-serv-${Math.random().toString(36).substring(2, 9)}`;

    try {
      const provision = await provisionServerFiles(serverId);
      if (!provision.success) throw new Error("File provisioning failed");

      await setDoc(doc(db, "servers", serverId), {
        name: provisionServerName,
        ownerId: provisionUserId,
        plan: plan?.name,
        status: "online",
        createdAt: serverTimestamp(),
        resources: {
          ram: plan?.ram,
          cpu: plan?.cpu,
          disk: plan?.disk
        }
      });

      toast({ title: "Admin Provision Success", description: `Server ${provisionServerName} deployed for user.` });
      setIsDialogOpen(false);
      setProvisionServerName("");
      setProvisionUserId("");
    } catch (error: any) {
      toast({ variant: "destructive", title: "Provisioning Failed", description: error.message });
    } finally {
      setIsProvisioning(false);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/auth?type=login");
  };

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 sm:p-8">
        <div className="w-full max-w-[160px] sm:max-w-[240px] flex flex-col items-center animate-in fade-in duration-700">
          <div className="relative w-full aspect-square mb-2">
            <Image src="/img/icon.png" alt="STSCloud" fill className="object-contain grayscale opacity-60" priority />
          </div>
          <div className="w-full h-[4px] bg-secondary overflow-hidden rounded-full">
            <div className="h-full bg-primary transition-all duration-300 ease-out" style={{ width: `${loadingProgress}%` }} />
          </div>
        </div>
      </div>
    );
  }

  if (!profile || profile.dev !== true) return null;

  const displayName = profile?.displayName || user?.displayName || user?.email?.split('@')[0] || "Dev Account";
  const userInitial = displayName.charAt(0).toUpperCase();

  const filteredUsers = usersList.filter(u => 
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.displayName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-background min-h-screen">
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
            <p className="text-sm text-muted-foreground">Monitor global node clusters and optimize internal configurations.</p>
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary text-white gap-2 font-bold"><Plus className="size-4" /> Provision Node</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] bg-card border-border/50">
                <DialogHeader>
                  <DialogTitle className="font-headline font-bold text-xl">Quick Provisioning</DialogTitle>
                  <DialogDescription>
                    Manually deploy a server for a user bypassing the payment flow.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="target-user" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Target User</Label>
                    <Select value={provisionUserId} onValueChange={setProvisionUserId}>
                      <SelectTrigger className="bg-secondary/30 border-none h-11">
                        <SelectValue placeholder="Select user..." />
                      </SelectTrigger>
                      <SelectContent>
                        {usersList.map(u => (
                          <SelectItem key={u.id} value={u.id}>{u.email}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="server-name" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Server Name</Label>
                    <Input 
                      id="server-name" 
                      placeholder="Production API" 
                      className="bg-secondary/30 border-none h-11"
                      value={provisionServerName}
                      onChange={(e) => setProvisionServerName(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="plan" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Resource Plan</Label>
                    <Select value={provisionPlanId} onValueChange={setProvisionPlanId}>
                      <SelectTrigger className="bg-secondary/30 border-none h-11">
                        <SelectValue placeholder="Select plan..." />
                      </SelectTrigger>
                      <SelectContent>
                        {resourcePresets.map(p => (
                          <SelectItem key={p.id} value={p.id}>{p.name} ({p.ram})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    className="w-full bg-primary text-white font-bold h-11" 
                    onClick={handleAdminProvision}
                    disabled={isProvisioning}
                  >
                    {isProvisioning ? <Loader2 className="size-4 animate-spin mr-2" /> : <Zap className="size-4 mr-2" />}
                    Provision Node
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
            <TabsTrigger value="nodes" className="rounded-lg gap-2 py-2 px-6 data-[state=active]:bg-primary">
              <Globe className="size-4" /> Nodes
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
              <StatCard title="Total Revenue" value="IDR 1.2M" trend="+15%" icon={CreditCard} color="text-green-400" />
              <StatCard title="Global CPU" value="32.4%" trend="+2.1%" icon={Cpu} color="text-primary" />
              <StatCard title="Active Reqs" value="45.2k" trend="+12%" icon={Activity} color="text-primary" />
              <StatCard title="Avg Latency" value="12ms" trend="Stable" icon={Zap} color="text-yellow-400" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 bg-card border-border/50 flex flex-col">
                <CardHeader>
                  <CardTitle className="font-headline flex items-center gap-2">
                    <Terminal className="size-5 text-primary" /> Global Live Events
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 min-h-[300px] font-code text-xs space-y-2 overflow-y-auto max-h-[400px] p-6 bg-black/40 rounded-xl m-4 border border-border/30 custom-scrollbar">
                  {mockEvents.map((event, i) => (
                    <div key={i} className="flex gap-4 border-b border-border/10 pb-2">
                      <span className="text-muted-foreground tabular-nums">[{event.time}]</span>
                      <span className={cn(
                        "font-bold uppercase px-1.5 rounded",
                        event.type === 'deploy' ? 'bg-blue-500/10 text-blue-400' :
                        event.type === 'payment' ? 'bg-green-500/10 text-green-400' :
                        event.type === 'alert' ? 'bg-red-500/10 text-red-400' : 'bg-secondary text-muted-foreground'
                      )}>{event.type}</span>
                      <span className="text-foreground">{event.msg}</span>
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
                  <IntegrityItem name="Node Provisioner" status="online" />
                  <IntegrityItem name="Database Primary" status="warning" message="High Latency Node-04" />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="nodes" className="animate-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
              <NodeCard location="Singapore" dc="Equinix SG1" load={45} status="online" />
              <NodeCard location="Jakarta" dc="Cyber 1" load={78} status="online" />
              <NodeCard location="USA East" dc="AWS us-east-1" load={92} status="warning" />
              <NodeCard location="Europe" dc="Hetzner DE" load={30} status="online" />
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
                      {mockTransactions.map((tx) => (
                        <TableRow key={tx.id}>
                          <TableCell className="font-medium text-xs">{tx.user}</TableCell>
                          <TableCell><Badge variant="outline" className="text-[10px]">{tx.plan}</Badge></TableCell>
                          <TableCell className="font-bold text-xs">{tx.amount}</TableCell>
                          <TableCell>
                            <Badge className={cn("text-[10px] uppercase font-bold", tx.status === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500')}>
                              {tx.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground text-xs">{tx.time}</TableCell>
                        </TableRow>
                      ))}
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
