import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ValidationRule {
  id: string;
  name: string;
  description?: string;
  type: 'required' | 'format' | 'range' | 'custom';
  status: 'valid' | 'invalid' | 'warning';
  message?: string;
  metadata?: Record<string, any>;
}

interface NodeValidationProps {
  title: string;
  description?: string;
  rules: ValidationRule[];
  className?: string;
}

const statusConfig: Record<
  ValidationRule['status'],
  {
    color: string;
    bgColor: string;
    textColor: string;
    icon: string;
  }
> = {
  valid: {
    color: 'text-green-500',
    bgColor: 'bg-green-50 dark:bg-green-950',
    textColor: 'text-green-800 dark:text-green-200',
    icon: '✅',
  },
  invalid: {
    color: 'text-red-500',
    bgColor: 'bg-red-50 dark:bg-red-950',
    textColor: 'text-red-800 dark:text-red-200',
    icon: '❌',
  },
  warning: {
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950',
    textColor: 'text-yellow-800 dark:text-yellow-200',
    icon: '⚠️',
  },
};

const typeConfig: Record<
  ValidationRule['type'],
  {
    color: string;
    bgColor: string;
    textColor: string;
  }
> = {
  required: {
    color: 'text-blue-500',
    bgColor: 'bg-blue-50 dark:bg-blue-950',
    textColor: 'text-blue-800 dark:text-blue-200',
  },
  format: {
    color: 'text-purple-500',
    bgColor: 'bg-purple-50 dark:bg-purple-950',
    textColor: 'text-purple-800 dark:text-purple-200',
  },
  range: {
    color: 'text-orange-500',
    bgColor: 'bg-orange-50 dark:bg-orange-950',
    textColor: 'text-orange-800 dark:text-orange-200',
  },
  custom: {
    color: 'text-gray-500',
    bgColor: 'bg-gray-50 dark:bg-gray-950',
    textColor: 'text-gray-800 dark:text-gray-200',
  },
};

export function NodeValidation({
  title,
  description,
  rules,
  className,
}: NodeValidationProps) {
  const validCount = rules.filter((rule) => rule.status === 'valid').length;
  const invalidCount = rules.filter((rule) => rule.status === 'invalid').length;
  const warningCount = rules.filter((rule) => rule.status === 'warning').length;

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
                statusConfig.valid.bgColor,
                statusConfig.valid.textColor
              )}
            >
              {validCount} Valid
            </Badge>
            <Badge
              variant="secondary"
              className={cn(
                "text-xs",
                statusConfig.warning.bgColor,
                statusConfig.warning.textColor
              )}
            >
              {warningCount} Warnings
            </Badge>
            <Badge
              variant="secondary"
              className={cn(
                "text-xs",
                statusConfig.invalid.bgColor,
                statusConfig.invalid.textColor
              )}
            >
              {invalidCount} Invalid
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {rules.map((rule) => {
            const status = statusConfig[rule.status];
            const type = typeConfig[rule.type];

            return (
              <div
                key={rule.id}
                className={cn(
                  "rounded-lg border p-4",
                  status.bgColor
                )}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <span className="text-lg">{status.icon}</span>
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className={cn("text-sm font-medium", status.textColor)}>
                        {rule.name}
                      </p>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant="secondary"
                          className={cn(
                            "text-xs",
                            type.bgColor,
                            type.textColor
                          )}
                        >
                          {rule.type}
                        </Badge>
                        <Badge
                          variant="secondary"
                          className={cn(
                            "text-xs",
                            status.bgColor,
                            status.textColor
                          )}
                        >
                          {rule.status}
                        </Badge>
                      </div>
                    </div>

                    {rule.description && (
                      <p className={cn("text-sm", status.textColor)}>
                        {rule.description}
                      </p>
                    )}

                    {rule.message && (
                      <p className={cn("text-xs", status.textColor)}>
                        {rule.message}
                      </p>
                    )}

                    {rule.metadata && (
                      <div className="mt-2">
                        <p className={cn("text-xs font-medium", status.textColor)}>
                          Details
                        </p>
                        <pre className="mt-1 rounded bg-background p-2 text-xs">
                          {JSON.stringify(rule.metadata, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {rules.length === 0 && (
            <div className="flex items-center justify-center rounded-lg border border-dashed p-8">
              <p className="text-sm text-muted-foreground">
                No validation rules available
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 