import React from 'react';
import { BaseEdge, EdgeProps, getBezierPath } from 'reactflow';

export function Edge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}: EdgeProps) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <BaseEdge
      path={edgePath}
      markerEnd={markerEnd}
      style={{
        ...style,
        strokeWidth: 2,
        stroke: 'hsl(var(--primary))',
        animation: 'flowing 1s linear infinite',
      }}
    />
  );
}

// Add this to your global CSS
const styles = `
@keyframes flowing {
  0% {
    stroke-dasharray: 5;
    stroke-dashoffset: 10;
  }
  100% {
    stroke-dasharray: 5;
    stroke-dashoffset: 0;
  }
}
`; 