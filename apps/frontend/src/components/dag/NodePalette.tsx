import React from 'react';
import { Database, Cpu, BarChart2, FileOutput } from 'lucide-react';
import { cn } from "@/lib/utils";

interface NodePaletteProps {
  className?: string;
  onDragStart: (event: React.DragEvent<HTMLDivElement>, nodeType: string) => void;
}

const nodeTypes = [
  {
    type: 'source',
    label: 'Source',
    icon: Database,
    description: 'Data source node for importing data',
  },
  {
    type: 'generator',
    label: 'Generator',
    icon: Cpu,
    description: 'Generate synthetic data',
  },
  {
    type: 'evaluator',
    label: 'Evaluator',
    icon: BarChart2,
    description: 'Evaluate data quality and metrics',
  },
  {
    type: 'exporter',
    label: 'Exporter',
    icon: FileOutput,
    description: 'Export data to various formats',
  },
];

export function NodePalette({ className, onDragStart }: NodePaletteProps) {
  return (
    <div className={cn("w-64 border-r border-border bg-background p-4", className)}>
      <h3 className="mb-4 text-sm font-medium text-muted-foreground">Nodes</h3>
      <div className="space-y-2">
        {nodeTypes.map((node) => (
          <div
            key={node.type}
            className="flex cursor-grab items-center space-x-3 rounded-lg border border-border bg-card p-3 transition-colors hover:bg-accent"
            draggable
            onDragStart={(e) => onDragStart(e, node.type)}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
              <node.icon className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">{node.label}</p>
              <p className="text-xs text-muted-foreground">{node.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 