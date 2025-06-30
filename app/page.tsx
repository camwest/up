import { Hero } from "@/components/hero";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">
      <nav className="w-full border-b border-border">
        <div className="max-w-4xl mx-auto flex justify-center items-center p-3">
          <Link href="/" className="font-display font-bold text-lg text-primary text-shadow-neon">
            Signal Up
          </Link>
        </div>
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <Hero />
      </div>

      <footer className="border-t border-border py-6">
        <div className="max-w-4xl mx-auto px-3 text-center">
          <p className="text-sm font-body text-muted-foreground">
            Zero friction. Maximum signal. Glow on.
          </p>
        </div>
      </footer>
    </main>
  );
}
