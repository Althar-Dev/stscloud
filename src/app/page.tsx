
import { AppSidebar } from "@/components/app-sidebar";
import { PerformanceMetrics } from "@/components/performance-metrics";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Server, 
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

const mockInstances = [
  { id: "s-1", name: "Main Survival", game: "Minecraft", players: "12/20", status: "online", node: "Phoenix-01" },
  { id: "s-2", name: "CS2 Competitive", game: "CS2", players: "4/10", status: "online", node: "Phoenix-02" },
  { id: "s-3", name: "Valheim World", game: "Valheim", players: "0/10", status: "offline", node: "Europe-North" },
];

export default function Dashboard() {
  return (
    <>
      <AppSidebar />
      <SidebarInset className="bg-background">
        <header className="flex h-16 shrink-0 items-center justify-between px-6 border-b border-border/50 sticky top-0 bg-background/80 backdrop-blur-md z-40">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <div className="h-4 w-px bg-border" />
            <h1 className="font-headline font-semibold text-lg">System Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative w-72 hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input 
                placeholder="Quick jump to instance..." 
                className="bg-secondary/40 border-none h-9 pl-9 focus-visible:ring-primary/40"
              />
            </div>
            <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90 text-white">
              <Plus className="size-4" />
              New Server
            </Button>
          </div>
        </header>

        <main className="flex-1 p-6 space-y-8 max-w-7xl mx-auto w-full">
          {/* Hero Section */}
          <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-primary/10 border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="size-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                    <Zap className="size-6 text-white" />
                  </div>
                  <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5">3 Running</Badge>
                </div>
                <div className="mt-4">
                  <div className="text-2xl font-bold font-headline">5 Active</div>
                  <div className="text-xs text-muted-foreground">Total Server Instances</div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-accent/10 border-accent/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="size-10 rounded-xl bg-accent flex items-center justify-center shadow-lg shadow-accent/20">
                    <Activity className="size-6 text-accent-foreground" />
                  </div>
                  <Badge variant="outline" className="border-accent/30 text-accent bg-accent/5">Optimal</Badge>
                </div>
                <div className="mt-4">
                  <div className="text-2xl font-bold font-headline">99.9%</div>
                  <div className="text-xs text-muted-foreground">Uptime Average</div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-green-500/10 border-green-500/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="size-10 rounded-xl bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/20">
                    <Shield className="size-6 text-white" />
                  </div>
                  <Badge variant="outline" className="border-green-500/30 text-green-500 bg-green-500/5">Protected</Badge>
                </div>
                <div className="mt-4">
                  <div className="text-2xl font-bold font-headline">24 DDoS</div>
                  <div className="text-xs text-muted-foreground">Mitigated today</div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="size-10 rounded-xl bg-secondary flex items-center justify-center border border-border">
                    <Server className="size-6 text-muted-foreground" />
                  </div>
                  <Badge variant="secondary">Global</Badge>
                </div>
                <div className="mt-4">
                  <div className="text-2xl font-bold font-headline">2 Nodes</div>
                  <div className="text-xs text-muted-foreground">Infrastructure Clusters</div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Performance Overview */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-headline font-bold">Real-time Node Health</h2>
              <Button variant="link" className="text-primary hover:text-accent gap-1 p-0">
                View detailed metrics <ChevronRight className="size-4" />
              </Button>
            </div>
            <PerformanceMetrics />
          </section>

          {/* Recent Instances */}
          <section className="space-y-4">
            <h2 className="text-xl font-headline font-bold">Recent Instances</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockInstances.map((instance) => (
                <Link key={instance.id} href={`/instances/${instance.id}`}>
                  <Card className="group border-border/50 bg-card hover:bg-secondary/20 hover:border-primary/30 transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                      <div className="space-y-1">
                        <CardTitle className="text-lg font-headline">{instance.name}</CardTitle>
                        <p className="text-xs text-muted-foreground">{instance.game} • {instance.node}</p>
                      </div>
                      <div className={cn(
                        "size-3 rounded-full",
                        instance.status === "online" ? "bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" : "bg-red-500"
                      )} />
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Activity className="size-4 text-primary" />
                          <span className="font-medium">{instance.players}</span>
                        </div>
                        <div className="p-2 rounded-lg bg-secondary/50 group-hover:bg-primary group-hover:text-white transition-colors">
                          <ExternalLink className="size-4" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
              <Link href="/deploy">
                <Card className="h-full border-dashed border-2 border-border/50 bg-transparent flex flex-col items-center justify-center p-8 hover:border-primary/50 hover:bg-primary/5 transition-all group">
                  <Plus className="size-8 text-muted-foreground group-hover:text-primary mb-2 transition-colors" />
                  <p className="text-sm font-semibold text-muted-foreground group-hover:text-primary">Deploy New Instance</p>
                </Card>
              </Link>
            </div>
          </section>
        </main>
      </SidebarInset>
    </>
  );
}

function cn(...inputs: any) {
  return inputs.filter(Boolean).join(" ");
}
