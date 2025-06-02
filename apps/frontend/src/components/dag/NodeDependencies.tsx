import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Dependency {
  id: string;
  name: string;
  version: string;
  type: 'required' | 'optional' | 'peer' | 'dev';
  status: 'installed' | 'outdated' | 'missing' | 'conflict';
  description?: string;
  metadata?: Record<string, any>;
}

interface NodeDependenciesProps {
  title: string;
  description?: string;
  dependencies: Dependency[];
  className?: string;
}

const typeConfig: Record<
  Dependency['type'],
  {
    color: string;
    bgColor: string;
    textColor: string;
    icon: string;
  }
> = {
  required: {
    color: 'text-blue-500',
    bgColor: 'bg-blue-50 dark:bg-blue-950',
    textColor: 'text-blue-800 dark:text-blue-200',
    icon: '📦',
  },
  optional: {
    color: 'text-green-500',
    bgColor: 'bg-green-50 dark:bg-green-950',
    textColor: 'text-green-800 dark:text-green-200',
    icon: '➕',
  },
  peer: {
    color: 'text-purple-500',
    bgColor: 'bg-purple-50 dark:bg-purple-950',
    textColor: 'text-purple-800 dark:text-purple-200',
    icon: '🔗',
  },
  dev: {
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950',
    textColor: 'text-yellow-800 dark:text-yellow-200',
    icon: '⚙️',
  },
};

const statusConfig: Record<
  Dependency['status'],
  {
    color: string;
    bgColor: string;
    textColor: string;
    icon: string;
  }
> = {
  installed: {
    color: 'text-green-500',
    bgColor: 'bg-green-50 dark:bg-green-950',
    textColor: 'text-green-800 dark:text-green-200',
    icon: '✅',
  },
  outdated: {
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950',
    textColor: 'text-yellow-800 dark:text-yellow-200',
    icon: '⚠️',
  },
  missing: {
    color: 'text-red-500',
    bgColor: 'bg-red-50 dark:bg-red-950',
    textColor: 'text-red-800 dark:text-red-200',
    icon: '❌',
  },
  conflict: {
    color: 'text-orange-500',
    bgColor: 'bg-orange-50 dark:bg-orange-950',
    textColor: 'text-orange-800 dark:text-orange-200',
    icon: '⚡',
  },
};

export function NodeDependencies({
  title,
  description,
  dependencies,
  className,
}: NodeDependenciesProps) {
  const installedCount = dependencies.filter((dep) => dep.status === 'installed').length;
  const outdatedCount = dependencies.filter((dep) => dep.status === 'outdated').length;
  const missingCount = dependencies.filter((dep) => dep.status === 'missing').length;
  const conflictCount = dependencies.filter((dep) => dep.status === 'conflict').length;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Badge
              variant="secondary"
              className={cn(
                "text-xs",
                statusConfig.installed.bgColor,
                statusConfig.installed.textColor
              )}
            >
              {installedCount} Installed
            </Badge>
            <Badge
              variant="secondary"
              className={cn(
                "text-xs",
                statusConfig.outdated.bgColor,
                statusConfig.outdated.textColor
              )}
            >
              {outdatedCount} Outdated
            </Badge>
            <Badge
              variant="secondary"
              className={cn(
                "text-xs",
                statusConfig.missing.bgColor,
                statusConfig.missing.textColor
              )}
            >
              {missingCount} Missing
            </Badge>
            <Badge
              variant="secondary"
              className={cn(
                "text-xs",
                statusConfig.conflict.bgColor,
                statusConfig.conflict.textColor
              )}
            >
              {conflictCount} Conflicts
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {dependencies.map((dependency) => {
            const type = typeConfig[dependency.type];
            const status = statusConfig[dependency.status];

            return (
              <div
                key={dependency.id}
                className={cn(
                  "rounded-lg border p-4",
                  type.bgColor
                )}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <span className="text-lg">{type.icon}</span>
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <p className={cn("text-sm font-medium", type.textColor)}>
                          {dependency.name}
                        </p>
                        <Badge
                          variant="secondary"
                          className={cn(
                            "text-xs",
                            type.bgColor,
                            type.textColor
                          )}
                        >
                          {dependency.type}
                        </Badge>
                        <Badge
                          variant="secondary"
                          className={cn(
                            "text-xs",
                            status.bgColor,
                            status.textColor
                          )}
                        >
                          {dependency.status}
                        </Badge>
                      </div>
                      <p className={cn("text-sm", type.textColor)}>
                        v{dependency.version}
                      </p>
                    </div>

                    {dependency.description && (
                      <p className={cn("text-sm", type.textColor)}>
                        {dependency.description}
                      </p>
                    )}

                    {dependency.metadata && (
                      <div>
                        <p className={cn("text-xs font-medium", type.textColor)}>
                          Details
                        </p>
                        <pre className="mt-1 rounded bg-background p-2 text-xs">
                          {JSON.stringify(dependency.metadata, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {dependencies.length === 0 && (
            <div className="flex items-center justify-center rounded-lg border border-dashed p-8">
              <p className="text-sm text-muted-foreground">
                No dependencies defined
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 