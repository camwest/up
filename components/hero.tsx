import Link from "next/link";

export function Hero() {
  return (
    <div className="flex flex-col gap-4 items-center text-center px-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl lg:text-6xl font-display font-bold text-primary text-shadow-neon">
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
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-headline font-bold py-3 px-6 text-lg rounded-sm transition-all duration-200 hover:scale-105 active:scale-95 shadow-neon uppercase tracking-wide"
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
