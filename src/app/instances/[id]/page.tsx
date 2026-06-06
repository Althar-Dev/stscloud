"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { TerminalConsole } from "@/components/terminal-console";
import { PerformanceMetrics } from "@/components/performance-metrics";
import { FileExplorer } from "@/components/file-explorer";
import { AIConfigTool } from "@/components/ai-config-tool";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Terminal, 
  Settings, 
  FolderOpen, 
  Cpu, 
  BrainCircuit, 
  Share2, 
  MoreVertical,
  ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export default function ServerPage() {
  const { id } = useParams();

  return (
    <>
      <AppSidebar />
      <SidebarInset className="bg-background">
        <header className="flex h-16 shrink-0 items-center justify-between px-4 md:px-6 border-b border-border/50 sticky top-0 bg-background/80 backdrop-blur-md z-40">
          <div className="flex items-center gap-3 md:gap-4">
            <SidebarTrigger />
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-2">
              <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="size-4" />
              </Link>
              <h1 className="font-headline font-semibold text-base md:text-lg truncate max-w-[120px] md:max-w-none">Main Survival</h1>
              <span className="hidden xs:inline-block px-2 py-0.5 rounded bg-secondary text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{id}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <Button variant="outline" size="sm" className="gap-2 h-9 border-border/50 hidden sm:flex">
              <Share2 className="size-4" /> Share
            </Button>
            <Button variant="ghost" size="icon" className="size-9">
              <MoreVertical className="size-4" />
            </Button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 space-y-6 max-w-7xl mx-auto w-full">
          <Tabs defaultValue="console" className="w-full space-y-6">
            <div className="flex items-center justify-start">
              <ScrollArea className="w-full" orientation="horizontal">
                <TabsList className="bg-secondary/30 p-1 rounded-xl w-fit h-auto inline-flex whitespace-nowrap">
                  <TabsTrigger value="console" className="rounded-lg gap-2 py-2 px-4 data-[state=active]:bg-primary data-[state=active]:text-white">
                    <Terminal className="size-4" /> <span>Console</span>
                  </TabsTrigger>
                  <TabsTrigger value="files" className="rounded-lg gap-2 py-2 px-4 data-[state=active]:bg-primary data-[state=active]:text-white">
                    <FolderOpen className="size-4" /> <span>Files</span>
                  </TabsTrigger>
                  <TabsTrigger value="intelligence" className="rounded-lg gap-2 py-2 px-4 data-[state=active]:bg-primary data-[state=active]:text-white">
                    <BrainCircuit className="size-4" /> <span>AI Config</span>
                  </TabsTrigger>
                  <TabsTrigger value="stats" className="rounded-lg gap-2 py-2 px-4 data-[state=active]:bg-primary data-[state=active]:text-white">
                    <Cpu className="size-4" /> <span>Performance</span>
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="rounded-lg gap-2 py-2 px-4 data-[state=active]:bg-primary data-[state=active]:text-white">
                    <Settings className="size-4" /> <span>Settings</span>
                  </TabsTrigger>
                </TabsList>
                <ScrollBar orientation="horizontal" className="hidden" />
              </ScrollArea>
            </div>

            <TabsContent value="console" className="space-y-6 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 h-[500px] md:h-[600px]">
                  <TerminalConsole />
                </div>
                <div className="space-y-6">
                  <div className="p-4 rounded-xl border border-border/50 bg-card">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Quick Stats</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <span className="text-sm text-muted-foreground">Players</span>
                        <span className="text-xl font-bold font-headline">12 / 20</span>
                      </div>
                      <div className="flex justify-between items-end">
                        <span className="text-sm text-muted-foreground">Uptime</span>
                        <span className="text-xl font-bold font-headline">2d 14h</span>
                      </div>
                      <div className="flex justify-between items-end">
                        <span className="text-sm text-muted-foreground">Address</span>
                        <span className="text-xs font-code text-primary break-all ml-4 text-right">play.stscloud.net:25565</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl border border-border/50 bg-card">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Node: Phoenix-01</h3>
                    <div className="space-y-2">
                      <div className="h-1 w-full bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: '45%' }} />
                      </div>
                      <p className="text-[10px] text-muted-foreground text-center">Node load: 45% (Nominal)</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="files" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <FileExplorer />
            </TabsContent>

            <TabsContent value="intelligence" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <AIConfigTool />
            </TabsContent>

            <TabsContent value="stats" className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
              <div className="flex flex-col gap-8">
                <PerformanceMetrics />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 rounded-xl border border-border/50 bg-card h-64 md:h-80 flex flex-col items-center justify-center">
                    <p className="text-muted-foreground text-sm italic">Historical analysis graph placeholder...</p>
                  </div>
                  <div className="p-6 rounded-xl border border-border/50 bg-card h-64 md:h-80 flex flex-col items-center justify-center">
                    <p className="text-muted-foreground text-sm italic">Network I/O graph placeholder...</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="max-w-2xl bg-card border border-border/50 rounded-xl p-6 md:p-8">
                  <h2 className="text-2xl font-headline font-bold mb-6">General Settings</h2>
                  <div className="space-y-6">
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Server Name</label>
                      <input className="w-full bg-secondary/50 border-none rounded-lg p-3 outline-none ring-1 ring-border focus:ring-primary/50" defaultValue="Main Survival" />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Startup Script</label>
                      <textarea className="w-full h-32 bg-secondary/50 border-none rounded-lg p-3 outline-none ring-1 ring-border focus:ring-primary/50 font-code text-sm" defaultValue="java -Xms4G -Xmx8G -jar spigot.jar nogui" />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                      <Button className="bg-primary hover:bg-primary/90 text-white w-full sm:w-auto">Save Changes</Button>
                      <Button variant="ghost" className="w-full sm:w-auto">Revert to default</Button>
                    </div>
                  </div>
               </div>
            </TabsContent>
          </Tabs>
        </main>
      </SidebarInset>
    </>
  );
}