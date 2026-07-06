
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
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
  ArrowLeft,
  CheckCircle2,
  Bot,
  HardDrive,
  Globe,
  Tag,
  Code2,
  CreditCard,
  ShoppingCart,
  Headset,
  User,
  Settings,
  LogOut,
  Loader2,
  RefreshCw,
  Layout
} from "lucide-react";
import { Icon } from "@iconify/react";
import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useUser, useAuth, useFirestore } from "@/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { doc, onSnapshot, setDoc, serverTimestamp } from "firebase/firestore";
import { createSvalePayment, checkPaymentStatus } from "@/app/actions/payment-actions";
import { provisionServerFiles } from "@/app/actions/server-provisioning";
import { useToast } from "@/hooks/use-toast";

const defaultTemplates = [
  { id: "website", name: "Website", group: "Cloud", icon: "Globe", color: "text-blue-400" },
  { id: "bots", name: "Bots", group: "Cloud", icon: "Bot", color: "text-indigo-400" },
];

const defaultResourcePresets = [
  { id: "p1", name: "Zero", ram: "1.5GB", cpu: "100%", disk: "2GB", price: "IDR 10.000", priceValue: 10000 },
  { id: "p2", name: "Core", ram: "3GB", cpu: "170%", disk: "5GB", price: "IDR 17.000", priceValue: 17000 },
  { id: "p3", name: "Plus", ram: "5GB", cpu: "250%", disk: "10GB", price: "IDR 27.000", priceValue: 27000 },
  { id: "p4", name: "Pro", ram: "7GB", cpu: "340%", disk: "15GB", price: "IDR 30.000", priceValue: 30000 },
  { id: "p5", name: "Elite", ram: "10GB", cpu: "Unlimited", disk: "25GB", price: "IDR 35.000", priceValue: 35000 },
  { id: "p6", name: "Infinity", ram: "Unlimited", cpu: "Unlimited", disk: "Unlimited", price: "IDR 50.000", priceValue: 50000 },
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

const runtimeIconNames: Record<string, string> = {
  nodejs: "logos:nodejs-icon",
  python: "logos:python",
  php: "logos:php",
};

// Icon component mapping for Lucide
const LucideIconMap: Record<string, any> = {
  Globe,
  Bot,
  Cpu,
  Database,
  Layout,
  Rocket,
  Code2
};

export default function DeployPage() {
  const router = useRouter();
  const { user } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const { toast } = useToast();
  const [profile, setProfile] = React.useState<any>(null);
  const [resourcePresets, setResourcePresets] = React.useState<any[]>(defaultResourcePresets);
  const [templates, setTemplates] = React.useState<any[]>(defaultTemplates);
  
  const [step, setStep] = React.useState(1);
  const [selectedTemplate, setSelectedTemplate] = React.useState<string | null>(null);
  const [selectedPreset, setSelectedPreset] = React.useState<string | null>("p1");
  const [selectedAppType, setSelectedAppType] = React.useState<string | null>(null);
  const [serverName, setServerName] = React.useState("");

  // Payment states
  const [paymentLoading, setPaymentLoading] = React.useState(false);
  const [paymentData, setPaymentData] = React.useState<any>(null);
  const [paymentStatus, setPaymentStatus] = React.useState<string>("pending");
  const [isChecking, setIsChecking] = React.useState(false);
  const [isProvisioning, setIsProvisioning] = React.useState(false);

  React.useEffect(() => {
    if (!user?.uid) return;
    const unsubProfile = onSnapshot(doc(db, "users", user.uid), (docSnap) => {
      if (docSnap.exists()) {
        setProfile(docSnap.data());
      }
    });

    // Fetch dynamic resource presets from Firestore
    const unsubPricing = onSnapshot(doc(db, "main", "product"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.tiers && Array.isArray(data.tiers)) {
          setResourcePresets(data.tiers);
          if (!data.tiers.find((t: any) => t.id === selectedPreset)) {
            setSelectedPreset(data.tiers[0]?.id || "p1");
          }
        }
      }
    });

    // Fetch dynamic templates from Firestore and filter by ACTIVE status
    const unsubTemplates = onSnapshot(doc(db, "main", "templates"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.list && Array.isArray(data.list)) {
          // FILTER: Only active templates
          const activeList = data.list.filter((t: any) => t.status === "active");
          setTemplates(activeList);
        }
      }
    });

    return () => {
      unsubProfile();
      unsubPricing();
      unsubTemplates();
    };
  }, [user, db, selectedPreset]);

  const selectedTemplateData = templates.find(t => t.id === selectedTemplate);
  const selectedPresetData = resourcePresets.find(p => p.id === selectedPreset);
  const availableAppTypes = selectedTemplate ? (applicationTypes[selectedTemplate] || applicationTypes.website) : [];

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/auth?type=login");
  };

  const handleInitializePayment = async () => {
    if (!selectedPresetData || !user?.email) return;
    
    setStep(5);
    setPaymentLoading(true);
    
    const invoiceId = `STS-${Date.now()}`;
    const result = await createSvalePayment({
      amount: selectedPresetData.priceValue,
      email: user.email,
      external_id: invoiceId,
      description: `Deployment Server: ${serverName || 'My Project'}`
    });

    if (result.success) {
      setPaymentData(result.data);
    } else {
      toast({
        variant: "destructive",
        title: "Payment Error",
        description: result.error || "Failed to process payment"
      });
      setStep(4);
    }
    setPaymentLoading(false);
  };

  const handleCheckStatus = async () => {
    if (!paymentData?.trx_id) return;
    setIsChecking(true);
    
    const result = await checkPaymentStatus(paymentData.trx_id);
    if (result.success) {
      setPaymentStatus(result.status);
      if (result.status === "success") {
        toast({
          title: "Payment Success!",
          description: "Finalizing server deployment..."
        });
        handleFinalizeDeployment();
      }
    }
    setIsChecking(false);
  };

  const handleFinalizeDeployment = async () => {
    if (!user?.uid || !selectedPresetData) return;
    setIsProvisioning(true);

    const serverId = `sts-serv-${Math.random().toString(36).substring(2, 9)}`;

    try {
      const provision = await provisionServerFiles(serverId);
      if (!provision.success) throw new Error("File provisioning failed");

      await setDoc(doc(db, "servers", serverId), {
        name: serverName || "Cloud Server",
        ownerId: user.uid,
        plan: selectedPresetData.name,
        status: "online",
        createdAt: serverTimestamp(),
        runtime: selectedAppType,
        template: selectedTemplate,
        resources: {
          ram: selectedPresetData.ram,
          cpu: selectedPresetData.cpu,
          disk: selectedPresetData.disk
        }
      });

      toast({
        title: "Deployment Complete",
        description: "Your server is now live."
      });

      router.push(`/servers/${serverId}`);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Deployment Failed",
        description: error.message
      });
    } finally {
      setIsProvisioning(false);
    }
  };

  const displayName = profile?.displayName || user?.displayName || user?.email?.split('@')[0] || "User Account";
  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <div className="bg-background min-h-screen">
      <header className="flex h-16 shrink-0 items-center justify-between px-4 md:px-8 border-b border-border/50 sticky top-0 bg-background/80 backdrop-blur-md z-40">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-[40px] h-[40px] rounded-lg overflow-hidden flex items-center justify-center">
              <Image src="/img/icons.png" alt="STSCloud" width={40} height={40} className="object-cover" />
            </div>
            <span className="font-headline font-bold text-xl tracking-tight">
              <span className="text-primary">Deploy</span>
            </span>
          </Link>
          <div className="h-4 w-px bg-border" />
          <button 
            onClick={() => step > 1 && step < 5 ? setStep(step - 1) : router.back()}
            className="text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
            aria-label="Go back"
          >
            <ArrowLeft className="size-4" />
          </button>
          <h1 className="font-headline font-semibold text-lg hidden sm:block">Deploy</h1>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              {templates.map((t) => {
                const IconComponent = LucideIconMap[t.icon] || Layout;
                return (
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
                      <div className={cn("size-12 md:size-16 mx-auto rounded-2xl bg-secondary flex items-center justify-center group-hover:scale-110 transition-all duration-300", t.color || "text-primary")}>
                        <IconComponent className="size-6 md:size-8" />
                      </div>
                      <div className="space-y-1">
                        <div className="font-headline font-bold text-base md:text-lg">{t.name}</div>
                        <Badge variant="secondary" className="text-[9px] uppercase tracking-widest px-2 font-bold opacity-70">{t.group || 'Infrastructure'}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                      <div className="flex items-center gap-1.5">
                        <Image src="/img/icons.png" alt="STS" width={30} height={30} className="object-contain" />
                        <span className="font-bold font-headline text-lg">{preset.name}</span>
                      </div>
                      {selectedPreset === preset.id && <CheckCircle2 className="size-4 text-primary fill-primary text-white" />}
                    </div>
                    
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Database className="size-3.5" />
                        <span className="font-medium">{preset.ram} RAM</span>
                      </div>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              {availableAppTypes.map((type) => {
                const iconName = runtimeIconNames[type.id];
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
                        {iconName ? (
                          <Icon icon={iconName} className="size-10" />
                        ) : (
                          <Code2 className={cn(
                            "size-8",
                            selectedAppType === type.id ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                          )} />
                        )}
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
              <p className="text-muted-foreground text-sm">Configure your server and review your order.</p>
            </div>

            <Card className="max-w-xl mx-auto border-border/50 bg-card overflow-hidden">
              <div className="p-6 bg-secondary/30 border-b border-border/50 flex items-center gap-3">
                <ShoppingCart className="size-5 text-primary" />
                <span className="font-bold font-headline">Summary & Config</span>
              </div>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="serverName" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Server Name</Label>
                    <Input 
                      id="serverName" 
                      placeholder="e.g., My Project" 
                      className="bg-secondary/30 border-none h-11 focus-visible:ring-primary/40" 
                      value={serverName}
                      onChange={(e) => setServerName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="h-px bg-border/50 my-2" />

                <div className="grid grid-cols-2 gap-y-5 text-sm">
                  <div className="text-muted-foreground">Environment</div>
                  <div className="font-bold text-right uppercase text-primary">{selectedTemplateData?.name}</div>
                  
                  <div className="text-muted-foreground">Resources</div>
                  <div className="font-bold text-right flex items-center justify-end gap-1.5">
                    <Image src="/img/icons.png" alt="STS" width={16} height={16} className="object-contain" />
                    {selectedPresetData?.name} ({selectedPresetData?.ram})
                  </div>
                  
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
                disabled={!serverName.trim()}
                onClick={handleInitializePayment}
                className="bg-primary text-white px-8 h-12 gap-2 w-full md:w-auto font-bold"
              >
                Continue to Payment <CreditCard className="size-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="max-w-md mx-auto space-y-8 text-center animate-in zoom-in-95 duration-500">
             <div className="space-y-2">
              <h2 className="text-2xl md:text-3xl font-headline font-bold">QRIS</h2>
              <p className="text-muted-foreground text-sm">
                Scan QRIS to complete payment
              </p>
            </div>
            
            <div className="p-8 rounded-3xl bg-secondary/20 border border-border/50 space-y-6">
              <div className="bg-white rounded-2xl shadow-inner relative overflow-hidden min-h-[250px] flex items-center justify-center">
                {paymentLoading ? (
                  <div className="w-full h-full p-4 space-y-4">
                    <Skeleton className="w-full aspect-square rounded-lg bg-secondary/10" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-3/4 mx-auto bg-secondary/10" />
                      <Skeleton className="h-4 w-1/2 mx-auto bg-secondary/10" />
                    </div>
                  </div>
                ) : paymentData?.qr_url ? (
                  <div className="space-y-4">
                    <img 
                      src={paymentData.qr_url} 
                      alt="QRIS Invoice" 
                      className={cn(
                        "w-full h-auto transition-opacity duration-1000",
                        (paymentStatus === "success" || isProvisioning) && "opacity-20 grayscale"
                      )}
                    />
                    {(paymentStatus === "success" || isProvisioning) && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-green-500/10 backdrop-blur-[2px]">
                        {isProvisioning ? (
                          <Loader2 className="size-12 text-primary animate-spin" />
                        ) : (
                          <CheckCircle2 className="size-20 text-green-500 fill-white" />
                        )}
                        <p className="text-green-600 font-bold text-lg mt-2">
                          {isProvisioning ? "PROVISIONING..." : "PAID"}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-destructive font-bold">Failed to load QRIS</p>
                )}
              </div>

              <div className="space-y-3">
                <Button 
                  onClick={handleCheckStatus}
                  disabled={isChecking || paymentStatus === "success" || isProvisioning}
                  className={cn(
                    "w-full h-14 gap-2 text-lg font-bold transition-all",
                    paymentStatus === "success" ? "bg-green-500" : "bg-primary"
                  )}
                >
                  {isChecking ? (
                    <Loader2 className="size-5 animate-spin" />
                  ) : paymentStatus === "success" ? (
                    <>
                      <Rocket className="size-5" /> Finalizing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="size-5" /> Check Status
                    </>
                  )}
                </Button>

                {paymentStatus === "success" && !isProvisioning && (
                  <Link href="/dashboard" className="block w-full">
                    <Button variant="outline" className="w-full h-12">To Dashboard</Button>
                  </Link>
                )}
              </div>
            </div>

            <Button 
              variant="ghost" 
              onClick={() => setStep(4)} 
              className="gap-2"
              disabled={paymentStatus === "success" || isProvisioning}
            >
              <ChevronLeft className="size-4" /> Cancel & Back
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}

