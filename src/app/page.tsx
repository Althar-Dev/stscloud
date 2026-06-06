"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { PerformanceMetrics } from "@/components/performance-metrics";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Server as ServerIcon, 
  Activity, 
  Plus, 
  ChevronRight, 
  ExternalLink,
  Zap,
  Shield,
  Search
} from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const mockServers = [
  { id: "s-1", name: "Official Website", type: "Website", details: "Next.js • Phoenix-01", usage: "1.2k req/m", status: "online" },
  { id: "s-2", name: "Support Bot", type: "Bot", details: "Discord.js • Phoenix-02", usage: "Active", status: "online" },
  { id: "s-3", name: "Portfolio Site", type: "Website", details: "Static • London-01", usage: "450 req/m", status: "offline" },
];

export default function Dashboard() {
  return (
    <>
      <AppSidebar />
      <SidebarInset className="bg-background">
        <header className="flex h-16 shrink-0 items-center justify-between px-4 md:px-6 border-b border-border/50 sticky top-0 bg-background/80 backdrop-blur-md z-40">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <div className="h-4 w-px bg-border" />
            <h1 className="font-headline font-semibold text-lg hidden sm:block">System Dashboard</h1>
            <h1 className="font-headline font-semibold text-lg sm:hidden">Dashboard</h1>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <div className="relative w-40 lg:w-72 hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input 
                placeholder="Search..." 
                className="bg-secondary/40 border-none h-9 pl-9 focus-visible:ring-primary/40"
              />
            </div>
            <Link href="/deploy">
              <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90 text-white px-3 md:px-4">
                <Plus className="size-4" />
                <span className="hidden xs:inline">New Server</span>
              </Button>
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 space-y-6 md:space-y-8 max-w-7xl mx-auto w-full">
          {/* Hero Stats - 2 columns */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            <Card className="bg-primary/10 border-primary/20 overflow-hidden relative group">
              <div className="absolute -right-4 -bottom-4 size-24 bg-primary/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
              <CardContent className="p-3 md:p-6 relative">
                <div className="flex items-center justify-between">
                  <div className="size-8 md:size-10 rounded-lg md:rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                    <Zap className="size-4 md:size-6 text-white" />
                  </div>
                  <Badge variant="outline" className="text-[8px] md:text-[10px] border-primary/30 text-primary bg-primary/5">2 Online</Badge>
                </div>
                <div className="mt-3 md:mt-4">
                  <div className="text-lg md:text-2xl font-bold font-headline">3 Active</div>
                  <div className="text-[8px] md:text-xs text-muted-foreground uppercase tracking-widest font-bold">Total Servers</div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-accent/10 border-accent/20 overflow-hidden relative group">
              <div className="absolute -right-4 -bottom-4 size-24 bg-accent/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
              <CardContent className="p-3 md:p-6 relative">
                <div className="flex items-center justify-between">
                  <div className="size-8 md:size-10 rounded-lg md:rounded-xl bg-accent flex items-center justify-center shadow-lg shadow-accent/20">
                    <Activity className="size-4 md:size-6 text-accent-foreground" />
                  </div>
                  <Badge variant="outline" className="text-[8px] md:text-[10px] border-accent/30 text-accent bg-accent/5">Optimal</Badge>
                </div>
                <div className="mt-3 md:mt-4">
                  <div className="text-lg md:text-2xl font-bold font-headline">99.9%</div>
                  <div className="text-[8px] md:text-xs text-muted-foreground uppercase tracking-widest font-bold">Uptime</div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-green-500/10 border-green-500/20 overflow-hidden relative group">
              <div className="absolute -right-4 -bottom-4 size-24 bg-green-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
              <CardContent className="p-3 md:p-6 relative">
                <div className="flex items-center justify-between">
                  <div className="size-8 md:size-10 rounded-lg md:rounded-xl bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/20">
                    <Shield className="size-4 md:size-6 text-white" />
                  </div>
                  <Badge variant="outline" className="text-[8px] md:text-[10px] border-green-500/30 text-green-500 bg-green-500/5">Protected</Badge>
                </div>
                <div className="mt-3 md:mt-4">
                  <div className="text-lg md:text-2xl font-bold font-headline">128</div>
                  <div className="text-[8px] md:text-xs text-muted-foreground uppercase tracking-widest font-bold">Attacks Blocked</div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border/50">
              <CardContent className="p-3 md:p-6">
                <div className="flex items-center justify-between">
                  <div className="size-8 md:size-10 rounded-lg md:rounded-xl bg-secondary flex items-center justify-center border border-border">
                    <ServerIcon className="size-4 md:size-6 text-muted-foreground" />
                  </div>
                  <Badge variant="secondary" className="text-[8px] md:text-[10px]">Edge</Badge>
                </div>
                <div className="mt-3 md:mt-4">
                  <div className="text-lg md:text-2xl font-bold font-headline">2 Nodes</div>
                  <div className="text-[8px] md:text-xs text-muted-foreground uppercase tracking-widest font-bold">Infra</div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Node Health */}
          <section className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-xl font-headline font-bold">Real-time Node Health</h2>
              <Button variant="link" className="text-primary hover:text-accent gap-1 p-0 text-sm">
                Details <ChevronRight className="size-4" />
              </Button>
            </div>
            <PerformanceMetrics />
          </section>

          {/* Servers Grid - 2 columns */}
          <section className="space-y-4">
            <h2 className="text-xl font-headline font-bold px-2">My Servers</h2>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {mockServers.map((server) => (
                <Link key={server.id} href={`/servers/${server.id}`}>
                  <Card className="group border-border/50 bg-card hover:bg-secondary/20 hover:border-primary/30 transition-all duration-300 h-full overflow-hidden">
                    <div className="p-3 md:p-5 flex flex-row items-center justify-between pb-2 md:pb-3">
                      <div className="space-y-0.5 md:space-y-1">
                        <div className="text-sm md:text-lg font-headline font-bold truncate max-w-[100px] md:max-w-[150px]">{server.name}</div>
                        <p className="text-[8px] md:text-[10px] text-muted-foreground uppercase font-bold tracking-widest truncate">{server.type}</p>
                      </div>
                      <div className={cn(
                        "size-1.5 md:size-2.5 rounded-full",
                        server.status === "online" ? "bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" : "bg-red-500"
                      )} />
                    </div>
                    <div className="px-3 md:px-5 pb-3 md:pb-5">
                      <div className="flex items-center justify-between text-[10px] md:text-sm">
                        <div className="flex items-center gap-1.5 md:gap-2">
                          <Activity className="size-3 md:size-4 text-primary" />
                          <span className="font-medium text-muted-foreground truncate">{server.usage}</span>
                        </div>
                        <div className="p-1.5 rounded-lg bg-secondary/50 group-hover:bg-primary group-hover:text-white transition-all transform group-hover:translate-x-1 hidden xs:block">
                          <ExternalLink className="size-3 md:size-4" />
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
              <Link href="/deploy">
                <Card className="h-full min-h-[100px] md:min-h-[140px] border-dashed border-2 border-border/50 bg-transparent flex flex-col items-center justify-center p-3 md:p-6 hover:border-primary/50 hover:bg-primary/5 transition-all group">
                  <div className="size-6 md:size-10 rounded-full border border-dashed border-border group-hover:border-primary/50 flex items-center justify-center mb-1.5 md:mb-3 transition-colors">
                    <Plus className="size-4 md:size-6 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <p className="text-[10px] md:text-sm font-bold text-muted-foreground group-hover:text-primary transition-colors text-center">New Server</p>
                </Card>
              </Link>
            </div>
          </section>
        </main>
      </SidebarInset>
    </>
  );
}
