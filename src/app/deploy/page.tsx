
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  Zap,
  LifeBuoy,
  User,
  Settings,
  LogOut
} from "lucide-react";
import { SiNodedotjs, SiPython, SiPhp } from "react-icons/si";
import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import Link from "next/link";

const templates = [
  { id: "website", name: "Website", group: "Cloud", icon: Globe, color: "text-blue-400" },
  { id: "bots", name: "Bots", group: "Cloud", icon: Bot, color: "text-indigo-400" },
];

const resourcePresets = [
  { id: "p1", ram: "1.5GB", cpu: "100%", disk: "2GB", price: "IDR 10.000" },
  { id: "p2", ram: "3GB", cpu: "170%", disk: "5GB", price: "IDR 17.000" },
  { id: "p3", ram: "5GB", cpu: "250%", disk: "10GB", price: "IDR 27.000" },
  { id: "p4", ram: "7GB", cpu: "340%", disk: "15GB", price: "IDR 30.000" },
  { id: "p5", ram: "10GB", cpu: "Unlimited", disk: "25GB", price: "IDR 35.000" },
  { id: "p6", ram: "Unlimited", cpu: "Unlimited", disk: "Unlimited", price: "IDR 50.000" },
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

const runtimeIcons: Record<string, React.ElementType> = {
  nodejs: SiNodedotjs,
  python: SiPython,
  php: SiPhp,
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
            <div className="w-[40px] h-[40px] rounded-lg overflow-hidden flex items-center justify-center">
              <Image src="/img/icon.png" alt="STSCloud" width={40} height={40} className="object-cover" />
            </div>
            <span className="font-headline font-bold text-xl tracking-tight">
              <span className="text-primary">Cloud</span>
            </span>
          </Link>
          <div className="h-4 w-px bg-border" />
          <h1 className="font-headline font-semibold text-lg hidden sm:block">Deploy</h1>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <Link href="/support">
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hidden sm:flex">
              <LifeBuoy className="size-4" />
              <span>Support</span>
            </Button>
          </Link>
          <div className="h-4 w-px bg-border hidden sm:block" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-9 rounded-full border border-border/50 overflow-hidden">
                <Avatar className="size-full">
                  <AvatarImage src="https://picsum.photos/seed/profile1/40/40" />
                  <AvatarFallback>ST</AvatarFallback>
                </Avatar>
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
              <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive">
                <LogOut className="size-4" /> Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
                    "cursor-pointer transition-all group overflow-hidden relative border-border/50",
                    selectedTemplate === t.id ? "border-primary bg-primary/5 ring-1 ring-primary/50" : "bg-card hover:border-primary/30 hover:bg-secondary/20"
                  )}
                  onClick={() => {
                    setSelectedTemplate(t.id);
                    setSelectedAppType(null);
                  }}
                >
                  <CardContent className="p-6 md:p-8 text-center space-y-4">
                    <div className={cn("size-12 md:size-16 mx-auto rounded-2xl bg-secondary flex items-center justify-center group-hover:scale-110 transition-all duration-300", t.color)}>
                      <t.icon className="size-6 md:size-8" />
                    </div>
                    <div className="space-y-1">
                      <div className="font-headline font-bold text-base md:text-lg">{t.name}</div>
                      <Badge variant="secondary" className="text-[9px] uppercase tracking-widest px-2 font-bold opacity-70">Infrastructure</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex justify-end pt-4">
              <Button 
                disabled={!selectedTemplate} 
                onClick={() => setStep(2)}
                className="bg-primary text-white px-8 h-12 gap-2 w-full md:w-auto font-bold"
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

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {resourcePresets.map((preset) => (
                <Card 
                  key={preset.id}
                  className={cn(
                    "cursor-pointer transition-all border-border/50 group relative overflow-hidden",
                    selectedPreset === preset.id ? "bg-primary/5 border-primary ring-1 ring-primary/50" : "bg-card hover:border-primary/30 hover:bg-secondary/20"
                  )}
                  onClick={() => setSelectedPreset(preset.id)}
                >
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Database className="size-4 text-primary" />
                        <span className="font-bold font-headline text-lg">{preset.ram}</span>
                      </div>
                      {selectedPreset === preset.id && <CheckCircle2 className="size-4 text-primary fill-primary text-white" />}
                    </div>
                    
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Cpu className="size-3.5" />
                        <span className="font-medium">CPU {preset.cpu}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <HardDrive className="size-3.5" />
                        <span className="font-medium">Disk {preset.disk}</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-border/50">
                      <div className="flex items-center gap-2">
                        <Tag className="size-3.5 text-primary" />
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
                className="bg-primary text-white px-8 h-12 gap-2 w-full md:w-auto font-bold"
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
              {availableAppTypes.map((type) => {
                const RuntimeIcon = runtimeIcons[type.id] || Code2;
                return (
                  <Card 
                    key={type.id}
                    className={cn(
                      "relative overflow-hidden group cursor-pointer transition-all duration-300 border-border/50",
                      selectedAppType === type.id 
                        ? "border-primary bg-primary/5 ring-1 ring-primary/50" 
                        : "bg-card hover:bg-secondary/30 hover:border-primary/30"
                    )}
                    onClick={() => setSelectedAppType(type.id)}
                  >
                    {selectedAppType === type.id && (
                      <div className="absolute top-3 right-3">
                        <CheckCircle2 className="size-4 text-primary fill-primary text-white" />
                      </div>
                    )}
                    <CardContent className="p-8 text-center flex flex-col items-center gap-4">
                      <div className={cn(
                        "size-16 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110",
                        selectedAppType === type.id ? "bg-primary/20" : "bg-secondary/50"
                      )}>
                        <RuntimeIcon className={cn(
                          "size-8",
                          selectedAppType === type.id ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                        )} />
                      </div>
                      <div className="space-y-1">
                        <div className="font-headline font-bold text-lg">{type.name}</div>
                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Standard Runtime</div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="flex flex-col-reverse md:flex-row justify-between gap-3 pt-6">
              <Button variant="ghost" onClick={() => setStep(2)} className="gap-2 w-full md:w-auto">
                <ChevronLeft className="size-4" /> Back
              </Button>
              <Button 
                disabled={!selectedAppType}
                onClick={() => setStep(4)}
                className="bg-primary text-white px-8 h-12 gap-2 w-full md:w-auto font-bold"
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
              <CardContent className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-y-5 text-sm">
                  <div className="text-muted-foreground">Environment</div>
                  <div className="font-bold text-right uppercase text-primary">{selectedTemplateData?.name}</div>
                  
                  <div className="text-muted-foreground">Resources</div>
                  <div className="font-bold text-right">{selectedPresetData?.ram} RAM / {selectedPresetData?.cpu} CPU</div>
                  
                  <div className="text-muted-foreground">Runtime</div>
                  <div className="font-bold text-right uppercase">{selectedAppType}</div>
                  
                  <div className="text-muted-foreground">Storage</div>
                  <div className="font-bold text-right">{selectedPresetData?.disk} SSD</div>
                </div>
                
                <div className="pt-6 border-t border-border/50 flex items-center justify-between">
                  <span className="font-bold font-headline text-lg">Total Cost</span>
                  <span className="font-bold font-headline text-3xl text-primary">{selectedPresetData?.price}</span>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col-reverse md:flex-row justify-between gap-3 pt-6">
              <Button variant="ghost" onClick={() => setStep(3)} className="gap-2 w-full md:w-auto">
                <ChevronLeft className="size-4" /> Back
              </Button>
              <Button 
                onClick={() => setStep(5)}
                className="bg-primary text-white px-8 h-12 gap-2 w-full md:w-auto font-bold"
              >
                Continue to Payment <CreditCard className="size-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="max-w-md mx-auto space-y-8 text-center animate-in zoom-in-95 duration-500">
             <div className="size-24 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto ring-1 ring-primary/20">
               <CreditCard className="size-12 text-primary animate-pulse" />
             </div>
             <div className="space-y-2">
              <h2 className="text-2xl md:text-3xl font-headline font-bold">Secure Payment</h2>
              <p className="text-muted-foreground text-sm">Complete your payment of {selectedPresetData?.price}.</p>
            </div>
            
            <div className="p-8 rounded-3xl bg-secondary/20 border border-border/50 space-y-6">
              <div className="space-y-4">
                <div className="text-left space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Virtual Account</label>
                  <div className="h-14 bg-background border border-border rounded-xl flex items-center px-4 font-mono font-bold text-lg text-primary">
                    STS-8821-2931-4822
                  </div>
                </div>
              </div>
              
              <Link href="/" className="block">
                <Button className="w-full bg-primary text-white h-14 gap-2 text-lg font-bold">
                  <Rocket className="size-5" /> Finalize Deployment
                </Button>
              </Link>
            </div>

            <Button variant="ghost" onClick={() => setStep(4)} className="gap-2">
              <ChevronLeft className="size-4" /> Cancel Payment
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
