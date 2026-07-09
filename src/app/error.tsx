"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * @fileOverview Global Error Boundary for STSCloud.
 * Handles 500 Internal Server Errors gracefully.
 */

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // Log the error to an internal tracking service if needed
    console.error("System Failure:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorative Element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-destructive/5 rounded-full blur-[150px] pointer-events-none" />
      
      <div className="relative z-10 flex flex-col items-center text-center space-y-8 max-w-lg">
        <div className="space-y-6">
          <div className="flex justify-center">
            <div className="size-20 rounded-3xl bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive animate-pulse">
              <ShieldAlert className="size-10" />
            </div>
          </div>
          
          <div className="space-y-3">
            <h1 className="text-4xl font-headline font-bold tracking-tight text-foreground">Critical System Exception</h1>
            <p className="text-muted-foreground text-sm font-medium leading-relaxed max-w-sm mx-auto">
              Our core infrastructure encountered an unexpected error. The security guard has isolated this instance for investigation.
            </p>
          </div>

          {error.digest && (
            <div className="px-4 py-2 rounded-lg bg-secondary/50 border border-border/50 inline-block">
              <code className="text-[10px] font-code text-muted-foreground uppercase tracking-widest">
                Trace ID: {error.digest}
              </code>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md">
          <Button 
            onClick={() => reset()}
            variant="outline" 
            className="w-full border-border/50 bg-secondary/20 h-12 gap-2 font-bold uppercase tracking-widest text-[10px]"
          >
            <RefreshCw className="size-4" /> Attempt Recovery
          </Button>
          <Button asChild className="w-full bg-primary hover:bg-primary/90 text-white h-12 gap-2 font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20">
            <Link href="/dashboard">
              <Home className="size-4" /> Go Dashboard
            </Link>
          </Button>
        </div>

        <div className="pt-12 border-t border-border/30 w-full flex flex-col items-center gap-4">
          <Link href="/" className="opacity-60 hover:opacity-100 transition-opacity">
            <Image src="/img/icons.png" alt="STSCloud" width={32} height={32} />
          </Link>
          <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-muted-foreground/60">
            STSCloud &bull; All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
