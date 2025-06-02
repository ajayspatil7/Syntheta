import React from 'react';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { cn } from "@/lib/utils";

interface DagEditorLayoutProps {
  nodePalette: React.ReactNode;
  dagCanvas: React.ReactNode;
  configPanel: React.ReactNode;
  className?: string;
}

export function DagEditorLayout({
  nodePalette,
  dagCanvas,
  configPanel,
  className,
}: DagEditorLayoutProps) {
  return (
    <div className={cn("h-screen w-full overflow-hidden", className)}>
      <ResizablePanelGroup direction="horizontal">
        {/* Left Panel - Node Palette */}
        <ResizablePanel
          defaultSize={20}
          minSize={15}
          maxSize={30}
          className="border-r border-border"
        >
          <div className="h-full overflow-y-auto p-4">
            {nodePalette}
          </div>
        </ResizablePanel>

        <ResizableHandle />

        {/* Center Panel - DAG Canvas */}
        <ResizablePanel
          defaultSize={60}
          minSize={40}
          className="relative"
        >
          <div className="h-full w-full">
            {dagCanvas}
          </div>
        </ResizablePanel>

        <ResizableHandle />

        {/* Right Panel - Configuration */}
        <ResizablePanel
          defaultSize={20}
          minSize={15}
          maxSize={40}
          className="border-l border-border"
        >
          <div className="h-full overflow-y-auto">
            {configPanel}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
} 