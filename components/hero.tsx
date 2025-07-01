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
        className="font-headline font-bold bg-primary text-primary-foreground px-10 py-4 shadow-neon uppercase tracking-wide text-xl active:translate-y-0.5 transition-transform hover:bg-primary/90"
      >
        Signal Up Now
      </Link>
    </div>
  );
}
