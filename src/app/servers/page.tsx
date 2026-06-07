"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  ExternalLink,
  Activity,
  Search
} from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const mockServers = [
  { id: "s-1", name: "Official Website", type: "Website", details: "Next.js • Phoenix-01", usage: "1.2k req/m", status: "online" },
  { id: "s-2", name: "Support Bot", type: "Bot", details: "Discord.js • Phoenix-02", usage: "Active", status: "online" },
  { id: "s-3", name: "Portfolio Site", type: "Website", details: "Static • London-01", usage: "450 req/m", status: "offline" },
  { id: "s-4", name: "Telegram News", type: "Bot", details: "Python • Phoenix-01", usage: "12k users", status: "online" },
];

export default function AllServersPage() {
  return (
    <>
      <AppSidebar />
      <SidebarInset className="bg-background">
        <header className="flex h-16 shrink-0 items-center justify-between px-4 md:px-6 border-b border-border/50 sticky top-0 bg-background/80 backdrop-blur-md z-40">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <div className="h-4 w-px bg-border" />
            <h1 className="font-headline font-semibold text-lg">All Servers</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/deploy">
              <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90 text-white">
                <Plus className="size-4" />
                <span className="hidden xs:inline">Deploy New</span>
              </Button>
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 space-y-6 max-w-7xl mx-auto w-full">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input 
              placeholder="Search all servers by name, type, or node..." 
              className="bg-secondary/40 border-none h-12 pl-10 focus-visible:ring-primary/40"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 md:gap-4">
            {mockServers.map((server) => (
              <Link key={server.id} href={`/servers/${server.id}`}>
                <Card className="group border-border/50 bg-card hover:bg-secondary/20 hover:border-primary/30 transition-all duration-300 h-full overflow-hidden">
                  <div className="p-3 md:p-5 flex flex-row items-center justify-between pb-2 md:pb-3">
                    <div className="space-y-0.5 md:space-y-1">
                      <div className="text-sm md:text-lg font-headline font-bold truncate max-w-[100px] md:max-w-[150px]">{server.name}</div>
                      <p className="text-[8px] md:text-[10px] text-muted-foreground uppercase font-bold tracking-widest truncate">{server.type} • {server.details}</p>
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
                      <div className="p-1.5 rounded-lg bg-secondary/50 group-hover:bg-primary group-hover:text-white transition-all transform group-hover:translate-x-1">
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
        </main>
      </SidebarInset>
    </>
  );
}
