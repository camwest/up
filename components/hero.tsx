"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function Hero() {
  const [mounted, setMounted] = useState(false);
  const [glowIntensity, setGlowIntensity] = useState(0.6);

  useEffect(() => {
    setMounted(true);
    
    // Subtle glow animation for main title
    const interval = setInterval(() => {
      setGlowIntensity(prev => prev >= 1 ? 0.6 : prev + 0.02);
    }, 100);

    return () => clearInterval(interval);
  }, []);

  if (!mounted) {
    return (
      <div className="flex flex-col gap-4 items-center text-center px-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl lg:text-6xl font-display font-bold text-primary">
            Signal Up
          </h1>
          <h2 className="text-xl lg:text-2xl font-headline font-semibold text-foreground">
            Put your signal up ↑
          </h2>
        </div>
        
        <p className="text-base lg:text-lg font-body text-muted-foreground max-w-2xl leading-relaxed">
          Unique flashing patterns to find your friends in any crowd. 
          No app required.
        </p>

        <div className="flex flex-col gap-3 w-full max-w-md">
          <Link
            href="/create"
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-headline font-bold py-3 px-6 text-lg rounded-sm transition-all duration-200 hover:scale-105 active:scale-95 uppercase tracking-wide"
          >
            Signal Up Now
          </Link>
          
          <p className="text-sm font-body text-muted-foreground">
            Hold phone up high ↑
          </p>
        </div>

        <div className="w-full max-w-md h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent my-2" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 items-center text-center px-4 w-full max-w-lg">
      <div className="flex flex-col gap-3">
        <h1 
          className="text-5xl lg:text-7xl font-display font-bold text-primary text-shadow-neon"
          style={{
            textShadow: `0 0 ${12 * glowIntensity}px currentColor, 0 0 ${24 * glowIntensity}px currentColor`,
          }}
        >
          Signal Up
        </h1>
        <p className="text-lg lg:text-xl font-body text-muted-foreground leading-relaxed">
          Find your friends in any crowd
        </p>
      </div>

      <Link
        href="/create"
        className="group bg-primary hover:bg-primary/90 text-primary-foreground font-headline font-bold py-4 px-10 text-xl rounded-sm transition-all duration-200 hover:scale-105 active:scale-95 shadow-neon uppercase tracking-wide relative overflow-hidden"
      >
        <span className="relative z-10">Signal Up Now</span>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
      </Link>
    </div>
  );
}
