import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Activity {
  id: string;
  type: 'create' | 'update' | 'delete' | 'run' | 'error';
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  timestamp: string;
  details: string;
  metadata?: Record<string, any>;
}

interface NodeActivityProps {
  title: string;
  description?: string;
  activities: Activity[];
  className?: string;
}

const activityTypeConfig: Record<
  Activity['type'],
  {
    color: string;
    bgColor: string;
    textColor: string;
    icon: string;
  }
> = {
  create: {
    color: 'text-green-500',
    bgColor: 'bg-green-50 dark:bg-green-950',
    textColor: 'text-green-800 dark:text-green-200',
    icon: '➕',
  },
  update: {
    color: 'text-blue-500',
    bgColor: 'bg-blue-50 dark:bg-blue-950',
    textColor: 'text-blue-800 dark:text-blue-200',
    icon: '✏️',
  },
  delete: {
    color: 'text-red-500',
    bgColor: 'bg-red-50 dark:bg-red-950',
    textColor: 'text-red-800 dark:text-red-200',
    icon: '🗑️',
  },
  run: {
    color: 'text-purple-500',
    bgColor: 'bg-purple-50 dark:bg-purple-950',
    textColor: 'text-purple-800 dark:text-purple-200',
    icon: '▶️',
  },
  error: {
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950',
    textColor: 'text-yellow-800 dark:text-yellow-200',
    icon: '⚠️',
  },
};

export function NodeActivity({
  title,
  description,
  activities,
  className,
}: NodeActivityProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      <CardContent>
        <div className="relative space-y-6">
          {activities.map((activity, index) => {
            const typeConfig = activityTypeConfig[activity.type];
            const isLast = index === activities.length - 1;

            return (
              <div key={activity.id} className="relative">
                {/* Timeline line */}
                {!isLast && (
                  <div
                    className={cn(
                      "absolute left-4 top-8 h-full w-0.5",
                      typeConfig.bgColor
                    )}
                  />
                )}

                <div className="relative flex items-start space-x-3">
                  {/* Timeline dot */}
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full",
                      typeConfig.bgColor
                    )}
                  >
                    <span className="text-sm">{typeConfig.icon}</span>
                  </div>

                  {/* Activity content */}
                  <div
                    className={cn(
                      "flex-1 rounded-lg border p-3",
                      typeConfig.bgColor
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {activity.user.avatar ? (
                          <img
                            src={activity.user.avatar}
                            alt={activity.user.name}
                            className="h-6 w-6 rounded-full"
                          />
                        ) : (
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                            <span className="text-xs font-medium text-primary">
                              {activity.user.name[0]}
                            </span>
                          </div>
                        )}
                        <p className={cn("text-sm font-medium", typeConfig.textColor)}>
                          {activity.user.name}
                        </p>
                        <Badge
                          variant="secondary"
                          className={cn(
                            "text-xs",
                            typeConfig.bgColor,
                            typeConfig.textColor
                          )}
                        >
                          {activity.type}
                        </Badge>
                      </div>
                      <span className={cn("text-xs", typeConfig.textColor)}>
                        {activity.timestamp}
                      </span>
                    </div>
                    <p className={cn("mt-1 text-sm", typeConfig.textColor)}>
                      {activity.details}
                    </p>
                    {activity.metadata && (
                      <pre className="mt-2 rounded bg-background p-2 text-xs">
                        {JSON.stringify(activity.metadata, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {activities.length === 0 && (
            <div className="flex items-center justify-center rounded-lg border border-dashed p-8">
              <p className="text-sm text-muted-foreground">
                No activity found
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 