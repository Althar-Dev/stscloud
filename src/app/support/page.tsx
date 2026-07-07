"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Headset, 
  MessageSquare, 
  Book, 
  ShieldCheck, 
  ChevronRight, 
  Send,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { useRouter } from "next/navigation";

const faqs = [
  {
    question: "Bagaimana cara deploy server baru?",
    answer: "Anda dapat melakukan deployment server baru dengan menekan tombol 'New Server' di dashboard. Ikuti panduan konfigurasi untuk memilih lingkungan, resource, dan runtime yang sesuai."
  },
  {
    question: "Metode pembayaran apa saja yang didukung?",
    answer: "Kami mendukung berbagai metode pembayaran lokal Indonesia termasuk QRIS, Virtual Account, dan E-Wallet melalui integrasi SValePay."
  },
  {
    question: "Apakah saya bisa upgrade resource nanti?",
    answer: "Ya! Anda dapat meningkatkan RAM, CPU, atau Storage kapan saja melalui tab pengaturan server. Perubahan akan diterapkan secara instan."
  },
  {
    question: "Apakah STSCloud menawarkan proteksi DDoS?",
    answer: "Setiap server di STSCloud dilengkapi dengan mitigasi DDoS L4-L7 standar industri untuk memastikan proyek Anda tetap online selama serangan berlangsung."
  }
];

export default function SupportPage() {
  const router = useRouter();
  const [submitted, setSubmitted] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="bg-background min-h-screen text-foreground selection:bg-primary/20">
      <header className="fixed top-0 w-full z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
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
                <span className="text-primary">Support</span>
              </span>
            </Link>
          </div>
          <Link href="/auth?type=signup">
            <Button variant="outline" size="sm" className="font-bold uppercase tracking-widest text-[10px]">Back to Signup</Button>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto pt-32 pb-20 px-4 md:px-8 space-y-12">
        <section className="text-center space-y-4 py-8">
          <h2 className="text-3xl md:text-6xl font-headline font-bold">How can we help?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base font-medium">
            Temukan jawaban untuk pertanyaan umum atau hubungi tim dukungan kami untuk bantuan lebih lanjut.
          </p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/support/knowledge-base" className="block h-full group">
            <Card className="bg-card border-border/50 hover:bg-secondary/20 transition-all cursor-pointer h-full">
              <CardContent className="p-6 space-y-4">
                <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Book className="size-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-headline font-bold text-lg">Knowledge Base</h3>
                  <p className="text-sm text-muted-foreground font-medium">Panduan lengkap dan dokumentasi teknis untuk semua layanan kami.</p>
                </div>
                <div className="flex items-center justify-between text-primary text-xs font-bold uppercase tracking-widest">
                  Explore Docs <ChevronRight className="size-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/support/billing" className="block h-full group">
            <Card className="bg-card border-border/50 hover:bg-secondary/20 transition-all cursor-pointer h-full">
              <CardContent className="p-6 space-y-4">
                <div className="size-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                  <ShieldCheck className="size-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-headline font-bold text-lg">Billing Support</h3>
                  <p className="text-sm text-muted-foreground font-medium">Kelola invoice, pembayaran, dan rincian paket berlangganan Anda.</p>
                </div>
                <div className="flex items-center justify-between text-accent text-xs font-bold uppercase tracking-widest">
                  Manage Billing <ChevronRight className="size-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="https://wa.me/628123456789" target="_blank" className="block h-full group">
            <Card className="bg-card border-border/50 hover:bg-secondary/20 transition-all cursor-pointer h-full">
              <CardContent className="p-6 space-y-4">
                <div className="size-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500">
                  <MessageSquare className="size-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-headline font-bold text-lg">Live Community</h3>
                  <p className="text-sm text-muted-foreground font-medium">Bergabunglah dengan grup diskusi dan hubungi kami via WhatsApp.</p>
                </div>
                <div className="flex items-center justify-between text-green-500 text-xs font-bold uppercase tracking-widest">
                  Chat Now <ChevronRight className="size-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-12">
          <section className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl md:text-3xl font-headline font-bold">Frequently Asked Questions</h2>
              <p className="text-sm text-muted-foreground font-medium">Jawaban cepat untuk pertanyaan yang paling sering diajukan.</p>
            </div>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border-border/50">
                  <AccordionTrigger className="font-bold hover:text-primary transition-colors py-5">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed font-medium pb-6">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>

          <section className="space-y-6">
            <Card className="border-border/50 bg-card overflow-hidden">
              <CardHeader className="bg-secondary/20 p-6 md:p-8 border-b border-border/50">
                <CardTitle className="font-headline text-2xl">Open a Ticket</CardTitle>
                <CardDescription className="font-medium">
                  Butuh bantuan spesifik? Kirimkan tiket bantuan ke tim teknis kami.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 md:p-8">
                {submitted ? (
                  <div className="text-center py-12 space-y-6 animate-in fade-in zoom-in-95">
                    <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary">
                      <ShieldCheck className="size-10" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-headline font-bold text-2xl">Ticket Submitted!</h3>
                      <p className="text-sm text-muted-foreground font-medium">
                        Kami telah menerima permintaan Anda dan akan membalas dalam waktu maksimal 24 jam.
                      </p>
                    </div>
                    <Button variant="outline" className="font-bold" onClick={() => setSubmitted(false)}>
                      Send another message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Name</label>
                        <Input placeholder="John Doe" required className="bg-secondary/30 border-none h-12 focus-visible:ring-primary/40" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Email</label>
                        <Input type="email" placeholder="john@example.com" required className="bg-secondary/30 border-none h-12 focus-visible:ring-primary/40" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Subject</label>
                      <Input placeholder="Technical Issue" required className="bg-secondary/30 border-none h-12 focus-visible:ring-primary/40" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Message</label>
                      <Textarea placeholder="Jelaskan masalah Anda secara detail..." required className="bg-secondary/30 border-none min-h-[150px] focus-visible:ring-primary/40" />
                    </div>
                    <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white h-12 gap-2 font-bold shadow-lg shadow-primary/20">
                      <Send className="size-4" /> Submit Ticket
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </section>
        </div>
      </main>

      <footer className="py-12 text-center text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
        &copy; {new Date().getFullYear()} STSCloud. All rights reserved.
      </footer>
    </div>
  );
}
