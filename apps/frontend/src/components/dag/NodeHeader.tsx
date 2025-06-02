import React from 'react';
import { Card, CardHeader } from "@/components/ui/card";
import { NodeStatus } from "./NodeStatus";
import { NodeToolbar } from "./NodeToolbar";
import { cn } from "@/lib/utils";

interface NodeHeaderProps {
  title: string;
  description?: string;
  status?: 'success' | 'error' | 'running' | 'idle';
  statusMessage?: string;
  onConfigure?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onRun?: () => void;
  onStop?: () => void;
  onSave?: () => void;
  isRunning?: boolean;
  className?: string;
}

export function NodeHeader({
  title,
  description,
  status,
  statusMessage,
  onConfigure,
  onDelete,
  onDuplicate,
  onRun,
  onStop,
  onSave,
  isRunning = false,
  className,
}: NodeHeaderProps) {
  return (
    <Card className={className}>
      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold">{title}</h3>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          <NodeToolbar
            onConfigure={onConfigure}
            onDelete={onDelete}
            onDuplicate={onDuplicate}
            onRun={onRun}
            onStop={onStop}
            onSave={onSave}
            isRunning={isRunning}
          />
        </div>
        {status && (
          <NodeStatus status={status} message={statusMessage} />
        )}
      </CardHeader>
    </Card>
  );
} 