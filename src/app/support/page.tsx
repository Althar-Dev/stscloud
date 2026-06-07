
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
  User,
  Settings as SettingsIcon,
  LogOut,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useUser, useAuth, useFirestore } from "@/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { doc, onSnapshot } from "firebase/firestore";

const faqs = [
  {
    question: "How do I deploy a new server?",
    answer: "You can deploy a new server by clicking the 'New Server' button on your dashboard. Follow the step-by-step configuration wizard to choose your environment, resources, and runtime."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We currently support various local payment methods including Virtual Accounts, E-Wallets, and Credit Cards for all hosting plans."
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
  const { user } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const [profile, setProfile] = React.useState<any>(null);
  
  const [submitted, setSubmitted] = React.useState(false);

  React.useEffect(() => {
    if (!user?.uid) return;
    const unsub = onSnapshot(doc(db, "users", user.uid), (doc) => {
      if (doc.exists()) {
        setProfile(doc.data());
      }
    });
    return () => unsub();
  }, [user, db]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/auth?type=login");
  };

  const displayName = profile?.displayName || user?.displayName || user?.email?.split('@')[0] || "User Account";
  const userInitial = displayName.charAt(0).toUpperCase();

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
          <h1 className="font-headline font-semibold text-lg hidden sm:block">Support Center</h1>
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
                <SettingsIcon className="size-4" /> Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive" onClick={handleSignOut}>
                <LogOut className="size-4" /> Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-12">
        {/* Hero Section */}
        <section className="text-center space-y-4 py-8">
          <h2 className="text-3xl md:text-5xl font-headline font-bold">How can we help?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Find answers to common questions or reach out to our dedicated support team for assistance.
          </p>
        </section>

        {/* Support Categories */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-card border-border/50 hover:bg-secondary/20 transition-all cursor-pointer group">
            <CardContent className="p-6 space-y-4">
              <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                < Book className="size-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-headline font-bold text-lg">Knowledge Base</h3>
                <p className="text-sm text-muted-foreground">Detailed guides and documentation for all our services.</p>
              </div>
              <Button variant="ghost" className="w-full justify-between p-0 hover:bg-transparent text-primary">
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
                <p className="text-sm text-muted-foreground">Manage your invoices, payments, and subscription plans.</p>
              </div>
              <Button variant="ghost" className="w-full justify-between p-0 hover:bg-transparent text-accent">
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
                <p className="text-sm text-muted-foreground">Join our Discord server and connect with other users.</p>
              </div>
              <Button variant="ghost" className="w-full justify-between p-0 hover:bg-transparent text-green-500">
                Join Discord <ChevronRight className="size-4" />
              </Button>
            </CardContent>
          </Card>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* FAQ Section */}
          <section className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-headline font-bold">Frequently Asked Questions</h2>
              <p className="text-sm text-muted-foreground">Quick answers to the most common inquiries.</p>
            </div>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border-border/50">
                  <AccordionTrigger className="font-medium hover:text-primary transition-colors">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>

          {/* Contact Form */}
          <section className="space-y-6">
            <Card className="border-border/50 bg-card">
              <CardHeader>
                <CardTitle className="font-headline">Open a Ticket</CardTitle>
                <CardDescription>
                  Need more specific help? Send a message to our support team.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {submitted ? (
                  <div className="text-center py-8 space-y-4 animate-in fade-in zoom-in-95">
                    <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary">
                      <ShieldCheck className="size-8" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-headline font-bold text-xl">Ticket Submitted!</h3>
                      <p className="text-sm text-muted-foreground">
                        We've received your request and will get back to you within 24 hours.
                      </p>
                    </div>
                    <Button variant="outline" onClick={() => setSubmitted(false)}>
                      Send another message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Name</label>
                        <Input placeholder="John Doe" required className="bg-secondary/30 border-none" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Email</label>
                        <Input type="email" placeholder="john@example.com" required className="bg-secondary/30 border-none" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Subject</label>
                      <Input placeholder="Technical Issue" required className="bg-secondary/30 border-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Message</label>
                      <Textarea placeholder="Describe your problem in detail..." required className="bg-secondary/30 border-none min-h-[120px]" />
                    </div>
                    <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white h-11 gap-2">
                      <Send className="size-4" /> Submit Ticket
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </div>
  );
}
