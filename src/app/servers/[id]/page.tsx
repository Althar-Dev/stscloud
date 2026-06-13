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
  Users as UsersIcon,
  Trash2,
  History,
  Save,
  Rocket,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CardContent } from "@/components/ui/card";
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
import { getServerDiskUsage, decommissionServerFiles } from "@/app/actions/server-files";
import { executeServerPower, getServerProcessStatus } from "@/app/actions/server-power";

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

  const [serverName, setServerName] = React.useState("");
  const [nodeVersion, setNodeVersion] = React.useState("");
  const [startupCommand, setStartupCommand] = React.useState("");
  const [commandRun, setCommandRun] = React.useState("");
  const [entryFile, setEntryFile] = React.useState("");
  const [isSavingSettings, setIsSavingSettings] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  
  const [powerActionActive, setPowerActionActive] = React.useState(false);

  React.useEffect(() => {
    if (!user?.uid || !id) return;

    const unsubProfile = onSnapshot(doc(db, "users", user.uid), (doc) => {
      if (doc.exists()) setProfile(doc.data());
    });

    const unsubServer = onSnapshot(doc(db, "servers", id as string), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setServer({ id: doc.id, ...data });
        
        // Only update inputs if different to avoid flickering while typing
        setServerName(prev => prev === data.name ? prev : (data.name || ""));
        setNodeVersion(prev => prev === data.nodeVersion ? prev : (data.nodeVersion || "20"));
        setStartupCommand(prev => prev === data.startupCommand ? prev : (data.startupCommand || "npm start"));
        setCommandRun(prev => prev === data.commandRun ? prev : (data.commandRun || "node"));
        setEntryFile(prev => prev === data.entryFile ? prev : (data.entryFile || "index.js"));
      } else if (!isDeleting) {
        toast({ variant: "destructive", title: "Instance removed", description: "The server instance is no longer available." });
        router.push("/dashboard");
      }
    });

    return () => {
      unsubProfile();
      unsubServer();
    };
  }, [user, id, db, router, toast, isDeleting]);

  // Real-time status monitor
  React.useEffect(() => {
    if (!id || !server || powerActionActive || server.status === 'starting') return;

    const monitorInterval = setInterval(async () => {
      try {
        const status = await getServerProcessStatus(id as string);
        if (!status.running && server.status === 'online') {
          updateDoc(doc(db, "servers", id as string), { status: 'offline' });
        } else if (status.running && server.status === 'offline') {
          updateDoc(doc(db, "servers", id as string), { status: 'online' });
        }
      } catch (e) {}
    }, 3000);

    return () => clearInterval(monitorInterval);
  }, [id, server, db, powerActionActive]);

  // Disk usage update
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
    
    setPowerActionActive(true);
    
    let targetStatus = server.status;
    if (action === "start" || action === "restart") targetStatus = "starting";
    if (action === "stop") targetStatus = "offline";

    try {
      await updateDoc(doc(db, "servers", id as string), { status: targetStatus });

      const result = await executeServerPower(id as string, action, {
        nodeVersion: nodeVersion || "20",
        commandRun: commandRun || "node",
        entryFile: entryFile || "index.js",
        startupCommand: startupCommand || "npm start"
      });

      if (!result.success) {
        await updateDoc(doc(db, "servers", id as string), { status: "offline" });
        toast({ variant: "destructive", title: "Execution Error", description: result.error });
      }
      
      // Jeda untuk memastikan status sinkron
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
    try {
      await updateDoc(doc(db, "servers", id as string), {
        name: serverName,
        nodeVersion,
        startupCommand,
        commandRun,
        entryFile
      });
      toast({ title: "Config Saved", description: "Startup parameters updated." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setIsSavingSettings(false);
    }
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

  const displayName = profile?.displayName || user?.displayName || user?.email?.split('@')[0] || "User";
  const userInitial = displayName.charAt(0).toUpperCase();
  const isNodeJS = server?.runtime === "nodejs";
  const nodeVersionsList = Array.from({ length: 8 }, (_, i) => (15 + i).toString());

  return (
    <div className="bg-background min-h-screen">
      <header className="flex h-16 shrink-0 items-center justify-between px-4 md:px-8 border-b border-border/50 sticky top-0 bg-background/80 backdrop-blur-md z-40">
        <div className="flex items-center gap-3 md:gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-[40px] h-[40px] rounded-lg overflow-hidden flex items-center justify-center">
              <Image src="/img/icon.png" alt="STSCloud" width={40} height={40} className="object-cover" />
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
                <Avatar className="size-8"><AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">{userInitial}</AvatarFallback></Avatar>
                <div className="hidden md:flex flex-col items-start text-left">
                  <span className="text-xs font-bold font-headline leading-none truncate max-w-[120px]">{displayName}</span>
                  <span className="text-[10px] text-muted-foreground leading-none mt-1 truncate max-w-[120px]">{user?.email}</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 mt-2">
              <DropdownMenuLabel className="font-headline">Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2"><User className="size-4" /> Profile</DropdownMenuItem>
              <DropdownMenuItem className="gap-2"><SettingsIcon className="size-4" /> Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive" onClick={handleSignOut}><LogOut className="size-4" /> Sign Out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8 space-y-6 md:space-y-8 max-w-7xl mx-auto w-full">
        <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="console" className="w-full space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="w-full md:w-auto overflow-x-auto pb-1 custom-scrollbar">
              <TabsList className="bg-secondary/30 p-1 rounded-xl w-fit h-auto flex whitespace-nowrap">
                <TabsTrigger value="console" className="rounded-lg gap-2 py-2 px-4 data-[state=active]:bg-primary data-[state=active]:text-white text-xs md:text-sm"><Terminal className="size-4" /> Console</TabsTrigger>
                <TabsTrigger value="files" className="rounded-lg gap-2 py-2 px-4 data-[state=active]:bg-primary data-[state=active]:text-white text-xs md:text-sm"><FolderOpen className="size-4" /> Files</TabsTrigger>
                {isNodeJS && <TabsTrigger value="startup" className="rounded-lg gap-2 py-2 px-4 data-[state=active]:bg-primary data-[state=active]:text-white text-xs md:text-sm"><Rocket className="size-4" /> StartUp</TabsTrigger>}
                <TabsTrigger value="access" className="rounded-lg gap-2 py-2 px-4 data-[state=active]:bg-primary data-[state=active]:text-white text-xs md:text-sm"><UsersIcon className="size-4" /> Access</TabsTrigger>
                <TabsTrigger value="activity" className="rounded-lg gap-2 py-2 px-4 data-[state=active]:bg-primary data-[state=active]:text-white text-xs md:text-sm"><History className="size-4" /> Activity</TabsTrigger>
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
            <div className="w-full h-[500px] md:h-[600px] lg:h-[650px]"><TerminalConsole serverId={id as string} externalStatus={server?.status} onPowerAction={handlePower} /></div>
            <PerformanceMetrics status={server?.status || "offline"} resources={server?.resources} actualDiskUsageMB={diskUsage} />
          </TabsContent>

          <TabsContent value="files" className="animate-in fade-in duration-500"><FileExplorer serverId={id as string} /></TabsContent>

          {isNodeJS && (
            <TabsContent value="startup" className="animate-in fade-in duration-500 space-y-8">
              <div className="max-w-3xl bg-card border border-border/50 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-border/50 bg-secondary/30 flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><Rocket className="size-5" /></div>
                  <div><h2 className="text-xl font-headline font-bold">Boot Configuration</h2><p className="text-xs text-muted-foreground">Modify script execution parameters.</p></div>
                </div>
                <CardContent className="p-8 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2"><Label className="text-xs font-bold uppercase text-muted-foreground">StartUp Command</Label><Input className="bg-secondary/50 border-none font-code text-sm h-11" value={startupCommand} onChange={(e) => setStartupCommand(e.target.value)} /></div>
                    <div className="space-y-2"><Label className="text-xs font-bold uppercase text-muted-foreground">NodeJs Version</Label>
                      <Select value={nodeVersion} onValueChange={setNodeVersion}>
                        <SelectTrigger className="bg-secondary/50 border-none h-11"><SelectValue /></SelectTrigger>
                        <SelectContent className="max-h-60">{nodeVersionsList.map(v => <SelectItem key={v} value={v}>Node.js {v}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2"><Label className="text-xs font-bold uppercase text-muted-foreground">Binary Runner</Label><Input className="bg-secondary/50 border-none font-code text-sm h-11" value={commandRun} onChange={(e) => setCommandRun(e.target.value)} /></div>
                    <div className="space-y-2"><Label className="text-xs font-bold uppercase text-muted-foreground">Entrypoint</Label><Input className="bg-secondary/50 border-none font-code text-sm h-11" value={entryFile} onChange={(e) => setEntryFile(e.target.value)} /></div>
                  </div>
                  <Button onClick={handleSaveSettings} disabled={isSavingSettings} className="h-12 px-8 bg-primary hover:bg-primary/90 text-white font-bold gap-2"><Save className="size-4" /> Update Startup Config</Button>
                </CardContent>
              </div>
            </TabsContent>
          )}

          <TabsContent value="settings" className="animate-in fade-in duration-500 space-y-8">
             <div className="max-w-2xl bg-card border border-border/50 rounded-xl p-6 md:p-8">
                <h2 className="text-xl font-headline font-bold mb-6">Server Identity</h2>
                <div className="space-y-6">
                  <div className="grid gap-2"><Label htmlFor="s-name" className="text-sm font-medium">Display Name</Label><Input id="s-name" className="bg-secondary/50 border-none rounded-lg h-11" value={serverName} onChange={(e) => setServerName(e.target.value)} /></div>
                  <Button onClick={handleSaveSettings} disabled={isSavingSettings} className="bg-primary hover:bg-primary/90 text-white h-11 font-bold gap-2"><Save className="size-4" /> Save Settings</Button>
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