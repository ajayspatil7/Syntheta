import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Error {
  id: string;
  type: 'validation' | 'runtime' | 'network' | 'security' | 'dependency' | 'unknown';
  message: string;
  stack?: string;
  timestamp: string;
  source?: string;
  metadata?: Record<string, any>;
}

interface NodeErrorsProps {
  title: string;
  description?: string;
  errors: Error[];
  className?: string;
}

const typeConfig: Record<
  Error['type'],
  {
    color: string;
    bgColor: string;
    textColor: string;
    icon: string;
  }
> = {
  validation: {
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950',
    textColor: 'text-yellow-800 dark:text-yellow-200',
    icon: '⚠️',
  },
  runtime: {
    color: 'text-red-500',
    bgColor: 'bg-red-50 dark:bg-red-950',
    textColor: 'text-red-800 dark:text-red-200',
    icon: '💥',
  },
  network: {
    color: 'text-orange-500',
    bgColor: 'bg-orange-50 dark:bg-orange-950',
    textColor: 'text-orange-800 dark:text-orange-200',
    icon: '🌐',
  },
  security: {
    color: 'text-purple-500',
    bgColor: 'bg-purple-50 dark:bg-purple-950',
    textColor: 'text-purple-800 dark:text-purple-200',
    icon: '🔒',
  },
  dependency: {
    color: 'text-blue-500',
    bgColor: 'bg-blue-50 dark:bg-blue-950',
    textColor: 'text-blue-800 dark:text-blue-200',
    icon: '📦',
  },
  unknown: {
    color: 'text-gray-500',
    bgColor: 'bg-gray-50 dark:bg-gray-950',
    textColor: 'text-gray-800 dark:text-gray-200',
    icon: '❓',
  },
};

export function NodeErrors({
  title,
  description,
  errors,
  className,
}: NodeErrorsProps) {
  const validationCount = errors.filter((error) => error.type === 'validation').length;
  const runtimeCount = errors.filter((error) => error.type === 'runtime').length;
  const networkCount = errors.filter((error) => error.type === 'network').length;
  const securityCount = errors.filter((error) => error.type === 'security').length;
  const dependencyCount = errors.filter((error) => error.type === 'dependency').length;
  const unknownCount = errors.filter((error) => error.type === 'unknown').length;

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
                typeConfig.validation.bgColor,
                typeConfig.validation.textColor
              )}
            >
              {validationCount} Validation
            </Badge>
            <Badge
              variant="secondary"
              className={cn(
                "text-xs",
                typeConfig.runtime.bgColor,
                typeConfig.runtime.textColor
              )}
            >
              {runtimeCount} Runtime
            </Badge>
            <Badge
              variant="secondary"
              className={cn(
                "text-xs",
                typeConfig.network.bgColor,
                typeConfig.network.textColor
              )}
            >
              {networkCount} Network
            </Badge>
            <Badge
              variant="secondary"
              className={cn(
                "text-xs",
                typeConfig.security.bgColor,
                typeConfig.security.textColor
              )}
            >
              {securityCount} Security
            </Badge>
            <Badge
              variant="secondary"
              className={cn(
                "text-xs",
                typeConfig.dependency.bgColor,
                typeConfig.dependency.textColor
              )}
            >
              {dependencyCount} Dependency
            </Badge>
            <Badge
              variant="secondary"
              className={cn(
                "text-xs",
                typeConfig.unknown.bgColor,
                typeConfig.unknown.textColor
              )}
            >
              {unknownCount} Unknown
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {errors.map((error) => {
            const type = typeConfig[error.type];

            return (
              <div
                key={error.id}
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
                        <Badge
                          variant="secondary"
                          className={cn(
                            "text-xs",
                            type.bgColor,
                            type.textColor
                          )}
                        >
                          {error.type}
                        </Badge>
                        {error.source && (
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs",
                              type.textColor
                            )}
                          >
                            {error.source}
                          </Badge>
                        )}
                      </div>
                      <p className={cn("text-xs", type.textColor)}>
                        {error.timestamp}
                      </p>
                    </div>

                    <p className={cn("text-sm", type.textColor)}>
                      {error.message}
                    </p>

                    {error.stack && (
                      <div className="mt-2">
                        <p className={cn("text-xs font-medium", type.textColor)}>
                          Stack Trace
                        </p>
                        <pre className="mt-1 rounded bg-background p-2 text-xs font-mono">
                          {error.stack}
                        </pre>
                      </div>
                    )}

                    {error.metadata && (
                      <div className="mt-2">
                        <p className={cn("text-xs font-medium", type.textColor)}>
                          Details
                        </p>
                        <pre className="mt-1 rounded bg-background p-2 text-xs">
                          {JSON.stringify(error.metadata, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {errors.length === 0 && (
            <div className="flex items-center justify-center rounded-lg border border-dashed p-8">
              <p className="text-sm text-muted-foreground">
                No errors found
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 