"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  CheckCircle2, 
  Zap, 
  ShieldCheck, 
  Cpu, 
  Database, 
  HardDrive,
  ArrowRight,
  ChevronRight,
  HelpCircle,
  Clock,
  Globe,
  Lock,
  Server as ServerIcon
} from "lucide-react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { useFirestore } from "@/firebase";
import { doc, onSnapshot } from "firebase/firestore";

const defaultPricingTiers = [
  { id: "p1", name: "Zero", ram: "1.5GB", cpu: "100%", disk: "2GB", price: "IDR 10.000", popular: false },
  { id: "p2", name: "Core", ram: "3GB", cpu: "170%", disk: "5GB", price: "IDR 17.000", popular: false },
  { id: "p3", name: "Plus", ram: "5GB", cpu: "250%", disk: "10GB", price: "IDR 27.000", popular: true },
];

const faqs = [
  {
    question: "Bagaimana sistem penagihan STSCloud?",
    answer: "Kami menggunakan sistem prabayar (prepaid). Anda membayar untuk masa aktif 30 hari di muka. Tidak ada biaya tersembunyi atau tagihan tiba-tiba di akhir bulan."
  },
  {
    question: "Apakah saya bisa ganti paket di tengah jalan?",
    answer: "Ya, Anda dapat melakukan upgrade paket kapan saja melalui dashboard. Sistem akan menghitung selisih harga secara prorata atau menambah masa aktif sesuai pembayaran baru."
  },
  {
    question: "Apa yang terjadi jika resource server saya penuh?",
    answer: "Sistem 'Resource Guard' kami akan memberikan peringatan. Jika penggunaan melebihi batas secara ekstrem, instans akan dihentikan sementara untuk menjaga stabilitas node, dan Anda akan menerima email notifikasi."
  }
];

