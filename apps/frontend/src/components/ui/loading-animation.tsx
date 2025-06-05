import React from 'react';

export function LoadingAnimation() {
  return (
    <div className="fixed inset-0 bg-syntheta-background flex items-center justify-center z-50">
      <div className="relative w-64 h-64">
        {/* Animated nodes */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="relative">
            {/* Center node */}
            <div className="w-12 h-12 rounded-full bg-syntheta-primary animate-pulse" />
            
            {/* Orbiting nodes */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-syntheta-primary/80 animate-[orbit_2s_linear_infinite]" />
            <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-syntheta-primary/80 animate-[orbit_2s_linear_infinite_0.5s]" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-8 h-8 rounded-full bg-syntheta-primary/80 animate-[orbit_2s_linear_infinite_1s]" />
            <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-syntheta-primary/80 animate-[orbit_2s_linear_infinite_1.5s]" />
          </div>
        </div>
        
        {/* Loading text */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-16 text-center">
          <h2 className="text-xl font-semibold text-syntheta-dark mb-2">Loading Pipeline</h2>
          <p className="text-sm text-muted-foreground">Preparing your synthetic data environment...</p>
        </div>
      </div>
    </div>
  );
} 