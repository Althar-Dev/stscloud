"use client";

import Link from "next/link";
import Image from "next/image";
import { MoveLeft, Home, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * @fileOverview Custom 404 Error Page for STSCloud.
 * Designed with the platform's signature futuristic dark theme.
 */

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorative Element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="relative z-10 flex flex-col items-center text-center space-y-8 max-w-md">
        <div className="space-y-4">
          <div className="flex justify-center mb-6">
            <Link href="/" className="transition-transform hover:scale-105 active:scale-95">
              <div className="w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center bg-secondary/50 border border-border/50">
                <Image src="/img/icons.png" alt="STSCloud" width={64} height={64} className="object-cover" />
              </div>
            </Link>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-8xl font-headline font-bold tracking-tighter text-primary/20 leading-none">404</h1>
            <h2 className="text-3xl font-headline font-bold text-foreground">Instance Not Found</h2>
            <p className="text-muted-foreground text-sm font-medium leading-relaxed">
              The node you are looking for does not exist or has been decommissioned from our infrastructure.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
          <Button asChild variant="outline" className="w-full border-border/50 bg-secondary/20 h-11 gap-2 font-bold uppercase tracking-widest text-[10px]">
            <Link href="/">
              <MoveLeft className="size-4" /> Back to Safety
            </Link>
          </Button>
          <Button asChild className="w-full bg-primary hover:bg-primary/90 text-white h-11 gap-2 font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20">
            <Link href="/dashboard">
              <Zap className="size-4" /> Dashboard
            </Link>
          </Button>
        </div>

        <div className="pt-8 opacity-40">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
            &copy; 2026 STSCloud Infrastructure
          </p>
        </div>
      </div>
    </div>
  );
}
