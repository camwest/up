import Link from "next/link";

interface PatternPageProps {
  params: {
    pattern: string;
  };
}

export default function PatternDisplay({ params }: PatternPageProps) {
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
            Pattern Display
          </h1>
          
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
            <p className="text-sm text-muted-foreground mb-2">Pattern ID:</p>
            <code className="text-primary font-mono bg-primary/10 px-2 py-1 rounded">
              {params.pattern}
            </code>
          </div>
          
          <p className="text-muted-foreground">
            Pattern display coming soon! This will show a full-screen flashing pattern 
            that your friends can spot in a crowd.
          </p>

          <div className="bg-accent/10 border border-accent/30 rounded-lg p-4">
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