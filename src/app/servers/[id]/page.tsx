
"use client";

import * as React from "react";
import { TerminalConsole } from "@/components/terminal-console";
import { PerformanceMetrics } from "@/components/performance-metrics";
import { FileExplorer } from "@/components/file-explorer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Terminal, 
  Settings, 
  FolderOpen, 
  Share2, 
  MoreVertical,
  ArrowLeft,
  Zap,
  Globe,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export default function ServerPage() {
  const { id } = useParams();
  const [status, setStatus] = React.useState<"online" | "offline" | "starting transition-all duration-300">("online");

  const handlePower = (action: "start" | "stop" | "restart") => {
    if (action === "start") {
      setStatus("starting");
      setTimeout(() => setStatus("online"), 2000);
    } else if (action === "stop") {
      setStatus("offline");
    } else {
      setStatus("offline");
      setTimeout(() => setStatus("starting"), 500);
      setTimeout(() => setStatus("online"), 2500);
    }
  };

  return (
    <div className="bg-background min-h-screen">
      <header className="flex h-16 shrink-0 items-center justify-between px-4 md:px-8 border-b border-border/50 sticky top-0 bg-background/80 backdrop-blur-md z-40">
        <div className="flex items-center gap-3 md:gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Zap className="size-5 text-white fill-white" />
            </div>
            <span className="font-headline font-bold text-lg md:text-xl tracking-tight hidden sm:block">
              STS<span className="text-primary">Cloud</span>
            </span>
          </Link>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <Link href="/" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="size-4" />
            </Link>
            <h1 className="font-headline font-semibold text-sm md:text-lg truncate max-w-[100px] xs:max-w-[150px] md:max-w-none">Main Survival</h1>
            <span className="hidden lg:inline-block px-2 py-0.5 rounded bg-secondary text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{id}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2 h-9 border-border/50 hidden sm:flex">
            <Share2 className="size-4" /> <span className="text-xs md:text-sm">Share</span>
          </Button>
          <Button variant="ghost" size="icon" className="size-9">
            <MoreVertical className="size-4" />
          </Button>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8 space-y-6 md:space-y-8 max-w-7xl mx-auto w-full">
        <Tabs defaultValue="console" className="w-full space-y-6">
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
                  <TabsTrigger value="settings" className="rounded-lg gap-2 py-2 px-3 md:px-5 data-[state=active]:bg-primary data-[state=active]:text-white text-xs md:text-sm">
                    <Settings className="size-4" /> <span>Settings</span>
                  </TabsTrigger>
                </TabsList>
                <ScrollBar orientation="horizontal" className="hidden" />
              </ScrollArea>
            </div>

            <div className="flex flex-row items-center justify-between md:justify-end w-full md:w-auto gap-2 md:gap-4 px-1">
              <div className="flex flex-1 md:flex-none items-center gap-2 px-3 py-2 rounded-xl bg-secondary/30 border border-border/50 hover:border-primary/30 transition-all shadow-sm">
                <Globe className="size-3.5 text-primary shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-widest text-muted-foreground leading-none mb-1">Address</span>
                  <span className="text-[10px] md:text-xs font-code text-primary font-medium truncate">play.stscloud.net:25565</span>
                </div>
              </div>
              <div className="flex flex-1 md:flex-none items-center gap-2 px-3 py-2 rounded-xl bg-secondary/30 border border-border/50 hover:border-primary/30 transition-all shadow-sm">
                <Clock className="size-3.5 text-primary shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-widest text-muted-foreground leading-none mb-1">Uptime</span>
                  <span className="text-[10px] md:text-xs font-bold font-headline truncate">2d 14h 32m</span>
                </div>
              </div>
            </div>
          </div>

          <TabsContent value="console" className="space-y-8 animate-in fade-in duration-500">
            <div className="w-full h-[500px] md:h-[600px] lg:h-[650px]">
              <TerminalConsole externalStatus={status} onPowerAction={handlePower} />
            </div>

            <div className="space-y-4">
              <h2 className="text-[10px] md:text-[11px] font-bold uppercase tracking-widest text-muted-foreground px-1">System Infrastructure</h2>
              <PerformanceMetrics />
            </div>
          </TabsContent>

          <TabsContent value="files" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <FileExplorer />
          </TabsContent>

          <TabsContent value="settings" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="max-w-2xl bg-card border border-border/50 rounded-xl p-6 md:p-8">
                <h2 className="text-xl md:text-2xl font-headline font-bold mb-6">General Settings</h2>
                <div className="space-y-6">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Server Name</label>
                    <input className="w-full bg-secondary/50 border-none rounded-lg p-3 outline-none ring-1 ring-border focus:ring-primary/50 text-sm" defaultValue="Main Survival" />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Startup Script</label>
                    <textarea className="w-full h-32 bg-secondary/50 border-none rounded-lg p-3 outline-none ring-1 ring-border focus:ring-primary/50 font-code text-xs md:text-sm" defaultValue="java -Xms4G -Xmx8G -jar spigot.jar nogui" />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button className="bg-primary hover:bg-primary/90 text-white w-full sm:w-auto h-11 text-sm">Save Changes</Button>
                    <Button variant="ghost" className="w-full sm:w-auto h-11 text-sm">Revert to default</Button>
                  </div>
                </div>
             </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
