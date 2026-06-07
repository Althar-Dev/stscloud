
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Server as ServerIcon, 
  Activity, 
  Plus, 
  ExternalLink,
  Zap,
  Headset,
  User,
  Settings,
  LogOut,
  Cpu,
  Database,
  HardDrive
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useUser, useAuth, useFirestore } from "@/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import * as React from "react";
import { doc, onSnapshot } from "firebase/firestore";

const recentServers = [
  { id: "s-1", name: "Official Website", type: "Website", details: "Next.js • Phoenix-01", cpu: "12%", ram: "1.2GB", disk: "2.1GB", status: "online" },
  { id: "s-2", name: "Support Bot", type: "Bot", details: "Discord.js • Phoenix-02", cpu: "5%", ram: "450MB", disk: "1.1GB", status: "online" },
];

export default function Dashboard() {
  const { user } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const [profile, setProfile] = React.useState<any>(null);

  React.useEffect(() => {
    if (!user?.uid) return;
    const unsub = onSnapshot(doc(db, "users", user.uid), (doc) => {
      if (doc.exists()) {
        setProfile(doc.data());
      }
    });
    return () => unsub();
  }, [user, db]);

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/auth?type=login");
  };

  const displayName = profile?.displayName || user?.displayName || user?.email?.split('@')[0] || "User Account";
  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <div className="bg-background min-h-screen">
      <header className="flex h-16 shrink-0 items-center justify-between px-4 md:px-8 border-b border-border/50 sticky top-0 bg-background/80 backdrop-blur-md z-40">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-[40px] h-[40px] rounded-lg overflow-hidden flex items-center justify-center">
              <Image src="/img/icon.png" alt="STSCloud" width={40} height={40} className="object-cover" />
            </div>
            <span className="font-headline font-bold text-lg md:text-xl tracking-tight">
              <span className="text-primary">Cloud</span>
            </span>
          </Link>
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
                <Settings className="size-4" /> Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive" onClick={handleSignOut}>
                <LogOut className="size-4" /> Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8 space-y-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
          <div className="space-y-1">
            <h2 className="text-xl md:text-2xl font-headline font-bold">System Overview</h2>
            <p className="text-xs md:text-sm text-muted-foreground">All nodes performing within optimal parameters.</p>
          </div>
          <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3">
            <Badge variant="outline" className="w-fit bg-primary/5 text-primary border-primary/20 px-3 py-1.5 text-[10px] md:text-xs">
              <Activity className="size-3 mr-2 animate-pulse" /> Global Health: Optimal
            </Badge>
            <Link href="/deploy">
              <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90 text-white h-9 px-3 md:px-4">
                <Plus className="size-4" />
                <span>New Server</span>
              </Button>
            </Link>
          </div>
        </div>

        <section className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 gap-3 md:gap-6">
          <Card className="bg-primary/10 border-primary/20 overflow-hidden relative group">
            <CardContent className="p-3 md:p-6 relative">
              <div className="flex items-center justify-between">
                <div className="size-8 md:size-10 rounded-xl bg-primary flex items-center justify-center">
                  <Zap className="size-4 md:size-6 text-white" />
                </div>
                <Badge variant="outline" className="text-[8px] md:text-[10px] border-primary/30 text-primary bg-primary/5">2 Online</Badge>
              </div>
              <div className="mt-3 md:mt-4">
                <div className="text-lg md:text-2xl font-bold font-headline">3 Active</div>
                <div className="text-[8px] md:text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Total Servers</div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-accent/10 border-accent/20 overflow-hidden relative group">
            <CardContent className="p-3 md:p-6 relative">
              <div className="flex items-center justify-between">
                <div className="size-8 md:size-10 rounded-xl bg-accent flex items-center justify-center">
                  <Activity className="size-4 md:size-6 text-accent-foreground" />
                </div>
                <Badge variant="outline" className="text-[8px] md:text-[10px] border-accent/30 text-accent bg-accent/5">Optimal</Badge>
              </div>
              <div className="mt-3 md:mt-4">
                <div className="text-lg md:text-2xl font-bold font-headline">99.9%</div>
                <div className="text-[8px] md:text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Avg Uptime</div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-lg md:text-xl font-headline font-bold">Active Servers</h2>
            <Link href="/servers">
               <Button variant="link" size="sm" className="text-xs md:text-sm p-0 h-auto text-primary">View all servers</Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentServers.map((server) => (
              <Link key={server.id} href={`/servers/${server.id}`}>
                <Card className="group border-border/50 bg-card hover:bg-secondary/20 hover:border-primary/30 transition-all duration-300 h-full overflow-hidden">
                  <div className="p-4 md:p-5 pb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="text-base md:text-lg font-headline font-bold truncate pr-2">{server.name}</div>
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-[8px] md:text-[9px] uppercase font-bold tracking-widest h-4 md:h-5 px-1.5",
                          server.status === "online" 
                            ? "border-green-500/50 text-green-500 bg-green-500/5" 
                            : "border-red-500/50 text-red-500 bg-red-500/5"
                        )}
                      >
                        {server.status}
                      </Badge>
                    </div>
                    <p className="text-[9px] md:text-[10px] text-muted-foreground uppercase font-bold tracking-widest truncate">
                      {server.type} • {server.details}
                    </p>
                  </div>
                  <div className="px-4 md:px-5 pb-4 md:pb-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-[10px] md:text-xs text-muted-foreground font-medium">
                        <div className="flex items-center gap-1">
                          <Cpu className="size-3 text-primary" />
                          <span>{server.cpu}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Database className="size-3 text-primary" />
                          <span>{server.ram}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <HardDrive className="size-3 text-primary" />
                          <span>{server.disk}</span>
                        </div>
                      </div>
                      <div className="p-1.5 md:p-2 rounded-lg bg-secondary/50 group-hover:bg-primary group-hover:text-white transition-all transform group-hover:translate-x-1">
                        <ExternalLink className="size-3.5 md:size-4" />
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
            <Link href="/deploy">
              <Card className="h-full min-h-[120px] md:min-h-[140px] border-dashed border-2 border-border/50 bg-transparent flex flex-col items-center justify-center p-4 md:p-6 hover:border-primary/50 hover:bg-primary/5 transition-all group">
                <div className="size-8 md:size-10 rounded-full border border-dashed border-border group-hover:border-primary/50 flex items-center justify-center mb-2 md:mb-3 transition-colors">
                  <Plus className="size-5 md:size-6 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <p className="text-xs md:text-sm font-bold text-muted-foreground group-hover:text-primary transition-colors text-center">Deploy New Server</p>
              </Card>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
