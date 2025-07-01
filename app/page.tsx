import { Hero } from "@/components/hero";
import { AnimatedBackground } from "@/components/animated-background";

export default function Home() {
  return (
    <>
      <AnimatedBackground />
      <main className="min-h-dvh text-foreground flex items-center justify-center relative z-10">
        <Hero />
      </main>
    </>
  );
}
