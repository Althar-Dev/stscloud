
"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  ArrowLeft, 
  Terminal, 
  Server, 
  ShieldCheck, 
  Lock, 
  Globe, 
  FileCode, 
  Copy, 
  Check,
  Zap,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

export default function AgentDocsPage() {
  const { toast } = useToast();
  const [copied, setCopied] = React.useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    toast({ title: "Copied", description: "Command copied to clipboard." });
    setTimeout(() => setCopied(null), 2000);
  };

  const installScript = `curl -sSL https://raw.githubusercontent.com/stscloud/agent/main/install.sh | bash`;
  const nginxConfig = `server {
    listen 80;
    server_name node-01.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:9005;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}`;

  return (
    <div className="bg-background min-h-screen">
      <header className="fixed top-0 w-full z-50 border-b border-border/50 bg-background/80 backdrop-blur-md h-16">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dev" className="p-2 hover:bg-secondary/50 rounded-lg transition-colors">
              <ArrowLeft className="size-5" />
            </Link>
            <div className="flex items-center gap-2">
              <Image src="/img/icons.png" alt="STS" width={32} height={32} />
              <span className="font-headline font-bold text-lg">Agent <span className="text-primary">Docs</span></span>
            </div>
          </div>
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 gap-2">
            <ShieldCheck className="size-3" /> Security Version 2.0
          </Badge>
        </div>
      </header>

      <main className="max-w-5xl mx-auto pt-24 pb-20 px-4 md:px-8">
        <div className="space-y-12">
          <section className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-headline font-bold">Setup Remote Agent</h1>
            <p className="text-muted-foreground text-lg font-medium leading-relaxed max-w-3xl">
              Gunakan panduan ini untuk mengubah VPS kosong menjadi STSCloud Agent. 
              Agent bertugas mengelola storage dan proses server pengguna melalui komunikasi HTTPS yang aman.
            </p>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-card border-border/50">
              <CardHeader>
                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-2"><Server className="size-5" /></div>
                <CardTitle className="text-sm font-headline">Dedicated Storage</CardTitle>
                <CardDescription className="text-xs">Agent menampung semua file server user secara eksklusif.</CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-card border-border/50">
              <CardHeader>
                <div className="size-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent mb-2"><Lock className="size-5" /></div>
                <CardTitle className="text-sm font-headline">Token Auth</CardTitle>
                <CardDescription className="text-xs">Komunikasi Panel-Agent menggunakan Shared Secret Key.</CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-card border-border/50">
              <CardHeader>
                <div className="size-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500 mb-2"><Globe className="size-5" /></div>
                <CardTitle className="text-sm font-headline">HTTPS Native</CardTitle>
                <CardDescription className="text-xs">Direkomendasikan menggunakan Domain + SSL untuk kelancaran stream.</CardDescription>
              </CardHeader>
            </Card>
          </div>

          <Tabs defaultValue="install" className="space-y-8">
            <TabsList className="bg-secondary/30 p-1 rounded-xl h-auto border border-border/50 w-full sm:w-fit overflow-x-auto justify-start flex">
              <TabsTrigger value="install" className="rounded-lg gap-2 py-2 px-6 data-[state=active]:bg-primary">1. Quick Install</TabsTrigger>
              <TabsTrigger value="ssl" className="rounded-lg gap-2 py-2 px-6 data-[state=active]:bg-primary">2. Configure SSL</TabsTrigger>
              <TabsTrigger value="panel" className="rounded-lg gap-2 py-2 px-6 data-[state=active]:bg-primary">3. Connect to Panel</TabsTrigger>
            </TabsList>

            <TabsContent value="install" className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
              <div className="space-y-4">
                <h3 className="text-2xl font-headline font-bold">Langkah 1: Instalasi Core Agent</h3>
                <p className="text-muted-foreground">Jalankan perintah berikut di terminal VPS target Anda (Ubuntu/Debian direkomendasikan).</p>
                
                <div className="relative group">
                  <pre className="bg-[#0c0c0f] p-6 rounded-xl border border-border/50 font-code text-sm text-primary overflow-x-auto">
                    <code>{installScript}</code>
                  </pre>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute top-4 right-4 hover:bg-primary/20 text-muted-foreground hover:text-primary"
                    onClick={() => copyToClipboard(installScript, 'install')}
                  >
                    {copied === 'install' ? <Check className="size-4" /> : <Copy className="size-4" />}
                  </Button>
                </div>

                <div className="bg-secondary/10 border border-border/50 rounded-xl p-6 space-y-4">
                   <div className="flex items-center gap-3 text-yellow-500 font-bold"><Info className="size-5" /> Persyaratan Sistem</div>
                   <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-2 font-medium">
                      <li>Node.js v20 atau lebih tinggi</li>
                      <li>Disk minimal 10GB untuk penampung file server</li>
                      <li>Akses Root atau Sudo</li>
                      <li>Port 9005 terbuka (digunakan oleh Agent Worker)</li>
                   </ul>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="ssl" className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
              <div className="space-y-4">
                <h3 className="text-2xl font-headline font-bold">Langkah 2: Reverse Proxy & HTTPS</h3>
                <p className="text-muted-foreground">Agar komunikasi upload/edit file berjalan lancar di browser modern, Agent wajib menggunakan HTTPS.</p>
                
                <div className="space-y-4">
                  <Label className="text-xs font-bold uppercase text-muted-foreground">Nginx Configuration</Label>
                  <div className="relative group">
                    <pre className="bg-[#0c0c0f] p-6 rounded-xl border border-border/50 font-code text-xs text-slate-300 overflow-x-auto leading-relaxed">
                      <code>{nginxConfig}</code>
                    </pre>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute top-4 right-4 hover:bg-primary/20 text-muted-foreground hover:text-primary"
                      onClick={() => copyToClipboard(nginxConfig, 'nginx')}
                    >
                      {copied === 'nginx' ? <Check className="size-4" /> : <Copy className="size-4" />}
                    </Button>
                  </div>
                </div>

                <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
                   <p className="text-sm font-medium leading-relaxed">
                     Setelah konfigurasi Nginx dipasang, gunakan <strong>Certbot</strong> untuk mengaktifkan SSL: <br />
                     <code className="text-primary font-bold mt-2 inline-block">sudo certbot --nginx -d node-01.yourdomain.com</code>
                   </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="panel" className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
              <div className="space-y-4">
                <h3 className="text-2xl font-headline font-bold">Langkah 3: Registrasi di Dev Console</h3>
                <p className="text-muted-foreground">Kembali ke Panel STSCloud dan masukkan detail Agent Anda.</p>
                
                <Card className="border-border/50 bg-card overflow-hidden">
                   <div className="p-4 bg-secondary/30 border-b border-border/50 flex items-center gap-3">
                      <Zap className="size-4 text-primary" />
                      <span className="text-xs font-bold uppercase tracking-widest">Panel Registration Checklist</span>
                   </div>
                   <CardContent className="p-8 space-y-6">
                      <div className="flex gap-4">
                        <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary shrink-0">1</div>
                        <div>
                          <p className="font-bold">Region Name</p>
                          <p className="text-sm text-muted-foreground font-medium">Beri nama lokasi fisik VPS Anda (e.g., Singapore-01).</p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary shrink-0">2</div>
                        <div>
                          <p className="font-bold">Domain Node</p>
                          <p className="text-sm text-muted-foreground font-medium">Masukkan domain HTTPS yang telah Anda setup (e.g., node-01.stscloud.id).</p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary shrink-0">3</div>
                        <div>
                          <p className="font-bold">Secret Key</p>
                          <p className="text-sm text-muted-foreground font-medium">Pastikan kunci ini sama dengan yang ada di file <code>config.sts</code> di VPS Agent.</p>
                        </div>
                      </div>
                   </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <footer className="py-12 border-t border-border/50 text-center">
         <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.3em]">
           &copy; {new Date().getFullYear()} StarVale Technology Solution &bull; Infrastructure Documentation
         </p>
      </footer>
    </div>
  );
}
