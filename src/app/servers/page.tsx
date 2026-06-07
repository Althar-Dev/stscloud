
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Plus, 
  ExternalLink,
  Activity,
  Search,
  Filter,
  Server as ServerIcon,
  Headset,
  User,
  Settings,
  LogOut,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useUser, useAuth, useFirestore } from "@/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import * as React from "react";
import { doc, onSnapshot } from "firebase/firestore";

const allServers = [
  { id: "s-1", name: "Main Survival", type: "Game Server", details: "Minecraft • Asia-SE", usage: "45/100 players", status: "online" },
  { id: "s-2", name: "Official Website", type: "Web Hosting", details: "Next.js • US-East", usage: "1.2k req/m", status: "online" },
  { id: "s-3", name: "Support Bot", type: "Bot Hosting", details: "Discord.js • Global", usage: "99% uptime", status: "online" },
  { id: "s-4", name: "Development Lab", type: "Virtual Machine", details: "Ubuntu 22.04 • EU-West", usage: "Idle", status: "offline" },
  { id: "s-5", name: "Database Primary", type: "Database", details: "PostgreSQL • Asia-SE", usage: "23% load", status: "online" },
];

export default function ServersPage() {
  const { user } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const [profile, setProfile] = React.useState<any>(null);
  const [searchQuery, setSearchQuery] = React.useState("");

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

  const filteredServers = allServers.filter(server => 
    server.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    server.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
          <div className="space-y-1">
            <h2 className="text-2xl md:text-3xl font-headline font-bold">All Servers</h2>
            <p className="text-xs md:text-sm text-muted-foreground">Manage and monitor all your deployed infrastructure.</p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input 
                placeholder="Search servers..." 
                className="pl-10 bg-secondary/30 border-none h-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Link href="/deploy">
              <Button className="bg-primary hover:bg-primary/90 text-white h-10 px-4 gap-2 font-bold">
                <Plus className="size-4" />
                <span className="hidden xs:inline">Deploy New</span>
              </Button>
            </Link>
          </div>
        </div>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServers.length > 0 ? (
            filteredServers.map((server) => (
              <Link key={server.id} href={`/servers/${server.id}`}>
                <Card className="group border-border/50 bg-card hover:bg-secondary/20 hover:border-primary/30 transition-all duration-300 h-full overflow-hidden">
                  <div className="p-5 pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="size-10 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                          <ServerIcon className="size-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-headline font-bold text-base truncate">{server.name}</h3>
                          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest truncate">{server.type}</p>
                        </div>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-[9px] uppercase font-bold tracking-widest h-5 px-2",
                          server.status === "online" 
                            ? "border-green-500/50 text-green-500 bg-green-500/5" 
                            : "border-red-500/50 text-red-500 bg-red-500/5"
                        )}
                      >
                        {server.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="px-5 py-3 border-y border-border/30 bg-secondary/10">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{server.details}</span>
                      <span className="font-bold text-foreground">{server.usage}</span>
                    </div>
                  </div>
                  <div className="p-5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className="size-3.5 text-primary" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Network: Stable</span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-secondary/50 group-hover:bg-primary group-hover:text-white transition-all transform group-hover:translate-x-1">
                      <ChevronRight className="size-4" />
                    </div>
                  </div>
                </Card>
              </Link>
            ))
          ) : (
            <div className="col-span-full py-20 text-center space-y-4">
              <div className="size-16 rounded-full bg-secondary flex items-center justify-center mx-auto">
                <Search className="size-8 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <h3 className="font-headline font-bold text-xl">No servers found</h3>
                <p className="text-sm text-muted-foreground">Try adjusting your search or deploy a new node.</p>
              </div>
              <Link href="/deploy">
                <Button variant="outline" className="mt-4">Deploy First Server</Button>
              </Link>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
