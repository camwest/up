"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { parsePatternName } from "@/lib/patterns";
import { PatternPreview, PatternInfo } from "@/components/pattern-preview";
import { ShareButton } from "@/components/share-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, AlertCircle } from "lucide-react";

interface PatternDisplayContentProps {
  patternName: string;
}

export function PatternDisplayContent({ patternName }: PatternDisplayContentProps) {
  const [showControls, setShowControls] = useState(true); // Show controls initially
  const [showInstructions, setShowInstructions] = useState(true); // Show "hold up high" initially
  const [showStrobeWarning, setShowStrobeWarning] = useState(false);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Parse the pattern from the URL
  const pattern = parsePatternName(patternName);
  const error = pattern ? null : `Invalid pattern name: ${patternName}`;

  // Screen Wake Lock - prevent screen timeout during pattern display
  useEffect(() => {
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

    // Cleanup on unmount
    return () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release();
        wakeLockRef.current = null;
      }
    };
  }, []);

  // Auto-fade controls and instructions
  useEffect(() => {
    // Fade out instructions after 3 seconds
    const instructionsTimer = setTimeout(() => {
      setShowInstructions(false);
    }, 3000);

    // Fade out controls after 5 seconds
    const controlsTimer = setTimeout(() => {
      setShowControls(false);
    }, 5000);

    return () => {
      clearTimeout(instructionsTimer);
      clearTimeout(controlsTimer);
    };
  }, []);

  // Reset auto-fade timer when user interacts
  const resetControlsTimer = () => {
    setShowControls(true);
    
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000); // Fade out after 3 seconds of inactivity
  };

  // Handle tap to show controls
  const handleContainerTap = () => {
    resetControlsTimer();
  };

  // Handle strobe warning if needed
  const handleStrobeWarningAccept = () => {
    setShowStrobeWarning(false);
  };

  const handleStrobeWarningCancel = () => {
    setShowStrobeWarning(false);
    // Exit to home since we don't have a non-fullscreen state
    window.location.href = '/';
  };

  // Check for strobe warning on mount
  useEffect(() => {
    if (pattern?.animation === 'strobe') {
      setShowStrobeWarning(true);
    }
  }, [pattern]);

  // Strobe Warning Dialog
  if (showStrobeWarning && pattern) {
    return (
      <main className="min-h-screen bg-background text-foreground flex flex-col">
        <nav className="w-full border-b border-border">
          <div className="max-w-4xl mx-auto flex justify-between items-center p-3">
            <Link href="/" className="font-display font-bold text-lg text-primary text-shadow-neon">
              Signal Up
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
          <div className="max-w-4xl mx-auto flex justify-between items-center p-3">
            <Link href="/" className="font-display font-bold text-lg text-primary text-shadow-neon">
              Signal Up
            </Link>
          </div>
        </nav>

        <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
          <div className="max-w-md text-center space-y-6">
            <div className="flex items-center justify-center mb-4">
              <AlertCircle className="w-12 h-12 text-destructive" />
            </div>
            
            <h1 className="text-3xl font-headline font-bold text-foreground">
              Signal Not Found
            </h1>
            
            <div className="bg-destructive/10 border border-destructive/30 rounded-sm p-4">
              <p className="text-sm font-body text-muted-foreground mb-2">Invalid Signal:</p>
              <code className="text-destructive font-mono bg-destructive/10 px-2 py-1 rounded-sm break-all">
                {patternName}
              </code>
            </div>
            
            <p className="font-body text-muted-foreground">
              This signal link is invalid. Ask your friend to generate a new signal.
            </p>

            <div className="flex gap-2">
              <Button asChild variant="outline" className="font-headline">
                <Link href="/create">
                  New Signal
                </Link>
              </Button>
              <Button asChild className="font-headline">
                <Link href="/">
                  <Home className="w-4 h-4 mr-2" />
                  Signal Up
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main 
      className="min-h-screen relative overflow-hidden cursor-pointer" 
      onClick={handleContainerTap}
    >
      {/* Fullscreen Pattern Background */}
      <div className="absolute inset-0 z-0">
        <PatternPreview 
          pattern={pattern}
          className="w-full h-full"
          fullscreen
          hideInstructions
        />
      </div>
      
      {/* Floating Controls with Fade Animation */}
      {showControls && (
        <div className="absolute inset-0 z-10 transition-opacity duration-500 opacity-100">
        
        {/* Dark Overlay for Readability */}
        <div className="absolute inset-0 bg-background/60" />
        
        <div className="relative z-20 min-h-screen flex flex-col">
          {/* Top Navigation */}
          <div className="flex items-center justify-between p-4">
            <Button variant="outline" asChild className="font-headline bg-background/90 backdrop-blur-sm">
              <Link href="/create">
                New Signal
              </Link>
            </Button>
            
            <ShareButton
              patternUrl={typeof window !== 'undefined' ? window.location.href : ''}
              patternName={patternName.toUpperCase()}
              variant="secondary"
              className="text-foreground hover:text-foreground bg-background/80 backdrop-blur-sm"
            />
          </div>
          
        </div>
        </div>
      )}

      {/* Instructions Overlay with Fade Animation */}
      <div 
        className={`absolute inset-0 z-15 flex items-end justify-center pb-20 pointer-events-none transition-opacity duration-1000 ${
          showInstructions ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="bg-background/90 backdrop-blur-sm rounded-sm border px-4 py-2">
          <p className="text-sm font-body text-foreground text-center">
            Hold phone up high ↑
          </p>
        </div>
      </div>
    </main>
  );
}