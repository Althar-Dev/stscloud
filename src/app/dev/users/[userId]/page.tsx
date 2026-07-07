"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Calendar, 
  Server as ServerIcon, 
  Activity, 
  ShieldCheck,
  ShieldAlert,
  Cpu,
  Database,
  HardDrive,
  Zap,
  Plus,
  Trash2,
  Globe,
  Bot,
  Code2,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser, useFirestore } from "@/firebase";
import { doc, onSnapshot, updateDoc, collection, query, where, setDoc, serverTimestamp, deleteDoc } from "firebase/firestore";
import { provisionServerFiles } from "@/app/actions/server-provisioning";
import { decommissionServerFiles } from "@/app/actions/server-files";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const defaultResourcePresets = [
  { id: "p1", name: "Zero", ram: "1.5GB", cpu: "100%", disk: "2GB" },
  { id: "p2", name: "Core", ram: "3GB", cpu: "170%", disk: "5GB" },
  { id: "p3", name: "Plus", ram: "5GB", cpu: "250%", disk: "10GB" },
  { id: "p4", name: "Pro", ram: "7GB", cpu: "340%", disk: "15GB" },
  { id: "p5", name: "Elite", ram: "10GB", cpu: "Unlimited", disk: "25GB" },
];

const templates = [
  { id: "website", name: "Website", icon: Globe },
  { id: "bots", name: "Bots", icon: Bot },
];

const runtimesByTemplate: Record<string, { id: string; name: string }[]> = {
  website: [
    { id: "nodejs", name: "Node.js" },
    { id: "python", name: "Python" },
    { id: "php", name: "PHP" },
  ],
  bots: [
    { id: "nodejs", name: "Node.js" },
    { id: "python", name: "Python" },
  ],
};

const runtimeVersions: Record<string, string[]> = {
  nodejs: ["16", "18", "20", "22"],
  python: ["3.10", "3.11", "3.12", "3.13"],
  php: ["7.4", "8.1", "8.2", "8.3"],
};

