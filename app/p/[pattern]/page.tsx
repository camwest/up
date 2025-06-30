"use client";

import Link from "next/link";
import { useState, use, useEffect, useRef } from "react";
import { parsePatternName } from "@/lib/patterns";
import { PatternPreview, PatternInfo } from "@/components/pattern-preview";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, AlertCircle } from "lucide-react";

interface PatternPageProps {
  params: Promise<{
    pattern: string;
  }>;
}

export default function PatternDisplay({ params }: PatternPageProps) {
  const resolvedParams = use(params);
  const patternName = resolvedParams.pattern;
  
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showStrobeWarning, setShowStrobeWarning] = useState(false);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  
  // Parse the pattern from the URL
  const pattern = parsePatternName(patternName);
  const error = pattern ? null : `Invalid pattern name: ${patternName}`;

  // Screen Wake Lock - prevent screen timeout during pattern display
  useEffect(() => {
    if (isFullscreen) {
      const requestWakeLock = async () => {
        try {
          if ('wakeLock' in navigator) {
            wakeLockRef.current = await navigator.wakeLock.request('screen');
            console.log('Screen wake lock activated');
          }
        } catch (error) {
          console.warn('Wake lock failed:', error);
        }
      };
      
      requestWakeLock();
    } else {
      // Release wake lock when exiting fullscreen
      if (wakeLockRef.current) {
        wakeLockRef.current.release();
        wakeLockRef.current = null;
        console.log('Screen wake lock released');
      }
    }

    // Cleanup on unmount
    return () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release();
        wakeLockRef.current = null;
      }
    };
  }, [isFullscreen]);

  // Handle fullscreen activation with strobe warning
  const handleFullscreenRequest = () => {
    if (pattern?.animation === 'strobe') {
      setShowStrobeWarning(true);
    } else {
      setIsFullscreen(true);
    }
  };

  const handleStrobeWarningAccept = () => {
    setShowStrobeWarning(false);
    setIsFullscreen(true);
  };

  const handleStrobeWarningCancel = () => {
    setShowStrobeWarning(false);
  };

  // Strobe Warning Dialog
  if (showStrobeWarning && pattern) {
    return (
      <main className="min-h-screen bg-background text-foreground flex flex-col">
        <nav className="w-full border-b border-border">
          <div className="max-w-4xl mx-auto flex justify-between items-center p-4">
            <Link href="/" className="font-bold text-lg text-primary">
              Concert Finder
            </Link>
          </div>
        </nav>

        <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
          <div className="max-w-md w-full">
            <Card className="border-amber-500 bg-amber-50 dark:bg-amber-950/20">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <AlertCircle className="w-8 h-8 text-amber-600" />
                  <h2 className="text-xl font-bold text-amber-800 dark:text-amber-200">
                    Seizure Warning
                  </h2>
                </div>
                
                <div className="space-y-3 text-sm text-amber-800 dark:text-amber-200">
                  <p className="font-medium">
                    This pattern contains <strong>strobe effects</strong> that flash rapidly at speed {pattern.speed}.
                  </p>
                  
                  <p>
                    Strobe effects may trigger seizures in individuals with photosensitive epilepsy. 
                    Please consider your health conditions before proceeding.
                  </p>
                  
                  <p className="text-xs">
                    If you experience dizziness, nausea, or discomfort, exit immediately.
                  </p>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button 
                    onClick={handleStrobeWarningCancel}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleStrobeWarningAccept}
                    className="flex-1 bg-amber-600 hover:bg-amber-700"
                  >
                    I Understand, Continue
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    );
  }

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
      <PatternPreview 
        pattern={pattern} 
        fullscreen 
        onExit={() => setIsFullscreen(false)}
      />
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
              onClick={handleFullscreenRequest}
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