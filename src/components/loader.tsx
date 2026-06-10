
"use client";

import Image from "next/image";
import * as React from "react";

/**
 * @fileOverview A branded loading component for STSCloud.
 * Features the app icon and a simulated progress bar for a premium feel.
 */

export function Loader() {
  const [loadingProgress, setLoadingProgress] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) return 100;
        return prev + 2;
      });
    }, 25);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 sm:p-8">
      <div className="w-full max-w-[160px] sm:max-w-[240px] flex flex-col items-center animate-in fade-in duration-700">
        <div className="relative w-full aspect-square mb-2">
          <Image 
            src="/img/icon.png" 
            alt="STSCloud" 
            fill 
            className="object-contain grayscale opacity-60" 
            priority
          />
        </div>
        <div className="w-full">
          <div className="h-[4px] w-full bg-secondary overflow-hidden rounded-full">
            <div 
              className="h-full bg-primary transition-all duration-300 ease-out" 
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
