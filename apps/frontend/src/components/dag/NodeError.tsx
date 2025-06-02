import React from 'react';
import { AlertCircle, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NodeErrorProps {
  error: {
    message: string;
    details?: string;
    code?: string;
  };
  onDismiss?: () => void;
  className?: string;
}

export function NodeError({ error, onDismiss, className }: NodeErrorProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950",
        className
      )}
    >
      <div className="flex items-start space-x-3">
        <AlertCircle className="h-5 w-5 text-red-500" />
        <div className="flex-1 space-y-1">
          <p className="text-sm font-medium text-red-800 dark:text-red-200">
            {error.message}
          </p>
          {error.details && (
            <p className="text-sm text-red-700 dark:text-red-300">
              {error.details}
            </p>
          )}
          {error.code && (
            <code className="block rounded bg-red-100 px-2 py-1 text-xs text-red-800 dark:bg-red-900 dark:text-red-200">
              {error.code}
            </code>
          )}
        </div>
        {onDismiss && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-red-500 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900 dark:hover:text-red-400"
            onClick={onDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
} 