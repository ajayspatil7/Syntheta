import React from 'react';
import { Play, Pause, Square, RotateCcw } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface NodeExecutionProps {
  status: 'idle' | 'running' | 'paused' | 'completed' | 'error';
  progress?: number;
  error?: string;
  onStart?: () => void;
  onPause?: () => void;
  onStop?: () => void;
  onReset?: () => void;
  className?: string;
}

export function NodeExecution({
  status,
  progress = 0,
  error,
  onStart,
  onPause,
  onStop,
  onReset,
  className,
}: NodeExecutionProps) {
  const getStatusColor = (status: NodeExecutionProps['status']) => {
    switch (status) {
      case 'running':
        return 'text-blue-500';
      case 'paused':
        return 'text-yellow-500';
      case 'completed':
        return 'text-green-500';
      case 'error':
        return 'text-red-500';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusText = (status: NodeExecutionProps['status']) => {
    switch (status) {
      case 'idle':
        return 'Ready to run';
      case 'running':
        return 'Running...';
      case 'paused':
        return 'Paused';
      case 'completed':
        return 'Completed';
      case 'error':
        return 'Error';
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className={cn("text-sm font-medium", getStatusColor(status))}>
            {getStatusText(status)}
          </p>
          {error && (
            <p className="text-xs text-red-500">{error}</p>
          )}
        </div>
        <div className="flex space-x-2">
          {status === 'idle' && (
            <Button
              variant="outline"
              size="icon"
              onClick={onStart}
              className="h-8 w-8"
            >
              <Play className="h-4 w-4" />
            </Button>
          )}
          {status === 'running' && (
            <Button
              variant="outline"
              size="icon"
              onClick={onPause}
              className="h-8 w-8"
            >
              <Pause className="h-4 w-4" />
            </Button>
          )}
          {(status === 'running' || status === 'paused') && (
            <Button
              variant="outline"
              size="icon"
              onClick={onStop}
              className="h-8 w-8"
            >
              <Square className="h-4 w-4" />
            </Button>
          )}
          {(status === 'completed' || status === 'error') && (
            <Button
              variant="outline"
              size="icon"
              onClick={onReset}
              className="h-8 w-8"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      {(status === 'running' || status === 'paused') && (
        <Progress value={progress} className="h-2" />
      )}
    </div>
  );
} 