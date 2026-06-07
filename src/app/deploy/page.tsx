"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Rocket, 
  ArrowRight, 
  Cpu, 
  Database, 
  ChevronLeft,
  CheckCircle2,
  Bot,
  HardDrive,
  Globe,
  Tag,
  Code2,
  CreditCard,
  ShoppingCart,
  Zap
} from "lucide-react";
import React from "react";
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

const applicationTypes: Record<string, { id: string; name: string }[]> = {
  bots: [
    { id: "nodejs", name: "Node.js" },
    { id: "python", name: "Python" },
  ],
  website: [
    { id: "nodejs", name: "Node.js" },
    { id: "python", name: "Python" },
    { id: "php", name: "PHP" },
  ],
};

export default function DeployPage() {
  const [step, setStep] = React.useState(1);
  const [selectedTemplate, setSelectedTemplate] = React.useState<string | null>(null);
  const [selectedPreset, setSelectedPreset] = React.useState<string | null>("p1");
  const [selectedAppType, setSelectedAppType] = React.useState<string | null>(null);

  const selectedTemplateData = templates.find(t => t.id === selectedTemplate);
  const selectedPresetData = resourcePresets.find(p => p.id === selectedPreset);
  const availableAppTypes = selectedTemplate ? applicationTypes[selectedTemplate] : [];

  return (
    <div className="bg-background min-h-screen">
      <header className="flex h-16 shrink-0 items-center justify-between px-4 md:px-8 border-b border-border/50 sticky top-0 bg-background/80 backdrop-blur-md z-40">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Zap className="size-5 text-white fill-white" />
            </div>
            <span className="font-headline font-bold text-xl tracking-tight">
              STS<span className="text-primary">Cloud</span>
            </span>
          </Link>
          <div className="h-4 w-px bg-border" />
          <h1 className="font-headline font-semibold text-lg">Deploy New Project</h1>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8 space-y-8 max-w-5xl mx-auto w-full">
        {/* Progress Tracker */}
        <div className="max-w-3xl mx-auto relative mb-12 px-8">
          <div className="absolute top-1/2 left-[52px] right-[52px] h-[2px] bg-secondary -translate-y-1/2 overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-500 ease-in-out" 
              style={{ width: `${(step - 1) * 25}%` }}
            />
          </div>

          <div className="flex items-center justify-between relative z-10">
            {[1, 2, 3, 4, 5].map((s) => (
              <div 
                key={s} 
                className={cn(
                  "size-8 md:size-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 bg-background",
                  step >= s ? "border-primary text-primary" : "border-border text-muted-foreground",
                  step === s && "ring-4 ring-primary/20 scale-110"
                )}
              >
                {step > s ? (
                  <CheckCircle2 className="size-5 md:size-6 fill-primary text-white" />
                ) : (
                  <span className="font-bold text-xs md:text-sm">{s}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="text-center space-y-2">
              <h2 className="text-2xl md:text-3xl font-headline font-bold">Select Template</h2>
              <p className="text-muted-foreground text-sm">Choose the environment for your project.</p>
            </div>

            <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
              {templates.map((t) => (
                <Card 
                  key={t.id} 
                  className={cn(
                    "cursor-pointer hover:border-primary/50 transition-all group overflow-hidden relative",
                    selectedTemplate === t.id ? "border-primary bg-primary/5 ring-1 ring-primary/50" : "bg-card border-border/50"
                  )}
                  onClick={() => {
                    setSelectedTemplate(t.id);
                    setSelectedAppType(null);
                  }}
                >
                  <CardContent className="p-6 md:p-8 text-center space-y-3">
                    <div className={cn("size-12 md:size-16 mx-auto rounded-xl bg-secondary flex items-center justify-center group-hover:scale-110 transition-transform", t.color)}>
                      <t.icon className="size-6 md:size-8" />
                    </div>
                    <div className="space-y-1">
                      <div className="font-headline font-bold text-base md:text-lg">{t.name}</div>
                      <Badge variant="secondary" className="text-[10px] uppercase tracking-widest px-2">{t.group}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex justify-end pt-4">
              <Button 
                disabled={!selectedTemplate} 
                onClick={() => setStep(2)}
                className="bg-primary text-white px-8 h-12 gap-2 w-full md:w-auto shadow-lg shadow-primary/20"
              >
                Configure Resources <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
             <div className="text-center space-y-2">
              <h2 className="text-2xl md:text-3xl font-headline font-bold">Select Resources</h2>
              <p className="text-muted-foreground text-sm">Define performance for your {selectedTemplateData?.name}.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {resourcePresets.map((preset) => (
                <Card 
                  key={preset.id}
                  className={cn(
                    "cursor-pointer transition-all border-border/50 hover:border-primary/50 overflow-hidden",
                    selectedPreset === preset.id ? "bg-primary/5 border-primary ring-1 ring-primary/50" : "bg-card"
                  )}
                  onClick={() => setSelectedPreset(preset.id)}
                >
                  <CardContent className="p-4 md:p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Database className="size-4 text-accent" />
                        <span className="font-bold font-headline text-base">{preset.ram}</span>
                      </div>
                      {selectedPreset === preset.id && <CheckCircle2 className="size-4 text-primary fill-primary text-white" />}
                    </div>
                    
                    <div className="grid grid-cols-1 gap-1.5 text-xs">
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
                        <span className="font-bold text-sm text-primary">{preset.price}</span>
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
                Select Runtime <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
             <div className="text-center space-y-2">
              <h2 className="text-2xl md:text-3xl font-headline font-bold">Application Runtime</h2>
              <p className="text-muted-foreground text-sm">Choose the environment for your {selectedTemplateData?.name}.</p>
            </div>

            <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
              {availableAppTypes.map((type) => (
                <Card 
                  key={type.id}
                  className={cn(
                    "cursor-pointer transition-all border-border/50 hover:border-primary/50 overflow-hidden",
                    selectedAppType === type.id ? "bg-primary/5 border-primary ring-1 ring-primary/50" : "bg-card"
                  )}
                  onClick={() => setSelectedAppType(type.id)}
                >
                  <CardContent className="p-8 text-center space-y-3">
                    <div className="size-12 mx-auto rounded-xl bg-secondary flex items-center justify-center">
                      <Code2 className="size-6 text-primary" />
                    </div>
                    <div className="font-headline font-bold text-lg">{type.name}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex flex-col-reverse md:flex-row justify-between gap-3 pt-6">
              <Button variant="ghost" onClick={() => setStep(2)} className="gap-2 w-full md:w-auto">
                <ChevronLeft className="size-4" /> Back
              </Button>
              <Button 
                disabled={!selectedAppType}
                onClick={() => setStep(4)}
                className="bg-primary text-white px-8 h-12 gap-2 w-full md:w-auto shadow-lg shadow-primary/20"
              >
                Checkout <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
             <div className="text-center space-y-2">
              <h2 className="text-2xl md:text-3xl font-headline font-bold">Review Order</h2>
              <p className="text-muted-foreground text-sm">Review your configuration before deployment.</p>
            </div>

            <Card className="max-w-xl mx-auto border-border/50 bg-card overflow-hidden">
              <div className="p-6 bg-secondary/30 border-b border-border/50 flex items-center gap-3">
                <ShoppingCart className="size-5 text-primary" />
                <span className="font-bold font-headline">Summary</span>
              </div>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-y-4 text-sm">
                  <div className="text-muted-foreground">Environment</div>
                  <div className="font-bold text-right uppercase">{selectedTemplateData?.name}</div>
                  
                  <div className="text-muted-foreground">Resources</div>
                  <div className="font-bold text-right">{selectedPresetData?.ram} RAM / {selectedPresetData?.cpu} CPU</div>
                  
                  <div className="text-muted-foreground">Runtime</div>
                  <div className="font-bold text-right uppercase">{selectedAppType}</div>
                  
                  <div className="text-muted-foreground">Storage</div>
                  <div className="font-bold text-right">{selectedPresetData?.disk} SSD</div>
                </div>
                
                <div className="pt-6 border-t border-border/50 flex items-center justify-between">
                  <span className="font-bold font-headline text-lg">Total Cost</span>
                  <span className="font-bold font-headline text-2xl text-primary">{selectedPresetData?.price}</span>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col-reverse md:flex-row justify-between gap-3 pt-6">
              <Button variant="ghost" onClick={() => setStep(3)} className="gap-2 w-full md:w-auto">
                <ChevronLeft className="size-4" /> Back
              </Button>
              <Button 
                onClick={() => setStep(5)}
                className="bg-primary text-white px-8 h-12 gap-2 w-full md:w-auto shadow-lg shadow-primary/20"
              >
                Continue to Payment <CreditCard className="size-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="max-w-md mx-auto space-y-8 text-center animate-in zoom-in-95 duration-500">
             <div className="size-24 rounded-full bg-primary/20 flex items-center justify-center mx-auto shadow-2xl shadow-primary/30">
               <CreditCard className="size-12 text-primary animate-pulse" />
             </div>
             <div className="space-y-2">
              <h2 className="text-2xl md:text-3xl font-headline font-bold">Secure Payment</h2>
              <p className="text-muted-foreground text-sm">Complete your payment of {selectedPresetData?.price}.</p>
            </div>
            
            <div className="p-8 rounded-2xl bg-secondary/30 border border-border/50 space-y-6">
              <div className="space-y-4">
                <div className="text-left space-y-1.5">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Virtual Account</label>
                  <div className="h-12 bg-background border border-border rounded-lg flex items-center px-4 font-mono font-bold">
                    STS-8821-2931-4822
                  </div>
                </div>
              </div>
              
              <Link href="/" className="block">
                <Button className="w-full bg-primary text-white h-12 shadow-lg shadow-primary/20 gap-2">
                  <Rocket className="size-4" /> Finalize Deployment
                </Button>
              </Link>
            </div>

            <Button variant="ghost" onClick={() => setStep(4)} className="gap-2">
              <ChevronLeft className="size-4" /> Cancel
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
