
"use client";

import * as React from "react";
import { TerminalConsole } from "@/components/terminal-console";
import { PerformanceMetrics } from "@/components/performance-metrics";
import { FileExplorer } from "@/components/file-explorer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Terminal, 
  FolderOpen, 
  ArrowLeft,
  Globe,
  Headset,
  User,
  LogOut,
  Settings as SettingsIcon,
  Trash2,
  Save,
  Rocket,
  AlertTriangle,
  CreditCard,
  Calendar,
  Clock,
  Zap,
  RefreshCw,
  Loader2,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CardContent, Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useUser, useAuth, useFirestore } from "@/firebase";
import { signOut } from "firebase/auth";
import { doc, onSnapshot, updateDoc, deleteDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { getServerDiskUsage, decommissionServerFiles, clearServerLogs } from "@/app/actions/server-files";
import { executeServerPower, getServerProcessStatus } from "@/app/actions/server-power";
import { createSvalePayment, checkPaymentStatus } from "@/app/actions/payment-actions";

const nodeVersions = ["16", "18", "20", "22", "24", "26"];
const pythonVersions = ["3.10", "3.11", "3.12", "3.13"];

export default function ServerPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [profile, setProfile] = React.useState<any>(null);
  const [server, setServer] = React.useState<any>(null);
  const [diskUsage, setDiskUsage] = React.useState<number>(0);
  const [activeTab, setActiveTab] = React.useState("console");
  const [pricingTiers, setPricingTiers] = React.useState<any[]>([]);
  const [mounted, setMounted] = React.useState(false);

  const [serverName, setServerName] = React.useState("");
  const [runtimeVersion, setRuntimeVersion] = React.useState("");
  const [startupCommand, setStartupCommand] = React.useState("");
  const [commandRun, setCommandRun] = React.useState("");
  const [entryFile, setEntryFile] = React.useState("");
  const [isSavingSettings, setIsSavingSettings] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  
  const [powerActionActive, setPowerActionActive] = React.useState(false);

  // Renewal State
  const [isRenewing, setIsRenewing] = React.useState(false);
  const [renewalPaymentData, setRenewalPaymentData] = React.useState<any>(null);
  const [renewalPaymentStatus, setRenewalPaymentStatus] = React.useState<string>("pending");
  const [isCheckingRenewal, setIsCheckingRenewal] = React.useState(false);
  const [renewalLoading, setRenewalLoading] = React.useState(false);

  const wasOnlineOnMount = React.useRef(false);

  // Billing Stats - Client-side safe calculations
  const expiresDate = mounted && server?.expiresAt ? new Date(server.expiresAt) : null;
  const isExpired = mounted && expiresDate ? expiresDate < new Date() : false;
  const daysLeft = mounted && expiresDate ? Math.max(0, Math.ceil((expiresDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) : 0;

  React.useEffect(() => {
    setMounted(true);
    if (!user?.uid || !id) return;

    const unsubProfile = onSnapshot(doc(db, "users", user.uid), (docSnap) => {
      if (docSnap.exists()) setProfile(docSnap.data());
    });

    const unsubServer = onSnapshot(doc(db, "servers", id as string), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setServer({ id: docSnap.id, ...data });
        
        if (data.status === "online" && !wasOnlineOnMount.current) {
          wasOnlineOnMount.current = true;
        }

        const currentVersion = data.runtimeVersion || data.nodeVersion || data.pythonVersion || "";
        
        setServerName(prev => prev === data.name ? prev : (data.name || ""));
        setRuntimeVersion(prev => prev === currentVersion ? prev : currentVersion);
        setStartupCommand(prev => prev === data.startupCommand ? prev : (data.startupCommand || ""));
        setCommandRun(prev => prev === data.commandRun ? prev : (data.commandRun || ""));
        setEntryFile(prev => prev === data.entryFile ? prev : (data.entryFile || ""));
      } else if (!isDeleting) {
        toast({ variant: "destructive", title: "Instance removed", description: "The server instance is no longer available." });
        router.push("/dashboard");
      }
    });

    const unsubPricing = onSnapshot(doc(db, "main", "product"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.tiers) setPricingTiers(data.tiers);
      }
    });

    return () => {
      unsubProfile();
      unsubServer();
      unsubPricing();
    };
  }, [user, id, db, router, toast, isDeleting]);

  React.useEffect(() => {
    return () => {
      if (server?.status === "offline" && id) {
        clearServerLogs(id as string).catch(() => {});
      }
    };
  }, [id, server?.status]);

  React.useEffect(() => {
    if (!id || !server || powerActionActive || server.status === 'starting') return;

    const monitorInterval = setInterval(async () => {
      try {
        const status = await getServerProcessStatus(id as string, {
          cpuLimit: server.resources?.cpu || "100%",
          ramLimit: server.resources?.ram || "1.5GB",
          serverName: server.name,
          userEmail: user?.email || ""
        });
        
        if (!status.running && server.status === 'online') {
          await updateDoc(doc(db, "servers", id as string), { status: 'offline' });
        } else if (status.running && server.status === 'offline') {
          updateDoc(doc(db, "servers", id as string), { status: 'online' });
        }
      } catch (e) {}
    }, 3000);

    return () => clearInterval(monitorInterval);
  }, [id, server, db, powerActionActive, user?.email]);

  React.useEffect(() => {
    if (!id) return;
    const updateUsage = async () => {
      const res = await getServerDiskUsage(id as string);
      if (res.success) setDiskUsage(res.sizeInMB || 0);
    };
    updateUsage();
    const interval = setInterval(updateUsage, 15000);
    return () => clearInterval(interval);
  }, [id]);

  const handlePower = async (action: "start" | "stop" | "restart") => {
    if (!id || !db || !server) return;

    if (isExpired && (action === "start" || action === "restart")) {
      toast({ 
        variant: "destructive", 
        title: "Access Denied", 
        description: "Instance has expired. Please renew your subscription to perform power actions." 
      });
      return;
    }
    
    setPowerActionActive(true);
    
    let targetStatus = server.status;
    if (action === "start" || action === "restart") targetStatus = "starting";
    if (action === "stop") targetStatus = "offline";

    try {
      await updateDoc(doc(db, "servers", id as string), { status: targetStatus });

      const result = await executeServerPower(id as string, action, {
        runtime: server.runtime || "nodejs",
        version: runtimeVersion,
        commandRun: commandRun || (server.runtime === 'python' ? 'python3' : 'node'),
        entryFile: entryFile || (server.runtime === 'python' ? 'main.py' : 'index.js'),
        startupCommand: startupCommand || (server.runtime === 'python' ? 'python3 main.py' : 'npm start'),
        limits: server.resources,
        serverName: server.name,
        userEmail: user?.email || ""
      });

      if (!result.success) {
        await updateDoc(doc(db, "servers", id as string), { status: "offline" });
        toast({ variant: "destructive", title: "Execution Error", description: result.error });
      }
      
      setTimeout(async () => {
        const check = await getServerProcessStatus(id as string);
        await updateDoc(doc(db, "servers", id as string), { status: check.running ? "online" : "offline" });
        setPowerActionActive(false);
      }, 7000);
      
    } catch (error: any) {
      setPowerActionActive(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!id || !db) return;
    setIsSavingSettings(true);
    
    const updatePayload: any = {
      name: serverName,
      runtimeVersion: runtimeVersion,
      startupCommand,
      commandRun,
      entryFile
    };

    if (server.runtime === 'nodejs') updatePayload.nodeVersion = runtimeVersion;
    if (server.runtime === 'python') updatePayload.pythonVersion = runtimeVersion;

    try {
      await updateDoc(doc(db, "servers", id as string), updatePayload);
      toast({ title: "Config Saved", description: "Startup parameters updated." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleInitiateRenewal = async () => {
    if (!server || !user?.email) return;
    const tier = pricingTiers.find(p => p.name === server.plan);
    if (!tier) {
      toast({ variant: "destructive", title: "Pricing Error", description: "Current plan pricing not found." });
      return;
    }

    setRenewalLoading(true);
    const invoiceId = `STS-RENEW-${Date.now()}`;
    const result = await createSvalePayment({
      amount: tier.priceValue,
      email: user.email,
      external_id: invoiceId,
      description: `Renewal for Server: ${server.name}`
    });

    if (result.success) {
      setRenewalPaymentData(result.data);
      setIsRenewing(true);
    } else {
      toast({ variant: "destructive", title: "Payment Error", description: result.error });
    }
    setRenewalLoading(false);
  };

  const handleCheckRenewalStatus = async () => {
    if (!renewalPaymentData?.trx_id || !id) return;
    setIsCheckingRenewal(true);
    
    const result = await checkPaymentStatus(renewalPaymentData.trx_id);
    if (result.success) {
      setRenewalPaymentStatus(result.status);
      if (result.status === "success") {
        toast({ title: "Payment Verified!", description: "Extending your subscription..." });
        
        // Calculate new expiration date
        const currentExp = server.expiresAt ? new Date(server.expiresAt) : new Date();
        const baseDate = currentExp > new Date() ? currentExp : new Date();
        const nextExp = new Date(baseDate.getTime() + 30 * 24 * 60 * 60 * 1000);
        
        await updateDoc(doc(db, "servers", id as string), {
          expiresAt: nextExp.toISOString()
        });

        toast({ title: "Success", description: "Instance successfully extended for 30 days." });
        setIsRenewing(false);
        setRenewalPaymentData(null);
        setRenewalPaymentStatus("pending");
      }
    }
    setIsCheckingRenewal(false);
  };

  const handleDeleteServer = async () => {
    if (!id || !db) return;
    setIsDeleting(true);
    try {
      const cleanup = await decommissionServerFiles(id as string);
      if (!cleanup.success) throw new Error(cleanup.error);
      await deleteDoc(doc(db, "servers", id as string));
      toast({ title: "Decommissioned", description: "All server data has been wiped." });
      router.push("/dashboard");
    } catch (error: any) {
      toast({ variant: "destructive", title: "Failed", description: error.message });
      setIsDeleting(false);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/auth?type=login");
  };

  const displayName = mounted ? (profile?.displayName || user?.displayName || user?.email?.split('@')[0] || "User") : "User";
  const userInitial = displayName.charAt(0).toUpperCase();
  
  const isNodeJS = server?.runtime === "nodejs";
  const isPython = server?.runtime === "python";
  const hasStartup = isNodeJS || isPython;

  const currentVersionsList = isPython ? pythonVersions : nodeVersions;

  return (
    <div className="bg-background min-h-screen">
      <header className="flex h-16 shrink-0 items-center justify-between px-4 md:px-8 border-b border-border/50 sticky top-0 bg-background/80 backdrop-blur-md z-40">
        <div className="flex items-center gap-3 md:gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-[40px] h-[40px] rounded-lg overflow-hidden flex items-center justify-center">
              <Image src="/img/icons.png" alt="STSCloud" width={40} height={40} className="object-cover" />
            </div>
            <span className="font-headline font-bold text-lg md:text-xl tracking-tight hidden sm:block">
              <span className="text-primary">Cloud</span>
            </span>
          </Link>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <button onClick={() => router.back()} className="text-muted-foreground hover:text-foreground transition-colors focus:outline-none">
              <ArrowLeft className="size-4" />
            </button>
            <h1 className="font-headline font-semibold text-sm md:text-lg truncate max-w-[150px] md:max-w-none">
              {server?.name || "Instance"}
            </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
          <Link href="/support"><Button variant="ghost" size="sm" className="gap-2 text-muted-foreground flex"><Headset className="size-4" /><span className="hidden sm:inline">Support</span></Button></Link>
          <div className="h-4 w-px bg-border hidden sm:block" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-auto p-1 md:pr-4 rounded-full border border-border/50 gap-3 group transition-all hover:bg-secondary/50">
                <Avatar className="size-8 md:size-9">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                    {userInitial}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col items-start text-left">
                  <span className="text-xs font-bold font-headline leading-none truncate max-w-[120px]">{displayName}</span>
                  <span className="text-[10px] text-muted-foreground leading-none mt-1 truncate max-w-[120px]">{mounted ? user?.email : ""}</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 mt-2">
              <DropdownMenuLabel className="font-headline">Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2"><User className="size-4" /> Profile</DropdownMenuItem>
              <DropdownMenuItem className="gap-2"><SettingsIcon className="size-4" /> Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive" onClick={handleSignOut}>
                <LogOut className="size-4" /> Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8 space-y-6 md:space-y-8 max-w-7xl mx-auto w-full">
        {isExpired && (
          <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4 animate-in slide-in-from-top-4">
             <div className="flex items-center gap-3">
                <AlertTriangle className="size-5 text-destructive" />
                <div>
                   <p className="font-bold text-sm text-destructive">Instance Expired</p>
                   <p className="text-xs text-muted-foreground">Operational features are disabled. Please renew to resume service.</p>
                </div>
             </div>
             <Button size="sm" className="bg-destructive text-white hover:bg-destructive/90 h-8 text-[10px] font-bold uppercase tracking-widest" onClick={() => setActiveTab('billing')}>
                Go to Billing
             </Button>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="console" className="w-full space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="w-full md:w-auto overflow-x-auto pb-1 custom-scrollbar">
              <TabsList className="bg-secondary/30 p-1 rounded-xl w-fit h-auto flex whitespace-nowrap">
                <TabsTrigger value="console" className="rounded-lg gap-2 py-2 px-4 data-[state=active]:bg-primary data-[state=active]:text-white text-xs md:text-sm"><Terminal className="size-4" /> Console</TabsTrigger>
                <TabsTrigger value="files" className="rounded-lg gap-2 py-2 px-4 data-[state=active]:bg-primary data-[state=active]:text-white text-xs md:text-sm"><FolderOpen className="size-4" /> Files</TabsTrigger>
                {hasStartup && <TabsTrigger value="startup" className="rounded-lg gap-2 py-2 px-4 data-[state=active]:bg-primary data-[state=active]:text-white text-xs md:text-sm"><Rocket className="size-4" /> StartUp</TabsTrigger>}
                <TabsTrigger value="billing" className="rounded-lg gap-2 py-2 px-4 data-[state=active]:bg-primary data-[state=active]:text-white text-xs md:text-sm"><CreditCard className="size-4" /> Billing</TabsTrigger>
                <TabsTrigger value="settings" className="rounded-lg gap-2 py-2 px-4 data-[state=active]:bg-primary data-[state=active]:text-white text-xs md:text-sm"><SettingsIcon className="size-4" /> Settings</TabsTrigger>
              </TabsList>
            </div>

            <div className="flex items-center justify-start md:justify-end gap-2 md:gap-4 px-1 animate-in fade-in duration-300 w-auto">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary/30 border border-border/50">
                <Globe className="size-3.5 text-primary" />
                <div className="flex flex-col">
                  <span className="text-[8px] font-bold uppercase text-muted-foreground leading-none mb-1">Hostname</span>
                  <span className="text-[10px] md:text-xs font-code text-primary font-medium whitespace-nowrap">
                    {id}.stscloud.id
                  </span>
                </div>
              </div>
            </div>
          </div>

          <TabsContent value="console" className="space-y-8 animate-in fade-in duration-500">
            <div className="w-full h-[500px] md:h-[600px] lg:h-[650px]">
              <TerminalConsole serverId={id as string} externalStatus={server?.status} onPowerAction={handlePower} isExpired={isExpired} />
            </div>
            <PerformanceMetrics status={server?.status || "offline"} resources={server?.resources} actualDiskUsageMB={diskUsage} />
          </TabsContent>

          <TabsContent value="files" className="animate-in fade-in duration-500">
            <FileExplorer serverId={id as string} isExpired={isExpired} />
          </TabsContent>

          {hasStartup && (
            <TabsContent value="startup" className="animate-in fade-in duration-500 space-y-8">
              <div className="max-w-3xl bg-card border border-border/50 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-border/50 bg-secondary/30 flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><Rocket className="size-5" /></div>
                  <div>
                    <h2 className="text-xl font-headline font-bold">Boot Configuration</h2>
                    <p className="text-xs text-muted-foreground">Modify {isPython ? 'Python' : 'Node.js'} execution parameters.</p>
                  </div>
                </div>
                <CardContent className="p-8 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-muted-foreground">StartUp Command</Label>
                      <Input className="bg-secondary/50 border-none font-code text-sm h-11" value={startupCommand} onChange={(e) => setStartupCommand(e.target.value)} placeholder={isPython ? 'python3 main.py' : 'npm start'} disabled={isExpired} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-muted-foreground">{isPython ? 'Python' : 'Node.js'} Version</Label>
                      <Select value={runtimeVersion} onValueChange={setRuntimeVersion} disabled={isExpired}>
                        <SelectTrigger className="bg-secondary/50 border-none h-11">
                          <SelectValue placeholder="Select version" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          {currentVersionsList.map(v => (
                            <SelectItem key={v} value={v}>
                              {isPython ? 'Python' : 'Node.js'} {v}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-muted-foreground">Binary Runner</Label>
                      <Input className="bg-secondary/50 border-none font-code text-sm h-11" value={commandRun} onChange={(e) => setCommandRun(e.target.value)} placeholder={isPython ? 'python3' : 'node'} disabled={isExpired} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-muted-foreground">Entrypoint</Label>
                      <Input className="bg-secondary/50 border-none font-code text-sm h-11" value={entryFile} onChange={(e) => setEntryFile(e.target.value)} placeholder={isPython ? 'main.py' : 'index.js'} disabled={isExpired} />
                    </div>
                  </div>
                  <Button onClick={handleSaveSettings} disabled={isSavingSettings || isExpired} className="h-12 px-8 bg-primary hover:bg-primary/90 text-white font-bold gap-2"><Save className="size-4" /> Update Startup Config</Button>
                </CardContent>
              </div>
            </TabsContent>
          )}

          <TabsContent value="billing" className="animate-in fade-in duration-500 space-y-8">
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 bg-card border-border/50 overflow-hidden">
                   <div className="p-6 bg-secondary/30 border-b border-border/50 flex items-center gap-3">
                      <div className="size-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent"><CreditCard className="size-5" /></div>
                      <div>
                        <h2 className="text-xl font-headline font-bold">Subscription Info</h2>
                        <p className="text-xs text-muted-foreground">Manage your instance billing and cycle.</p>
                      </div>
                   </div>
                   <CardContent className="p-8 space-y-8">
                      {isRenewing ? (
                         <div className="max-w-md mx-auto space-y-6 text-center animate-in zoom-in-95">
                            <div className="space-y-2">
                               <h3 className="text-xl font-headline font-bold">Renewal Payment</h3>
                               <p className="text-xs text-muted-foreground">Scan QRIS to extend for 30 days.</p>
                            </div>
                            <div className="p-0 rounded-2xl bg-white flex items-center justify-center relative overflow-hidden">
                               {renewalPaymentData?.qr_url ? (
                                  <div className="w-full">
                                     <img src={renewalPaymentData.qr_url} alt="QRIS" className={cn("w-full h-auto transition-opacity", (renewalPaymentStatus === "success" || isCheckingRenewal) && "opacity-20")} />
                                     {renewalPaymentStatus === "success" && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-green-500/10 backdrop-blur-sm">
                                           <CheckCircle2 className="size-16 text-green-500 fill-white" />
                                           <p className="text-green-600 font-bold mt-2">PAID</p>
                                        </div>
                                     )}
                                  </div>
                               ) : <Skeleton className="w-full aspect-square" />}
                            </div>
                            <div className="flex flex-col gap-3">
                               <Button onClick={handleCheckRenewalStatus} disabled={isCheckingRenewal || renewalPaymentStatus === 'success'} className="w-full h-12 gap-2 bg-primary">
                                  {isCheckingRenewal ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />} Check Status
                               </Button>
                               <Button variant="ghost" onClick={() => setIsRenewing(false)} className="text-xs">Cancel & Back</Button>
                            </div>
                         </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-6">
                            <div className="space-y-1">
                               <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Current Plan</Label>
                               <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/30 border border-border/50">
                                  <Zap className="size-5 text-primary" />
                                  <div>
                                     <div className="font-bold text-lg">{server?.plan || "N/A"}</div>
                                     <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{server?.resources?.ram} RAM Instance</div>
                                  </div>
                               </div>
                            </div>
                            <div className="space-y-1">
                               <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Expiration Date</Label>
                               <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/30 border border-border/50">
                                  <Calendar className="size-5 text-primary" />
                                  <div>
                                     <div className={cn("font-bold text-lg", isExpired ? "text-destructive" : "")}>
                                        {expiresDate ? expiresDate.toLocaleDateString() : "Never"}
                                     </div>
                                     <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                                        {isExpired ? "EXPIRED" : `${daysLeft} DAYS REMAINING`}
                                     </div>
                                  </div>
                               </div>
                            </div>
                          </div>

                          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 flex flex-col justify-between">
                             <div className="space-y-2">
                                <div className="text-xs font-bold text-primary uppercase tracking-[0.2em]">Extend Sub</div>
                                <h3 className="text-xl font-headline font-bold">Renewal Cycle</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                   Extend your instance for another 30 days. Payments are processed instantly via SValePay QRIS.
                                </p>
                             </div>
                             <Button onClick={handleInitiateRenewal} disabled={renewalLoading} className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-bold gap-2 mt-6">
                                {renewalLoading ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />} Renew Instance
                             </Button>
                          </div>
                        </div>
                      )}
                   </CardContent>
                </Card>

                <Card className="bg-card border-border/50 p-6 flex flex-col gap-6">
                   <div className="flex items-center gap-3">
                      <Clock className="size-5 text-muted-foreground" />
                      <h3 className="font-headline font-bold">Billing History</h3>
                   </div>
                   <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40">
                      <CreditCard className="size-12 mb-4" />
                      <p className="text-xs font-medium">Internal transaction log is currently being migrated.</p>
                   </div>
                </Card>
             </div>
          </TabsContent>

          <TabsContent value="settings" className="animate-in fade-in duration-500 space-y-8">
             <div className="max-w-2xl bg-card border border-border/50 rounded-xl p-6 md:p-8">
                <h2 className="text-xl font-headline font-bold mb-6">Server Identity</h2>
                <div className="space-y-6">
                  <div className="grid gap-2"><Label htmlFor="s-name" className="text-sm font-medium">Display Name</Label><Input id="s-name" className="bg-secondary/50 border-none rounded-lg h-11" value={serverName} onChange={(e) => setServerName(e.target.value)} disabled={isExpired} /></div>
                  <Button onClick={handleSaveSettings} disabled={isSavingSettings || isExpired} className="bg-primary hover:bg-primary/90 text-white h-11 font-bold gap-2"><Save className="size-4" /> Save Settings</Button>
                </div>
             </div>
             <div className="max-w-2xl bg-card border border-destructive/20 rounded-xl p-6 md:p-8">
                <div className="flex items-center gap-3 text-destructive mb-4"><AlertTriangle className="size-6" /><h2 className="text-xl font-headline font-bold">Termination</h2></div>
                <p className="text-sm text-muted-foreground mb-6">Decommissioning will permanently wipe all storage and configuration data.</p>
                <AlertDialog>
                  <AlertDialogTrigger asChild><Button variant="destructive" className="h-11 font-bold gap-2" disabled={isDeleting}><Trash2 className="size-4" /> Decommission Server</Button></AlertDialogTrigger>
                  <AlertDialogContent className="rounded-xl border-border/50"><AlertDialogHeader><AlertDialogTitle>Delete Permanently?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone. <strong>{server?.name}</strong> will be wiped.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel className="rounded-lg">Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDeleteServer} className="bg-destructive text-white rounded-lg">Yes, Delete Everything</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
                </AlertDialog>
             </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

