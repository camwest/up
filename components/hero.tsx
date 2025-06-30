import Link from "next/link";

export function Hero() {
  return (
    <div className="flex flex-col gap-8 items-center text-center px-4">
      <div className="flex flex-col gap-4">
        <h1 className="text-4xl lg:text-6xl font-bold text-primary text-shadow-neon">
          Concert Finder
        </h1>
        <h2 className="text-2xl lg:text-3xl font-semibold text-foreground">
          Find Your Friends in the Crowd
        </h2>
      </div>
      
      <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl leading-relaxed">
        Generate a unique flashing pattern and send the link to your friends. 
        No app install required.
      </p>

      <div className="flex flex-col gap-4 w-full max-w-md">
        <Link
          href="/create"
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 px-8 text-xl rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 shadow-neon"
        >
          Create Pattern to Share
        </Link>
        
        <p className="text-sm text-muted-foreground">
          Hold your phone up high so friends can spot your pattern
        </p>
      </div>

      <div className="w-full max-w-md h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent my-4" />
    </div>
  );
}
