import React from 'react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  Settings,
  Trash2,
  Copy,
  MoreVertical,
  Play,
  StopCircle,
  Save,
} from 'lucide-react';

interface NodeToolbarProps {
  onConfigure?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onRun?: () => void;
  onStop?: () => void;
  onSave?: () => void;
  isRunning?: boolean;
  className?: string;
}

export function NodeToolbar({
  onConfigure,
  onDelete,
  onDuplicate,
  onRun,
  onStop,
  onSave,
  isRunning = false,
  className,
}: NodeToolbarProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between space-x-2 rounded-lg border bg-card p-2",
        className
      )}
    >
      <div className="flex items-center space-x-2">
        {onConfigure && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onConfigure}
            className="h-8 w-8"
          >
            <Settings className="h-4 w-4" />
          </Button>
        )}
        {onRun && !isRunning && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onRun}
            className="h-8 w-8"
          >
            <Play className="h-4 w-4" />
          </Button>
        )}
        {onStop && isRunning && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onStop}
            className="h-8 w-8"
          >
            <StopCircle className="h-4 w-4" />
          </Button>
        )}
        {onSave && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onSave}
            className="h-8 w-8"
          >
            <Save className="h-4 w-4" />
          </Button>
        )}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {onDuplicate && (
            <DropdownMenuItem onClick={onDuplicate}>
              <Copy className="mr-2 h-4 w-4" />
              Duplicate
            </DropdownMenuItem>
          )}
          {onDelete && (
            <DropdownMenuItem
              onClick={onDelete}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
} 