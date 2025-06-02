import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface LogEntry {
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'debug';
  message: string;
  details?: string;
}

interface NodeLogsProps {
  logs: LogEntry[];
  className?: string;
}

const logLevelConfig: Record<
  LogEntry['level'],
  {
    color: string;
    bgColor: string;
    textColor: string;
  }
> = {
  info: {
    color: 'text-blue-500',
    bgColor: 'bg-blue-50 dark:bg-blue-950',
    textColor: 'text-blue-800 dark:text-blue-200',
  },
  warning: {
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950',
    textColor: 'text-yellow-800 dark:text-yellow-200',
  },
  error: {
    color: 'text-red-500',
    bgColor: 'bg-red-50 dark:bg-red-950',
    textColor: 'text-red-800 dark:text-red-200',
  },
  debug: {
    color: 'text-gray-500',
    bgColor: 'bg-gray-50 dark:bg-gray-950',
    textColor: 'text-gray-800 dark:text-gray-200',
  },
};

export function NodeLogs({ logs, className }: NodeLogsProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">Logs</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] rounded-md border p-4">
          <div className="space-y-2">
            {logs.map((log, index) => {
              const config = logLevelConfig[log.level];
              return (
                <div
                  key={index}
                  className={cn(
                    "rounded-lg border p-2",
                    config.bgColor
                  )}
                >
                  <div className="flex items-center space-x-2">
                    <span className={cn("text-xs font-medium", config.color)}>
                      {log.level.toUpperCase()}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {log.timestamp}
                    </span>
                  </div>
                  <p className={cn("mt-1 text-sm", config.textColor)}>
                    {log.message}
                  </p>
                  {log.details && (
                    <pre className="mt-1 rounded bg-background p-2 text-xs">
                      {log.details}
                    </pre>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
} 