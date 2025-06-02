import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface Metric {
  label: string;
  value: number;
  unit?: string;
  max?: number;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

interface NodeMetricsProps {
  metrics: Metric[];
  className?: string;
}

export function NodeMetrics({ metrics, className }: NodeMetricsProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">Metrics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {metrics.map((metric, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{metric.label}</span>
                  {metric.trend && (
                    <span
                      className={cn(
                        "text-xs",
                        metric.trend.isPositive
                          ? "text-green-500"
                          : "text-red-500"
                      )}
                    >
                      {metric.trend.isPositive ? "↑" : "↓"}{" "}
                      {Math.abs(metric.trend.value)}%
                    </span>
                  )}
                </div>
                {metric.description && (
                  <p className="text-xs text-muted-foreground">
                    {metric.description}
                  </p>
                )}
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">
                  {metric.value}
                  {metric.unit && (
                    <span className="ml-1 text-muted-foreground">
                      {metric.unit}
                    </span>
                  )}
                </div>
              </div>
            </div>
            {metric.max && (
              <Progress
                value={(metric.value / metric.max) * 100}
                className="h-2"
              />
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
} 