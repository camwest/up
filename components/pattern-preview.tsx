"use client";

import { Pattern, getAnimationDuration } from "@/lib/patterns";
import { useEffect, useState } from "react";

interface PatternPreviewProps {
  pattern: Pattern;
  className?: string;
  fullscreen?: boolean;
  onExit?: () => void;
}

export function PatternPreview({ pattern, className = "", fullscreen = false, onExit }: PatternPreviewProps) {
  const [mounted, setMounted] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);
  const [batteryOptimized, setBatteryOptimized] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-hide overlay in fullscreen mode
  useEffect(() => {
    if (fullscreen && showOverlay) {
      const timer = setTimeout(() => {
        setShowOverlay(false);
      }, 3000); // Hide after 3 seconds

      return () => clearTimeout(timer);
    }
  }, [fullscreen, showOverlay]);

  // Battery optimization - reduce animation intensity when battery is low
  useEffect(() => {
    if (!fullscreen) return;

    const checkBatteryOptimization = async () => {
      try {
        // Check battery level (if supported)
        if ('getBattery' in navigator) {
          const battery = await (navigator as Navigator & { getBattery(): Promise<{ level: number; charging: boolean }> }).getBattery();
          if (battery.level < 0.2 && !battery.charging) {
            setBatteryOptimized(true);
          }
        }
      } catch {
        // Battery API not supported, continue normally
      }
    };

    // Check page visibility to pause animations when tab is hidden
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setBatteryOptimized(true);
      } else {
        setBatteryOptimized(false);
        checkBatteryOptimization();
      }
    };

    checkBatteryOptimization();
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fullscreen]);

  // Handle tap to show/hide overlay in fullscreen
  const handleContainerClick = () => {
    if (fullscreen) {
      setShowOverlay(!showOverlay);
    }
  };

  if (!mounted) {
    return (
      <div className={`bg-background border border-border rounded-lg ${className}`}>
        <div className="flex items-center justify-center h-full text-muted-foreground">
          Loading pattern...
        </div>
      </div>
    );
  }

  const duration = getAnimationDuration(pattern.speed);
  
  // Apply battery optimization by reducing animation speed or disabling for strobe
  const optimizedDuration = batteryOptimized ? duration * 2 : duration; // Slower when battery optimized
  const animationClass = batteryOptimized && pattern.animation === 'strobe' 
    ? 'animate-pulse8' // Switch strobe to pulse to save battery
    : `animate-${pattern.animation}8`;
  
  const containerClass = fullscreen 
    ? "fixed inset-0 pattern-display"
    : `relative overflow-hidden rounded-lg border border-border ${className}`;

  const primaryStyle = {
    backgroundColor: `#${pattern.primary}`,
    animationDuration: `${optimizedDuration}ms`
  };

  const secondaryStyle = pattern.secondary ? {
    backgroundColor: `#${pattern.secondary}`,
    animationDuration: `${optimizedDuration * 1.2}ms` // Slightly offset for visual interest
  } : undefined;

  return (
    <div 
      className={containerClass}
      onClick={handleContainerClick}
    >
      {/* Primary color layer */}
      <div 
        className={`absolute inset-0 pattern-layer ${animationClass}`}
        style={primaryStyle}
      />
      
      {/* Secondary color layer (if present) */}
      {pattern.secondary && secondaryStyle && (
        <div 
          className={`absolute inset-0 pattern-layer ${animationClass} opacity-40`}
          style={{
            ...secondaryStyle,
            animationDelay: `${optimizedDuration * 0.5}ms` // Offset timing
          }}
        />
      )}
      
      {/* Overlay content for non-fullscreen */}
      {!fullscreen && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-black/50 backdrop-blur-sm rounded px-3 py-1">
            <span className="text-white text-sm font-mono">
              {pattern.animation.toUpperCase()} • {pattern.speed}x
            </span>
          </div>
        </div>
      )}
      
      {/* Fullscreen overlay with auto-hide */}
      {fullscreen && showOverlay && (
        <>
          {/* Exit button */}
          {onExit && (
            <button
              onClick={onExit}
              className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm text-white p-2 rounded-lg hover:bg-black/80 transition-colors z-10"
            >
              ←
            </button>
          )}
          
          {/* Instructions */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 transition-opacity duration-500">
            <div className="bg-black/70 backdrop-blur-sm rounded-lg px-4 py-2 text-center">
              <p className="text-white text-sm font-medium mb-1">
                Hold phone up high ↑
              </p>
              <p className="text-white/70 text-xs">
                Your friends are looking for this pattern
              </p>
              <p className="text-white/50 text-xs mt-1">
                Tap to show/hide controls
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

interface PatternInfoProps {
  pattern: Pattern;
  patternName: string;
}

export function PatternInfo({ pattern, patternName }: PatternInfoProps) {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-primary mb-2">
          {patternName}
        </h2>
        <p className="text-muted-foreground">
          {pattern.animation.charAt(0).toUpperCase() + pattern.animation.slice(1)} pattern at speed {pattern.speed}
        </p>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div 
              className="w-4 h-4 rounded border border-border"
              style={{ backgroundColor: `#${pattern.primary}` }}
            />
            <span className="text-foreground">Primary</span>
          </div>
          <code className="text-xs text-primary bg-primary/10 px-2 py-1 rounded">
            #{pattern.primary}
          </code>
        </div>
        
        {pattern.secondary && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded border border-border"
                style={{ backgroundColor: `#${pattern.secondary}` }}
              />
              <span className="text-foreground">Secondary</span>
            </div>
            <code className="text-xs text-accent bg-accent/10 px-2 py-1 rounded">
              #{pattern.secondary}
            </code>
          </div>
        )}
      </div>
    </div>
  );
}