export default function UserDetailPage() {
  const { userId } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { user: currentUser, loading: authLoading } = useUser();
  const db = useFirestore();
  
  const [profile, setProfile] = React.useState<any>(null);
  const [targetUser, setTargetUser] = React.useState<any>(null);
  const [userServers, setUserServers] = React.useState<any[]>([]);
  const [updating, setUpdating] = React.useState(false);
  const [resourcePresets, setResourcePresets] = React.useState<any[]>(defaultResourcePresets);

  // Provisioning State
  const [isProvisioning, setIsProvisioning] = React.useState(false);
  const [provisionPlanId, setProvisionPlanId] = React.useState("p1");
  const [provisionTemplate, setProvisionTemplate] = React.useState("website");
  const [provisionRuntime, setProvisionRuntime] = React.useState("nodejs");
  const [provisionVersion, setProvisionVersion] = React.useState("20");
  const [provisionServerName, setProvisionServerName] = React.useState("");
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  // Auth & Admin Check
  React.useEffect(() => {
    if (authLoading) return;
    if (!currentUser) {
      router.push("/auth?type=login");
      return;
    }

    const unsub = onSnapshot(doc(db, "users", currentUser.uid), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setProfile(data);
        if (data.dev !== true) {
          router.replace("/dashboard");
        }
      } else {
        router.replace("/dashboard");
      }
    });
    
    return () => unsub();
  }, [currentUser, authLoading, db, router]);

  // Fetch Target User Data & Global Pricing
  React.useEffect(() => {
    if (!userId || !db) return;

    const unsubUser = onSnapshot(doc(db, "users", userId as string), (doc) => {
      if (doc.exists()) {
        setTargetUser({ id: doc.id, ...doc.data() });
      } else {
        toast({
          variant: "destructive",
          title: "User not found",
          description: "The requested user ID does not exist."
        });
        router.push("/dev");
      }
    });

    const unsubPricing = onSnapshot(doc(db, "main", "product"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.tiers && Array.isArray(data.tiers)) {
          setResourcePresets(data.tiers);
          if (data.tiers.length > 0 && !provisionPlanId) {
            setProvisionPlanId(data.tiers[0].id);
          }
        }
      }
    });

    const serversQuery = query(collection(db, "servers"), where("ownerId", "==", userId));
    const unsubServers = onSnapshot(serversQuery, (snapshot) => {
      setUserServers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubUser();
      unsubPricing();
      unsubServers();
    };
  }, [userId, db, router, toast, provisionPlanId]);

  // Sync version when runtime changes
  React.useEffect(() => {
    const versions = runtimeVersions[provisionRuntime] || [];
    if (versions.length > 0) {
      setProvisionVersion(versions[0]);
    }
  }, [provisionRuntime]);

  const toggleDevStatus = async () => {
    if (!targetUser || updating) return;
    setUpdating(true);
    try {
      await updateDoc(doc(db, "users", targetUser.id), {
        dev: !targetUser.dev
      });
      toast({
        title: "Status Updated",
        description: `${targetUser.email} is now ${!targetUser.dev ? "a Developer" : "a standard User"}.`
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleAdminProvision = async () => {
    if (!provisionServerName) {
      toast({ variant: "destructive", title: "Missing Info", description: "Please enter a server name." });
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
        ownerId: targetUser.id,
        plan: plan?.name,
        template: provisionTemplate,
        runtime: provisionRuntime,
        runtimeVersion: provisionVersion,
        nodeVersion: provisionRuntime === 'nodejs' ? provisionVersion : null,
        pythonVersion: provisionRuntime === 'python' ? provisionVersion : null,
        status: "online",
        createdAt: serverTimestamp(),
        resources: {
          ram: plan?.ram,
          cpu: plan?.cpu,
          disk: plan?.disk
        }
      });

      toast({ title: "Admin Provision Success", description: `Agent ${provisionServerName} deployed.` });
      setIsDialogOpen(false);
      setProvisionServerName("");
    } catch (error: any) {
      toast({ variant: "destructive", title: "Provisioning Failed", description: error.message });
    } finally {
      setIsProvisioning(false);
    }
  };

  const handleAdminDeleteServer = async (serverId: string) => {
    try {
      const cleanup = await decommissionServerFiles(serverId);
      if (!cleanup.success) throw new Error(cleanup.error);
      await deleteDoc(doc(db, "servers", serverId));
      toast({ title: "Success", description: "Server removed permanently." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Delete Failed", description: error.message });
    }
  };

  const availableRuntimes = runtimesByTemplate[provisionTemplate] || [];
  const availableVersions = runtimeVersions[provisionRuntime] || [];

  if (!targetUser) return null;

  const joinDate = targetUser.createdAt?.toDate ? targetUser.createdAt.toDate().toLocaleDateString() : "Unknown";
  const userInitial = (targetUser.displayName || targetUser.email || "U").charAt(0).toUpperCase();

  return (
    <div className="bg-background min-h-screen">
      <header className="flex h-16 shrink-0 items-center justify-between px-4 md:px-8 border-b border-border/50 sticky top-0 bg-[#0c0c0f]/80 backdrop-blur-md z-40">
        <div className="flex items-center gap-4">
          <Link href="/dev" className="flex items-center gap-2">
            <div className="w-[32px] h-[32px] rounded-lg overflow-hidden flex items-center justify-center">
              <Image src="/img/icons.png" alt="STSCloud" width={32} height={32} className="object-cover" />
            </div>
            <span className="font-headline font-bold text-lg tracking-tight">
              <span className="text-primary">User</span>Detail
            </span>
          </Link>
          <div className="h-4 w-px bg-border hidden sm:block" />
          <button onClick={() => router.back()} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" />
          </button>
        </div>
      </header>

      <main className="p-4 md:p-8 space-y-8 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1 border-border/50 bg-card">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Avatar className="size-20 border-2 border-primary/20">
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                    {userInitial}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle className="font-headline font-bold">{targetUser.displayName || "Standard User"}</CardTitle>
              <CardDescription className="text-xs truncate">{targetUser.email}</CardDescription>
              <div className="pt-4 flex justify-center">
                {targetUser.dev ? (
                  <Badge className="bg-primary/20 text-primary border-primary/30 gap-1 px-3">
                    <ShieldCheck className="size-3" /> Developer Admin
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-secondary/50 text-muted-foreground gap-1 px-3">
                    <User className="size-3" /> Standard User
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-4 border-t border-border/30">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="size-4 text-primary" />
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium ml-auto">{targetUser.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="size-4 text-primary" />
                <span className="text-muted-foreground">Joined:</span>
                <span className="font-medium ml-auto">{joinDate}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <ServerIcon className="size-4 text-primary" />
                <span className="text-muted-foreground">Agents:</span>
                <span className="font-medium ml-auto">{userServers.length}</span>
              </div>

              <div className="pt-6 space-y-3">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-bold gap-2 shadow-lg shadow-primary/20">
                      <Plus className="size-4" /> Server
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="w-[calc(100%-2rem)] max-w-[95vw] sm:max-w-[450px] bg-card border-border/50 rounded-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="font-headline font-bold text-xl">Admin: Deploy Server</DialogTitle>
                      <DialogDescription className="break-all">
                        Directly provision a server instance for {targetUser.email}.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="server-name" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Server Name</Label>
                        <Input 
                          id="server-name" 
                          placeholder="e.g., Cloud Instance" 
                          className="bg-secondary/30 border-none h-11"
                          value={provisionServerName}
                          onChange={(e) => setProvisionServerName(e.target.value)}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Template</Label>
                          <Select value={provisionTemplate} onValueChange={(val) => {
                            setProvisionTemplate(val);
                          }}>
                            <SelectTrigger className="bg-secondary/30 border-none h-11 w-full">
                              <SelectValue placeholder="Template" />
                            </SelectTrigger>
                            <SelectContent>
                              {templates.map(t => (
                                <SelectItem key={t.id} value={t.id}>
                                  <div className="flex items-center gap-2 uppercase text-[10px] font-bold tracking-widest">
                                    <t.icon className="size-3 shrink-0" /> <span className="truncate">{t.name}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid gap-2">
                          <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Runtime</Label>
                          <Select value={provisionRuntime} onValueChange={setProvisionRuntime}>
                            <SelectTrigger className="bg-secondary/30 border-none h-11 w-full">
                              <SelectValue placeholder="Runtime" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableRuntimes.map(r => (
                                <SelectItem key={r.id} value={r.id}>
                                  <div className="flex items-center gap-2 uppercase text-[10px] font-bold tracking-widest">
                                    <Code2 className="size-3 shrink-0" /> <span className="truncate">{r.name}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      {availableVersions.length > 0 && (
                        <div className="grid gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                          <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            {provisionRuntime === 'python' ? 'Python' : provisionRuntime === 'nodejs' ? 'Node.js' : 'Runtime'} Version
                          </Label>
                          <Select value={provisionVersion} onValueChange={setProvisionVersion}>
                            <SelectTrigger className="bg-secondary/30 border-none h-11 w-full">
                              <SelectValue placeholder="Select version" />
                            </SelectTrigger>
                            <SelectContent className="max-h-60">
                              {availableVersions.map(v => (
                                <SelectItem key={v} value={v}>
                                  {provisionRuntime === 'python' ? `Python ${v}` : `v${v}`}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      <div className="grid gap-2">
                        <Label htmlFor="plan" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Resource Plan</Label>
                        <Select value={provisionPlanId} onValueChange={setProvisionPlanId}>
                          <SelectTrigger className="bg-secondary/30 border-none h-11 w-full">
                            <SelectValue placeholder="Select plan..." />
                          </SelectTrigger>
                          <SelectContent>
                            {resourcePresets.map(p => (
                              <SelectItem key={p.id} value={p.id}>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold">{p.name}</span>
                                  <span className="text-[10px] opacity-50">({p.ram})</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <DialogFooter className="sm:mt-0">
                      <Button 
                        className="w-full bg-primary text-white font-bold h-11" 
                        onClick={handleAdminProvision}
                        disabled={isProvisioning}
                      >
                        {isProvisioning ? (
                          <span className="flex items-center justify-center gap-2">
                            <Plus className="size-4 animate-spin" /> Provisioning...
                          </span>
                        ) : (
                          <span className="flex items-center justify-center gap-2">
                            <Zap className="size-4" /> Finalize Provisioning
                          </span>
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Button 
                  variant={targetUser.dev ? "destructive" : "outline"} 
                  className={cn("w-full h-11 font-bold gap-2", !targetUser.dev && "border-primary/30 text-primary bg-primary/5 hover:bg-primary/10")}
                  onClick={toggleDevStatus}
                  disabled={updating}
                >
                  {updating ? <Plus className="size-4 animate-spin" /> : (
                    targetUser.dev ? <ShieldAlert className="size-4" /> : <ShieldCheck className="size-4" />
                  )}
                  {targetUser.dev ? "Revoke Dev Role" : "Promote to Dev"}
                </Button>
                <Button variant="ghost" className="w-full h-11 text-destructive hover:bg-destructive/10">
                  Suspend Account
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="servers" className="w-full">
              <TabsList className="bg-secondary/30 p-1 rounded-xl h-auto border border-border/50">
                <TabsTrigger value="servers" className="rounded-lg gap-2 py-2 px-6 data-[state=active]:bg-primary">
                  <ServerIcon className="size-4" /> Agents
                </TabsTrigger>
              </TabsList>

              <TabsContent value="servers" className="pt-6 space-y-4 animate-in fade-in duration-500">
                <h3 className="font-headline font-bold text-lg px-1">Deployed Infrastructure</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userServers.length > 0 ? (
                    userServers.map(server => (
                      <div key={server.id} className="relative group">
                        <Link href={`/servers/${server.id}`}>
                          <Card className="border-border/50 bg-card hover:bg-secondary/30 hover:border-primary/30 transition-all duration-300 overflow-hidden h-full">
                            <CardContent className="p-5 pb-3">
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="size-10 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                                    <ServerIcon className="size-5 text-primary" />
                                  </div>
                                  <div className="min-w-0">
                                    <h4 className="text-sm font-bold truncate pr-12">{server.name}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                      <Badge variant="outline" className={cn(
                                        "text-[8px] uppercase font-bold px-1.5 h-4",
                                        server.status === "online" ? "text-green-500 border-green-500/20" : "text-red-500 border-red-500/20"
                                      )}>
                                        {server.status}
                                      </Badge>
                                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest truncate">STS {server.plan}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                            
                            <div className="px-5 py-3 border-y border-border/30 bg-secondary/10">
                              <div className="flex items-center justify-between text-[9px] md:text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                                <div className="flex items-center gap-2">
                                  <Cpu className="size-3 text-primary" />
                                  <div className="flex flex-col leading-none">
                                    <span className="text-[7px] md:text-[8px] opacity-70">TOTAL CPU</span>
                                    <span>{server.resources?.cpu || "--"}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 border-l border-border/30 pl-2">
                                  <Database className="size-3 text-primary" />
                                  <div className="flex flex-col leading-none">
                                    <span className="text-[7px] md:text-[8px] opacity-70">TOTAL RAM</span>
                                    <span>{server.resources?.ram || "--"}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 border-l border-border/30 pl-2">
                                  <HardDrive className="size-3 text-primary" />
                                  <div className="flex flex-col leading-none">
                                    <span className="text-[7px] md:text-[8px] opacity-70">TOTAL DISK</span>
                                    <span>{server.resources?.disk || "--"}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="p-5 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Zap className="size-3.5 text-primary" />
                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Dev Instance</span>
                              </div>
                            </div>
                          </Card>
                        </Link>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="absolute top-4 right-4 size-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="w-[95vw] max-w-lg rounded-lg">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Admin: Delete Server?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to permanently decommission <strong>{server.name}</strong>? All storage data will be wiped.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleAdminDeleteServer(server.id)}
                                className="bg-destructive text-white"
                              >
                                Delete Permanently
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full py-12 text-center bg-secondary/10 rounded-2xl border border-dashed border-border/50">
                      <ServerIcon className="size-10 text-muted-foreground mx-auto mb-3 opacity-20" />
                      <p className="text-sm text-muted-foreground font-medium">This user hasn't deployed any agents yet.</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}
