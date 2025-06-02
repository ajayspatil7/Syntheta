import React from 'react';
import { NodeHeader } from "./NodeHeader";
import { NodeConfiguration } from "./NodeConfiguration";
import { NodeHelp } from "./NodeHelp";
import { NodeError } from "./NodeError";
import { NodeLoading } from "./NodeLoading";
import { NodePorts } from "./NodePorts";
import { NodePreview } from "./NodePreview";
import { cn } from "@/lib/utils";

interface Port {
  id: string;
  label: string;
  type: string;
  description?: string;
  required?: boolean;
}

interface ConfigurationField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'boolean' | 'select';
  value: any;
  options?: { label: string; value: any }[];
  description?: string;
  required?: boolean;
}

interface HelpSection {
  id: string;
  title: string;
  content: React.ReactNode;
}

interface NodeProps {
  id: string;
  title: string;
  description?: string;
  status?: 'success' | 'error' | 'running' | 'idle';
  statusMessage?: string;
  error?: {
    message: string;
    details?: string;
    code?: string;
  };
  isLoading?: boolean;
  loadingMessage?: string;
  inputs: Port[];
  outputs: Port[];
  configuration: ConfigurationField[];
  help: HelpSection[];
  preview?: {
    data: any;
    type: 'json' | 'text' | 'image' | 'table';
  };
  onConfigure?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onRun?: () => void;
  onStop?: () => void;
  onSave?: () => void;
  onConfigurationChange: (values: Record<string, any>) => void;
  className?: string;
}

export function Node({
  id,
  title,
  description,
  status,
  statusMessage,
  error,
  isLoading,
  loadingMessage,
  inputs,
  outputs,
  configuration,
  help,
  preview,
  onConfigure,
  onDelete,
  onDuplicate,
  onRun,
  onStop,
  onSave,
  onConfigurationChange,
  className,
}: NodeProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <NodeHeader
        title={title}
        description={description}
        status={status}
        statusMessage={statusMessage}
        onConfigure={onConfigure}
        onDelete={onDelete}
        onDuplicate={onDuplicate}
        onRun={onRun}
        onStop={onStop}
        onSave={onSave}
        isRunning={status === 'running'}
      />

      {error && <NodeError error={error} />}

      {isLoading && <NodeLoading message={loadingMessage} />}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-4">
          <NodePorts inputs={inputs} outputs={outputs} />
          {configuration.length > 0 && (
            <NodeConfiguration
              fields={configuration}
              onSave={onConfigurationChange}
            />
          )}
        </div>

        <div className="space-y-4">
          {preview && (
            <NodePreview
              data={preview.data}
              type={preview.type}
            />
          )}
          {help.length > 0 && <NodeHelp sections={help} />}
        </div>
      </div>
    </div>
  );
} 