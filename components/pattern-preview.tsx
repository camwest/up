"use client";

import { Pattern, getAnimationDuration } from "@/lib/patterns";

// Helper function to find color name from hex (reusing logic from patterns.ts)
function findColorName(hex: string): string {
  const COLOR_PALETTE = {
    'NEON': { h: 329, s: 100, l: 50 },
    'VOLT': { h: 335, s: 100, l: 45 },
    'FIRE': { h: 320, s: 100, l: 55 },
    'TRON': { h: 186, s: 100, l: 50 },
    'AQUA': { h: 180, s: 100, l: 45 },
    'SYNC': { h: 190, s: 100, l: 55 },
    'ACID': { h: 79, s: 100, l: 53 },
    'BEAM': { h: 75, s: 100, l: 48 },
    'BUZZ': { h: 85, s: 100, l: 58 },
    'GOLD': { h: 45, s: 100, l: 50 },
    'VOID': { h: 271, s: 100, l: 50 }
  } as const;

  const { h } = hexToHsl(hex);
  
  let closestName = 'NEON';
  let closestDistance = Infinity;
  
  for (const [name, color] of Object.entries(COLOR_PALETTE)) {
    const distance = Math.abs(h - color.h);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestName = name;
    }
  }
  
  return closestName;
}

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  
  return { h: h * 360, s: s * 100, l: l * 100 };
}
import { useEffect, useState } from "react";

interface PatternPreviewProps {
  pattern: Pattern;
  className?: string;
  fullscreen?: boolean;
  onExit?: () => void;
  hideInstructions?: boolean;
}

export function PatternPreview({ pattern, className = "", fullscreen = false, onExit, hideInstructions = false }: PatternPreviewProps) {
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
      <div className={`bg-background border border-border rounded-sm ${className}`}>
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
    : `relative overflow-hidden rounded-sm border border-border ${className}`;

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
      
      
      {/* Fullscreen overlay with auto-hide */}
      {fullscreen && showOverlay && (
        <>
          {/* Exit button */}
          {onExit && (
            <button
              onClick={onExit}
              className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm text-white p-2 rounded-sm hover:bg-black/80 transition-colors z-10"
            >
              ←
            </button>
          )}
          
          {/* Instructions */}
          {!hideInstructions && (
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 transition-opacity duration-500">
              <div className="bg-black/70 backdrop-blur-sm rounded-sm px-4 py-2 text-center">
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
          )}
        </>
      )}
    </div>
  );
}

interface PatternInfoProps {
  pattern: Pattern;
  patternName: string;
}

export function PatternInfo({ pattern }: PatternInfoProps) {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-muted-foreground">
          {pattern.animation.charAt(0).toUpperCase() + pattern.animation.slice(1)} pattern at speed {pattern.speed}
        </p>
      </div>
      
      <div className="flex items-center justify-center gap-6">
        <div className="flex items-center gap-2">
          <div 
            className="w-4 h-4 border border-border"
            style={{ backgroundColor: `#${pattern.primary}` }}
          />
          <span className="text-foreground">{findColorName(pattern.primary)}</span>
        </div>
        
        {pattern.secondary && (
          <div className="flex items-center gap-2">
            <div 
              className="w-4 h-4 border border-border"
              style={{ backgroundColor: `#${pattern.secondary}` }}
            />
            <span className="text-foreground">{findColorName(pattern.secondary)}</span>
          </div>
        )}
      </div>
    </div>
  );
}