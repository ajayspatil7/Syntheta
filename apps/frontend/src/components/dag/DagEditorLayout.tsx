'use client';

import { ReactNode } from 'react';

interface DagEditorLayoutProps {
  nodePalette: ReactNode;
  dagCanvas: ReactNode;
  configPanel: ReactNode;
  runHistory?: ReactNode;
}

export function DagEditorLayout({
  nodePalette,
  dagCanvas,
  configPanel,
  runHistory,
}: DagEditorLayoutProps) {
  return (
    <div className="flex h-full">
      <div className="w-64">{nodePalette}</div>
      <div className="flex-1 flex flex-col">
        <div className="flex-1">{dagCanvas}</div>
        {runHistory}
      </div>
      <div className="w-80">{configPanel}</div>
    </div>
  );
} 