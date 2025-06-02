import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NodeNotificationsProps {
  title: string;
  description?: string;
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  className?: string;
}

const notificationTypeConfig: Record<
  Notification['type'],
  {
    color: string;
    bgColor: string;
    textColor: string;
  }
> = {
  info: {
    color: 'text-blue-500',
    bgColor: 'bg-blue-50 dark:bg-blue-950',
    textColor: 'text-blue-800 dark:text-blue-200',
  },
  success: {
    color: 'text-green-500',
    bgColor: 'bg-green-50 dark:bg-green-950',
    textColor: 'text-green-800 dark:text-green-200',
  },
  warning: {
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950',
    textColor: 'text-yellow-800 dark:text-yellow-200',
  },
  error: {
    color: 'text-red-500',
    bgColor: 'bg-red-50 dark:bg-red-950',
    textColor: 'text-red-800 dark:text-red-200',
  },
};

export function NodeNotifications({
  title,
  description,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  className,
}: NodeNotificationsProps) {
  const unreadCount = notifications.filter((n) => !n.read).length;

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
          {unreadCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {unreadCount} unread
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {notifications.map((notification) => {
          const typeConfig = notificationTypeConfig[notification.type];

          return (
            <div
              key={notification.id}
              className={cn(
                "rounded-lg border p-3",
                typeConfig.bgColor,
                !notification.read && "border-l-4 border-l-primary"
              )}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <p className={cn("text-sm font-medium", typeConfig.textColor)}>
                      {notification.title}
                    </p>
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-xs",
                        typeConfig.bgColor,
                        typeConfig.textColor
                      )}
                    >
                      {notification.type}
                    </Badge>
                    {!notification.read && (
                      <Badge
                        variant="outline"
                        className="text-xs text-primary"
                      >
                        New
                      </Badge>
                    )}
                  </div>
                  <p className={cn("text-sm", typeConfig.textColor)}>
                    {notification.message}
                  </p>
                  <p className={cn("text-xs", typeConfig.textColor)}>
                    {notification.timestamp}
                  </p>
                </div>
                {!notification.read && (
                  <button
                    onClick={() => onMarkAsRead(notification.id)}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Mark as read
                  </button>
                )}
              </div>

              {notification.action && (
                <div className="mt-3">
                  <button
                    onClick={notification.action.onClick}
                    className={cn(
                      "rounded-md px-3 py-1 text-xs font-medium",
                      typeConfig.bgColor,
                      typeConfig.textColor,
                      "hover:opacity-80"
                    )}
                  >
                    {notification.action.label}
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {notifications.length === 0 && (
          <div className="flex items-center justify-center rounded-lg border border-dashed p-8">
            <p className="text-sm text-muted-foreground">
              No notifications found
            </p>
          </div>
        )}

        {notifications.length > 0 && unreadCount > 0 && (
          <div className="flex justify-end">
            <button
              onClick={onMarkAllAsRead}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Mark all as read
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 