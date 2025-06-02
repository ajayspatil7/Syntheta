import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Setting {
  id: string;
  name: string;
  description?: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'multiselect' | 'json';
  value: any;
  options?: {
    label: string;
    value: any;
  }[];
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: string;
    custom?: (value: any) => boolean;
  };
  metadata?: Record<string, any>;
}

interface NodeSettingsProps {
  title: string;
  description?: string;
  settings: Setting[];
  onSettingChange: (settingId: string, value: any) => void;
  className?: string;
}

export function NodeSettings({
  title,
  description,
  settings,
  onSettingChange,
  className,
}: NodeSettingsProps) {
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const validateSetting = (setting: Setting, value: any): string | null => {
    if (setting.validation?.required && !value) {
      return 'This field is required';
    }

    if (setting.type === 'number') {
      const numValue = Number(value);
      if (setting.validation?.min !== undefined && numValue < setting.validation.min) {
        return `Value must be at least ${setting.validation.min}`;
      }
      if (setting.validation?.max !== undefined && numValue > setting.validation.max) {
        return `Value must be at most ${setting.validation.max}`;
      }
    }

    if (setting.validation?.pattern) {
      const regex = new RegExp(setting.validation.pattern);
      if (!regex.test(value)) {
        return 'Invalid format';
      }
    }

    if (setting.validation?.custom && !setting.validation.custom(value)) {
      return 'Invalid value';
    }

    return null;
  };

  const handleSettingChange = (setting: Setting, value: any) => {
    const error = validateSetting(setting, value);
    setErrors((prev) => ({
      ...prev,
      [setting.id]: error || '',
    }));

    if (!error) {
      onSettingChange(setting.id, value);
    }
  };

  const renderSettingInput = (setting: Setting) => {
    const error = errors[setting.id];

    switch (setting.type) {
      case 'text':
        return (
          <input
            type="text"
            value={setting.value}
            onChange={(e) => handleSettingChange(setting, e.target.value)}
            className={cn(
              "w-full rounded-md border bg-background px-3 py-2 text-sm",
              error && "border-red-500"
            )}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={setting.value}
            onChange={(e) => handleSettingChange(setting, e.target.value)}
            min={setting.validation?.min}
            max={setting.validation?.max}
            className={cn(
              "w-full rounded-md border bg-background px-3 py-2 text-sm",
              error && "border-red-500"
            )}
          />
        );

      case 'boolean':
        return (
          <input
            type="checkbox"
            checked={setting.value}
            onChange={(e) => handleSettingChange(setting, e.target.checked)}
            className="h-4 w-4 rounded border-gray-300"
          />
        );

      case 'select':
        return (
          <select
            value={setting.value}
            onChange={(e) => handleSettingChange(setting, e.target.value)}
            className={cn(
              "w-full rounded-md border bg-background px-3 py-2 text-sm",
              error && "border-red-500"
            )}
          >
            {setting.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'multiselect':
        return (
          <select
            multiple
            value={setting.value}
            onChange={(e) => {
              const values = Array.from(
                e.target.selectedOptions,
                (option) => option.value
              );
              handleSettingChange(setting, values);
            }}
            className={cn(
              "w-full rounded-md border bg-background px-3 py-2 text-sm",
              error && "border-red-500"
            )}
          >
            {setting.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'json':
        return (
          <textarea
            value={JSON.stringify(setting.value, null, 2)}
            onChange={(e) => {
              try {
                const value = JSON.parse(e.target.value);
                handleSettingChange(setting, value);
              } catch (err) {
                setErrors((prev) => ({
                  ...prev,
                  [setting.id]: 'Invalid JSON',
                }));
              }
            }}
            className={cn(
              "w-full rounded-md border bg-background px-3 py-2 text-sm font-mono",
              error && "border-red-500"
            )}
            rows={4}
          />
        );

      default:
        return null;
    }
  };

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
          {settings.map((setting) => (
            <div key={setting.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor={setting.id}
                  className="text-sm font-medium"
                >
                  {setting.name}
                  {setting.validation?.required && (
                    <span className="ml-1 text-red-500">*</span>
                  )}
                </label>
                {setting.metadata && (
                  <Badge variant="secondary" className="text-xs">
                    {setting.metadata.type}
                  </Badge>
                )}
              </div>

              {setting.description && (
                <p className="text-sm text-muted-foreground">
                  {setting.description}
                </p>
              )}

              {renderSettingInput(setting)}

              {errors[setting.id] && (
                <p className="text-xs text-red-500">
                  {errors[setting.id]}
                </p>
              )}

              {setting.metadata && (
                <div className="mt-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    Details
                  </p>
                  <pre className="mt-1 rounded bg-muted/50 p-2 text-xs">
                    {JSON.stringify(setting.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ))}

          {settings.length === 0 && (
            <div className="flex items-center justify-center rounded-lg border border-dashed p-8">
              <p className="text-sm text-muted-foreground">
                No settings available
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 