import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Stat {
  label: string;
  value: string | number;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

interface NodeStatisticsProps {
  stats: Stat[];
  className?: string;
}

export function NodeStatistics({ stats, className }: NodeStatisticsProps) {
  return (
    <div className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-4", className)}>
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.label}
            </CardTitle>
            {stat.trend && (
              <div
                className={cn(
                  "flex items-center text-xs",
                  stat.trend.isPositive ? "text-green-500" : "text-red-500"
                )}
              >
                {stat.trend.isPositive ? "↑" : "↓"} {Math.abs(stat.trend.value)}%
              </div>
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            {stat.description && (
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 