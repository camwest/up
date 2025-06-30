import Link from "next/link";

export default function CreatePattern() {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">
      <nav className="w-full border-b border-border">
        <div className="max-w-4xl mx-auto flex justify-between items-center p-4">
          <Link href="/" className="font-bold text-lg text-primary">
            Concert Finder
          </Link>
        </div>
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="max-w-md text-center space-y-6">
          <h1 className="text-3xl font-bold text-primary">
            Create Your Pattern
          </h1>
          
          <p className="text-muted-foreground">
            Pattern creation coming soon! This will generate a unique flashing pattern 
            based on your location and create a shareable link.
          </p>

          <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">
              🚧 Under construction - Phase 2 feature
            </p>
          </div>

          <Link
            href="/"
            className="inline-block bg-primary/20 hover:bg-primary/30 text-primary font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}