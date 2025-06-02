import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface DocumentationSection {
  id: string;
  title: string;
  content: string;
  type: 'overview' | 'usage' | 'api' | 'examples' | 'notes' | 'references';
  metadata?: Record<string, any>;
}

interface NodeDocumentationProps {
  title: string;
  description?: string;
  sections: DocumentationSection[];
  className?: string;
}

const typeConfig: Record<
  DocumentationSection['type'],
  {
    color: string;
    bgColor: string;
    textColor: string;
    icon: string;
  }
> = {
  overview: {
    color: 'text-blue-500',
    bgColor: 'bg-blue-50 dark:bg-blue-950',
    textColor: 'text-blue-800 dark:text-blue-200',
    icon: '📝',
  },
  usage: {
    color: 'text-green-500',
    bgColor: 'bg-green-50 dark:bg-green-950',
    textColor: 'text-green-800 dark:text-green-200',
    icon: '🎯',
  },
  api: {
    color: 'text-purple-500',
    bgColor: 'bg-purple-50 dark:bg-purple-950',
    textColor: 'text-purple-800 dark:text-purple-200',
    icon: '🔌',
  },
  examples: {
    color: 'text-orange-500',
    bgColor: 'bg-orange-50 dark:bg-orange-950',
    textColor: 'text-orange-800 dark:text-orange-200',
    icon: '💡',
  },
  notes: {
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950',
    textColor: 'text-yellow-800 dark:text-yellow-200',
    icon: '📌',
  },
  references: {
    color: 'text-gray-500',
    bgColor: 'bg-gray-50 dark:bg-gray-950',
    textColor: 'text-gray-800 dark:text-gray-200',
    icon: '🔗',
  },
};

export function NodeDocumentation({
  title,
  description,
  sections,
  className,
}: NodeDocumentationProps) {
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
          {sections.map((section) => {
            const type = typeConfig[section.type];

            return (
              <div
                key={section.id}
                className={cn(
                  "rounded-lg border p-4",
                  type.bgColor
                )}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <span className="text-lg">{type.icon}</span>
                  </div>

                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className={cn("text-sm font-medium", type.textColor)}>
                        {section.title}
                      </p>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-xs",
                          type.bgColor,
                          type.textColor
                        )}
                      >
                        {section.type}
                      </Badge>
                    </div>

                    <div className={cn("prose prose-sm max-w-none", type.textColor)}>
                      {section.content.split('\n').map((paragraph, index) => (
                        <p key={index} className="mb-2 last:mb-0">
                          {paragraph}
                        </p>
                      ))}
                    </div>

                    {section.metadata && (
                      <div>
                        <p className={cn("text-xs font-medium", type.textColor)}>
                          Details
                        </p>
                        <pre className="mt-1 rounded bg-background p-2 text-xs">
                          {JSON.stringify(section.metadata, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {sections.length === 0 && (
            <div className="flex items-center justify-center rounded-lg border border-dashed p-8">
              <p className="text-sm text-muted-foreground">
                No documentation available
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 