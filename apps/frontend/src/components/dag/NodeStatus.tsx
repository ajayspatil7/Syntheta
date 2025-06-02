import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Status {
  id: string;
  name: string;
  value: string;
  type: 'info' | 'success' | 'warning' | 'error';
  description?: string;
  timestamp?: string;
  metadata?: Record<string, any>;
}

interface NodeStatusProps {
  title: string;
  description?: string;
  statuses: Status[];
  className?: string;
}

const statusConfig: Record<
  Status['type'],
  {
    color: string;
    bgColor: string;
    textColor: string;
    icon: string;
  }
> = {
  info: {
    color: 'text-blue-500',
    bgColor: 'bg-blue-50 dark:bg-blue-950',
    textColor: 'text-blue-800 dark:text-blue-200',
    icon: 'ℹ️',
  },
  success: {
    color: 'text-green-500',
    bgColor: 'bg-green-50 dark:bg-green-950',
    textColor: 'text-green-800 dark:text-green-200',
    icon: '✅',
  },
  warning: {
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950',
    textColor: 'text-yellow-800 dark:text-yellow-200',
    icon: '⚠️',
  },
  error: {
    color: 'text-red-500',
    bgColor: 'bg-red-50 dark:bg-red-950',
    textColor: 'text-red-800 dark:text-red-200',
    icon: '❌',
  },
};

export function NodeStatus({
  title,
  description,
  statuses,
  className,
}: NodeStatusProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {statuses.map((status) => {
            const config = statusConfig[status.type];

            return (
              <div
                key={status.id}
                className={cn(
                  "rounded-lg border p-4",
                  config.bgColor
                )}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <span className="text-lg">{config.icon}</span>
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className={cn("text-sm font-medium", config.textColor)}>
                        {status.name}
                      </p>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-xs",
                          config.bgColor,
                          config.textColor
                        )}
                      >
                        {status.type}
                      </Badge>
                    </div>

                    <p className={cn("text-sm", config.textColor)}>
                      {status.value}
                    </p>

                    {status.description && (
                      <p className={cn("text-xs", config.textColor)}>
                        {status.description}
                      </p>
                    )}

                    {status.timestamp && (
                      <p className={cn("text-xs", config.textColor)}>
                        {status.timestamp}
                      </p>
                    )}

                    {status.metadata && (
                      <div className="mt-2">
                        <p className={cn("text-xs font-medium", config.textColor)}>
                          Details
                        </p>
                        <pre className="mt-1 rounded bg-background p-2 text-xs">
                          {JSON.stringify(status.metadata, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {statuses.length === 0 && (
            <div className="flex items-center justify-center rounded-lg border border-dashed p-8">
              <p className="text-sm text-muted-foreground">
                No status information available
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 