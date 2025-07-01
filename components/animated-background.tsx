"use client";

export function AnimatedBackground() {

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-background">
      {/* Debug: Red background to verify rendering */}
      
      {/* 8-bit grid pattern */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 0, 140, 0.6) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 0, 140, 0.6) 1px, transparent 1px)
          `,
          backgroundSize: '8px 8px',
          imageRendering: 'pixelated',
        }}
      />
      
      {/* Animated signal hints - floating orbs */}
      <div className="absolute inset-0 w-full h-full">
        {/* 8-bit signal pixels */}
        <div 
          className="absolute w-2 h-2 bg-primary/50 animate-pulse8"
          style={{
            top: '20%',
            left: '15%',
            animationDuration: '1200ms',
            animationDelay: '0ms',
            imageRendering: 'pixelated'
          }}
        />
        
        {/* Concert lighting signals */}
        <div 
          className="absolute w-1 h-1 bg-cyan/60 animate-strobe8"
          style={{
            top: '40%',
            right: '20%',
            animationDuration: '140ms',
            animationDelay: '400ms',
            imageRendering: 'pixelated'
          }}
        />
        
        <div 
          className="absolute w-2 h-2 bg-lime/40 animate-pulse8"
          style={{
            top: '70%',
            left: '25%',
            animationDuration: '600ms',
            animationDelay: '800ms',
            imageRendering: 'pixelated'
          }}
        />
        
        <div 
          className="absolute w-1 h-1 bg-violet/30 animate-strobe8"
          style={{
            top: '60%',
            right: '30%',
            animationDuration: '140ms',
            animationDelay: '1200ms',
            imageRendering: 'pixelated'
          }}
        />
        
        <div 
          className="absolute w-2 h-2 bg-amber/50 animate-pulse8"
          style={{
            top: '25%',
            right: '40%',
            animationDuration: '600ms',
            animationDelay: '300ms',
            imageRendering: 'pixelated'
          }}
        />
        
        {/* Additional concert atmosphere signals */}
        <div 
          className="absolute w-1 h-1 bg-magenta/40 animate-strobe8"
          style={{
            top: '10%',
            left: '70%',
            animationDuration: '140ms',
            animationDelay: '600ms',
            imageRendering: 'pixelated'
          }}
        />
        
        <div 
          className="absolute w-2 h-2 bg-cyan/30 animate-pulse8"
          style={{
            top: '80%',
            right: '10%',
            animationDuration: '1200ms',
            animationDelay: '1000ms',
            imageRendering: 'pixelated'
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