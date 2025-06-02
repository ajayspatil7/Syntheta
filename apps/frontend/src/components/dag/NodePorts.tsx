import React from 'react';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { cn } from "@/lib/utils";

interface Port {
  id: string;
  label: string;
  type: string;
  description?: string;
  required?: boolean;
}

interface NodePortsProps {
  inputs: Port[];
  outputs: Port[];
  className?: string;
}

export function NodePorts({ inputs, outputs, className }: NodePortsProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {/* Inputs */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Inputs</h3>
        <div className="space-y-2">
          {inputs.map((input) => (
            <div
              key={input.id}
              className="flex items-center space-x-2 rounded-lg border bg-card p-2"
            >
              <ArrowLeft className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{input.label}</span>
                  {input.required && (
                    <span className="text-xs text-red-500">*</span>
                  )}
                </div>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <span>{input.type}</span>
                  {input.description && (
                    <>
                      <span>•</span>
                      <span>{input.description}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Outputs */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Outputs</h3>
        <div className="space-y-2">
          {outputs.map((output) => (
            <div
              key={output.id}
              className="flex items-center space-x-2 rounded-lg border bg-card p-2"
            >
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{output.label}</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <span>{output.type}</span>
                  {output.description && (
                    <>
                      <span>•</span>
                      <span>{output.description}</span>
                    </>
                  )}
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 