import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from "@/lib/utils";

interface NodeLoadingProps {
  message?: string;
  className?: string;
}

export function NodeLoading({ message = 'Loading...', className }: NodeLoadingProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center space-x-2 rounded-lg border border-border bg-background p-4",
        className
      )}
    >
      <Loader2 className="h-5 w-5 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
} 