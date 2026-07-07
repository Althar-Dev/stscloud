"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  ShieldCheck, 
  CreditCard, 
  Receipt, 
  Zap, 
  HelpCircle,
  AlertCircle,
  BadgeCheck,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function BillingSupportPage() {
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
                <span className="text-primary">Billing</span>
              </span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto pt-32 pb-20 px-4">
        <div className="text-center space-y-4 mb-12">
          <Badge variant="outline" className="border-primary/20 text-primary uppercase font-bold tracking-widest px-2 py-0.5 text-[9px]">Platform Finance</Badge>
          <h1 className="text-4xl md:text-5xl font-headline font-bold">Billing & Payments</h1>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm md:text-base font-medium">
            Informasi mengenai sistem pembayaran, invoice, dan siklus berlangganan di STSCloud.
          </p>
        </div>

        <div className="space-y-8">
          <Card className="bg-card border-border/50 overflow-hidden">
            <CardHeader className="bg-secondary/20 p-8 border-b border-border/50">
              <div className="flex items-center gap-3 mb-2">
                <CreditCard className="size-5 text-primary" />
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Accepted Payments</span>
              </div>
              <CardTitle className="font-headline text-2xl">Metode Pembayaran</CardTitle>
              <CardDescription>Kami menggunakan SValePay untuk memastikan transaksi yang cepat dan aman.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/30 border border-border/50">
                  <div className="size-8 rounded-lg bg-white flex items-center justify-center font-bold text-xs text-black">QRIS</div>
                  <div>
                    <div className="text-sm font-bold">QRIS Dynamic</div>
                    <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Instant Activation</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/30 border border-border/50">
                  <Receipt className="size-5 text-accent" />
                  <div>
                    <div className="text-sm font-bold">Virtual Account</div>
                    <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Coming Soon</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-card border-border/50">
              <CardHeader>
                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                  <Zap className="size-5" />
                </div>
                <CardTitle className="font-headline font-bold">Siklus Berlangganan</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground leading-relaxed font-medium space-y-4">
                <p>Setiap server dideploy dengan sistem prabayar per 30 hari. Anda akan menerima notifikasi email 3 hari sebelum masa aktif berakhir.</p>
                <div className="flex items-center gap-2 text-primary font-bold">
                  <CheckCircle2 className="size-4" /> Provisi Instan
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border/50">
              <CardHeader>
                <div className="size-10 rounded-xl bg-destructive/10 flex items-center justify-center text-destructive mb-4">
                  <AlertCircle className="size-5" />
                </div>
                <CardTitle className="font-headline font-bold">Kebijakan Refund</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground leading-relaxed font-medium">
                <p>Karena sifat layanan yang bersifat provisi instan, kami tidak menyediakan pengembalian dana setelah server berhasil diaktifkan, kecuali terjadi gangguan sistem fatal pada infrastruktur kami.</p>
              </CardContent>
            </Card>
          </div>

          <section className="bg-secondary/10 p-8 rounded-2xl border border-border/50 space-y-6">
            <div className="flex items-center gap-3">
              <HelpCircle className="size-6 text-primary" />
              <h2 className="text-2xl font-headline font-bold">Billing FAQ</h2>
            </div>
            <Separator className="bg-border/50" />
            <div className="space-y-6">
              <div className="space-y-2">
                <h4 className="font-bold text-foreground">Apakah harga sudah termasuk pajak?</h4>
                <p className="text-sm text-muted-foreground font-medium">Ya, harga yang tertera di halaman pricing adalah harga final (Nett) yang Anda bayarkan tanpa ada biaya tambahan tersembunyi.</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-foreground">Bagaimana jika saya telat membayar perpanjangan?</h4>
                <p className="text-sm text-muted-foreground font-medium">Jika pembayaran tidak diterima dalam 24 jam setelah masa aktif berakhir, sistem akan menghentikan server (Suspend). Data akan dihapus permanen jika tidak dibayar dalam 7 hari.</p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="py-12 border-t border-border/50 text-center text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
        &copy; {new Date().getFullYear()} STSCloud Finance. All rights reserved.
      </footer>
    </div>
  );
}
