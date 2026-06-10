
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
  Clock,
  Headset,
  User,
  LogOut,
  Settings as SettingsIcon,
  Users as UsersIcon,
  UserPlus,
  Trash2,
  Mail,
  History,
  CheckCircle2,
  Info,
  Save,
  Rocket,
  AlertTriangle,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
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
} from "@/components/ui/dialog";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useUser, useAuth, useFirestore } from "@/firebase";
import { signOut } from "firebase/auth";
import { doc, onSnapshot, updateDoc, deleteDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { getServerDiskUsage, decommissionServerFiles } from "@/app/actions/server-files";
import { Loader } from "@/components/loader";

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
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState("console");
  const [inviteEmail, setInviteEmail] = React.useState("");

  // Settings & Startup states
  const [serverName, setServerName] = React.useState("");
  const [nodeVersion, setNodeVersion] = React.useState("");
  const [startupCommand, setStartupCommand] = React.useState("");
  const [commandRun, setCommandRun] = React.useState("");
  const [entryFile, setEntryFile] = React.useState("");
  const [isSavingSettings, setIsSavingSettings] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  React.useEffect(() => {
    if (!user?.uid || !id) return;

    // User Profile Listener
    const unsubProfile = onSnapshot(doc(db, "users", user.uid), (doc) => {
      if (doc.exists()) {
        setProfile(doc.data());
      }
    });

    // Specific Server Listener
    const unsubServer = onSnapshot(doc(db, "servers", id as string), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setServer({ id: doc.id, ...data });
        setServerName(data.name || "");
        setNodeVersion(data.nodeVersion || "20");
        setStartupCommand(data.startupCommand || "npm start");
        setCommandRun(data.commandRun || "node");
        setEntryFile(data.entryFile || "index.js");
      } else {
        // Only redirect if not already in the middle of a deletion
        if (!isDeleting) {
          toast({
            variant: "destructive",
            title: "Server not found",
            description: "This instance may have been decommissioned."
          });
          router.push("/dashboard");
        }
      }
      setLoading(false);
    });

    // Fetch actual disk usage
    getServerDiskUsage(id as string).then(res => {
      if (res.success) setDiskUsage(res.sizeInMB || 0);
    });

    return () => {
      unsubProfile();
      unsubServer();
    };
  }, [user, id, db, router, toast, isDeleting]);

  const handlePower = async (action: "start" | "stop" | "restart") => {
    if (!id || !db) return;
    
    let newStatus = server?.status;
    if (action === "start") newStatus = "starting";
    if (action === "stop") newStatus = "offline";
    if (action === "restart") newStatus = "starting";

    try {
      await updateDoc(doc(db, "servers", id as string), {
        status: newStatus
      });

      if (action === "start" || action === "restart") {
        setTimeout(async () => {
          await updateDoc(doc(db, "servers", id as string), {
            status: "online"
          });
        }, 2000);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "System Error",
        description: "Failed to communicate with agent node."
      });
    }
  };

  const handleSaveSettings = async () => {
    if (!id || !db) return;
    setIsSavingSettings(true);
    try {
      await updateDoc(doc(db, "servers", id as string), {
        name: serverName,
        nodeVersion: nodeVersion,
        startupCommand: startupCommand,
        commandRun: commandRun,
        entryFile: entryFile
      });
      toast({
        title: "Configuration Saved",
        description: "Server settings and startup parameters updated."
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      });
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleDeleteServer = async () => {
    if (!id || !db) return;
    setIsDeleting(true);
    
    try {
      // 1. Clean up storage files
      const cleanup = await decommissionServerFiles(id as string);
      if (!cleanup.success) throw new Error(cleanup.error);

      // 2. Delete Firestore Document
      await deleteDoc(doc(db, "servers", id as string));

      toast({
        title: "Server Decommissioned",
        description: "The instance and its data have been permanently removed."
      });

      router.push("/dashboard");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Decommission Failed",
        description: error.message
      });
      setIsDeleting(false);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/auth?type=login");
  };

  const handleAddAccess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    
    toast({
      title: "Access Request Sent",
      description: `Access invitation sent to ${inviteEmail}`,
    });
    setInviteEmail("");
  };

  if (loading) {
    return <Loader />;
  }

  const displayName = profile?.displayName || user?.displayName || user?.email?.split('@')[0] || "User Account";
  const userInitial = displayName.charAt(0).toUpperCase();

  const isNodeJS = server?.runtime === "nodejs";

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
            <button 
              onClick={() => router.back()}
              className="text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
              aria-label="Go back"
            >
              <ArrowLeft className="size-4" />
            </button>
            <div className="flex items-center gap-2 min-w-0">
              <h1 className="font-headline font-semibold text-sm md:text-lg truncate max-w-[120px] xs:max-w-[150px] md:max-w-none">
                {server?.name || "Instance Management"}
              </h1>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
          <Link href="/support">
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground flex">
              <Headset className="size-4" />
              <span className="hidden sm:inline">Support</span>
            </Button>
          </Link>
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
                  <span className="text-xs font-bold font-headline leading-none truncate max-w-[120px]">
                    {displayName}
                  </span>
                  <span className="text-[10px] text-muted-foreground leading-none mt-1 truncate max-w-[120px]">
                    {user?.email}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 mt-2">
              <DropdownMenuLabel className="font-headline">My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2">
                <User className="size-4" /> Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2">
                <SettingsIcon className="size-4" /> Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive" onClick={handleSignOut}>
                <LogOut className="size-4" /> Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8 space-y-6 md:space-y-8 max-w-7xl mx-auto w-full">
        <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="console" className="w-full space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center justify-start overflow-hidden">
              <ScrollArea className="w-full" orientation="horizontal">
                <TabsList className="bg-secondary/30 p-1 rounded-xl w-fit h-auto inline-flex whitespace-nowrap">
                  <TabsTrigger value="console" className="rounded-lg gap-2 py-2 px-3 md:px-5 data-[state=active]:bg-primary data-[state=active]:text-white text-xs md:text-sm">
                    <Terminal className="size-4" /> <span>Console</span>
                  </TabsTrigger>
                  <TabsTrigger value="files" className="rounded-lg gap-2 py-2 px-3 md:px-5 data-[state=active]:bg-primary data-[state=active]:text-white text-xs md:text-sm">
                    <FolderOpen className="size-4" /> <span>Files</span>
                  </TabsTrigger>
                  {isNodeJS && (
                    <TabsTrigger value="startup" className="rounded-lg gap-2 py-2 px-3 md:px-5 data-[state=active]:bg-primary data-[state=active]:text-white text-xs md:text-sm">
                      <Rocket className="size-4" /> <span>StartUp</span>
                    </TabsTrigger>
                  )}
                  <TabsTrigger value="access" className="rounded-lg gap-2 py-2 px-3 md:px-5 data-[state=active]:bg-primary data-[state=active]:text-white text-xs md:text-sm">
                    <UsersIcon className="size-4" /> <span>Access</span>
                  </TabsTrigger>
                  <TabsTrigger value="activity" className="rounded-lg gap-2 py-2 px-3 md:px-5 data-[state=active]:bg-primary data-[state=active]:text-white text-xs md:text-sm">
                    <History className="size-4" /> <span>Activity</span>
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="rounded-lg gap-2 py-2 px-3 md:px-5 data-[state=active]:bg-primary data-[state=active]:text-white text-xs md:text-sm">
                    <SettingsIcon className="size-4" /> <span>Settings</span>
                  </TabsTrigger>
                </TabsList>
                <ScrollBar orientation="horizontal" className="hidden" />
              </ScrollArea>
            </div>

            {activeTab === "console" && (
              <div className="flex flex-row items-center justify-between md:justify-end w-full md:w-auto gap-2 md:gap-4 px-1 animate-in fade-in slide-in-from-right-2 duration-300">
                <div className="flex flex-1 md:flex-none items-center gap-2 px-3 py-2 rounded-xl bg-secondary/30 border border-border/50 hover:border-primary/30 transition-all">
                  <Globe className="size-3.5 text-primary shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-wider text-muted-foreground leading-none mb-1">Address</span>
                    <span className="text-[10px] md:text-xs font-code text-primary font-medium truncate">
                      {server?.id}.stscloud.net
                    </span>
                  </div>
                </div>
                <div className="flex flex-1 md:flex-none items-center gap-2 px-3 py-2 rounded-xl bg-secondary/30 border border-border/50 hover:border-primary/30 transition-all">
                  <Clock className="size-3.5 text-primary shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-wider text-muted-foreground leading-none mb-1">Status</span>
                    <span className="text-[10px] md:text-xs font-bold font-headline uppercase tracking-widest">{server?.status}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <TabsContent value="console" className="space-y-8 animate-in fade-in duration-500">
            <div className="w-full h-[500px] md:h-[600px] lg:h-[650px]">
              <TerminalConsole serverId={id as string} externalStatus={server?.status} onPowerAction={handlePower} />
            </div>

            <div className="space-y-4">
              <h2 className="text-[10px] md:text-[11px] font-bold uppercase tracking-widest text-muted-foreground px-1">System Infrastructure</h2>
              <PerformanceMetrics status={server?.status || "offline"} resources={server?.resources} actualDiskUsageMB={diskUsage} />
            </div>
          </TabsContent>

          <TabsContent value="files" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <FileExplorer serverId={id as string} />
          </TabsContent>

          {isNodeJS && (
            <TabsContent value="startup" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="max-w-3xl bg-card border border-border/50 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-border/50 bg-secondary/30 flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Rocket className="size-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-headline font-bold">StartUp Configuration</h2>
                    <p className="text-xs text-muted-foreground">Manage how your NodeJS application boots and runs.</p>
                  </div>
                </div>
                <CardContent className="p-8 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">StartUp Command</Label>
                      <Input 
                        className="bg-secondary/50 border-none font-code text-sm h-11"
                        value={startupCommand}
                        onChange={(e) => setStartupCommand(e.target.value)}
                        placeholder="e.g. npm start"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">NodeJs Version</Label>
                      <Select value={nodeVersion} onValueChange={setNodeVersion}>
                        <SelectTrigger className="bg-secondary/50 border-none h-11">
                          <SelectValue placeholder="Select version" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="18">Node.js 18 (LTS)</SelectItem>
                          <SelectItem value="20">Node.js 20 (Stable)</SelectItem>
                          <SelectItem value="22">Node.js 22 (Current)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Command Run</Label>
                      <Input 
                        className="bg-secondary/50 border-none font-code text-sm h-11"
                        value={commandRun}
                        onChange={(e) => setCommandRun(e.target.value)}
                        placeholder="e.g. node, npm, yarn"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Js File</Label>
                      <Input 
                        className="bg-secondary/50 border-none font-code text-sm h-11"
                        value={entryFile}
                        onChange={(e) => setEntryFile(e.target.value)}
                        placeholder="e.g. index.js"
                      />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-border/50">
                    <Button 
                      onClick={handleSaveSettings}
                      disabled={isSavingSettings}
                      className="w-full sm:w-auto h-12 px-8 bg-primary hover:bg-primary/90 text-white font-bold gap-2 shadow-lg shadow-primary/20"
                    >
                      {isSavingSettings ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                      Save Startup Configuration
                    </Button>
                  </div>
                </CardContent>
              </div>
            </TabsContent>
          )}

          <TabsContent value="access" className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-1 border-border/50 bg-card h-fit">
                <CardHeader>
                  <CardTitle className="text-lg font-headline font-bold flex items-center gap-2">
                    <UserPlus className="size-5 text-primary" />
                    Grant Access
                  </CardTitle>
                  <CardDescription>Invite another user to manage this server.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddAccess} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">User Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input 
                          placeholder="user@example.com" 
                          className="bg-secondary/30 border-none pl-10" 
                          type="email"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-11">
                      Grant Access
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2 border-border/50 bg-card">
                <CardHeader>
                  <CardTitle className="text-lg font-headline font-bold">Authorized Users</CardTitle>
                  <CardDescription>Users listed here can control and view this server.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-border/50">
                    <div className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-10 border border-primary/20">
                          <AvatarFallback className="bg-primary/5 text-primary font-bold">
                            {userInitial}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm font-bold flex items-center gap-2">
                            {displayName}
                            <Badge variant="outline" className="text-[8px] uppercase tracking-widest border-primary/50 text-primary bg-primary/5 px-1.5 h-4">Owner</Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">{user?.email}</div>
                        </div>
                      </div>
                      <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Full Control</div>
                    </div>

                    <div className="p-4 flex items-center justify-between group">
                      <div className="flex items-center gap-3 opacity-60">
                        <Avatar className="size-10">
                          <AvatarFallback className="bg-secondary text-muted-foreground font-bold">ST</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm font-bold flex items-center gap-2">
                            Support Team
                            <Badge variant="outline" className="text-[8px] uppercase tracking-widest px-1.5 h-4">Member</Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">support@stscloud.net</div>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
            <Card className="border-border/50 bg-card">
              <CardHeader>
                <CardTitle className="text-lg font-headline font-bold">Recent Activity</CardTitle>
                <CardDescription>A log of all significant events and actions performed on this node.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border/50">
                  <ActivityItem 
                    icon={CheckCircle2} 
                    action="Provisioning Cycle" 
                    user="System" 
                    time={server?.createdAt?.toDate ? server.createdAt.toDate().toLocaleDateString() : "Just now"} 
                    type="success" 
                  />
                  <ActivityItem 
                    icon={Info} 
                    action={`Instance deployed with ${server?.plan} plan`} 
                    user="System" 
                    time="Recently" 
                    type="info" 
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
             <div className="max-w-2xl bg-card border border-border/50 rounded-xl p-6 md:p-8">
                <h2 className="text-xl md:text-2xl font-headline font-bold mb-6">General Settings</h2>
                <div className="space-y-6">
                  <div className="grid gap-2">
                    <Label htmlFor="s-name" className="text-sm font-medium">Server Name</Label>
                    <Input 
                      id="s-name"
                      className="bg-secondary/50 border-none rounded-lg h-11 focus-visible:ring-primary/50 text-sm" 
                      value={serverName}
                      onChange={(e) => setServerName(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button 
                      onClick={handleSaveSettings}
                      disabled={isSavingSettings}
                      className="bg-primary hover:bg-primary/90 text-white w-full sm:w-auto h-11 text-sm font-bold gap-2"
                    >
                      {isSavingSettings ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                      Save Changes
                    </Button>
                    <Button variant="ghost" className="w-full sm:w-auto h-11 text-sm">Revert to default</Button>
                  </div>
                </div>
             </div>

             <div className="max-w-2xl bg-card border border-destructive/20 rounded-xl p-6 md:p-8">
                <div className="flex items-center gap-3 text-destructive mb-4">
                  <AlertTriangle className="size-6" />
                  <h2 className="text-xl md:text-2xl font-headline font-bold">Danger Zone</h2>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  Decommissioning a server will permanently delete the instance and all associated data in its storage. This action cannot be undone.
                </p>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="destructive" 
                      className="w-full sm:w-auto h-11 font-bold gap-2"
                      disabled={isDeleting}
                    >
                      {isDeleting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                      Decommission Server
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="w-[95vw] max-w-lg rounded-lg">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete the server <strong>{server?.name}</strong> and all files in its storage. There is no way to recover this data.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleDeleteServer}
                        className="bg-destructive hover:bg-destructive/90 text-white"
                      >
                        Yes, Decommission Server
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
             </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function ActivityItem({ icon: Icon, action, user, time, type }: any) {
  return (
    <div className="p-4 flex items-center justify-between group hover:bg-secondary/10 transition-colors">
      <div className="flex items-center gap-4">
        <div className={cn(
          "size-9 rounded-lg flex items-center justify-center shrink-0",
          type === "success" ? "bg-green-500/10 text-green-500" :
          type === "warning" ? "bg-yellow-500/10 text-yellow-500" :
          "bg-blue-500/10 text-blue-500"
        )}>
          <Icon className="size-4.5" />
        </div>
        <div className="space-y-0.5">
          <div className="text-sm font-bold">{action}</div>
          <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">By {user}</div>
        </div>
      </div>
      <div className="text-xs text-muted-foreground tabular-nums">{time}</div>
    </div>
  );
}
