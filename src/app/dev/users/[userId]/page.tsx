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
  Shield, 
  Server as ServerIcon, 
  Activity, 
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  Cpu,
  Database,
  HardDrive,
  Zap,
  Plus
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser, useFirestore } from "@/firebase";
import { doc, onSnapshot, updateDoc, collection, query, where, setDoc, serverTimestamp } from "firebase/firestore";
import { provisionServerFiles } from "@/app/actions/server-provisioning";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const resourcePresets = [
  { id: "p1", name: "Zero", ram: "1.5GB", cpu: "100%", disk: "2GB" },
  { id: "p2", name: "Core", ram: "3GB", cpu: "170%", disk: "5GB" },
  { id: "p3", name: "Plus", ram: "5GB", cpu: "250%", disk: "10GB" },
  { id: "p4", name: "Pro", ram: "7GB", cpu: "340%", disk: "15GB" },
  { id: "p5", name: "Elite", ram: "10GB", cpu: "Unlimited", disk: "25GB" },
];

export default function UserDetailPage() {
  const { userId } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { user: currentUser, loading: authLoading } = useUser();
  const db = useFirestore();
  
  const [profile, setProfile] = React.useState<any>(null);
  const [targetUser, setTargetUser] = React.useState<any>(null);
  const [userServers, setUserServers] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [updating, setUpdating] = React.useState(false);
  const [loadingProgress, setLoadingProgress] = React.useState(0);

  // Provisioning State
  const [isProvisioning, setIsProvisioning] = React.useState(false);
  const [provisionPlanId, setProvisionPlanId] = React.useState("p1");
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

  // Loading animation simulation
  React.useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= 100) return 100;
          return prev + 2;
        });
      }, 30);
      return () => clearInterval(interval);
    }
  }, [loading]);

  // Fetch Target User Data
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
      setLoading(false);
    });

    const serversQuery = query(collection(db, "servers"), where("ownerId", "==", userId));
    const unsubServers = onSnapshot(serversQuery, (snapshot) => {
      setUserServers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubUser();
      unsubServers();
    };
  }, [userId, db, router, toast]);

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

  if (loading || authLoading) {
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

  if (!targetUser) return null;

  const joinDate = targetUser.createdAt?.toDate ? targetUser.createdAt.toDate().toLocaleDateString() : "Unknown";
  const userInitial = (targetUser.displayName || targetUser.email || "U").charAt(0).toUpperCase();

  return (
    <div className="bg-background min-h-screen">
      <header className="flex h-16 shrink-0 items-center justify-between px-4 md:px-8 border-b border-border/50 sticky top-0 bg-[#0c0c0f]/80 backdrop-blur-md z-40">
        <div className="flex items-center gap-4">
          <Link href="/dev" className="flex items-center gap-2">
            <div className="w-[32px] h-[32px] rounded-lg overflow-hidden flex items-center justify-center bg-primary">
              <Image src="/img/icon.png" alt="STSCloud" width={32} height={32} className="invert brightness-0" />
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
          {/* User Profile Card */}
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
                  <DialogContent className="sm:max-w-[425px] bg-card border-border/50">
                    <DialogHeader>
                      <DialogTitle className="font-headline font-bold text-xl">Deploy Server for User</DialogTitle>
                      <DialogDescription>
                        Directly provision a server instance for {targetUser.email}.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="server-name" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Server Name</Label>
                        <Input 
                          id="server-name" 
                          placeholder="e.g., My Cloud Project" 
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
                        Provision Server
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
                  {updating ? <Loader2 className="size-4 animate-spin" /> : (
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

          {/* User Data & Tabs */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="servers" className="w-full">
              <TabsList className="bg-secondary/30 p-1 rounded-xl h-auto border border-border/50">
                <TabsTrigger value="servers" className="rounded-lg gap-2 py-2 px-6 data-[state=active]:bg-primary">
                  <ServerIcon className="size-4" /> Agents
                </TabsTrigger>
                <TabsTrigger value="activity" className="rounded-lg gap-2 py-2 px-6 data-[state=active]:bg-primary">
                  <Activity className="size-4" /> Recent Activity
                </TabsTrigger>
              </TabsList>

              <TabsContent value="servers" className="pt-6 space-y-4 animate-in fade-in duration-500">
                <h3 className="font-headline font-bold text-lg px-1">Deployed Infrastructure</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userServers.length > 0 ? (
                    userServers.map(server => (
                      <Link key={server.id} href={`/servers/${server.id}`}>
                        <Card className="group border-border/50 bg-card hover:bg-secondary/30 hover:border-primary/30 transition-all duration-300 overflow-hidden">
                          <CardContent className="p-5 space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="size-10 rounded-xl bg-secondary flex items-center justify-center">
                                  <ServerIcon className="size-5 text-primary" />
                                </div>
                                <div>
                                  <h4 className="text-sm font-bold truncate pr-4">{server.name}</h4>
                                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">STS {server.plan}</p>
                                </div>
                              </div>
                              <Badge variant="outline" className={cn(
                                "text-[9px] uppercase",
                                server.status === "online" ? "text-green-500 border-green-500/20" : "text-red-500 border-red-500/20"
                              )}>
                                {server.status}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-muted-foreground border-t border-border/30 pt-3">
                               <div className="flex items-center gap-1"><Cpu className="size-3 text-primary" /> {server.resources?.cpu || "--"}</div>
                               <div className="flex items-center gap-1"><Database className="size-3 text-primary" /> {server.resources?.ram || "--"}</div>
                               <div className="flex items-center gap-1"><HardDrive className="size-3 text-primary" /> {server.resources?.disk || "--"}</div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))
                  ) : (
                    <div className="col-span-full py-12 text-center bg-secondary/10 rounded-2xl border border-dashed border-border/50">
                      <ServerIcon className="size-10 text-muted-foreground mx-auto mb-3 opacity-20" />
                      <p className="text-sm text-muted-foreground font-medium">This user hasn't deployed any agents yet.</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="activity" className="pt-6 space-y-4">
                 <Card className="border-border/50 bg-card">
                   <CardContent className="p-0">
                      <div className="divide-y divide-border/30">
                         <div className="p-4 flex items-center justify-between text-sm">
                            <div className="flex items-center gap-3">
                               <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><User className="size-4" /></div>
                               <div>
                                  <div className="font-bold">Account Created</div>
                                  <div className="text-[10px] text-muted-foreground uppercase">System Registration</div>
                               </div>
                            </div>
                            <div className="text-xs text-muted-foreground">{joinDate}</div>
                         </div>
                         <div className="p-4 flex items-center justify-between text-sm opacity-50">
                            <div className="flex items-center gap-3">
                               <div className="size-8 rounded-lg bg-secondary flex items-center justify-center"><Activity className="size-4" /></div>
                               <div>
                                  <div className="font-bold">Last Login</div>
                                  <div className="text-[10px] text-muted-foreground uppercase">Authentication Session</div>
                               </div>
                            </div>
                            <div className="text-xs text-muted-foreground">Recently</div>
                         </div>
                      </div>
                   </CardContent>
                 </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}
