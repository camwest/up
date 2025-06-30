"use client";

import Link from "next/link";
import { useState, use } from "react";
import { parsePatternName, type Pattern } from "@/lib/patterns";
import { PatternPreview, PatternInfo } from "@/components/pattern-preview";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Home, AlertCircle } from "lucide-react";

interface PatternPageProps {
  params: Promise<{
    pattern: string;
  }>;
}

export default function PatternDisplay({ params }: PatternPageProps) {
  const resolvedParams = use(params);
  const patternName = resolvedParams.pattern;
  
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Parse the pattern from the URL
  const pattern = parsePatternName(patternName);
  const error = pattern ? null : `Invalid pattern name: ${patternName}`;

  if (error || !pattern) {
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
            <div className="flex items-center justify-center mb-4">
              <AlertCircle className="w-12 h-12 text-destructive" />
            </div>
            
            <h1 className="text-3xl font-bold text-foreground">
              Pattern Not Found
            </h1>
            
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-6">
              <p className="text-sm text-muted-foreground mb-2">Invalid Pattern:</p>
              <code className="text-destructive font-mono bg-destructive/10 px-2 py-1 rounded break-all">
                {patternName}
              </code>
            </div>
            
            <p className="text-muted-foreground">
              This pattern link is invalid or malformed. Ask your friend to generate a new pattern.
            </p>

            <div className="flex gap-2">
              <Button asChild variant="outline">
                <Link href="/create">
                  Create New Pattern
                </Link>
              </Button>
              <Button asChild>
                <Link href="/">
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (isFullscreen) {
    return (
      <div className="relative">
        <PatternPreview pattern={pattern} fullscreen />
        
        {/* Exit fullscreen button */}
        <button
          onClick={() => setIsFullscreen(false)}
          className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm text-white p-2 rounded-lg hover:bg-black/80 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">
      <nav className="w-full border-b border-border">
        <div className="max-w-4xl mx-auto flex justify-between items-center p-4">
          <Link href="/" className="font-bold text-lg text-primary">
            Concert Finder
          </Link>
        </div>
      </nav>

      <div className="flex-1 flex flex-col items-center px-4 py-8">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-primary mb-2">
              {patternName.toUpperCase()}
            </h1>
            <p className="text-muted-foreground">
              Hold your phone up so friends can find you
            </p>
          </div>

          {/* Pattern Preview Card */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <PatternPreview 
                pattern={pattern} 
                className="h-48"
              />
              <PatternInfo 
                pattern={pattern}
                patternName={patternName.toUpperCase()}
              />
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              onClick={() => setIsFullscreen(true)}
              className="w-full h-12 text-lg"
              size="lg"
            >
              Display Pattern Full Screen
            </Button>
            
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" asChild>
                <Link href="/create">
                  Create New Pattern
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/">
                  <Home className="w-4 h-4 mr-1" />
                  Home
                </Link>
              </Button>
            </div>
          </div>

          <div className="text-center text-xs text-muted-foreground">
            Share this link: <br />
            <code className="text-primary">
              {typeof window !== 'undefined' ? window.location.href : ''}
            </code>
          </div>
        </div>
      </div>
    </main>
  );
}