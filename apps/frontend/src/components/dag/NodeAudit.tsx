import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AuditEntry {
  id: string;
  action: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  timestamp: string;
  changes: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  metadata?: Record<string, any>;
}

interface NodeAuditProps {
  title: string;
  description?: string;
  entries: AuditEntry[];
  className?: string;
}

export function NodeAudit({
  title,
  description,
  entries,
  className,
}: NodeAuditProps) {
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
          {entries.map((entry, index) => {
            const isLast = index === entries.length - 1;

            return (
              <div key={entry.id} className="relative">
                {/* Timeline line */}
                {!isLast && (
                  <div className="absolute left-4 top-8 h-full w-0.5 bg-border" />
                )}

                <div className="relative flex items-start space-x-3">
                  {/* Timeline dot */}
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    <span className="text-sm text-primary">📝</span>
                  </div>

                  {/* Audit content */}
                  <div className="flex-1 rounded-lg border bg-card p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {entry.user.avatar ? (
                          <img
                            src={entry.user.avatar}
                            alt={entry.user.name}
                            className="h-6 w-6 rounded-full"
                          />
                        ) : (
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                            <span className="text-xs font-medium text-primary">
                              {entry.user.name[0]}
                            </span>
                          </div>
                        )}
                        <p className="text-sm font-medium">
                          {entry.user.name}
                        </p>
                        <Badge variant="secondary" className="text-xs">
                          {entry.action}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {entry.timestamp}
                      </span>
                    </div>

                    <div className="mt-3 space-y-2">
                      {entry.changes.map((change, changeIndex) => (
                        <div
                          key={changeIndex}
                          className="rounded-md border bg-muted/50 p-2"
                        >
                          <p className="text-xs font-medium">
                            {change.field}
                          </p>
                          <div className="mt-1 grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <p className="text-muted-foreground">Old Value</p>
                              <pre className="mt-1 rounded bg-background p-1">
                                {JSON.stringify(change.oldValue, null, 2)}
                              </pre>
                            </div>
                            <div>
                              <p className="text-muted-foreground">New Value</p>
                              <pre className="mt-1 rounded bg-background p-1">
                                {JSON.stringify(change.newValue, null, 2)}
                              </pre>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {entry.metadata && (
                      <div className="mt-3">
                        <p className="text-xs font-medium text-muted-foreground">
                          Metadata
                        </p>
                        <pre className="mt-1 rounded bg-muted/50 p-2 text-xs">
                          {JSON.stringify(entry.metadata, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {entries.length === 0 && (
            <div className="flex items-center justify-center rounded-lg border border-dashed p-8">
              <p className="text-sm text-muted-foreground">
                No audit entries found
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 