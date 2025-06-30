"use client";

import { Pattern, getAnimationDuration } from "@/lib/patterns";
import { useEffect, useState } from "react";

interface PatternPreviewProps {
  pattern: Pattern;
  className?: string;
  fullscreen?: boolean;
}

export function PatternPreview({ pattern, className = "", fullscreen = false }: PatternPreviewProps) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

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
  const animationClass = `animate-${pattern.animation}8`;
  
  const containerClass = fullscreen 
    ? "fixed inset-0 pattern-display"
    : `relative overflow-hidden rounded-lg border border-border ${className}`;

  const primaryStyle = {
    backgroundColor: `#${pattern.primary}`,
    animationDuration: `${duration}ms`
  };

  const secondaryStyle = pattern.secondary ? {
    backgroundColor: `#${pattern.secondary}`,
    animationDuration: `${duration * 1.2}ms` // Slightly offset for visual interest
  } : undefined;

  return (
    <div className={containerClass}>
      {/* Primary color layer */}
      <div 
        className={`absolute inset-0 ${animationClass}`}
        style={primaryStyle}
      />
      
      {/* Secondary color layer (if present) */}
      {pattern.secondary && secondaryStyle && (
        <div 
          className={`absolute inset-0 ${animationClass} opacity-40`}
          style={{
            ...secondaryStyle,
            animationDelay: `${duration * 0.5}ms` // Offset timing
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
      
      {/* Fullscreen instructions */}
      {fullscreen && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="bg-black/70 backdrop-blur-sm rounded-lg px-4 py-2 text-center">
            <p className="text-white text-sm font-medium mb-1">
              Hold phone up high ↑
            </p>
            <p className="text-white/70 text-xs">
              Your friends are looking for this pattern
            </p>
          </div>
        </div>
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