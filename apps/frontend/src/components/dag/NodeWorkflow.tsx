import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface WorkflowStep {
  id: string;
  name: string;
  description?: string;
  type: 'input' | 'process' | 'output' | 'condition' | 'loop' | 'error';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  dependencies?: string[];
  metadata?: Record<string, any>;
}

interface NodeWorkflowProps {
  title: string;
  description?: string;
  steps: WorkflowStep[];
  className?: string;
}

const typeConfig: Record<
  WorkflowStep['type'],
  {
    color: string;
    bgColor: string;
    textColor: string;
    icon: string;
  }
> = {
  input: {
    color: 'text-blue-500',
    bgColor: 'bg-blue-50 dark:bg-blue-950',
    textColor: 'text-blue-800 dark:text-blue-200',
    icon: '📥',
  },
  process: {
    color: 'text-purple-500',
    bgColor: 'bg-purple-50 dark:bg-purple-950',
    textColor: 'text-purple-800 dark:text-purple-200',
    icon: '⚙️',
  },
  output: {
    color: 'text-green-500',
    bgColor: 'bg-green-50 dark:bg-green-950',
    textColor: 'text-green-800 dark:text-green-200',
    icon: '📤',
  },
  condition: {
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950',
    textColor: 'text-yellow-800 dark:text-yellow-200',
    icon: '❓',
  },
  loop: {
    color: 'text-orange-500',
    bgColor: 'bg-orange-50 dark:bg-orange-950',
    textColor: 'text-orange-800 dark:text-orange-200',
    icon: '🔄',
  },
  error: {
    color: 'text-red-500',
    bgColor: 'bg-red-50 dark:bg-red-950',
    textColor: 'text-red-800 dark:text-red-200',
    icon: '⚠️',
  },
};

const statusConfig: Record<
  WorkflowStep['status'],
  {
    color: string;
    bgColor: string;
    textColor: string;
    icon: string;
  }
> = {
  pending: {
    color: 'text-gray-500',
    bgColor: 'bg-gray-50 dark:bg-gray-950',
    textColor: 'text-gray-800 dark:text-gray-200',
    icon: '⏳',
  },
  running: {
    color: 'text-blue-500',
    bgColor: 'bg-blue-50 dark:bg-blue-950',
    textColor: 'text-blue-800 dark:text-blue-200',
    icon: '▶️',
  },
  completed: {
    color: 'text-green-500',
    bgColor: 'bg-green-50 dark:bg-green-950',
    textColor: 'text-green-800 dark:text-green-200',
    icon: '✅',
  },
  failed: {
    color: 'text-red-500',
    bgColor: 'bg-red-50 dark:bg-red-950',
    textColor: 'text-red-800 dark:text-red-200',
    icon: '❌',
  },
  skipped: {
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950',
    textColor: 'text-yellow-800 dark:text-yellow-200',
    icon: '⏭️',
  },
};

export function NodeWorkflow({
  title,
  description,
  steps,
  className,
}: NodeWorkflowProps) {
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
          {steps.map((step, index) => {
            const type = typeConfig[step.type];
            const status = statusConfig[step.status];
            const isLast = index === steps.length - 1;

            return (
              <div key={step.id} className="relative">
                {/* Timeline line */}
                {!isLast && (
                  <div
                    className={cn(
                      "absolute left-4 top-8 h-full w-0.5",
                      status.bgColor
                    )}
                  />
                )}

                <div className="relative flex items-start space-x-3">
                  {/* Timeline dot */}
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full",
                      status.bgColor
                    )}
                  >
                    <span className="text-sm">{status.icon}</span>
                  </div>

                  {/* Step content */}
                  <div
                    className={cn(
                      "flex-1 rounded-lg border p-4",
                      type.bgColor
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">{type.icon}</span>
                        <p className={cn("text-sm font-medium", type.textColor)}>
                          {step.name}
                        </p>
                        <Badge
                          variant="secondary"
                          className={cn(
                            "text-xs",
                            type.bgColor,
                            type.textColor
                          )}
                        >
                          {step.type}
                        </Badge>
                        <Badge
                          variant="secondary"
                          className={cn(
                            "text-xs",
                            status.bgColor,
                            status.textColor
                          )}
                        >
                          {step.status}
                        </Badge>
                      </div>
                    </div>

                    {step.description && (
                      <p className={cn("mt-1 text-sm", type.textColor)}>
                        {step.description}
                      </p>
                    )}

                    {step.dependencies && step.dependencies.length > 0 && (
                      <div className="mt-2">
                        <p className={cn("text-xs font-medium", type.textColor)}>
                          Dependencies
                        </p>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {step.dependencies.map((dependency) => (
                            <Badge
                              key={dependency}
                              variant="outline"
                              className={cn(
                                "text-xs",
                                type.textColor
                              )}
                            >
                              {dependency}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {step.metadata && (
                      <div className="mt-2">
                        <p className={cn("text-xs font-medium", type.textColor)}>
                          Details
                        </p>
                        <pre className="mt-1 rounded bg-background p-2 text-xs">
                          {JSON.stringify(step.metadata, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {steps.length === 0 && (
            <div className="flex items-center justify-center rounded-lg border border-dashed p-8">
              <p className="text-sm text-muted-foreground">
                No workflow steps defined
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 