import React from 'react';
import { Button } from "@/components/ui/button";
import { Database, ArrowRight } from 'lucide-react';
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  onAddNode?: () => void;
  className?: string;
}

export function EmptyState({ onAddNode, className }: EmptyStateProps) {
  return (
    <div className={cn("flex h-full items-center justify-center", className)}>
      <div className="text-center">
        <div className="mx-auto mb-6 h-16 w-16 rounded-full bg-muted p-3">
          <Database className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="mb-2 text-lg font-semibold">No Nodes Added</h3>
        <p className="mb-6 text-sm text-muted-foreground">
          Start building your synthetic data pipeline by adding nodes from the palette.
        </p>
        {onAddNode && (
          <Button onClick={() => {
            console.log('EmptyState: "Add Your First Node" button clicked');
            onAddNode();
          }} className="group">
            Add Your First Node
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        )}
      </div>
    </div>
  );
} 