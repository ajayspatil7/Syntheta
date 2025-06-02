import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Version {
  id: string;
  number: string;
  status: 'current' | 'deprecated' | 'upcoming';
  changes: {
    type: 'added' | 'changed' | 'deprecated' | 'removed' | 'fixed' | 'security';
    description: string;
  }[];
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  timestamp: string;
  metadata?: Record<string, any>;
}

interface NodeVersionProps {
  title: string;
  description?: string;
  versions: Version[];
  className?: string;
}

const statusConfig: Record<
  Version['status'],
  {
    color: string;
    bgColor: string;
    textColor: string;
    icon: string;
  }
> = {
  current: {
    color: 'text-green-500',
    bgColor: 'bg-green-50 dark:bg-green-950',
    textColor: 'text-green-800 dark:text-green-200',
    icon: '✅',
  },
  deprecated: {
    color: 'text-red-500',
    bgColor: 'bg-red-50 dark:bg-red-950',
    textColor: 'text-red-800 dark:text-red-200',
    icon: '⚠️',
  },
  upcoming: {
    color: 'text-blue-500',
    bgColor: 'bg-blue-50 dark:bg-blue-950',
    textColor: 'text-blue-800 dark:text-blue-200',
    icon: '🔄',
  },
};

const changeTypeConfig: Record<
  Version['changes'][0]['type'],
  {
    color: string;
    bgColor: string;
    textColor: string;
    icon: string;
  }
> = {
  added: {
    color: 'text-green-500',
    bgColor: 'bg-green-50 dark:bg-green-950',
    textColor: 'text-green-800 dark:text-green-200',
    icon: '➕',
  },
  changed: {
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950',
    textColor: 'text-yellow-800 dark:text-yellow-200',
    icon: '✏️',
  },
  deprecated: {
    color: 'text-orange-500',
    bgColor: 'bg-orange-50 dark:bg-orange-950',
    textColor: 'text-orange-800 dark:text-orange-200',
    icon: '⚠️',
  },
  removed: {
    color: 'text-red-500',
    bgColor: 'bg-red-50 dark:bg-red-950',
    textColor: 'text-red-800 dark:text-red-200',
    icon: '🗑️',
  },
  fixed: {
    color: 'text-blue-500',
    bgColor: 'bg-blue-50 dark:bg-blue-950',
    textColor: 'text-blue-800 dark:text-blue-200',
    icon: '🔧',
  },
  security: {
    color: 'text-purple-500',
    bgColor: 'bg-purple-50 dark:bg-purple-950',
    textColor: 'text-purple-800 dark:text-purple-200',
    icon: '🔒',
  },
};

export function NodeVersion({
  title,
  description,
  versions,
  className,
}: NodeVersionProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {versions.map((version) => {
            const status = statusConfig[version.status];

            return (
              <div
                key={version.id}
                className={cn(
                  "rounded-lg border p-4",
                  status.bgColor
                )}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <span className="text-lg">{status.icon}</span>
                  </div>

                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <p className={cn("text-sm font-medium", status.textColor)}>
                          Version {version.number}
                        </p>
                        <Badge
                          variant="secondary"
                          className={cn(
                            "text-xs",
                            status.bgColor,
                            status.textColor
                          )}
                        >
                          {version.status}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        {version.author.avatar ? (
                          <img
                            src={version.author.avatar}
                            alt={version.author.name}
                            className="h-6 w-6 rounded-full"
                          />
                        ) : (
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                            <span className="text-xs font-medium text-primary">
                              {version.author.name[0]}
                            </span>
                          </div>
                        )}
                        <p className={cn("text-xs", status.textColor)}>
                          {version.author.name}
                        </p>
                        <p className={cn("text-xs", status.textColor)}>
                          {version.timestamp}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {version.changes.map((change, index) => {
                        const type = changeTypeConfig[change.type];

                        return (
                          <div
                            key={index}
                            className={cn(
                              "rounded-md border p-2",
                              type.bgColor
                            )}
                          >
                            <div className="flex items-center space-x-2">
                              <span className="text-sm">{type.icon}</span>
                              <Badge
                                variant="secondary"
                                className={cn(
                                  "text-xs",
                                  type.bgColor,
                                  type.textColor
                                )}
                              >
                                {change.type}
                              </Badge>
                              <p className={cn("text-sm", type.textColor)}>
                                {change.description}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {version.metadata && (
                      <div>
                        <p className={cn("text-xs font-medium", status.textColor)}>
                          Details
                        </p>
                        <pre className="mt-1 rounded bg-background p-2 text-xs">
                          {JSON.stringify(version.metadata, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {versions.length === 0 && (
            <div className="flex items-center justify-center rounded-lg border border-dashed p-8">
              <p className="text-sm text-muted-foreground">
                No version information available
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 