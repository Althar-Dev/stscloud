
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
  Info,
  Rocket
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";

export default function AgentDocsPage() {
  const { toast } = useToast();
  const [copied, setCopied] = React.useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    toast({ title: "Copied", description: "Command copied to clipboard." });
    setTimeout(() => setCopied(null), 2000);
  };

  const installScript = `curl -sSL https://stscloud.id/api/agent/install-agent.sh | bash`;

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
            <ShieldCheck className="size-3" /> Auto-SSL Enabled
          </Badge>
        </div>
      </header>

      <main className="max-w-5xl mx-auto pt-24 pb-20 px-4 md:px-8">
        <div className="space-y-12">
          <section className="space-y-4 text-center sm:text-left">
            <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tight">Setup <span className="text-primary">Remote Agent</span></h1>
            <p className="text-muted-foreground text-lg font-medium leading-relaxed max-w-3xl">
              Gunakan satu perintah untuk mengubah VPS kosong menjadi node infrastruktur STSCloud. 
              Skrip akan mengonfigurasi storage, worker API, dan SSL secara otomatis.
            </p>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-card border-border/50">
              <CardHeader>
                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-2"><Rocket className="size-5" /></div>
                <CardTitle className="text-sm font-headline">Zero Config SSL</CardTitle>
                <CardDescription className="text-xs">Skrip otomatis memasang Certbot dan mengonfigurasi HTTPS untuk domain Anda.</CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-card border-border/50">
              <CardHeader>
                <div className="size-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent mb-2"><Lock className="size-5" /></div>
                <CardTitle className="text-sm font-headline">Token Auth</CardTitle>
                <CardDescription className="text-xs">Komunikasi Panel-Agent diamankan dengan Secret Key terenkripsi.</CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-card border-border/50">
              <CardHeader>
                <div className="size-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500 mb-2"><Globe className="size-5" /></div>
                <CardTitle className="text-sm font-headline">Edge Ready</CardTitle>
                <CardDescription className="text-xs">Dirancang untuk latensi rendah dengan dukungan domain native.</CardDescription>
              </CardHeader>
            </Card>
          </div>

          <section className="space-y-8">
            <div className="flex items-center gap-3">
               <Terminal className="size-6 text-primary" />
               <h2 className="text-2xl font-headline font-bold">One-Click Installation</h2>
            </div>
            
            <div className="space-y-4">
              <p className="text-muted-foreground">Jalankan perintah ini di terminal VPS Anda (Ubuntu 20.04+ direkomendasikan):</p>
              <div className="relative group">
                <pre className="bg-[#0c0c0f] p-6 rounded-xl border border-border/50 font-code text-sm text-primary overflow-x-auto shadow-2xl">
                  <code>{installScript}</code>
                </pre>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute top-4 right-4 hover:bg-primary/20 text-muted-foreground hover:text-primary transition-all"
                  onClick={() => copyToClipboard(installScript, 'install')}
                >
                  {copied === 'install' ? <Check className="size-4" /> : <Copy className="size-4" />}
                </Button>
              </div>
            </div>

            <Card className="border-primary/20 bg-primary/5 overflow-hidden">
               <div className="p-4 bg-primary/10 border-b border-primary/20 flex items-center gap-3">
                  <Info className="size-4 text-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Apa yang dilakukan skrip ini?</span>
               </div>
               <CardContent className="p-8">
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <li className="flex items-start gap-3 text-sm font-medium text-muted-foreground">
                      <Check className="size-4 text-green-500 shrink-0 mt-0.5" />
                      Instalasi Node.js v20 LTS & PM2 Process Manager.
                    </li>
                    <li className="flex items-start gap-3 text-sm font-medium text-muted-foreground">
                      <Check className="size-4 text-green-500 shrink-0 mt-0.5" />
                      Konfigurasi Nginx Reverse Proxy otomatis.
                    </li>
                    <li className="flex items-start gap-3 text-sm font-medium text-muted-foreground">
                      <Check className="size-4 text-green-500 shrink-0 mt-0.5" />
                      Pemasangan SSL via Certbot (Let's Encrypt).
                    </li>
                    <li className="flex items-start gap-3 text-sm font-medium text-muted-foreground">
                      <Check className="size-4 text-green-500 shrink-0 mt-0.5" />
                      Pengaturan Worker API pada port 9005.
                    </li>
                  </ul>
               </CardContent>
            </Card>
          </section>

          <section className="space-y-6">
            <h3 className="text-2xl font-headline font-bold">Langkah Selanjutnya</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-4">
                  <div className="size-8 rounded-full bg-secondary flex items-center justify-center font-bold text-primary">1</div>
                  <p className="text-sm font-medium leading-relaxed">
                    Setelah skrip selesai, ia akan memberikan **Secret Key**. Simpan kunci ini baik-baik.
                  </p>
               </div>
               <div className="space-y-4">
                  <div className="size-8 rounded-full bg-secondary flex items-center justify-center font-bold text-primary">2</div>
                  <p className="text-sm font-medium leading-relaxed">
                    Kembali ke **Dev Console > Agents**, klik **Register Agent** dan masukkan Domain serta Secret Key yang didapat.
                  </p>
               </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="py-12 border-t border-border/50 text-center">
         <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.3em]">
           &copy; {new Date().getFullYear()} StarVale Technology Solution &bull; Infrastructure Automated Setup
         </p>
      </footer>
    </div>
  );
}
