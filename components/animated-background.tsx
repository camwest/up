"use client";

export function AnimatedBackground() {

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-background">
      {/* Debug: Red background to verify rendering */}
      
      {/* Subtle grid pattern */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 0, 140, 0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 0, 140, 0.5) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />
      
      {/* Animated signal hints - floating orbs */}
      <div className="absolute inset-0 w-full h-full">
        {/* Primary signal hint */}
        <div 
          className="absolute w-3 h-3 bg-primary/40 rounded-full animate-pulse8"
          style={{
            top: '20%',
            left: '15%',
            animationDuration: '1200ms',
            animationDelay: '0ms'
          }}
        />
        
        {/* Secondary signal hints */}
        <div 
          className="absolute w-2 h-2 bg-cyan/50 rounded-full animate-pulse8"
          style={{
            top: '40%',
            right: '20%',
            animationDuration: '1000ms',
            animationDelay: '400ms'
          }}
        />
        
        <div 
          className="absolute w-2.5 h-2.5 bg-lime/40 rounded-full animate-pulse8"
          style={{
            top: '70%',
            left: '25%',
            animationDuration: '1400ms',
            animationDelay: '800ms'
          }}
        />
        
        <div 
          className="absolute w-2 h-2 bg-violet/30 rounded-full animate-pulse8"
          style={{
            top: '60%',
            right: '30%',
            animationDuration: '1100ms',
            animationDelay: '1200ms'
          }}
        />
        
        <div 
          className="absolute w-2.5 h-2.5 bg-amber/50 rounded-full animate-pulse8"
          style={{
            top: '25%',
            right: '40%',
            animationDuration: '1300ms',
            animationDelay: '300ms'
          }}
        />
      </div>
      
      {/* Subtle gradient overlay for depth */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/10"
      />
    </div>
  );
}