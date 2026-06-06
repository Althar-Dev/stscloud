"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Rocket, 
  Search, 
  ArrowRight, 
  Cpu, 
  Database, 
  ChevronLeft,
  CheckCircle2,
  Bot,
  HardDrive,
  Globe,
  Tag
} from "lucide-react";
import React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import Link from "next/link";

const templates = [
  { id: "website", name: "Website", group: "Cloud", icon: Globe, color: "text-blue-400" },
  { id: "bots", name: "Bots", group: "Cloud", icon: Bot, color: "text-indigo-400" },
];

const resourcePresets = [
  { id: "p1", ram: "1GB", cpu: "20%", disk: "1GB", price: "IDR 3.000" },
  { id: "p2", ram: "2GB", cpu: "30%", disk: "2GB", price: "IDR 5.000" },
  { id: "p3", ram: "3GB", cpu: "40%", disk: "3GB", price: "IDR 8.000" },
  { id: "p4", ram: "4GB", cpu: "45%", disk: "4GB", price: "IDR 10.000" },
  { id: "p5", ram: "5GB", cpu: "50%", disk: "5GB", price: "IDR 13.000" },
  { id: "p6", ram: "6GB", cpu: "55%", disk: "6GB", price: "IDR 15.000" },
  { id: "p7", ram: "7GB", cpu: "60%", disk: "7GB", price: "IDR 18.000" },
  { id: "p8", ram: "8GB", cpu: "65%", disk: "8GB", price: "IDR 20.000" },
  { id: "p9", ram: "9GB", cpu: "70%", disk: "9GB", price: "IDR 23.000" },
  { id: "p10", ram: "10GB", cpu: "75%", disk: "10GB", price: "IDR 25.000" },
  { id: "p11", ram: "Unlimited", cpu: "85%", disk: "Unlimited", price: "IDR 30.000" },
];

export default function DeployPage() {
  const [step, setStep] = React.useState(1);
  const [selectedTemplate, setSelectedTemplate] = React.useState<string | null>(null);
  const [selectedPreset, setSelectedPreset] = React.useState<string>("p1");

  const selectedTemplateData = templates.find(t => t.id === selectedTemplate);

  return (
    <>
      <AppSidebar />
      <SidebarInset className="bg-background">
        <header className="flex h-16 shrink-0 items-center justify-between px-4 md:px-6 border-b border-border/50 sticky top-0 bg-background/80 backdrop-blur-md z-40">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <div className="h-4 w-px bg-border" />
            <h1 className="font-headline font-semibold text-lg">Server Setup</h1>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 space-y-8 max-w-5xl mx-auto w-full">
          {/* Progress Tracker */}
          <div className="flex items-center justify-between max-w-2xl mx-auto relative mb-8 md:mb-12 px-4">
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
                <h2 className="text-2xl md:text-3xl font-headline font-bold">Select Template</h2>
                <p className="text-muted-foreground text-sm">Choose your application environment.</p>
              </div>

              <div className="relative max-w-md mx-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input placeholder="Search templates..." className="bg-secondary/40 border-none h-11 pl-10" />
              </div>

              <div className="grid grid-cols-2 gap-3 md:gap-4 max-w-2xl mx-auto">
                {templates.map((t) => (
                  <Card 
                    key={t.id} 
                    className={cn(
                      "cursor-pointer hover:border-primary/50 transition-all group overflow-hidden relative",
                      selectedTemplate === t.id ? "border-primary bg-primary/5 ring-1 ring-primary/50" : "bg-card border-border/50"
                    )}
                    onClick={() => setSelectedTemplate(t.id)}
                  >
                    <CardContent className="p-4 md:p-8 text-center space-y-3">
                      <div className={cn("size-10 md:size-16 mx-auto rounded-xl bg-secondary flex items-center justify-center group-hover:scale-110 transition-transform", t.color)}>
                        <t.icon className="size-5 md:size-8" />
                      </div>
                      <div className="space-y-1">
                        <div className="font-headline font-bold text-sm md:text-lg">{t.name}</div>
                        <Badge variant="secondary" className="text-[8px] md:text-[10px] uppercase tracking-widest px-1.5">{t.group}</Badge>
                      </div>
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
                  Configure Package <ArrowRight className="size-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
               <div className="text-center space-y-2">
                <h2 className="text-2xl md:text-3xl font-headline font-bold">Select Resource Package</h2>
                <p className="text-muted-foreground text-sm">Define performance capacity for your {selectedTemplateData?.name}.</p>
              </div>

              <div className="grid grid-cols-2 gap-3 md:gap-4">
                {resourcePresets.map((preset) => (
                  <Card 
                    key={preset.id}
                    className={cn(
                      "cursor-pointer transition-all border-border/50 hover:border-primary/50 overflow-hidden",
                      selectedPreset === preset.id ? "bg-primary/5 border-primary ring-1 ring-primary/50" : "bg-card"
                    )}
                    onClick={() => setSelectedPreset(preset.id)}
                  >
                    <CardContent className="p-3 md:p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Database className="size-4 text-accent" />
                          <span className="font-bold font-headline text-sm md:text-base">{preset.ram}</span>
                        </div>
                        {selectedPreset === preset.id && <CheckCircle2 className="size-4 text-primary fill-primary text-white" />}
                      </div>
                      
                      <div className="grid grid-cols-1 gap-1.5 text-[10px] md:text-xs">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Cpu className="size-3" />
                          <span>CPU {preset.cpu}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <HardDrive className="size-3" />
                          <span>Disk {preset.disk}</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-border/50">
                        <div className="flex items-center gap-2">
                          <Tag className="size-3 text-primary" />
                          <span className="font-bold text-xs md:text-sm text-primary">{preset.price}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex flex-col-reverse md:flex-row justify-between gap-3 pt-6">
                <Button variant="ghost" onClick={() => setStep(1)} className="gap-2 w-full md:w-auto">
                  <ChevronLeft className="size-4" /> Back
                </Button>
                <Button 
                  onClick={() => setStep(3)}
                  className="bg-primary text-white px-8 h-12 gap-2 w-full md:w-auto shadow-lg shadow-primary/20"
                >
                  Deploy Server <ArrowRight className="size-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="max-w-md mx-auto space-y-8 text-center animate-in zoom-in-95 duration-500">
               <div className="size-20 md:size-24 rounded-full bg-primary/20 flex items-center justify-center mx-auto shadow-2xl shadow-primary/30">
                 <Rocket className="size-10 md:size-12 text-primary animate-bounce" />
               </div>
               <div className="space-y-2">
                <h2 className="text-2xl md:text-3xl font-headline font-bold">Starting Deployment...</h2>
                <p className="text-muted-foreground text-sm">Provisioning Docker containers and routing networking.</p>
              </div>
              <div className="p-4 md:p-6 rounded-2xl bg-secondary/30 border border-border/50 space-y-4 text-left">
                <div className="flex items-center gap-3">
                  <div className="size-2 rounded-full bg-green-500" />
                  <span className="text-[10px] md:text-sm font-medium">Network interface created</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="size-2 rounded-full bg-green-500" />
                  <span className="text-[10px] md:text-sm font-medium">Docker image pulled (v1.2.0)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="size-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-[10px] md:text-sm font-medium">Attaching storage...</span>
                </div>
              </div>
              <Link href="/" className="block w-full">
                <Button className="w-full bg-primary text-white h-12 shadow-lg shadow-primary/20">
                  Return to Dashboard
                </Button>
              </Link>
            </div>
          )}
        </main>
      </SidebarInset>
    </>
  );
}
