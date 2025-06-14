"use client";

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, AlertCircle, BarChart3, CheckCircle2, Clock, Database, PlayCircle, XCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';

interface DashboardStats {
  total_pipelines: number;
  active_runs_24h: number;
  success_rate_30d: number;
  status_distribution: Record<string, number>;
  recent_activity: Array<{
    id: number;
    dag_id: number;
    dag_name: string;
    status: string;
    started_at: string | null;
    completed_at: string | null;
    error: string | null;
    metrics: Record<string, any> | null;
  }>;
}

// Use the correct backend URL for browser access
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export default function DashboardPage() {
  const { data, isLoading, error, refetch } = useQuery<DashboardStats>({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No authorization token found');
      }

      try {
        const url = `${BACKEND_URL}/api/v1/dashboard/stats`;
        console.log('Attempting to fetch from:', url);
        console.log('Using token:', token.substring(0, 10) + '...');
        
        const res = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          console.error('Backend error response:', {
            status: res.status,
            statusText: res.statusText,
            errorData
          });
          throw new Error(errorData.detail || `Failed to fetch dashboard data: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();
        console.log('Successfully fetched dashboard data:', data);
        return data;
      } catch (error) {
        console.error('API Error details:', {
          error,
          message: error instanceof Error ? error.message : 'Unknown error',
          backendUrl: BACKEND_URL
        });
        if (error instanceof Error) {
          throw new Error(`Failed to connect to backend: ${error.message}`);
        }
        throw new Error('Failed to connect to backend service');
      }
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  <Skeleton className="h-4 w-[100px]" />
                </CardTitle>
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-[60px]" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : 'An error occurred while loading the dashboard'}
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={() => refetch()}>Retry</Button>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: "Total Pipelines",
      value: data?.total_pipelines || 0,
      icon: Database,
      description: "Active pipelines in your workspace",
    },
    {
      title: "Active Runs (24h)",
      value: data?.active_runs_24h || 0,
      icon: PlayCircle,
      description: "Currently running pipelines",
    },
    {
      title: "Success Rate (30d)",
      value: data?.success_rate_30d ? `${(data.success_rate_30d * 100).toFixed(1)}%` : "N/A",
      icon: BarChart3,
      description: "Pipeline success rate over last 30 days",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-500';
      case 'failed':
        return 'text-red-500';
      case 'running':
        return 'text-blue-500';
      case 'pending':
        return 'text-yellow-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running':
        return <PlayCircle className="h-4 w-4 text-blue-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Status Distribution (30d)</CardTitle>
          </CardHeader>
          <CardContent>
            {data?.status_distribution && Object.entries(data.status_distribution).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(data.status_distribution).map(([status, count]) => (
                  <div key={status} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-medium ${getStatusColor(status)}`}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                      <span className="text-sm text-muted-foreground">{count} runs</span>
                    </div>
                    <Progress value={(count / Math.max(...Object.values(data.status_distribution))) * 100} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-4">
                No status data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {data?.recent_activity && data.recent_activity.length > 0 ? (
              <div className="space-y-4">
                {data.recent_activity.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-4">
                    {getStatusIcon(activity.status)}
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {activity.dag_name || `Pipeline Run #${activity.id}`}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {activity.error || `Status: ${activity.status}`}
                      </p>
                      {activity.metrics && (
                        <div className="text-xs text-muted-foreground">
                          {Object.entries(activity.metrics).map(([key, value]) => (
                            <span key={key} className="mr-2">
                              {key}: {value}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {activity.started_at ? formatDistanceToNow(new Date(activity.started_at), { addSuffix: true }) : 'N/A'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-4">
                No recent activity
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 