'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';

interface RunHistoryProps {
  dagId: string;
}

interface DAGRun {
  id: number;
  status: string;
  started_at: string;
  completed_at: string | null;
  error: string | null;
  metrics: any;
}

interface ExecutionLog {
  id: number;
  node_id: string;
  status: string;
  started_at: string;
  completed_at: string | null;
  error: string | null;
  error_type: string | null;
  metrics: any;
}

const getStatusVariant = (status: string): "destructive" | "default" | "secondary" | "outline" => {
  switch (status) {
    case 'completed':
      return 'default';
    case 'failed':
      return 'destructive';
    case 'running':
      return 'default';
    case 'paused':
      return 'secondary';
    default:
      return 'secondary';
  }
};

export function RunHistory({ dagId }: RunHistoryProps) {
  const [timeFilter, setTimeFilter] = React.useState('24h');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [selectedRun, setSelectedRun] = React.useState<DAGRun | null>(null);

  const { data: runs, isLoading, error } = useQuery({
    queryKey: ['dag-runs', dagId],
    queryFn: async () => {
      const response = await fetch(`/api/dags/${dagId}/runs`);
      if (!response.ok) throw new Error('Failed to fetch runs');
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="p-4">
        <p className="text-sm text-muted-foreground">Loading runs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <p className="text-sm text-red-500">Error loading runs</p>
      </div>
    );
  }

  if (!runs || runs.length === 0) {
    return (
      <div className="p-4">
        <p className="text-sm text-muted-foreground">No runs available</p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Run History</CardTitle>
          <div className="flex space-x-4">
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Time period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Last 24 hours</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="running">Running</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="runs">
          <TabsList>
            <TabsTrigger value="runs">Runs</TabsTrigger>
            {selectedRun && <TabsTrigger value="details">Details</TabsTrigger>}
          </TabsList>
          <TabsContent value="runs">
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {runs.map((run: DAGRun) => (
                  <Card key={run.id} className="p-4 border-b cursor-pointer hover:bg-accent" onClick={() => setSelectedRun(run)}>
                    <CardContent className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Run #{run.id}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(run.started_at), { addSuffix: true })}
                        </p>
                      </div>
                      <Badge variant={getStatusVariant(run.status)}>
                        {run.status}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
          {selectedRun && (
            <TabsContent value="details">
              <RunDetails
                run={selectedRun}
                logs={null}
                metrics={null}
                isLoadingLogs={false}
                isLoadingMetrics={false}
              />
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
}

interface RunDetailsProps {
  run: DAGRun;
  logs: ExecutionLog[] | null;
  metrics: any;
  isLoadingLogs: boolean;
  isLoadingMetrics: boolean;
}

function RunDetails({
  run,
  logs,
  metrics,
  isLoadingLogs,
  isLoadingMetrics
}: RunDetailsProps) {
  return (
    <div className="space-y-6">
      {/* Run Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="font-medium">Run Summary</h3>
          <dl className="mt-2 space-y-1">
            <div>
              <dt className="text-sm text-muted-foreground">Status</dt>
              <dd>{run.status}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Started</dt>
              <dd>{new Date(run.started_at).toLocaleString()}</dd>
            </div>
            {run.completed_at && (
              <div>
                <dt className="text-sm text-muted-foreground">Completed</dt>
                <dd>{new Date(run.completed_at).toLocaleString()}</dd>
              </div>
            )}
          </dl>
        </div>
        {metrics && (
          <div>
            <h3 className="font-medium">Metrics</h3>
            <dl className="mt-2 space-y-1">
              <div>
                <dt className="text-sm text-muted-foreground">Total Duration</dt>
                <dd>{metrics.total_duration_seconds.toFixed(2)}s</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Total Input Size</dt>
                <dd>{(metrics.total_input_size_bytes / 1024).toFixed(2)}KB</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Total Output Size</dt>
                <dd>{(metrics.total_output_size_bytes / 1024).toFixed(2)}KB</dd>
              </div>
            </dl>
          </div>
        )}
      </div>

      {/* Execution Logs */}
      <div>
        <h3 className="font-medium mb-4">Execution Logs</h3>
        {isLoadingLogs ? (
          <p>Loading logs...</p>
        ) : (
          <div className="space-y-4">
            {logs?.map((log) => (
              <div key={log.id} className="p-4 border rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Node {log.node_id}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(log.started_at).toLocaleString()}
                    </p>
                  </div>
                  <Badge variant={getStatusVariant(log.status)}>
                    {log.status}
                  </Badge>
                </div>
                {log.error && (
                  <div className="mt-2 p-2 bg-destructive/10 rounded">
                    <p className="text-sm text-destructive">{log.error}</p>
                    {log.error_type && (
                      <p className="text-xs text-muted-foreground">
                        Error Type: {log.error_type}
                      </p>
                    )}
                  </div>
                )}
                {log.metrics && (
                  <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Duration:</span>{' '}
                      {log.metrics.duration_seconds.toFixed(2)}s
                    </div>
                    <div>
                      <span className="text-muted-foreground">Input:</span>{' '}
                      {(log.metrics.input_size_bytes / 1024).toFixed(2)}KB
                    </div>
                    <div>
                      <span className="text-muted-foreground">Output:</span>{' '}
                      {(log.metrics.output_size_bytes / 1024).toFixed(2)}KB
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 