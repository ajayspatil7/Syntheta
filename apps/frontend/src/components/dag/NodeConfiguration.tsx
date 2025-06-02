import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface ConfigField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'textarea' | 'boolean';
  value: any;
  description?: string;
  required?: boolean;
  placeholder?: string;
  min?: number;
  max?: number;
}

interface NodeConfigurationProps {
  title: string;
  description?: string;
  fields: ConfigField[];
  onChange: (id: string, value: any) => void;
  className?: string;
}

export function NodeConfiguration({
  title,
  description,
  fields,
  onChange,
  className,
}: NodeConfigurationProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {fields.map((field) => (
          <div key={field.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor={field.id}>
                {field.label}
                {field.required && (
                  <span className="ml-1 text-red-500">*</span>
                )}
              </Label>
              {field.type === 'boolean' && (
                <Switch
                  id={field.id}
                  checked={field.value}
                  onCheckedChange={(checked) => onChange(field.id, checked)}
                />
              )}
            </div>
            {field.description && (
              <p className="text-sm text-muted-foreground">
                {field.description}
              </p>
            )}
            {field.type !== 'boolean' && (
              field.type === 'textarea' ? (
                <Textarea
                  id={field.id}
                  value={field.value}
                  onChange={(e) => onChange(field.id, e.target.value)}
                  placeholder={field.placeholder}
                  className="min-h-[100px]"
                />
              ) : (
                <Input
                  id={field.id}
                  type={field.type}
                  value={field.value}
                  onChange={(e) => {
                    const value = field.type === 'number'
                      ? parseFloat(e.target.value)
                      : e.target.value;
                    onChange(field.id, value);
                  }}
                  placeholder={field.placeholder}
                  min={field.min}
                  max={field.max}
                />
              )
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
} 