"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Rocket, 
  Search, 
  ArrowRight, 
  Cpu, 
  Database, 
  Globe, 
  ChevronLeft,
  CheckCircle2
} from "lucide-react";
import React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import Link from "next/link";

const templates = [
  { id: "web-next", name: "Next.js App", group: "Website", icon: "🌐", color: "text-blue-400" },
  { id: "web-static", name: "Static Site", group: "Website", icon: "📄", color: "text-green-400" },
  { id: "bot-discord", name: "Discord Bot", group: "Bots", icon: "🤖", color: "text-indigo-400" },
  { id: "bot-telegram", name: "Telegram Bot", group: "Bots", icon: "✈️", color: "text-sky-400" },
];

export default function DeployPage() {
  const [step, setStep] = React.useState(1);
  const [selectedTemplate, setSelectedTemplate] = React.useState<string | null>(null);

  const selectedTemplateData = templates.find(t => t.id === selectedTemplate);

  return (
    <>
      <AppSidebar />
      <SidebarInset className="bg-background">
        <header className="flex h-16 shrink-0 items-center justify-between px-6 border-b border-border/50 sticky top-0 bg-background/80 backdrop-blur-md z-40">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <div className="h-4 w-px bg-border" />
            <h1 className="font-headline font-semibold text-lg">Server Setup</h1>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 space-y-8 max-w-5xl mx-auto w-full">
          {/* Progress Tracker */}
          <div className="flex items-center justify-between max-w-2xl mx-auto relative mb-12 px-4">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-secondary -translate-y-1/2 -z-10" />
            {[1, 2, 3].map((s) => (
              <div 
                key={s} 
                className={cn(
                  "size-8 md:size-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 bg-background",
                  step >= s ? "border-primary text-primary" : "border-border text-muted-foreground",
                  step === s && "ring-4 ring-primary/20 scale-110"
                )}
              >
                {step > s ? <CheckCircle2 className="size-5 md:size-6 fill-primary text-white" /> : <span className="font-bold text-xs md:text-sm">{s}</span>}
              </div>
            ))}
          </div>

          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="text-center space-y-2">
                <h2 className="text-2xl md:text-3xl font-headline font-bold">Choose a Template</h2>
                <p className="text-muted-foreground text-sm md:text-base">Select your application environment.</p>
              </div>

              <div className="relative max-w-md mx-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input placeholder="Search templates..." className="bg-secondary/40 border-none h-11 pl-10" />
              </div>

              <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-2 gap-3 md:gap-4 max-w-3xl mx-auto">
                {templates.map((t) => (
                  <Card 
                    key={t.id} 
                    className={cn(
                      "cursor-pointer hover:border-primary/50 transition-all group",
                      selectedTemplate === t.id ? "border-primary bg-primary/5 ring-1 ring-primary/50" : "bg-card border-border/50"
                    )}
                    onClick={() => setSelectedTemplate(t.id)}
                  >
                    <CardContent className="p-4 md:p-6 text-center space-y-2 md:space-y-3">
                      <div className="text-3xl md:text-4xl group-hover:scale-110 transition-transform">{t.icon}</div>
                      <div className="font-headline font-bold text-sm md:text-base">{t.name}</div>
                      <Badge variant="secondary" className="text-[10px] uppercase">{t.group}</Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex justify-end pt-4">
                <Button 
                  disabled={!selectedTemplate} 
                  onClick={() => setStep(2)}
                  className="bg-primary text-white px-6 md:px-8 h-12 gap-2 w-full md:w-auto shadow-lg shadow-primary/20"
                >
                  Configure Resources <ArrowRight className="size-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
               <div className="text-center space-y-2">
                <h2 className="text-2xl md:text-3xl font-headline font-bold">Resource Allocation</h2>
                <p className="text-muted-foreground text-sm md:text-base">Define the limits for your new {selectedTemplateData?.name} server.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <Card className="bg-card border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Cpu className="size-4 text-primary" /> CPU Power
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between font-bold font-headline text-sm md:text-base">
                      <span>Limits</span>
                      <span className="text-primary">100% (1 vCore)</span>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: '25%' }} />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Database className="size-4 text-accent" /> Memory Allocation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between font-bold font-headline text-sm md:text-base">
                      <span>Max RAM</span>
                      <span className="text-accent">1024 MB</span>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-accent" style={{ width: '20%' }} />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border/50 md:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Globe className="size-4 text-green-400" /> Regional Node
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl border border-primary bg-primary/5 text-center cursor-pointer">
                      <div className="text-sm font-bold">Phoenix-01</div>
                      <div className="text-[10px] text-muted-foreground">US-WEST (15ms)</div>
                    </div>
                    <div className="p-4 rounded-xl border border-border bg-transparent text-center cursor-pointer opacity-50 hover:opacity-100 transition-opacity">
                      <div className="text-sm font-bold">London-01</div>
                      <div className="text-[10px] text-muted-foreground">EU-WEST (140ms)</div>
                    </div>
                    <div className="p-4 rounded-xl border border-border bg-transparent text-center cursor-pointer opacity-50 hover:opacity-100 transition-opacity">
                      <div className="text-sm font-bold">Singapore-01</div>
                      <div className="text-[10px] text-muted-foreground">ASIA-SE (210ms)</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex flex-col-reverse md:flex-row justify-between gap-3 pt-4">
                <Button variant="ghost" onClick={() => setStep(1)} className="gap-2 w-full md:w-auto">
                  <ChevronLeft className="size-4" /> Back
                </Button>
                <Button 
                  onClick={() => setStep(3)}
                  className="bg-primary text-white px-8 h-12 gap-2 w-full md:w-auto shadow-lg shadow-primary/20"
                >
                  Finalize Deployment <ArrowRight className="size-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="max-w-md mx-auto space-y-8 text-center animate-in zoom-in-95 duration-500">
               <div className="size-24 rounded-full bg-primary/20 flex items-center justify-center mx-auto shadow-2xl shadow-primary/30">
                 <Rocket className="size-12 text-primary animate-bounce" />
               </div>
               <div className="space-y-2">
                <h2 className="text-2xl md:text-3xl font-headline font-bold">Deploying Server...</h2>
                <p className="text-muted-foreground text-sm">We are provisioning your Docker container and setting up the network routes.</p>
              </div>
              <div className="p-6 rounded-2xl bg-secondary/30 border border-border/50 space-y-4 text-left">
                <div className="flex items-center gap-3">
                  <div className="size-2 rounded-full bg-green-500" />
                  <span className="text-xs md:text-sm font-medium">Network interface created</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="size-2 rounded-full bg-green-500" />
                  <span className="text-xs md:text-sm font-medium">Docker image pulled (v1.2.0)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="size-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-xs md:text-sm font-medium">Mounting persistent storage...</span>
                </div>
              </div>
              <Link href="/" className="block w-full">
                <Button className="w-full bg-primary text-white h-12 shadow-lg shadow-primary/20">
                  Go to Dashboard
                </Button>
              </Link>
            </div>
          )}
        </main>
      </SidebarInset>
    </>
  );
}