export default function PricingPage() {
  const router = useRouter();
  const db = useFirestore();
  const [pricingTiers, setPricingTiers] = React.useState<any[]>(defaultPricingTiers);
  const [socials, setSocials] = React.useState<any>({});

  React.useEffect(() => {
    const unsubPricing = onSnapshot(doc(db, "main", "product"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.tiers && Array.isArray(data.tiers)) setPricingTiers(data.tiers);
      }
    });

    const unsubSocials = onSnapshot(doc(db, "main", "socials"), (docSnap) => {
      if (docSnap.exists()) {
        setSocials(docSnap.data());
      }
    });

    return () => {
      unsubPricing();
      unsubSocials();
    };
  }, [db]);

  return (
    <div className="bg-background min-h-screen text-foreground selection:bg-primary/20">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-border/50 bg-background/80 backdrop-blur-md h-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()}
              className="text-muted-foreground hover:text-foreground transition-colors p-2 hover:bg-secondary/50 rounded-lg"
            >
              <ArrowLeft className="size-5" />
            </button>
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-[32px] h-[32px] rounded-lg overflow-hidden flex items-center justify-center bg-primary transition-transform group-hover:scale-110">
                <Image src="/img/icons.png" alt="STSCloud" width={32} height={32} className="object-cover" />
              </div>
              <span className="font-headline font-bold text-lg tracking-tight">
                <span className="text-primary">Pricing</span>
              </span>
            </Link>
          </div>
          <Link href="/auth?type=signup">
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-white font-bold h-9 px-5 text-[10px] uppercase tracking-widest">
              Daftar Sekarang
            </Button>
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto pt-32 pb-20 px-4 sm:px-6 lg:px-8 space-y-24">
        {/* Hero Section */}
        <section className="text-center space-y-6 max-w-3xl mx-auto">
          <div className="flex justify-center">
            <Badge variant="outline" className="px-3 py-1 border-primary/20 bg-primary/5 text-primary text-[9px] font-bold uppercase tracking-[0.2em]">
              <Zap className="size-3 mr-2 animate-pulse" /> Paket Performa Tinggi
            </Badge>
          </div>
          <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tight">
            Transparansi Biaya, <br /> <span className="text-primary italic">Tanpa Kompromi</span> Performa.
          </h1>
          <p className="text-muted-foreground text-sm md:text-base font-medium leading-relaxed">
            Pilih paket yang sesuai dengan skala proyek Anda. Dari bot sederhana hingga aplikasi web perusahaan, infrastruktur kami siap mendukung pertumbuhan Anda.
          </p>
        </section>

        {/* Pricing Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {pricingTiers.map((tier) => (
            <Card key={tier.id} className={cn(
              "border-border/50 bg-card transition-all duration-500 hover:border-primary/50 hover:-translate-y-2 relative overflow-hidden group flex flex-col h-full shadow-2xl",
              tier.popular && "border-primary/50 ring-1 ring-primary/20 scale-[1.03] z-10"
            )}>
              {tier.popular && (
                <div className="absolute top-0 right-0 bg-primary text-white text-[8px] font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-bl-2xl shadow-xl">Rekomendasi</div>
              )}
              <CardHeader className="p-8 space-y-6">
                <div className="flex items-center gap-4">
                  <div className={cn("size-12 rounded-2xl bg-secondary flex items-center justify-center group-hover:scale-110 transition-transform duration-500", tier.popular ? "text-primary shadow-[0_0_20px_rgba(99,102,241,0.3)]" : "text-muted-foreground")}>
                    <ServerIcon className="size-6" />
                  </div>
                  <div className="space-y-1">
                    <CardTitle className="font-headline font-bold text-2xl">{tier.name}</CardTitle>
                    <CardDescription className="text-[10px] uppercase font-bold tracking-widest opacity-60">Provision Layer</CardDescription>
                  </div>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl md:text-4xl font-headline font-bold text-primary">{tier.price}</span>
                  <span className="text-muted-foreground text-xs font-bold uppercase tracking-widest">/bulan</span>
                </div>
              </CardHeader>
              
              <CardContent className="p-8 pt-0 space-y-8 flex-1 flex flex-col">
                <div className="space-y-4 flex-1">
                   <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 border border-border/50 group-hover:border-primary/20 transition-colors">
                      <Database className="size-4 text-primary" />
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase text-muted-foreground">Memory</span>
                        <span className="text-sm font-bold">{tier.ram} RAM</span>
                      </div>
                   </div>
                   <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 border border-border/50 group-hover:border-primary/20 transition-colors">
                      <Cpu className="size-4 text-primary" />
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase text-muted-foreground">Compute</span>
                        <span className="text-sm font-bold">{tier.cpu} CPU Shared</span>
                      </div>
                   </div>
                   <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 border border-border/50 group-hover:border-primary/20 transition-colors">
                      <HardDrive className="size-4 text-primary" />
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase text-muted-foreground">Storage</span>
                        <span className="text-sm font-bold">{tier.disk} NVMe SSD</span>
                      </div>
                   </div>
                </div>

                <div className="space-y-4 pt-6">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    <CheckCircle2 className="size-3.5 text-primary" /> 99.9% Uptime Guarantee
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    <CheckCircle2 className="size-3.5 text-primary" /> DDoS Mitigation L4-L7
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    <CheckCircle2 className="size-3.5 text-primary" /> Instant Provisioning
                  </div>
                </div>

                <Link href="/auth?type=signup" className="block w-full pt-4">
                  <Button className={cn("w-full h-12 font-bold gap-2 text-xs uppercase tracking-widest transition-all duration-300", tier.popular ? "bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20" : "bg-secondary hover:bg-secondary/80 text-foreground border border-border/50")}>
                    Mulai Sekarang <ArrowRight className="size-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* Detailed Comparison */}
        <section className="space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-headline font-bold">Bandingkan Spesifikasi</h2>
            <p className="text-muted-foreground font-medium">Detail teknis untuk membantu Anda menentukan resource yang tepat.</p>
          </div>
          <Card className="border-border/50 bg-card overflow-hidden">
            <Table>
              <TableHeader className="bg-secondary/20">
                <TableRow>
                  <TableHead className="font-headline font-bold text-foreground">Fitur Utama</TableHead>
                  {pricingTiers.slice(0, 3).map(t => (
                    <TableHead key={t.id} className="text-center font-headline font-bold text-foreground">{t.name}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">RAM Allocation</TableCell>
                  {pricingTiers.slice(0, 3).map(t => <TableCell key={t.id} className="text-center text-muted-foreground">{t.ram}</TableCell>)}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">CPU Threads</TableCell>
                  {pricingTiers.slice(0, 3).map(t => <TableCell key={t.id} className="text-center text-muted-foreground">{t.cpu}</TableCell>)}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Disk Type</TableCell>
                  <TableCell colSpan={3} className="text-center text-primary font-bold">High-Speed NVMe Gen4 SSD</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Auto-Restart</TableCell>
                  <TableCell colSpan={3} className="text-center text-muted-foreground"><CheckCircle2 className="size-4 text-green-500 mx-auto" /></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">SSH/Terminal Access</TableCell>
                  <TableCell colSpan={3} className="text-center text-muted-foreground"><CheckCircle2 className="size-4 text-green-500 mx-auto" /></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Card>
        </section>

        {/* FAQ Section */}
        <section className="max-w-3xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <Badge variant="outline" className="border-primary/20 text-primary uppercase font-bold tracking-widest px-2 py-0.5 text-[9px]">Bantuan</Badge>
            <h2 className="text-3xl md:text-4xl font-headline font-bold">Pertanyaan Umum Pricing</h2>
          </div>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-border/50 bg-card/50 px-6 rounded-2xl mb-4 transition-all hover:bg-card">
                <AccordionTrigger className="font-headline font-bold text-base md:text-lg hover:no-underline hover:text-primary transition-colors py-6">
                  <div className="flex items-center gap-3 text-left"><HelpCircle className="size-5 text-primary shrink-0" />{faq.question}</div>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm md:text-base leading-relaxed font-medium pb-8 pl-8">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      </main>

      {/* Footer */}
      <footer className="pt-20 pb-12 bg-card border-t border-border/50">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center justify-center text-center gap-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-[40px] h-[40px] rounded-xl overflow-hidden flex items-center justify-center bg-primary">
              <Image src="/img/icons.png" alt="STSCloud" width={40} height={40} className="object-cover" />
            </div>
            <span className="font-headline font-bold text-2xl tracking-tight">STS<span className="text-primary">Cloud</span></span>
          </Link>
          
          <div className="flex items-center gap-6">
            <Link href={socials.twitter || '#'} target="_blank" className="size-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all">
              <Icon icon="ri:twitter-x-fill" className="size-5" />
            </Link>
            <Link href={socials.linkedin || '#'} target="_blank" className="size-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all">
              <Icon icon="ri:linkedin-fill" className="size-5" />
            </Link>
            <Link href={socials.instagram || '#'} target="_blank" className="size-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all">
              <Icon icon="ri:instagram-line" className="size-5" />
            </Link>
            <Link href={socials.whatsapp || '#'} target="_blank" className="size-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all">
              <Icon icon="ri:whatsapp-line" className="size-5" />
            </Link>
          </div>

          <div className="space-y-2">
            <p className="text-xs md:text-sm text-muted-foreground font-medium">
              © 2026- Present | STSCloud Infrastructure • All rights reserved
            </p>
            <p className="text-xs md:text-sm text-muted-foreground font-medium">
              Powered by <Link href="https://starvale.my.id" target="_blank" className="text-foreground hover:underline">StarVale</Link>
            </p>
            <p className="text-xs md:text-sm text-muted-foreground font-medium mt-1">
              Build with 💙 by <Link href="https://althar.dev" target="_blank" className="text-primary hover:underline">AltharDev</Link> (Alhadi Adriano)
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
