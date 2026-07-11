
"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Wrench, Clock, ShieldAlert, Headset, ArrowRight, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/**
 * @fileOverview Public maintenance page for STSCloud.
 */

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />
      
      <div className="relative z-10 flex flex-col items-center text-center space-y-10 max-w-2xl">
        <div className="space-y-6">
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-24 h-24 rounded-3xl overflow-hidden flex items-center justify-center shadow-2xl">
                <Image src="/img/icons.png" alt="STSCloud" width={96} height={96} className="object-cover" />
              </div>
              <div className="absolute -bottom-2 -right-2 size-8 rounded-full bg-primary flex items-center justify-center text-white border-4 border-background animate-pulse">
                <Wrench className="size-4" />
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 gap-2 px-3 py-1.5 uppercase tracking-widest text-[10px] font-bold">
              <ShieldAlert className="size-3 animate-pulse" /> Scheduled Optimization
            </Badge>
            <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tight">System Under <br /> <span className="text-primary italic">Maintenance</span></h1>
            <p className="text-muted-foreground text-sm md:text-base font-medium leading-relaxed max-w-lg mx-auto">
              We're currently upgrading our core infrastructure to provide even lower latency for your cloud projects. We'll be back shortly.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md">
           <div className="p-6 rounded-2xl bg-secondary/30 border border-border/50 text-left space-y-2">
              <Clock className="size-5 text-primary" />
              <div className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Estimated Time</div>
              <p className="text-sm font-bold">~ 30 Minutes</p>
           </div>
           <div className="p-6 rounded-2xl bg-secondary/30 border border-border/50 text-left space-y-2">
              <ShieldAlert className="size-5 text-accent" />
              <div className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Server Status</div>
              <p className="text-sm font-bold">Data Protected</p>
           </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-md pt-4">
           <Button asChild className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-widest text-[10px] gap-2">
              <Link href="/support">
                 <Headset className="size-4" /> Open Support Ticket
              </Link>
           </Button>
           <Button asChild variant="outline" className="w-full h-12 border-border/50 bg-secondary/20 font-bold uppercase tracking-widest text-[10px] gap-2">
              <Link href="https://wa.me/628123456789" target="_blank">
                 <MessageSquare className="size-4" /> WhatsApp Support
              </Link>
           </Button>
        </div>

        <div className="pt-12 border-t border-border/30 w-full opacity-40">
          <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-muted-foreground">
            &copy; {new Date().getFullYear()} STSCloud Infrastructure &bull; StarVale Technology Solution
          </p>
        </div>
      </div>
    </div>
  );
}
