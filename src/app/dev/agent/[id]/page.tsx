
"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { 
  ArrowLeft, 
  Globe, 
  ShieldCheck, 
  Cpu, 
  Database, 
  HardDrive, 
  Activity, 
  Server as ServerIcon,
  Wifi,
  WifiOff,
  RefreshCw,
  Loader2,
  Trash2,
  Zap,
  ChevronRight,
  ExternalLink,
  Monitor
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useUser, useFirestore } from "@/firebase";
import { doc, onSnapshot, collection, query, where, deleteDoc } from "firebase/firestore";
import { getSystemHardwareInfo } from "@/app/actions/system-info";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Loader } from "@/components/loader";

export default function AgentDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();

  const [agent, setAgent] = React.useState<any>(null);
  const [metrics, setMetrics] = React.useState<any>(null);
  const [servers, setServers] = React.useState<any[]>([]);
  const [loadingMetrics, setLoadingMetrics] = React.useState(true);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  // Auth Guard
  React.useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/auth?type=login");
      return;
    }

    const unsubUser = onSnapshot(doc(db, "users", user.uid), (docSnap) => {
      if (!docSnap.exists() || docSnap.data().dev !== true) {
        router.replace("/dashboard");
      }
    });

    return () => unsubUser();
  }, [user, authLoading, db, router]);

  // Data Fetching
  React.useEffect(() => {
    if (!id || !db) return;

    const unsubAgent = onSnapshot(doc(db, "infrastructure_agents", id as string), (docSnap) => {
      if (docSnap.exists()) {
        setAgent({ id: docSnap.id, ...docSnap.data() });
      } else {
        toast({ variant: "destructive", title: "Agent not found" });
        router.push("/dev?view=agents");
      }
    });

    const q = query(collection(db, "servers"), where("agentId", "==", id));
    const unsubServers = onSnapshot(q, (snapshot) => {
      setServers(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => {
      unsubAgent();
      unsubServers();
    };
  }, [id, db, router, toast]);

  const fetchMetrics = React.useCallback(async () => {
    if (!id) return;
    setLoadingMetrics(true);
    const res = await getSystemHardwareInfo(id as string);
    if (res.success) {
      setMetrics(res.data);
    } else {
      console.warn("Metrics Error:", res.error);
    }
    setLoadingMetrics(false);
    setIsRefreshing(false);
  }, [id]);

  React.useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, [fetchMetrics]);

  if (!agent) return <Loader />;

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    fetchMetrics();
  };

  const parseToNum = (val: string) => parseFloat(val) || 0;

  // Resource Calculations
  const ramTotal = metrics ? parseToNum(metrics.totalRam) : 0;
  const ramUsed = metrics ? parseToNum(metrics.usedRam) : 0;
  const ramPercent = ramTotal > 0 ? (ramUsed / ramTotal) * 100 : 0;

  const diskTotal = metrics ? parseToNum(metrics.totalDisk) : 0;
  const diskUsed = metrics ? parseToNum(metrics.usedDisk) : 0;
  const diskPercent = diskTotal > 0 ? (diskUsed / diskTotal) * 100 : 0;

  return (
    <div className="bg-background min-h-screen">
      <header className="flex h-16 shrink-0 items-center justify-between px-4 md:px-8 border-b border-border/50 sticky top-0 bg-[#0c0c0f]/80 backdrop-blur-md z-40">
        <div className="flex items-center gap-4">
          <Link href="/dev?view=agents" className="p-2 hover:bg-secondary/50 rounded-lg transition-colors">
            <ArrowLeft className="size-5" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Globe className="size-5 text-primary" />
            </div>
            <span className="font-headline font-bold text-lg tracking-tight">
              Agent <span className="text-primary">Node</span>
            </span>
          </div>
          <div className="h-4 w-px bg-border hidden sm:block" />
          <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-muted-foreground">
             <span className="font-code">{agent.domain}</span>
             <Badge variant="outline" className="h-5 text-[8px] border-primary/30 text-primary">{agent.ip}</Badge>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-9 gap-2 text-xs font-bold" 
          onClick={handleManualRefresh}
          disabled={isRefreshing}
        >
          {isRefreshing ? <Loader2 className="size-3 animate-spin" /> : <RefreshCw className="size-3" />}
          Refresh Metrics
        </Button>
      </header>

      <main className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Hardware Stats */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <Card className="bg-card border-border/50 overflow-hidden relative group">
                  <div className="absolute top-0 left-0 w-full h-1 bg-primary opacity-50" />
                  <CardContent className="p-6 space-y-6">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                              <Cpu className="size-6" />
                           </div>
                           <div className="space-y-0.5">
                              <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground">Processor</h3>
                              <div className="font-headline font-bold text-lg truncate max-w-[200px]" title={metrics?.cpuModel}>
                                 {loadingMetrics ? "---" : (metrics?.cpuModel || "Generic CPU")}
                              </div>
                           </div>
                        </div>
                        <Badge variant="secondary" className="font-code text-primary">{metrics?.cpuCores || "--"} Cores</Badge>
                     </div>
                     <div className="pt-4 border-t border-border/30">
                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                           <span>Real-time Load</span>
                           <span className="text-primary">{agent.load}%</span>
                        </div>
                        <Progress value={agent.load} className="h-1.5 bg-secondary" />
                     </div>
                  </CardContent>
               </Card>

               <Card className="bg-card border-border/50 overflow-hidden relative group">
                  <div className="absolute top-0 left-0 w-full h-1 bg-accent opacity-50" />
                  <CardContent className="p-6 space-y-6">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <div className="size-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                              <Database className="size-6" />
                           </div>
                           <div className="space-y-0.5">
                              <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground">Physical RAM</h3>
                              <div className="font-headline font-bold text-lg">
                                 {loadingMetrics ? "---" : metrics?.totalRam || "0 GB"}
                              </div>
                           </div>
                        </div>
                     </div>
                     <div className="pt-4 border-t border-border/30 space-y-4">
                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                           <span>Used: {metrics?.usedRam || "0 GB"}</span>
                           <span>Free: {metrics?.freeRam || "0 GB"}</span>
                        </div>
                        <Progress value={ramPercent} className="h-1.5 bg-secondary" />
                     </div>
                  </CardContent>
               </Card>
            </div>

            <Card className="bg-card border-border/50 overflow-hidden">
               <CardHeader className="bg-secondary/20 border-b border-border/50">
                  <div className="flex items-center gap-3">
                     <HardDrive className="size-5 text-orange-400" />
                     <div>
                        <CardTitle className="font-headline text-lg">Storage Allocation</CardTitle>
                        <CardDescription className="text-xs">Capacity planning for edge storage nodes.</CardDescription>
                     </div>
                  </div>
               </CardHeader>
               <CardContent className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                     <div className="md:col-span-1 flex flex-col items-center justify-center text-center space-y-2">
                        <div className="text-4xl font-headline font-bold text-orange-400">{metrics?.totalDisk || "0 GB"}</div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Total Capacity</p>
                     </div>
                     <div className="md:col-span-2 space-y-6">
                        <div className="space-y-2">
                           <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                              <span className="text-muted-foreground">Storage Efficiency</span>
                              <span className="text-orange-400">{diskPercent.toFixed(1)}%</span>
                           </div>
                           <Progress value={diskPercent} className="h-3 bg-secondary" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="p-3 rounded-xl bg-secondary/30 border border-border/50">
                              <p className="text-[8px] font-bold uppercase text-muted-foreground mb-1">In-Use</p>
                              <p className="font-bold text-sm">{metrics?.usedDisk || "0 GB"}</p>
                           </div>
                           <div className="p-3 rounded-xl bg-secondary/30 border border-border/50">
                              <p className="text-[8px] font-bold uppercase text-muted-foreground mb-1">Available</p>
                              <p className="font-bold text-sm text-green-400">{metrics?.freeDisk || "0 GB"}</p>
                           </div>
                        </div>
                     </div>
                  </div>
               </CardContent>
            </Card>
          </div>

          {/* Agent Info Sidebar */}
          <div className="space-y-6">
             <Card className="bg-card border-border/50">
                <CardHeader>
                   <CardTitle className="font-headline text-base">Node Identity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                   <div className="flex items-center justify-between py-2 border-b border-border/30">
                      <span className="text-xs text-muted-foreground">Region</span>
                      <span className="text-xs font-bold">{agent.regionName}</span>
                   </div>
                   <div className="flex items-center justify-between py-2 border-b border-border/30">
                      <span className="text-xs text-muted-foreground">Status</span>
                      <Badge className={cn("text-[9px] uppercase font-bold", agent.status === 'online' ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500")}>
                        {agent.status}
                      </Badge>
                   </div>
                   <div className="flex items-center justify-between py-2 border-b border-border/30">
                      <span className="text-xs text-muted-foreground">Established</span>
                      <span className="text-xs font-medium">{agent.createdAt?.toDate ? agent.createdAt.toDate().toLocaleDateString() : "N/A"}</span>
                   </div>
                   <div className="pt-2">
                      <p className="text-[8px] font-bold uppercase text-muted-foreground mb-2">Secret Token (Read Only)</p>
                      <div className="bg-secondary/50 p-2 rounded-md font-code text-[10px] break-all border border-border/50 text-muted-foreground">
                        {agent.secretKey.substring(0, 10)}****************
                      </div>
                   </div>
                </CardContent>
             </Card>

             <Card className="bg-primary/5 border border-primary/20">
                <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                   <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <Activity className="size-6" />
                   </div>
                   <div className="space-y-1">
                      <h4 className="font-bold">Occupancy Rate</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Currently hosting <strong>{servers.length}</strong> virtual instances. Load is balanced across CPU threads.
                      </p>
                   </div>
                </CardContent>
             </Card>
          </div>
        </div>

        {/* Hosted Servers List */}
        <section className="space-y-4">
           <div className="flex items-center justify-between px-1">
              <h2 className="text-xl font-headline font-bold">Deployed Instances</h2>
              <Badge variant="outline" className="font-code text-[10px]">{servers.length} Total</Badge>
           </div>
           
           <Card className="bg-card border-border/50 overflow-hidden">
              <Table>
                 <TableHeader className="bg-secondary/20">
                    <TableRow>
                       <TableHead>Server Name</TableHead>
                       <TableHead>Owner ID</TableHead>
                       <TableHead>Runtime</TableHead>
                       <TableHead>Status</TableHead>
                       <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                 </TableHeader>
                 <TableBody>
                    {servers.map((s) => (
                       <TableRow key={s.id} className="hover:bg-secondary/10">
                          <TableCell>
                             <div className="flex items-center gap-3">
                                <div className="size-8 rounded-lg bg-secondary flex items-center justify-center text-primary">
                                   <ServerIcon className="size-4" />
                                </div>
                                <div className="flex flex-col">
                                   <span className="font-bold text-xs">{s.name}</span>
                                   <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{s.plan} Plan</span>
                                </div>
                             </div>
                          </TableCell>
                          <TableCell className="font-code text-[10px] text-muted-foreground">{s.ownerId}</TableCell>
                          <TableCell>
                             <Badge variant="outline" className="text-[8px] uppercase">{s.runtime || 'N/A'}</Badge>
                          </TableCell>
                          <TableCell>
                             <div className="flex items-center gap-2">
                                <div className={cn("size-1.5 rounded-full", s.status === 'online' ? "bg-green-500 animate-pulse" : "bg-red-500")} />
                                <span className="text-[10px] font-bold uppercase">{s.status}</span>
                             </div>
                          </TableCell>
                          <TableCell className="text-right">
                             <Link href={`/servers/${s.id}`}>
                                <Button variant="ghost" size="icon" className="size-8 hover:text-primary">
                                   <ChevronRight className="size-4" />
                                </Button>
                             </Link>
                          </TableCell>
                       </TableRow>
                    ))}
                    {servers.length === 0 && (
                       <TableRow>
                          <TableCell colSpan={5} className="text-center py-12 opacity-50 text-xs">
                             No servers are currently hosted on this agent node.
                          </TableCell>
                       </TableRow>
                    )}
                 </TableBody>
              </Table>
           </Card>
        </section>
      </main>
    </div>
  );
}
