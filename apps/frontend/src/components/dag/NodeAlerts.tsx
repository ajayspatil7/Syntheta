import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Alert {
  id: string;
  name: string;
  description: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  status: 'active' | 'acknowledged' | 'resolved';
  timestamp: string;
  source: string;
  details?: string;
}

interface NodeAlertsProps {
  title: string;
  description?: string;
  alerts: Alert[];
  className?: string;
}

const alertSeverityConfig: Record<
  Alert['severity'],
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
  critical: {
    color: 'text-purple-500',
    bgColor: 'bg-purple-50 dark:bg-purple-950',
    textColor: 'text-purple-800 dark:text-purple-200',
  },
};

const alertStatusConfig: Record<
  Alert['status'],
  {
    color: string;
    bgColor: string;
    textColor: string;
  }
> = {
  active: {
    color: 'text-red-500',
    bgColor: 'bg-red-50 dark:bg-red-950',
    textColor: 'text-red-800 dark:text-red-200',
  },
  acknowledged: {
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950',
    textColor: 'text-yellow-800 dark:text-yellow-200',
  },
  resolved: {
    color: 'text-green-500',
    bgColor: 'bg-green-50 dark:bg-green-950',
    textColor: 'text-green-800 dark:text-green-200',
  },
};

export function NodeAlerts({
  title,
  description,
  alerts,
  className,
}: NodeAlertsProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {alerts.map((alert) => {
          const severityConfig = alertSeverityConfig[alert.severity];
          const statusConfig = alertStatusConfig[alert.status];

          return (
            <div
              key={alert.id}
              className={cn(
                "rounded-lg border p-3",
                severityConfig.bgColor
              )}
            >
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <p className={cn("text-sm font-medium", severityConfig.textColor)}>
                      {alert.name}
                    </p>
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-xs",
                        severityConfig.bgColor,
                        severityConfig.textColor
                      )}
                    >
                      {alert.severity}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs",
                        statusConfig.color
                      )}
                    >
                      {alert.status}
                    </Badge>
                  </div>
                  <p className={cn("text-sm", severityConfig.textColor)}>
                    {alert.description}
                  </p>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-4">
                <div>
                  <p className={cn("text-xs font-medium", severityConfig.textColor)}>
                    Source
                  </p>
                  <p className={cn("text-sm", severityConfig.textColor)}>
                    {alert.source}
                  </p>
                </div>

                <div>
                  <p className={cn("text-xs font-medium", severityConfig.textColor)}>
                    Timestamp
                  </p>
                  <p className={cn("text-sm", severityConfig.textColor)}>
                    {alert.timestamp}
                  </p>
                </div>

                {alert.details && (
                  <div className="col-span-2">
                    <p className={cn("text-xs font-medium", severityConfig.textColor)}>
                      Details
                    </p>
                    <pre className={cn(
                      "mt-1 rounded bg-background p-2 text-xs",
                      severityConfig.textColor
                    )}>
                      {alert.details}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {alerts.length === 0 && (
          <div className="flex items-center justify-center rounded-lg border border-dashed p-8">
            <p className="text-sm text-muted-foreground">
              No alerts found
            </p>
          </div>
        )}

        {alerts.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Badge variant="outline" className="text-red-500">
              {alerts.filter((a) => a.status === 'active').length} active
            </Badge>
            <Badge variant="outline" className="text-yellow-500">
              {alerts.filter((a) => a.status === 'acknowledged').length} acknowledged
            </Badge>
            <Badge variant="outline" className="text-green-500">
              {alerts.filter((a) => a.status === 'resolved').length} resolved
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 