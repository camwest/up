"use client";

import Link from "next/link";

export function Hero() {
  return (
    <div className="flex flex-col gap-6 items-center text-center px-4 w-full max-w-lg">
      <div className="flex flex-col gap-3">
        <h1 className="text-5xl lg:text-7xl font-display font-bold text-primary text-shadow-neon">
          Signal Up
        </h1>
        <p className="text-lg lg:text-xl font-body text-muted-foreground leading-relaxed">
          Find your friends in any crowd
        </p>
      </div>

      <Link
        href="/create"
        className="font-headline font-bold border border-foreground/20 bg-glass backdrop-blur text-foreground px-10 py-4 uppercase tracking-wide text-xl active:translate-y-0.5 transition-transform hover:bg-foreground/10"
      >
        Signal Up Now
      </Link>
    </div>
  );
}
