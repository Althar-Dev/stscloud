"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Book, 
  Rocket, 
  Terminal, 
  Code2, 
  ShieldCheck, 
  Server as ServerIcon,
  ChevronRight,
  Database,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

const docSections = [
  {
    title: "Getting Started",
    icon: Rocket,
    items: [
      { id: "intro", label: "Pengenalan STSCloud" },
      { id: "deploy", label: "Cara Deploy Server Pertama" },
      { id: "dashboard", label: "Navigasi Dashboard" },
    ]
  },
  {
    title: "Server Management",
    icon: ServerIcon,
    items: [
      { id: "console", label: "Menggunakan Terminal Console" },
      { id: "files", label: "Manajemen File & File Explorer" },
      { id: "resources", label: "Memahami Resource Guard" },
    ]
  },
  {
    title: "Runtimes & Enviroment",
    icon: Code2,
    items: [
      { id: "nodejs", label: "Konfigurasi Node.js" },
      { id: "python", label: "Konfigurasi Python" },
      { id: "startup", label: "Kustomisasi Startup Command" },
    ]
  }
];

export default function KnowledgeBasePage() {
  const router = useRouter();

  return (
    <div className="bg-background min-h-screen text-foreground selection:bg-primary/20">
      <header className="fixed top-0 w-full z-50 border-b border-border/50 bg-background/80 backdrop-blur-md h-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()}
              className="text-muted-foreground hover:text-foreground transition-colors p-2 hover:bg-secondary/50 rounded-lg"
            >
              <ArrowLeft className="size-5" />
            </button>
            <Link href="/" className="flex items-center gap-2">
              <div className="w-[32px] h-[32px] rounded-lg overflow-hidden flex items-center justify-center">
                <Image src="/img/icons.png" alt="STSCloud" width={32} height={32} className="object-cover" />
              </div>
              <span className="font-headline font-bold text-lg tracking-tight">
                <span className="text-primary">Docs</span>
              </span>
            </Link>
          </div>
          <div className="relative hidden md:block w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input placeholder="Cari dokumentasi..." className="bg-secondary/30 border-none h-9 pl-10 text-xs" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto pt-24 pb-20 px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Sidebar Navigation */}
          <aside className="lg:col-span-3 hidden lg:block space-y-8 sticky top-24 h-fit">
            <div className="space-y-6">
              {docSections.map((section, i) => (
                <div key={i} className="space-y-3">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    <section.icon className="size-3" /> {section.title}
                  </div>
                  <ul className="space-y-1">
                    {section.items.map(item => (
                      <li key={item.id}>
                        <button className="text-sm font-medium hover:text-primary transition-colors text-muted-foreground py-1 block w-full text-left">
                          {item.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-9 space-y-12">
            <div className="space-y-4">
              <Badge variant="outline" className="border-primary/20 text-primary uppercase font-bold tracking-widest px-2 py-0.5 text-[9px]">Knowledge Base</Badge>
              <h1 className="text-4xl md:text-5xl font-headline font-bold">Dokumentasi STSCloud</h1>
              <p className="text-muted-foreground font-medium">Panduan lengkap untuk mengelola infrastruktur cloud Anda dengan STSCloud.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-card border-border/50 hover:border-primary/30 transition-all group cursor-pointer">
                <CardHeader>
                  <Rocket className="size-8 text-primary mb-2 group-hover:scale-110 transition-transform" />
                  <CardTitle className="font-headline">Quick Start</CardTitle>
                  <CardDescription>Pelajari cara deploy server pertama Anda dalam hitungan detik.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" className="p-0 h-auto text-primary text-xs font-bold uppercase tracking-widest gap-2">
                    Mulai Sekarang <ChevronRight className="size-3" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-card border-border/50 hover:border-primary/30 transition-all group cursor-pointer">
                <CardHeader>
                  <Terminal className="size-8 text-accent mb-2 group-hover:scale-110 transition-transform" />
                  <CardTitle className="font-headline">Console Master</CardTitle>
                  <CardDescription>Panduan menggunakan terminal interaktif untuk skrip Node/Python.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" className="p-0 h-auto text-accent text-xs font-bold uppercase tracking-widest gap-2">
                    Pelajari Konsol <ChevronRight className="size-3" />
                  </Button>
                </CardContent>
              </Card>

            <div className="space-y-8 bg-secondary/10 p-8 rounded-2xl border border-border/50">
              <h2 className="text-2xl font-headline font-bold flex items-center gap-3">
                <Database className="size-6 text-primary" /> Infrastruktur Lokal
              </h2>
              <div className="prose prose-invert max-w-none text-muted-foreground leading-relaxed font-medium space-y-4">
                <p>
                  STSCloud menggunakan node infrastruktur lokal di Jakarta (JKT-01) untuk memastikan latensi terendah bagi pengguna di Indonesia. Setiap node didukung oleh penyimpanan NVMe SSD dan CPU berperforma tinggi.
                </p>
                <h3 className="text-foreground font-bold mt-6">Optimasi Resource Guard</h3>
                <p>
                  Sistem kami memantau penggunaan CPU, RAM, dan Disk secara real-time. Jika aplikasi Anda melebihi batas paket yang dipilih, sistem akan menghentikan proses untuk menjaga stabilitas node demi kenyamanan pengguna lain.
                </p>
              </div>
            </div>
          </div>
        </div>
        </div>
      </main>

      <footer className="py-12 border-t border-border/50 text-center text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
        &copy; {new Date().getFullYear()} STSCloud Docs. All rights reserved.
      </footer>
    </div>
  );
}
