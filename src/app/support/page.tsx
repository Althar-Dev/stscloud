
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
  Globe
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
    question: "How do I deploy a new server?",
    answer: "You can deploy a new server by clicking the 'New Server' button on your dashboard. Follow the step-by-step configuration wizard to choose your environment, resources, and runtime."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We currently support various local payment methods including QRIS, Virtual Accounts, and E-Wallets via SValePay."
  },
  {
    question: "Can I upgrade my resources later?",
    answer: "Yes! You can upgrade your RAM, CPU, or Storage at any time from the server settings tab. Changes are applied instantly."
  },
  {
    question: "Do you offer DDoS protection?",
    answer: "Every server on STSCloud comes with advanced L4-L7 DDoS mitigation as standard, ensuring your projects remain online even during attacks."
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
      {/* Header Styled like /legal */}
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
                <Image src="/img/icon.png" alt="STSCloud" width={32} height={32} className="object-cover" />
              </div>
              <span className="font-headline font-bold text-lg tracking-tight">
                <span className="text-primary">Support</span>
              </span>
            </Link>
          </div>
          <div className="hidden sm:block">
            <Badge variant="outline" className="border-primary/20 text-primary uppercase font-bold tracking-widest text-[10px]">
              Help Center
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto pt-32 pb-20 px-4 md:px-8 space-y-12">
        {/* Hero Section */}
        <section className="text-center space-y-4 py-8">
          <h2 className="text-3xl md:text-6xl font-headline font-bold">How can we help?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base font-medium">
            Find answers to common questions or reach out to our dedicated support team for assistance.
          </p>
        </section>

        {/* Support Categories */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-card border-border/50 hover:bg-secondary/20 transition-all cursor-pointer group">
            <CardContent className="p-6 space-y-4">
              <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Book className="size-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-headline font-bold text-lg">Knowledge Base</h3>
                <p className="text-sm text-muted-foreground font-medium">Detailed guides and documentation for all our services.</p>
              </div>
              <Button variant="ghost" className="w-full justify-between p-0 hover:bg-transparent text-primary text-xs font-bold uppercase tracking-widest">
                Explore Docs <ChevronRight className="size-4" />
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card border-border/50 hover:bg-secondary/20 transition-all cursor-pointer group">
            <CardContent className="p-6 space-y-4">
              <div className="size-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                <ShieldCheck className="size-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-headline font-bold text-lg">Billing Support</h3>
                <p className="text-sm text-muted-foreground font-medium">Manage your invoices, payments, and subscription plans.</p>
              </div>
              <Button variant="ghost" className="w-full justify-between p-0 hover:bg-transparent text-accent text-xs font-bold uppercase tracking-widest">
                Manage Billing <ChevronRight className="size-4" />
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card border-border/50 hover:bg-secondary/20 transition-all cursor-pointer group">
            <CardContent className="p-6 space-y-4">
              <div className="size-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500">
                <MessageSquare className="size-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-headline font-bold text-lg">Community</h3>
                <p className="text-sm text-muted-foreground font-medium">Join our Discord server and connect with other users.</p>
              </div>
              <Button variant="ghost" className="w-full justify-between p-0 hover:bg-transparent text-green-500 text-xs font-bold uppercase tracking-widest">
                Join Discord <ChevronRight className="size-4" />
              </Button>
            </CardContent>
          </Card>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-12">
          {/* FAQ Section */}
          <section className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl md:text-3xl font-headline font-bold">Frequently Asked Questions</h2>
              <p className="text-sm text-muted-foreground font-medium">Quick answers to the most common inquiries.</p>
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

          {/* Contact Form */}
          <section className="space-y-6">
            <Card className="border-border/50 bg-card overflow-hidden">
              <CardHeader className="bg-secondary/20 p-6 md:p-8 border-b border-border/50">
                <CardTitle className="font-headline text-2xl">Open a Ticket</CardTitle>
                <CardDescription className="font-medium">
                  Need more specific help? Send a message to our support team.
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
                        We've received your request and will get back to you within 24 hours.
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
                      <Textarea placeholder="Describe your problem in detail..." required className="bg-secondary/30 border-none min-h-[150px] focus-visible:ring-primary/40" />
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

// Internal component for consistent support branding
function Badge({ children, variant = "default", className }: { children: React.ReactNode, variant?: any, className?: string }) {
  const variants: any = {
    default: "bg-primary text-white",
    outline: "border border-primary/20 text-primary bg-primary/5"
  };
  return (
    <div className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest transition-colors ${variants[variant] || variants.default} ${className}`}>
      {children}
    </div>
  );
}
