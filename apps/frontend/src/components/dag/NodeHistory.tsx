import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface HistoryEntry {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  details?: string;
  status: 'success' | 'error' | 'warning';
}

interface NodeHistoryProps {
  title: string;
  description?: string;
  entries: HistoryEntry[];
  className?: string;
}

const historyStatusConfig: Record<
  HistoryEntry['status'],
  {
    color: string;
    bgColor: string;
    textColor: string;
  }
> = {
  success: {
    color: 'text-green-500',
    bgColor: 'bg-green-50 dark:bg-green-950',
    textColor: 'text-green-800 dark:text-green-200',
  },
  error: {
    color: 'text-red-500',
    bgColor: 'bg-red-50 dark:bg-red-950',
    textColor: 'text-red-800 dark:text-red-200',
  },
  warning: {
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950',
    textColor: 'text-yellow-800 dark:text-yellow-200',
  },
};

export function NodeHistory({
  title,
  description,
  entries,
  className,
}: NodeHistoryProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] rounded-md border p-4">
          <div className="space-y-4">
            {entries.map((entry) => {
              const config = historyStatusConfig[entry.status];
              return (
                <div
                  key={entry.id}
                  className={cn(
                    "flex items-start space-x-3 rounded-lg border p-3",
                    config.bgColor
                  )}
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className={cn("text-sm font-medium", config.textColor)}>
                        {entry.action}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {entry.timestamp}
                      </span>
                    </div>
                    <p className={cn("text-sm", config.textColor)}>
                      by {entry.user}
                    </p>
                    {entry.details && (
                      <pre className="mt-1 rounded bg-background p-2 text-xs">
                        {entry.details}
                      </pre>
                    )}
                  </div>
                </div>
              );
            })}

            {entries.length === 0 && (
              <div className="flex items-center justify-center rounded-lg border border-dashed p-8">
                <p className="text-sm text-muted-foreground">
                  No history entries found
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
} 