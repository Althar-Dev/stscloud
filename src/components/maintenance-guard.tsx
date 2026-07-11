
"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { useFirestore, useUser } from "@/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { AlertCircle, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";

/**
 * @fileOverview Guard component to detect global maintenance mode and restrict access.
 * Allows developers to bypass maintenance for testing.
 */

export function MaintenanceGuard({ children }: { children: React.ReactNode }) {
  const db = useFirestore();
  const { user } = useUser();
  const pathname = usePathname();
  const router = useRouter();
  const [maintenanceActive, setMaintenanceActive] = React.useState(false);
  const [isDev, setIsDev] = React.useState(false);

  React.useEffect(() => {
    // 1. Listen for global maintenance flag
    const unsubConfig = onSnapshot(doc(db, "main", "settings"), (docSnap) => {
      if (docSnap.exists()) {
        const active = docSnap.data().maintenance || false;
        setMaintenanceActive(active);
      }
    });

    // 2. Check if current user is dev
    let unsubUser = () => {};
    if (user?.uid) {
      unsubUser = onSnapshot(doc(db, "users", user.uid), (docSnap) => {
        if (docSnap.exists()) {
          setIsDev(docSnap.data().dev === true);
        }
      });
    }

    return () => {
      unsubConfig();
      unsubUser();
    };
  }, [db, user]);

  React.useEffect(() => {
    // Redirect logic:
    // Skip if maintenance is not active.
    // Skip if path is /maintenance (avoid infinite loops).
    // Skip if path is /dev or /auth (essential paths).
    // Skip if user is dev.
    
    if (maintenanceActive && !isDev) {
      const exemptPaths = ["/maintenance", "/auth", "/dev", "/api"];
      const isExempt = exemptPaths.some(p => pathname.startsWith(p));
      
      if (!isExempt) {
        router.replace("/maintenance");
      }
    }
  }, [maintenanceActive, isDev, pathname, router]);

  // Visual indicator for devs when maintenance is ON
  const showDevWarning = maintenanceActive && isDev && !pathname.startsWith("/maintenance");

  return (
    <>
      {showDevWarning && (
        <div className="fixed top-0 left-0 w-full z-[100] bg-primary text-white text-[10px] font-bold uppercase tracking-[0.2em] py-1.5 flex items-center justify-center gap-4 shadow-xl px-4 text-center">
           <ShieldAlert className="size-3 shrink-0" />
           <span>MAINTENANCE MODE ACTIVE &bull; DEV ACCESS BYPASS ENABLED</span>
           <Badge variant="outline" className="text-white border-white/40 h-5 hidden sm:flex">Bypass</Badge>
        </div>
      )}
      <div className={showDevWarning ? "pt-8" : ""}>
        {children}
      </div>
    </>
  );
}
