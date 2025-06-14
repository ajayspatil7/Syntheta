import React from 'react';
import { Node } from 'reactflow';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Upload, Database, CheckCircle2, XCircle } from 'lucide-react';
import {
  SourceNodeConfig,
  GeneratorNodeConfig,
  EvaluatorNodeConfig,
  ExporterNodeConfig,
  SourceNodeConfigSchema,
  GeneratorNodeConfigSchema,
  EvaluatorNodeConfigSchema,
  ExporterNodeConfigSchema,
  DataQualityRule,
  GeneratorConstraintParams,
} from '@/types/dag';
import { getNodeValidationErrors } from '@/utils/dagValidation';
import { z } from 'zod';
import { ScrollArea } from "@/components/ui/scroll-area";

// Define types for nested enums in GeneratorNodeConfigSchema for explicit casting
type GeneratorConstraint = z.infer<typeof GeneratorNodeConfigSchema>['constraints'] extends (infer T)[] | undefined ? T : never;
type GeneratorConstraintType = GeneratorConstraint extends { type: infer T } ? T : never;
type DistributionType = GeneratorConstraint['params'] extends { distribution: infer T } ? T : never;
type CorrelationType = GeneratorConstraint['params'] extends { correlation_type: infer T } ? T : never;

interface NodeConfigPanelProps {
  node: Node | null;
  onConfigChange: (nodeId: string, config: any) => void;
}

function NodeConfigPanel({ node, onConfigChange }: NodeConfigPanelProps) {
  const [errors, setErrors] = React.useState<string[]>([]);
  const [validationState, setValidationState] = React.useState<Record<string, { isValid: boolean; message?: string }>>({});
  const [requiredMetricInput, setRequiredMetricInput] = React.useState('');
  const [thresholdMetricInput, setThresholdMetricInput] = React.useState('');
  const [thresholdValueInput, setThresholdValueInput] = React.useState('');
  const [notification, setNotification] = React.useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Get default config based on node type
  const getDefaultConfig = (type: string) => {
    switch (type) {
      case 'source':
        return {
          type: 'csv',
          connection: { path: '' },
          options: { delimiter: ',', encoding: 'utf-8' },
          schema: { columns: [] },
          validation: { required_columns: [], data_quality_rules: [] },
        };
      case 'generator':
        return {
          type: 'ctgan',
          parameters: { num_samples: 1000 },
          constraints: [],
          data_quality: { privacy: {}, validation: { required_metrics: [], thresholds: {} } },
          output_format: { schema: { columns: [] } },
        };
      case 'evaluator':
        return {
          metrics: [],
          validation: { required_metrics: [], thresholds: [], data_quality_rules: [] },
        };
      case 'exporter':
        return {
          type: 'csv',
          destination: { path: '' },
          options: { delimiter: ',', encoding: 'utf-8' },
          validation: { required_metrics: [], thresholds: {} },
          metrics: [],
          format: 'csv',
          compression: 'none',
        };
      default:
        return {};
    }
  };

  // Initialize pendingConfig with default values if node exists
  const [pendingConfig, setPendingConfig] = React.useState<any>(
    node && node.type ? (node.data.config || getDefaultConfig(node.type)) : null
  );

  // Update local state when node changes
  React.useEffect(() => {
    if (node && node.type) {
      setPendingConfig(node.data.config || getDefaultConfig(node.type));
      setErrors([]); // Clear errors when node changes
      validateConfig(node.type, node.data.config || getDefaultConfig(node.type));
    } else {
      setPendingConfig(null);
    }
  }, [node]);

  // Real-time validation
  const validateConfig = (type: string, config: any) => {
    let validationResult;
    try {
      switch (type) {
        case 'source':
          validationResult = SourceNodeConfigSchema.safeParse(config);
          break;
        case 'generator':
          validationResult = GeneratorNodeConfigSchema.safeParse(config);
          break;
        case 'evaluator':
          validationResult = EvaluatorNodeConfigSchema.safeParse(config);
          break;
        case 'exporter':
          validationResult = ExporterNodeConfigSchema.safeParse(config);
          break;
        default:
          validationResult = { success: true, data: config };
      }

      if (!validationResult.success && validationResult.error) {
        const newValidationState: Record<string, { isValid: boolean; message?: string }> = {};
        validationResult.error.errors.forEach(err => {
          newValidationState[err.path.join('.')] = {
            isValid: false,
            message: err.message
          };
        });
        setValidationState(newValidationState);
      } else {
        setValidationState({});
      }
    } catch (error) {
      console.error("Validation error:", error);
      setValidationState({
        _error: {
          isValid: false,
          message: `An unexpected validation error occurred: ${error}`
        }
      });
    }
  };

  // Update local pending config with validation
  const handleConfigChange = (key: string, value: unknown) => {
    const updatedConfig = {
      ...(pendingConfig || {}),
      [key]: value,
    };
    setPendingConfig(updatedConfig);
    if (node?.type) {
      validateConfig(node.type, updatedConfig);
    }
  };

  // Update local pending nested config with validation
  const handleNestedConfigChange = (configKey: string, key: string, value: unknown) => {
    const currentPendingConfig = (pendingConfig || {}) || {};
    const nestedConfig = currentPendingConfig[configKey] || {};
    const updatedNestedConfig = {
      ...nestedConfig,
      [key]: value,
    };
    const updatedConfig = {
      ...currentPendingConfig,
      [configKey]: updatedNestedConfig,
    };
    setPendingConfig(updatedConfig);
    if (node?.type) {
      validateConfig(node.type, updatedConfig);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !node) return;

    // Handle file upload based on node type
    switch (node.type) {
      case 'source':
        const sourceConfig = (pendingConfig || {}) as SourceNodeConfig;
        if (sourceConfig.type === 'csv') {
          // Create a FileReader to read the file
          const reader = new FileReader();
          reader.onload = (e) => {
            // Store the file content in memory (you might want to handle this differently in production)
            const fileContent = e.target?.result;
            // Update the config with both the file path and content
            handleNestedConfigChange('connection', 'path', file.name);
            handleNestedConfigChange('connection', 'fileContent', fileContent);
          };
          reader.readAsText(file);
        }
        break;
      case 'exporter':
        // Handle exporter file upload (e.g., for specifying schema or reference data)
        break;
    }
    // Clear the input value so the same file can be selected again
    event.target.value = '';
  };

  const handleAddRequiredMetric = () => {
    if (requiredMetricInput.trim() === '') return;
    const currentMetrics = pendingConfig?.validation?.required_metrics || [];
    const updatedMetrics = [...currentMetrics, requiredMetricInput.trim()];
    handleNestedConfigChange('validation', 'required_metrics', updatedMetrics);
    setRequiredMetricInput('');
  };

  const handleRemoveRequiredMetric = (index: number) => {
    const currentMetrics = pendingConfig?.validation?.required_metrics || [];
    const updatedMetrics = currentMetrics.filter((_: unknown, i: number) => i !== index);
    handleNestedConfigChange('validation', 'required_metrics', updatedMetrics);
  };

  const handleAddThreshold = () => {
    if (thresholdMetricInput.trim() === '' || thresholdValueInput.trim() === '') return;
    const currentThresholds = pendingConfig?.validation?.thresholds || {};
    const updatedThresholds = {
      ...currentThresholds,
      [thresholdMetricInput.trim()]: parseFloat(thresholdValueInput.trim()),
    };
    handleNestedConfigChange('validation', 'thresholds', updatedThresholds);
    setThresholdMetricInput('');
    setThresholdValueInput('');
  };

  const handleRemoveThreshold = (metricName: string) => {
    const currentThresholds = pendingConfig?.validation?.thresholds || {};
    const updatedThresholds = { ...currentThresholds };
    delete updatedThresholds[metricName];
    handleNestedConfigChange('validation', 'thresholds', updatedThresholds);
  };

  // Handle saving the configuration
  const handleSaveConfig = () => {
    if (!node) return;

    // Validate the pending config using Zod before saving
    let validationResult;
    try {
      switch (node.type) {
        case 'source':
          validationResult = SourceNodeConfigSchema.safeParse(pendingConfig);
          break;
        case 'generator':
          validationResult = GeneratorNodeConfigSchema.safeParse(pendingConfig);
          break;
        case 'evaluator':
          validationResult = EvaluatorNodeConfigSchema.safeParse(pendingConfig);
          break;
        case 'exporter':
          validationResult = ExporterNodeConfigSchema.safeParse(pendingConfig);
          break;
        default:
          validationResult = { success: true, data: pendingConfig };
      }

      if (!validationResult.success && validationResult.error) {
        const errorMessages = validationResult.error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
        setErrors(errorMessages);
        setNotification({
          type: 'error',
          message: 'Please fix the errors before saving.'
        });
      } else {
        setErrors([]);
        onConfigChange(node.id, pendingConfig);
        setNotification({
          type: 'success',
          message: 'Configuration saved successfully.'
        });
      }
    } catch (error) {
      console.error("Validation error:", error);
      setErrors([`An unexpected validation error occurred: ${error}`]);
      setNotification({
        type: 'error',
        message: 'An unexpected error occurred while saving.'
      });
    }
  };

  // Helper function to render validation status
  const renderValidationStatus = (field: string) => {
    const status = validationState[field];
    if (!status) return null;

    return status.isValid ? (
      <CheckCircle2 className="h-4 w-4 text-green-500" />
    ) : (
      <div className="flex items-center space-x-1">
        <XCircle className="h-4 w-4 text-red-500" />
        <span className="text-sm text-red-500">{status.message}</span>
      </div>
    );
  };

  const renderSourceConfig = (config: SourceNodeConfig) => {
    if (!config) return null;
    
    return (
      <Tabs defaultValue="connection" className="h-full">
        <div className="border-b border-border">
          <TabsList className="h-12 w-full justify-start rounded-none border-b bg-transparent p-0">
            <TabsTrigger
              value="connection"
              className="h-12 rounded-none border-b-2 border-transparent px-4 data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              Connection
            </TabsTrigger>
            <TabsTrigger
              value="schema"
              className="h-12 rounded-none border-b-2 border-transparent px-4 data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              Schema
            </TabsTrigger>
            <TabsTrigger
              value="options"
              className="h-12 rounded-none border-b-2 border-transparent px-4 data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              Options
            </TabsTrigger>
            <TabsTrigger
              value="validation"
              className="h-12 rounded-none border-b-2 border-transparent px-4 data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              Validation
            </TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea className="h-[calc(100vh-12rem)]">
          <div className="p-6">
            <TabsContent value="connection" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Connection Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <Label>Source Type</Label>
                    <Select
                      value={config.type || 'csv'}
                      onValueChange={(value) => handleConfigChange('type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select source type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="csv">CSV File</SelectItem>
                        <SelectItem value="postgresql">PostgreSQL</SelectItem>
                        <SelectItem value="mysql">MySQL</SelectItem>
                        <SelectItem value="minio">MinIO</SelectItem>
                        <SelectItem value="s3">Amazon S3</SelectItem>
                        <SelectItem value="api">API</SelectItem>
                        <SelectItem value="kafka">Kafka</SelectItem>
                      </SelectContent>
                    </Select>
                    {renderValidationStatus('type')}
                  </div>

                  {config.type === 'csv' && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>File Path</Label>
                        <div className="flex space-x-2">
                          <Input
                            value={config.connection?.path || ''}
                            onChange={(e) => handleNestedConfigChange('connection', 'path', e.target.value)}
                            placeholder="Enter file path"
                          />
                          <Button variant="outline" size="icon" onClick={() => document.getElementById('file-upload')?.click()}>
                            <Upload className="h-4 w-4" />
                          </Button>
                          <input
                            id="file-upload"
                            type="file"
                            className="hidden"
                            accept=".csv"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleNestedConfigChange('connection', 'path', file.name);
                              }
                            }}
                          />
                        </div>
                        {renderValidationStatus('connection.path')}
                      </div>
                    </div>
                  )}

                  {['postgresql', 'mysql'].includes(config.type) && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Host</Label>
                        <Input
                          value={config.connection?.host || ''}
                          onChange={(e) => handleNestedConfigChange('connection', 'host', e.target.value)}
                          placeholder="Enter host"
                        />
                        {renderValidationStatus('connection.host')}
                      </div>
                      <div className="space-y-2">
                        <Label>Port</Label>
                        <Input
                          type="number"
                          value={config.connection?.port || ''}
                          onChange={(e) => handleNestedConfigChange('connection', 'port', parseInt(e.target.value))}
                          placeholder="Enter port"
                        />
                        {renderValidationStatus('connection.port')}
                      </div>
                      <div className="space-y-2">
                        <Label>Database</Label>
                        <Input
                          value={config.connection?.database || ''}
                          onChange={(e) => handleNestedConfigChange('connection', 'database', e.target.value)}
                          placeholder="Enter database name"
                        />
                        {renderValidationStatus('connection.database')}
                      </div>
                      <div className="space-y-2">
                        <Label>Username</Label>
                        <Input
                          value={config.connection?.username || ''}
                          onChange={(e) => handleNestedConfigChange('connection', 'username', e.target.value)}
                          placeholder="Enter username"
                        />
                        {renderValidationStatus('connection.username')}
                      </div>
                      <div className="space-y-2">
                        <Label>Password</Label>
                        <Input
                          type="password"
                          value={config.connection?.password || ''}
                          onChange={(e) => handleNestedConfigChange('connection', 'password', e.target.value)}
                          placeholder="Enter password"
                        />
                        {renderValidationStatus('connection.password')}
                      </div>
                    </div>
                  )}

                  {config.type === 's3' && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Bucket</Label>
                        <Input
                          value={config.connection?.bucket || ''}
                          onChange={(e) => handleNestedConfigChange('connection', 'bucket', e.target.value)}
                          placeholder="Enter bucket name"
                        />
                        {renderValidationStatus('connection.bucket')}
                      </div>
                      <div className="space-y-2">
                        <Label>Path</Label>
                        <Input
                          value={config.connection?.path || ''}
                          onChange={(e) => handleNestedConfigChange('connection', 'path', e.target.value)}
                          placeholder="Enter file path"
                        />
                        {renderValidationStatus('connection.path')}
                      </div>
                      <div className="space-y-2">
                        <Label>Region</Label>
                        <Input
                          value={config.connection?.region || ''}
                          onChange={(e) => handleNestedConfigChange('connection', 'region', e.target.value)}
                          placeholder="Enter region"
                        />
                        {renderValidationStatus('connection.region')}
                      </div>
                    </div>
                  )}

                  {config.type === 'api' && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>URL</Label>
                        <Input
                          value={config.connection?.url || ''}
                          onChange={(e) => handleNestedConfigChange('connection', 'url', e.target.value)}
                          placeholder="Enter API URL"
                        />
                        {renderValidationStatus('connection.url')}
                      </div>
                      <div className="space-y-2">
                        <Label>Method</Label>
                        <Select
                          value={config.connection?.method || 'GET'}
                          onValueChange={(value) => handleNestedConfigChange('connection', 'method', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select method" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="GET">GET</SelectItem>
                            <SelectItem value="POST">POST</SelectItem>
                            <SelectItem value="PUT">PUT</SelectItem>
                            <SelectItem value="DELETE">DELETE</SelectItem>
                          </SelectContent>
                        </Select>
                        {renderValidationStatus('connection.method')}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="schema" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Schema Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Columns</Label>
                    {(config.schema?.columns || []).map((column, index) => (
                      <div key={index} className="space-y-2 p-4 border rounded-lg">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Name</Label>
                            <Input
                              value={column.name}
                              onChange={(e) => {
                                const updatedColumns = [...(config.schema?.columns || [])];
                                updatedColumns[index] = { ...column, name: e.target.value };
                                handleNestedConfigChange('schema', 'columns', updatedColumns);
                              }}
                              placeholder="Column name"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Type</Label>
                            <Select
                              value={column.type}
                              onValueChange={(value) => {
                                const updatedColumns = [...(config.schema?.columns || [])];
                                updatedColumns[index] = { ...column, type: value as 'string' | 'number' | 'boolean' | 'date' | 'datetime' | 'json' | 'array' };
                                handleNestedConfigChange('schema', 'columns', updatedColumns);
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="string">String</SelectItem>
                                <SelectItem value="number">Number</SelectItem>
                                <SelectItem value="boolean">Boolean</SelectItem>
                                <SelectItem value="date">Date</SelectItem>
                                <SelectItem value="datetime">DateTime</SelectItem>
                                <SelectItem value="json">JSON</SelectItem>
                                <SelectItem value="array">Array</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Input
                            value={column.description || ''}
                            onChange={(e) => {
                              const updatedColumns = [...(config.schema?.columns || [])];
                              updatedColumns[index] = { ...column, description: e.target.value };
                              handleNestedConfigChange('schema', 'columns', updatedColumns);
                            }}
                            placeholder="Column description"
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id={`nullable-${index}`}
                            checked={column.nullable}
                            onCheckedChange={(checked) => {
                              const updatedColumns = [...(config.schema?.columns || [])];
                              updatedColumns[index] = { ...column, nullable: checked };
                              handleNestedConfigChange('schema', 'columns', updatedColumns);
                            }}
                          />
                          <Label htmlFor={`nullable-${index}`}>Nullable</Label>
                        </div>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      onClick={() => {
                        const updatedColumns = [...(config.schema?.columns || []), {
                          name: '',
                          type: 'string',
                          nullable: true,
                        }];
                        handleNestedConfigChange('schema', 'columns', updatedColumns);
                      }}
                    >
                      Add Column
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="options" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {config.type === 'csv' && (
                    <>
                      <div className="space-y-2">
                        <Label>Delimiter</Label>
                        <Input
                          value={config.options?.delimiter || ','}
                          onChange={(e) => handleNestedConfigChange('options', 'delimiter', e.target.value)}
                          placeholder="Enter delimiter"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Encoding</Label>
                        <Input
                          value={config.options?.encoding || 'utf-8'}
                          onChange={(e) => handleNestedConfigChange('options', 'encoding', e.target.value)}
                          placeholder="Enter encoding"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="has-header"
                          checked={config.options?.has_header}
                          onCheckedChange={(checked) => handleNestedConfigChange('options', 'has_header', checked)}
                        />
                        <Label htmlFor="has-header">Has Header Row</Label>
                      </div>
                    </>
                  )}

                  {['postgresql', 'mysql'].includes(config.type) && (
                    <>
                      <div className="space-y-2">
                        <Label>Query</Label>
                        <Textarea
                          value={config.options?.query || ''}
                          onChange={(e) => handleNestedConfigChange('options', 'query', e.target.value)}
                          placeholder="Enter SQL query"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Batch Size</Label>
                        <Input
                          type="number"
                          value={config.options?.batch_size || ''}
                          onChange={(e) => handleNestedConfigChange('options', 'batch_size', parseInt(e.target.value))}
                          placeholder="Enter batch size"
                        />
                      </div>
                    </>
                  )}

                  {config.type === 'api' && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Headers</Label>
                        <Textarea
                          value={JSON.stringify(config.connection?.headers || {}, null, 2)}
                          onChange={(e) => {
                            try {
                              const headers = JSON.parse(e.target.value);
                              handleNestedConfigChange('connection', 'headers', headers);
                            } catch (error) {
                              // Invalid JSON, ignore
                            }
                          }}
                          placeholder="Enter headers as JSON"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Authentication</Label>
                        <Select
                          value={config.connection?.auth?.type || 'none'}
                          onValueChange={(value) => handleNestedConfigChange('connection', 'auth', { type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select auth type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="basic">Basic Auth</SelectItem>
                            <SelectItem value="bearer">Bearer Token</SelectItem>
                            <SelectItem value="api_key">API Key</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="validation" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Validation Rules</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <Label>Required Columns</Label>
                    <div className="flex space-x-2">
                      <Select
                        onValueChange={(value) => {
                          if (value.trim() === '') return;
                          const currentRequiredColumns = config.validation?.required_columns || [];
                          if (!currentRequiredColumns.includes(value)) {
                            const updatedColumns = [...currentRequiredColumns, value];
                            handleNestedConfigChange('validation', 'required_columns', updatedColumns);
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select column" />
                        </SelectTrigger>
                        {(config.schema?.columns || []).filter(column => column && column.name && column.name.trim() !== '').length > 0 && (
                          <SelectContent>
                            {(config.schema?.columns || [])
                              .filter(column => column && column.name && column.name.trim() !== '')
                              .map((column) => (
                                <SelectItem key={column.name} value={column.name}>
                                  {column.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        )}
                      </Select>
                    </div>
                    <div className="space-y-2">
                      {(config.validation?.required_columns || []).map((column, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                          <span>{column}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const updatedColumns = config.validation?.required_columns?.filter((_, i) => i !== index) || [];
                              handleNestedConfigChange('validation', 'required_columns', updatedColumns);
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label>Data Quality Rules</Label>
                    {(config.validation?.data_quality_rules || []).map((rule, index) => (
                      <div key={index} className="space-y-2 p-4 border rounded-lg">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Column</Label>
                            <Select
                              value={rule.column}
                              onValueChange={(value) => {
                                const updatedRules = [...(config.validation?.data_quality_rules || [])];
                                updatedRules[index] = { ...rule, column: value };
                                handleNestedConfigChange('validation', 'data_quality_rules', updatedRules);
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select column" />
                              </SelectTrigger>
                              {(config.schema?.columns || []).filter(column => column && column.name && column.name.trim() !== '').length > 0 && (
                                <SelectContent>
                                  {(config.schema?.columns || [])
                                    .filter(column => column && column.name && column.name.trim() !== '')
                                    .map((column) => (
                                      <SelectItem key={column.name} value={column.name}>
                                        {column.name}
                                      </SelectItem>
                                    ))}
                                </SelectContent>
                              )}
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Rule Type</Label>
                            <Select
                              value={rule.rule}
                              onValueChange={(value) => {
                                const updatedRules = [...(config.validation?.data_quality_rules || [])];
                                updatedRules[index] = { ...rule, rule: value as DataQualityRule['rule'], params: {} }; // Reset params on rule type change
                                handleNestedConfigChange('validation', 'data_quality_rules', updatedRules);
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select rule type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="not_null">Not Null</SelectItem>
                                <SelectItem value="unique">Unique</SelectItem>
                                <SelectItem value="range">Range</SelectItem>
                                <SelectItem value="pattern">Pattern</SelectItem>
                                <SelectItem value="custom">Custom</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {rule.rule === 'range' && (
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Min Value</Label>
                              <Input
                                type="number"
                                value={rule.params?.min || ''}
                                onChange={(e) => {
                                  const updatedRules = [...(config.validation?.data_quality_rules || [])];
                                  updatedRules[index] = { ...rule, params: { ...rule.params, min: parseFloat(e.target.value) } };
                                  handleNestedConfigChange('validation', 'data_quality_rules', updatedRules);
                                }}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Max Value</Label>
                              <Input
                                type="number"
                                value={rule.params?.max || ''}
                                onChange={(e) => {
                                  const updatedRules = [...(config.validation?.data_quality_rules || [])];
                                  updatedRules[index] = { ...rule, params: { ...rule.params, max: parseFloat(e.target.value) } };
                                  handleNestedConfigChange('validation', 'data_quality_rules', updatedRules);
                                }}
                              />
                            </div>
                          </div>
                        )}

                        {rule.rule === 'pattern' && (
                          <div className="space-y-2">
                            <Label>Pattern</Label>
                            <Input
                              value={rule.params?.pattern || ''}
                              onChange={(e) => {
                                const updatedRules = [...(config.validation?.data_quality_rules || [])];
                                updatedRules[index] = {
                                  ...rule,
                                  params: { ...rule.params, pattern: e.target.value }
                                };
                                handleNestedConfigChange('validation', 'data_quality_rules', updatedRules);
                              }}
                              placeholder="Enter regex pattern"
                            />
                          </div>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const updatedRules = (config.validation?.data_quality_rules || []).filter((_, i) => i !== index) || [];
                            handleNestedConfigChange('validation', 'data_quality_rules', updatedRules);
                          }}
                        >
                          Remove Rule
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      onClick={() => {
                        const updatedRules = [...(config.validation?.data_quality_rules || []), {
                          column: '',
                          rule: 'not_null',
                          params: {},
                        }];
                        handleNestedConfigChange('validation', 'data_quality_rules', updatedRules);
                      }}
                    >
                      Add Validation Rule
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </ScrollArea>
      </Tabs>
    );
  };

  const renderGeneratorConfig = (config: GeneratorNodeConfig) => (
    <Tabs defaultValue="parameters">
      <TabsList className="h-12 w-full justify-start rounded-none border-b bg-transparent p-0">
        <TabsTrigger
          value="parameters"
          className="h-12 rounded-none border-b-2 border-transparent px-4 data-[state=active]:border-primary data-[state=active]:bg-transparent"
        >
          Parameters
        </TabsTrigger>
        <TabsTrigger
          value="constraints"
          className="h-12 rounded-none border-b-2 border-transparent px-4 data-[state=active]:border-primary data-[state=active]:bg-transparent"
        >
          Constraints
        </TabsTrigger>
        <TabsTrigger
          value="data_quality"
          className="h-12 rounded-none border-b-2 border-transparent px-4 data-[state=active]:border-primary data-[state=active]:bg-transparent"
        >
          Data Quality
        </TabsTrigger>
        <TabsTrigger
          value="output"
          className="h-12 rounded-none border-b-2 border-transparent px-4 data-[state=active]:border-primary data-[state=active]:bg-transparent"
        >
          Output Format
        </TabsTrigger>
      </TabsList>

      <ScrollArea className="h-[calc(100vh-12rem)]">
        <div className="p-6">
          <TabsContent value="parameters" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Generator Parameters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Generator Type</Label>
                  <Select
                    value={config.type}
                    onValueChange={(value) => handleConfigChange('type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select generator type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ctgan">CTGAN</SelectItem>
                      <SelectItem value="tvae">TVAE</SelectItem>
                      <SelectItem value="copulagan">CopulaGAN</SelectItem>
                      <SelectItem value="gaussian">Gaussian</SelectItem>
                      <SelectItem value="uniform">Uniform</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                  {renderValidationStatus('type')}
                </div>

                {/* Common Parameters */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Number of Samples</Label>
                    <Input
                      type="number"
                      value={config.parameters?.num_samples ?? ''}
                      onChange={(e) => handleNestedConfigChange('parameters', 'num_samples', parseInt(e.target.value))}
                      placeholder="Enter number of samples"
                    />
                    {renderValidationStatus('parameters.num_samples')}
                  </div>
                  <div className="space-y-2">
                    <Label>Batch Size</Label>
                    <Input
                      type="number"
                      value={config.parameters?.batch_size ?? ''}
                      onChange={(e) => handleNestedConfigChange('parameters', 'batch_size', parseInt(e.target.value))}
                      placeholder="Enter batch size"
                    />
                     {renderValidationStatus('parameters.batch_size')}
                  </div>
                  <div className="space-y-2">
                    <Label>Epochs</Label>
                    <Input
                      type="number"
                      value={config.parameters?.epochs ?? ''}
                      onChange={(e) => handleNestedConfigChange('parameters', 'epochs', parseInt(e.target.value))}
                      placeholder="Enter epochs"
                    />
                     {renderValidationStatus('parameters.epochs')}
                  </div>
                  <div className="space-y-2">
                    <Label>Learning Rate</Label>
                    <Input
                      type="number"
                      value={config.parameters?.learning_rate ?? ''}
                      onChange={(e) => handleNestedConfigChange('parameters', 'learning_rate', parseFloat(e.target.value))}
                      placeholder="Enter learning rate"
                    />
                     {renderValidationStatus('parameters.learning_rate')}
                  </div>
                </div>

                {/* CTGAN Specific Parameters */}
                {config.type === 'ctgan' && (
                  <div className="space-y-4">
                     <div className="space-y-2">
                      <Label>Embedding Dimension</Label>
                      <Input
                        type="number"
                        value={config.parameters?.embedding_dim ?? ''}
                        onChange={(e) => handleNestedConfigChange('parameters', 'embedding_dim', parseInt(e.target.value))}
                        placeholder="Enter embedding dimension"
                      />
                       {renderValidationStatus('parameters.embedding_dim')}
                    </div>
                    <div className="space-y-2">
                      <Label>Generator Dimension</Label>
                      <Input
                        value={config.parameters?.generator_dim?.join(',') ?? ''}
                        onChange={(e) => handleNestedConfigChange('parameters', 'generator_dim', e.target.value.split(',').map(Number))}
                        placeholder="Enter generator dimensions (comma-separated)"
                      />
                       {renderValidationStatus('parameters.generator_dim')}
                    </div>
                    <div className="space-y-2">
                      <Label>Discriminator Dimension</Label>
                      <Input
                        value={config.parameters?.discriminator_dim?.join(',') ?? ''}
                        onChange={(e) => handleNestedConfigChange('parameters', 'discriminator_dim', e.target.value.split(',').map(Number))}
                        placeholder="Enter discriminator dimensions (comma-separated)"
                      />
                       {renderValidationStatus('parameters.discriminator_dim')}
                    </div>
                  </div>
                )}

                {/* TVAE Specific Parameters */}
                 {config.type === 'tvae' && (
                  <div className="space-y-4">
                     <div className="space-y-2">
                      <Label>Compress Dimensions</Label>
                      <Input
                        value={config.parameters?.compress_dims?.join(',') ?? ''}
                        onChange={(e) => handleNestedConfigChange('parameters', 'compress_dims', e.target.value.split(',').map(Number))}
                        placeholder="Enter compress dimensions (comma-separated)"
                      />
                        {renderValidationStatus('parameters.compress_dims')}
                    </div>
                    <div className="space-y-2">
                      <Label>Decompress Dimensions</Label>
                      <Input
                        value={config.parameters?.decompress_dims?.join(',') ?? ''}
                        onChange={(e) => handleNestedConfigChange('parameters', 'decompress_dims', e.target.value.split(',').map(Number))}
                        placeholder="Enter decompress dimensions (comma-separated)"
                      />
                       {renderValidationStatus('parameters.decompress_dims')}
                    </div>
                  </div>
                 )}

                 {/* CopulaGAN Specific Parameters */}
                  {config.type === 'copulagan' && (
                   <div className="space-y-4">
                      <div className="space-y-2">
                       <Label>Number of Clusters</Label>
                       <Input
                         type="number"
                         value={config.parameters?.n_clusters ?? ''}
                         onChange={(e) => handleNestedConfigChange('parameters', 'n_clusters', parseInt(e.target.value))}
                         placeholder="Enter number of clusters"
                       />
                        {renderValidationStatus('parameters.n_clusters')}
                     </div>
                   </div>
                  )}

                  {/* Custom Generator Parameters */}
                   {config.type === 'custom' && (
                    <div className="space-y-4">
                       <div className="space-y-2">
                        <Label>Custom Script (Python code)</Label>
                        <Textarea
                          value={config.parameters?.custom_script ?? ''}
                          onChange={(e) => handleNestedConfigChange('parameters', 'custom_script', e.target.value)}
                          placeholder="Paste your Python script here"
                        />
                         {renderValidationStatus('parameters.custom_script')}
                       </div>
                       <div className="space-y-2">
                         <Label>Custom Requirements (comma-separated)</Label>
                         <Input
                           value={config.parameters?.custom_requirements?.join(',') ?? ''}
                           onChange={(e) => handleNestedConfigChange('parameters', 'custom_requirements', e.target.value.split(','))}
                           placeholder="Enter required Python packages (e.g., pandas, numpy)"
                         />
                          {renderValidationStatus('parameters.custom_requirements')}
                       </div>
                    </div>
                   )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="constraints" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Constraints</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 {(config.constraints || []).map((constraint, index) => (
                    <div key={index} className="space-y-2 p-4 border rounded-lg">
                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                             <Label>Column</Label>
                              <Input
                                value={constraint.column}
                                onChange={(e) => {
                                  const updatedConstraints = [...(config.constraints || [])];
                                  updatedConstraints[index] = { ...constraint, column: e.target.value };
                                  handleConfigChange('constraints', updatedConstraints);
                                }}
                                placeholder="Column name"
                             />
                             {renderValidationStatus(`constraints.${index}.column`)}
                          </div>
                          <div className="space-y-2">
                             <Label>Constraint Type</Label>
                             <Select
                                value={constraint.type}
                                onValueChange={(value) => {
                                   const updatedConstraints = [...(config.constraints || [])];
                                   updatedConstraints[index] = { ...constraint, type: value as GeneratorConstraintType, params: {} }; // Reset params on type change
                                   handleConfigChange('constraints', updatedConstraints);
                                }}
                              >
                                 <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                                 <SelectContent>
                                    <SelectItem value="range">Range</SelectItem>
                                    <SelectItem value="distribution">Distribution</SelectItem>
                                    <SelectItem value="correlation">Correlation</SelectItem>
                                    <SelectItem value="custom">Custom</SelectItem>
                                 </SelectContent>
                              </Select>
                              {renderValidationStatus(`constraints.${index}.type`)}
                          </div>
                       </div>

                        {/* Constraint Parameters */}
                        {constraint.type === 'range' && (
                           <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                 <Label>Min Value</Label>
                                 <Input
                                    type="number"
                                    value={constraint.params?.min ?? ''}
                                    onChange={(e) => {
                                       const updatedConstraints = [...(config.constraints || [])];
                                       updatedConstraints[index] = { ...constraint, params: { ...constraint.params, min: parseFloat(e.target.value) } };
                                       handleConfigChange('constraints', updatedConstraints);
                                    }}
                                 />
                                 {renderValidationStatus(`constraints.${index}.params.min`)}
                              </div>
                              <div className="space-y-2">
                                 <Label>Max Value</Label>
                                 <Input
                                    type="number"
                                    value={constraint.params?.max ?? ''}
                                    onChange={(e) => {
                                       const updatedConstraints = [...(config.constraints || [])];
                                       updatedConstraints[index] = { ...constraint, params: { ...constraint.params, max: parseFloat(e.target.value) } };
                                       handleConfigChange('constraints', updatedConstraints);
                                    }}
                                 />
                                 {renderValidationStatus(`constraints.${index}.params.max`)}
                              </div>
                           </div>
                        )}

                         {constraint.type === 'distribution' && (
                           <div className="space-y-4">
                              <div className="space-y-2">
                                 <Label>Distribution Type</Label>
                                 <Select
                                    value={constraint.params?.distribution}
                                    onValueChange={(value) => {
                                       const updatedConstraints = [...(config.constraints || [])];
                                       updatedConstraints[index] = { ...constraint, params: { ...constraint.params, distribution: value as DistributionType } };
                                       handleConfigChange('constraints', updatedConstraints);
                                    }}
                                  >
                                     <SelectTrigger><SelectValue placeholder="Select distribution type" /></SelectTrigger>
                                     <SelectContent>
                                        <SelectItem value="normal">Normal</SelectItem>
                                        <SelectItem value="uniform">Uniform</SelectItem>
                                        <SelectItem value="exponential">Exponential</SelectItem>
                                        <SelectItem value="custom">Custom</SelectItem>
                                     </SelectContent>
                                  </Select>
                                   {renderValidationStatus(`constraints.${index}.params.distribution`)}
                              </div>

                              {/* Distribution Specific Parameters */}
                              {constraint.params?.distribution === 'normal' && (
                                 <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                       <Label>Mean</Label>
                                       <Input
                                          type="number"
                                          value={constraint.params?.mean ?? ''}
                                          onChange={(e) => {
                                             const updatedConstraints = [...(config.constraints || [])];
                                             updatedConstraints[index] = { ...constraint, params: { ...constraint.params, mean: parseFloat(e.target.value) } };
                                             handleConfigChange('constraints', updatedConstraints);
                                          }}
                                       />
                                        {renderValidationStatus(`constraints.${index}.params.mean`)}
                                    </div>
                                    <div className="space-y-2">
                                       <Label>Standard Deviation</Label>
                                       <Input
                                          type="number"
                                          value={constraint.params?.std ?? ''}
                                          onChange={(e) => {
                                             const updatedConstraints = [...(config.constraints || [])];
                                             updatedConstraints[index] = { ...constraint, params: { ...constraint.params, std: parseFloat(e.target.value) } };
                                             handleConfigChange('constraints', updatedConstraints);
                                          }}
                                       />
                                        {renderValidationStatus(`constraints.${index}.params.std`)}
                                    </div>
                                 </div>
                              )}

                              {constraint.params?.distribution === 'custom' && (
                                 <div className="space-y-2">
                                    <Label>Custom Distribution Script (Python code)</Label>
                                    <Textarea
                                       value={constraint.params?.custom_rule ?? ''}
                                       onChange={(e) => {
                                          const updatedConstraints = [...(config.constraints || [])];
                                          updatedConstraints[index] = { ...constraint, params: { ...constraint.params, custom_rule: e.target.value } };
                                          handleConfigChange('constraints', updatedConstraints);
                                       }}
                                       placeholder="Paste your Python script here"
                                    />
                                     {renderValidationStatus(`constraints.${index}.params.custom_rule`)}
                                 </div>
                              )}
                           </div>
                         )}

                         {constraint.type === 'correlation' && (
                            <div className="space-y-4">
                               <div className="space-y-2">
                                  <Label>Correlated Column</Label>
                                  <Input
                                     value={constraint.params?.correlated_with}
                                     onChange={(e) => {
                                        const updatedConstraints = [...(config.constraints || [])];
                                        updatedConstraints[index] = { ...constraint, params: { ...constraint.params, correlated_with: e.target.value } };
                                        handleConfigChange('constraints', updatedConstraints);
                                     }}
                                     placeholder="Enter column name"
                                  />
                                  {renderValidationStatus(`constraints.${index}.params.correlated_with`)}
                               </div>
                               <div className="space-y-2">
                                  <Label>Correlation Type</Label>
                                  <Select
                                     value={constraint.params?.correlation_type}
                                     onValueChange={(value) => {
                                        const updatedConstraints = [...(config.constraints || [])];
                                        updatedConstraints[index] = { ...constraint, params: { ...constraint.params, correlation_type: value as CorrelationType } };
                                        handleConfigChange('constraints', updatedConstraints);
                                     }}
                                   >
                                      <SelectTrigger><SelectValue placeholder="Select correlation type" /></SelectTrigger>
                                      <SelectContent>
                                         <SelectItem value="pearson">Pearson</SelectItem>
                                         <SelectItem value="spearman">Spearman</SelectItem>
                                         <SelectItem value="kendall">Kendall</SelectItem>
                                      </SelectContent>
                                   </Select>
                                    {renderValidationStatus(`constraints.${index}.params.correlation_type`)}
                               </div>
                               <div className="space-y-2">
                                  <Label>Correlation Value</Label>
                                  <Input
                                     type="number"
                                     value={constraint.params?.correlation_value ?? ''}
                                     onChange={(e) => {
                                        const updatedConstraints = [...(config.constraints || [])];
                                        updatedConstraints[index] = { ...constraint, params: { ...constraint.params, correlation_value: parseFloat(e.target.value) } };
                                        handleConfigChange('constraints', updatedConstraints);
                                     }}
                                     placeholder="Enter value"
                                  />
                                   {renderValidationStatus(`constraints.${index}.params.correlation_value`)}
                               </div>
                            </div>
                         )}

                         {constraint.type === 'custom' && (
                           <div className="space-y-2">
                              <Label>Custom Constraint Script (Python code)</Label>
                              <Textarea
                                value={constraint.params?.custom_rule ?? ''}
                                onChange={(e) => {
                                   const updatedConstraints = [...(config.constraints || [])];
                                   updatedConstraints[index] = { ...constraint, params: { ...constraint.params, custom_rule: e.target.value } };
                                   handleConfigChange('constraints', updatedConstraints);
                                }}
                                placeholder="Paste your Python script here"
                              />
                               {renderValidationStatus(`constraints.${index}.params.custom_rule`)}
                           </div>
                         )}

                       <Button
                         variant="ghost"
                         size="sm"
                         onClick={() => {
                           const updatedConstraints = config.constraints?.filter((_, i) => i !== index) || [];
                           handleConfigChange('constraints', updatedConstraints);
                         }}
                       >
                         Remove Constraint
                       </Button>
                    </div>
                 ))}

                 <Button
                   variant="outline"
                   onClick={() => {
                      const updatedConstraints = [...(config.constraints || []), {
                         column: '',
                         type: 'range',
                         params: {},
                      }];
                      handleConfigChange('constraints', updatedConstraints);
                   }}
                 >
                   Add Constraint
                 </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data_quality" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Data Quality & Privacy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Privacy Settings */}
                <div className="space-y-2">
                  <Label>Privacy Settings</Label>
                  <div className="flex items-center space-x-2 mt-2">
                    <Switch
                      id="anonymization"
                      checked={config.data_quality?.privacy?.anonymization ?? false}
                      onCheckedChange={(checked) => handleNestedConfigChange('data_quality', 'privacy', { ...(config.data_quality?.privacy || {}), anonymization: checked })}
                    />
                    <Label htmlFor="anonymization">Anonymize Data</Label>
                  </div>
                   {renderValidationStatus('data_quality.privacy.anonymization')}

                   {config.data_quality?.privacy?.anonymization && (
                      <div className="space-y-4 mt-4">
                         <div className="space-y-2">
                            <Label>K-Anonymity</Label>
                            <Input
                              type="number"
                              value={config.data_quality?.privacy?.k_anonymity ?? ''}
                              onChange={(e) => handleNestedConfigChange('data_quality', 'privacy', { ...(config.data_quality?.privacy || {}), k_anonymity: parseInt(e.target.value) })}
                              placeholder="Enter K value"
                            />
                             {renderValidationStatus('data_quality.privacy.k_anonymity')}
                         </div>
                         <div className="space-y-2">
                            <Label>L-Diversity</Label>
                            <Input
                              type="number"
                              value={config.data_quality?.privacy?.l_diversity ?? ''}
                              onChange={(e) => handleNestedConfigChange('data_quality', 'privacy', { ...(config.data_quality?.privacy || {}), l_diversity: parseInt(e.target.value) })}
                              placeholder="Enter L value"
                            />
                              {renderValidationStatus('data_quality.privacy.l_diversity')}
                         </div>
                         <div className="space-y-2">
                            <Label>T-Closeness</Label>
                            <Input
                              type="number"
                              value={config.data_quality?.privacy?.t_closeness ?? ''}
                              onChange={(e) => handleNestedConfigChange('data_quality', 'privacy', { ...(config.data_quality?.privacy || {}), t_closeness: parseFloat(e.target.value) })}
                              placeholder="Enter T value"
                            />
                              {renderValidationStatus('data_quality.privacy.t_closeness')}
                         </div>
                      </div>
                   )}
                </div>

                {/* Validation Settings */}
                <div className="space-y-4">
                  <Label>Validation Rules</Label>

                    {/* Required Metrics Section */}
                   <div className="space-y-2 mt-4">
                     <Label>Required Metrics</Label>
                     <div className="flex space-x-2">
                       <Input
                         placeholder="Enter metric name"
                         value={requiredMetricInput}
                         onChange={(e) => setRequiredMetricInput(e.target.value)}
                       />
                       <Button variant="outline" size="sm" onClick={handleAddRequiredMetric}>Add</Button>
                     </div>
                     {(config.data_quality?.validation?.required_metrics || []).map((metric: string, index: number) => (
                       <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                         <span>{metric}</span>
                         <Button variant="ghost" size="sm" onClick={() => handleRemoveRequiredMetric(index)}>Remove</Button>
                       </div>
                     ))}
                      {renderValidationStatus('data_quality.validation.required_metrics')}
                   </div>

                   {/* Thresholds Section */}
                   <div className="space-y-2 mt-4">
                     <Label>Thresholds</Label>
                     <div className="flex space-x-2">
                       <Input
                         placeholder="Metric name"
                         value={thresholdMetricInput}
                         onChange={(e) => setThresholdMetricInput(e.target.value)}
                       />
                       <Input
                         type="number"
                         placeholder="Threshold value"
                         value={thresholdValueInput}
                         onChange={(e) => setThresholdValueInput(e.target.value)}
                       />
                       <Button variant="outline" size="sm" onClick={handleAddThreshold}>Add</Button>
                     </div>
                     {Object.entries(config.data_quality?.validation?.thresholds || {}).map(([metric, threshold]: [string, number], index: number) => (
                       <div key={metric} className="flex items-center justify-between p-2 bg-muted rounded">
                         <span>{`${metric}: ${threshold}`}</span>
                         <Button variant="ghost" size="sm" onClick={() => handleRemoveThreshold(metric)}>Remove</Button>
                       </div>
                     ))}
                      {renderValidationStatus('data_quality.validation.thresholds')}
                   </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="output" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Output Format</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="space-y-2">
                   <Label>Output Schema Columns</Label>
                   {(config.output_format?.schema?.columns || []).map((column, index: number) => (
                      <div key={index} className="space-y-2 p-4 border rounded-lg">
                         <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                               <Label>Name</Label>
                               <Input
                                  value={column.name}
                                  onChange={(e) => {
                                     const updatedColumns = [...(config.output_format?.schema?.columns || [])];
                                     updatedColumns[index] = { ...column, name: e.target.value };
                                     handleNestedConfigChange('output_format', 'schema', { ...config.output_format?.schema, columns: updatedColumns });
                                  }}
                                  placeholder="Column name"
                               />
                                {renderValidationStatus(`output_format.schema.columns.${index}.name`)}
                            </div>
                            <div className="space-y-2">
                               <Label>Type</Label>
                               <Select
                                  value={column.type}
                                  onValueChange={(value) => {
                                     const updatedColumns = [...(config.output_format?.schema?.columns || [])];
                                     updatedColumns[index] = { ...column, type: value as 'string' | 'number' | 'boolean' | 'date' | 'datetime' | 'json' | 'array' };
                                     handleNestedConfigChange('output_format', 'schema', { ...config.output_format?.schema, columns: updatedColumns });
                                  }}
                                >
                                   <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                                   <SelectContent>
                                      <SelectItem value="string">String</SelectItem>
                                      <SelectItem value="number">Number</SelectItem>
                                      <SelectItem value="boolean">Boolean</SelectItem>
                                      <SelectItem value="date">Date</SelectItem>
                                      <SelectItem value="datetime">DateTime</SelectItem>
                                      <SelectItem value="json">JSON</SelectItem>
                                      <SelectItem value="array">Array</SelectItem>
                                   </SelectContent>
                                </Select>
                                 {renderValidationStatus(`output_format.schema.columns.${index}.type`)}
                            </div>
                         </div>
                         <div className="space-y-2">
                            <Label>Description</Label>
                            <Input
                              value={column.description || ''}
                              onChange={(e) => {
                                const updatedColumns = [...(config.output_format?.schema?.columns || [])];
                                updatedColumns[index] = { ...column, description: e.target.value };
                                handleNestedConfigChange('output_format', 'schema', { ...config.output_format?.schema, columns: updatedColumns });
                              }}
                              placeholder="Column description"
                            />
                             {renderValidationStatus(`output_format.schema.columns.${index}.description`)}
                         </div>
                         <div className="flex items-center space-x-2">
                           <Switch
                             id={`generator-output-nullable-${index}`}
                             checked={column.nullable}
                             onCheckedChange={(checked) => {
                               const updatedColumns = [...(config.output_format?.schema?.columns || [])];
                               updatedColumns[index] = { ...column, nullable: checked };
                               handleNestedConfigChange('output_format', 'schema', { ...config.output_format?.schema, columns: updatedColumns });
                             }}
                           />
                           <Label htmlFor={`generator-output-nullable-${index}`}>Nullable</Label>
                         </div>
                      </div>
                   ))}
                   <Button
                      variant="outline"
                      onClick={() => {
                         const updatedColumns = [...(config.output_format?.schema?.columns || []), {
                            name: '',
                            type: 'string',
                            nullable: true,
                         }];
                         handleNestedConfigChange('output_format', 'schema', { ...config.output_format?.schema, columns: updatedColumns });
                      }}
                   >
                      Add Column
                   </Button>
                 </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </ScrollArea>
    </Tabs>
  );

  const renderEvaluatorConfig = (config: EvaluatorNodeConfig) => (
    <Tabs defaultValue="metrics" className="h-full">
      <div className="border-b border-border">
        <TabsList className="h-12 w-full justify-start rounded-none border-b bg-transparent p-0">
          <TabsTrigger
            value="metrics"
            className="h-12 rounded-none border-b-2 border-transparent px-4 data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            Metrics
          </TabsTrigger>
          <TabsTrigger
            value="validation"
            className="h-12 rounded-none border-b-2 border-transparent px-4 data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            Validation
          </TabsTrigger>
        </TabsList>
      </div>

      <ScrollArea className="h-[calc(100vh-12rem)]">
        <div className="p-6 space-y-6">
          <TabsContent value="metrics" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Metrics to Calculate</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* UI for selecting specific metrics */}
                <div>
                  <Label>Select Metrics</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {/* Common metrics to select */}
                    {[ 'mean', 'std', 'min', 'max', 'median', 'null_count', 'unique_count', 'most_common' ].map((metric) => (
                      <div key={metric} className="flex items-center space-x-2">
                        <Switch
                          id={`metric-${metric}`}
                          checked={config.metrics?.includes(metric) ?? false}
                          onCheckedChange={(checked) => {
                            const currentMetrics = config.metrics || [];
                            const updatedMetrics = checked
                              ? [...currentMetrics, metric]
                              : currentMetrics.filter(m => m !== metric);
                            handleConfigChange('metrics', updatedMetrics);
                          }}
                        />
                        <Label htmlFor={`metric-${metric}`}>{metric.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</Label>
                      </div>
                    ))}
                  </div>
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      UI for selecting specific metrics is not yet implemented. All available metrics in the backend are currently calculated.
                    </AlertDescription>
                  </Alert>
                </div>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Metrics calculation logic is implemented in the backend. UI to select specific metrics is pending.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="validation" className="mt-0 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Validation Rules</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Validation Section (reusing Evaluator validation UI components) */}
                {/* TODO: Potentially create reusable ValidationConfig component */}
                <div>
                   <Label>Validation Rules</Label>
                   {config.validation?.data_quality_rules?.map((rule: DataQualityRule, index: number) => (
                     <div key={index} className="border p-4 rounded space-y-2">
                       <div className="flex justify-between items-center">
                         <Label>Rule {index + 1}</Label>
                         <Button variant="destructive" size="sm"
                           onClick={() => {
                             const updatedRules = (config.validation?.data_quality_rules || []).filter((_: any, i: number) => i !== index);
                             handleNestedConfigChange('validation', 'data_quality_rules', updatedRules);
                           }}
                         >
                           Delete
                         </Button>
                       </div>
                       <div>
                         <Label htmlFor={`rule-column-${index}`}>Column</Label>
                         <Input
                           id={`rule-column-${index}`}
                           value={rule.column || ''}
                           onChange={(e) => {
                             const updatedRules = [...(config.validation?.data_quality_rules || [])];
                             updatedRules[index] = { ...updatedRules[index], column: e.target.value };
                             handleNestedConfigChange('validation', 'data_quality_rules', updatedRules);
                           }}
                         />
                       </div>
                       <div>
                         <Label htmlFor={`rule-type-${index}`}>Rule Type</Label>
                         <Select
                           value={rule.rule || ''}
                           onValueChange={(value) => {
                             const updatedRules = [...(config.validation?.data_quality_rules || [])];
                             updatedRules[index] = { ...updatedRules[index], rule: value as DataQualityRule['rule'], params: {} }; // Reset params on rule type change
                             handleNestedConfigChange('validation', 'data_quality_rules', updatedRules);
                           }}
                         >
                           <SelectTrigger id={`rule-type-${index}`}><SelectValue placeholder="Select a rule type" /></SelectTrigger>
                           <SelectContent>
                             <SelectItem value="not_null">Not Null</SelectItem>
                             <SelectItem value="unique">Unique</SelectItem>
                             <SelectItem value="range">Range</SelectItem>
                             <SelectItem value="pattern">Pattern</SelectItem>
                             <SelectItem value="custom">Custom</SelectItem>
                           </SelectContent>
                         </Select>
                       </div>

                       {/* Render parameters based on rule type */}
                       {rule.rule === 'range' && (
                         <div className="flex space-x-2">
                           <div className="flex-1">
                             <Label htmlFor={`rule-min-${index}`}>Min</Label>
                             <Input
                               id={`rule-min-${index}`}
                               type="number"
                               value={rule.params?.min ?? ''}
                               onChange={(e) => {
                                 const updatedRules = [...(config.validation?.data_quality_rules || [])];
                                 updatedRules[index] = { ...updatedRules[index], params: { ...(updatedRules[index].params || {}), min: parseFloat(e.target.value) || undefined } };
                                 handleNestedConfigChange('validation', 'data_quality_rules', updatedRules);
                               }}
                             />
                           </div>
                           <div className="flex-1">
                             <Label htmlFor={`rule-max-${index}`}>Max</Label>
                             <Input
                               id={`rule-max-${index}`}
                               type="number"
                               value={rule.params?.max ?? ''}
                               onChange={(e) => {
                                 const updatedRules = [...(config.validation?.data_quality_rules || [])];
                                 updatedRules[index] = { ...updatedRules[index], params: { ...(updatedRules[index].params || {}), max: parseFloat(e.target.value) || undefined } };
                                 handleNestedConfigChange('validation', 'data_quality_rules', updatedRules);
                               }}
                             />
                           </div>
                         </div>
                       )}

                       {rule.rule === 'pattern' && (
                         <div>
                           <Label htmlFor={`rule-pattern-${index}`}>Pattern (Regex)</Label>
                           <Input
                             id={`rule-pattern-${index}`}
                             value={rule.params?.pattern || ''}
                             onChange={(e) => {
                               const updatedRules = [...(config.validation?.data_quality_rules || [])];
                               updatedRules[index] = { ...updatedRules[index], params: { ...(updatedRules[index].params || {}), pattern: e.target.value } };
                               handleNestedConfigChange('validation', 'data_quality_rules', updatedRules);
                             }}
                           />
                         </div>
                       )}

                        {rule.rule === 'custom' && (
                         <div>
                           <Label htmlFor={`rule-custom-${index}`}>Custom Rule (Code)</Label>
                            <Textarea
                              id={`rule-custom-${index}`}
                              value={rule.params?.custom_rule || ''}
                              onChange={(e) => {
                                const updatedRules = [...(config.validation?.data_quality_rules || [])];
                                updatedRules[index] = { ...updatedRules[index], params: { ...(updatedRules[index].params || {}), custom_rule: e.target.value } };
                                handleNestedConfigChange('validation', 'data_quality_rules', updatedRules);
                              }}
                            />
                         </div>
                        )}

                     </div>
                   ))}

                   <Button
                     variant="outline"
                     onClick={() => {
                       const updatedRules = [...(config.validation?.data_quality_rules || []), { column: '', rule: 'not_null', params: {} } as DataQualityRule];
                       handleNestedConfigChange('validation', 'data_quality_rules', updatedRules);
                     }}
                   >
                     Add Validation Rule
                   </Button>
                   {/* TODO: Implement UI for required_metrics and thresholds if needed in the future */}
                    <Alert>
                     <AlertCircle className="h-4 w-4" />
                     <AlertDescription>
                       UI for required_metrics and thresholds is not yet implemented.
                     </AlertDescription>
                   </Alert>
                 </div>
                 
                 {/* Required Metrics Section */}
                 <div className="space-y-2">
                   <Label>Required Metrics</Label>
                   <div className="flex space-x-2">
                     <Input
                       placeholder="Enter metric name"
                       value={requiredMetricInput}
                       onChange={(e) => setRequiredMetricInput(e.target.value)}
                     />
                     <Button variant="outline" size="sm" onClick={handleAddRequiredMetric}>Add</Button>
                   </div>
                   {(config.validation?.required_metrics || []).map((metric, index) => (
                     <div key={index} className="flex items-center space-x-2">
                       <Label>{metric}</Label>
                       <Button variant="destructive" size="sm" onClick={() => handleRemoveRequiredMetric(index)}>Delete</Button>
                     </div>
                   ))}
                    <Alert>
                     <AlertCircle className="h-4 w-4" />
                     <AlertDescription>
                       Backend validation for required metrics is also pending.
                     </AlertDescription>
                   </Alert>
                 </div>
                 
                 {/* Thresholds Section */}
                 <div className="space-y-2">
                   <Label>Thresholds</Label>
                   <div className="flex space-x-2">
                     <Input
                       placeholder="Metric name"
                       value={thresholdMetricInput}
                       onChange={(e) => setThresholdMetricInput(e.target.value)}
                     />
                     <Input
                       type="number"
                       placeholder="Threshold value"
                       value={thresholdValueInput}
                       onChange={(e) => setThresholdValueInput(e.target.value)}
                     />
                     <Button variant="outline" size="sm" onClick={handleAddThreshold}>Add</Button>
                   </div>
                   {Object.entries(config.validation?.thresholds || {}).map(([metric, threshold], index) => (
                     <div key={metric} className="flex items-center space-x-2">
                       <Label>{`${metric}: ${threshold}`}</Label>
                       <Button variant="destructive" size="sm" onClick={() => handleRemoveThreshold(metric)}>Delete</Button>
                     </div>
                   ))}
                    <Alert>
                     <AlertCircle className="h-4 w-4" />
                     <AlertDescription>
                       UI for thresholds is not yet fully implemented. Backend validation using thresholds is also pending.
                     </AlertDescription>
                   </Alert>
                 </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </ScrollArea>
    </Tabs>
  );

  const renderExporterConfig = (config: ExporterNodeConfig) => (
    <Tabs defaultValue="destination">
      <TabsList>
        <TabsTrigger value="destination">Destination</TabsTrigger>
        <TabsTrigger value="options">Options</TabsTrigger>
        <TabsTrigger value="validation">Validation</TabsTrigger>
      </TabsList>

      <ScrollArea className="h-[calc(100vh-12rem)]">
        <div className="p-6">
          <TabsContent value="destination" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Destination Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Exporter Type</Label>
                  <Select
                    value={config.type}
                    onValueChange={(value) => handleConfigChange('type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select exporter type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="csv">CSV File</SelectItem>
                      <SelectItem value="json">JSON File</SelectItem>
                      <SelectItem value="minio">MinIO</SelectItem>
                      <SelectItem value="s3">Amazon S3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {(config.type === 'csv' || config.type === 'json') && (
                  <div className="space-y-2">
                    <Label>File Path</Label>
                    <Input
                      value={config.destination?.path || ''}
                      onChange={(e) => handleNestedConfigChange('destination', 'path', e.target.value)}
                      placeholder="Enter file path"
                    />
                  </div>
                )}
                {(config.type === 's3') && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Bucket</Label>
                      <Input
                        value={config.destination?.bucket || ''}
                        onChange={(e) => handleNestedConfigChange('destination', 'bucket', e.target.value)}
                        placeholder="Enter bucket name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Path</Label>
                      <Input
                        value={config.destination?.path || ''}
                        onChange={(e) => handleNestedConfigChange('destination', 'path', e.target.value)}
                        placeholder="Enter file path"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="options" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(config.type === 'csv') && (
                  <div className="space-y-2">
                    <Label>Delimiter</Label>
                    <Input
                      value={config.options?.delimiter || ','}
                      onChange={(e) => handleNestedConfigChange('options', 'delimiter', e.target.value)}
                      placeholder="Enter delimiter"
                    />
                  </div>
                )}
                {(config.type === 'csv' || config.type === 'json') && (
                  <div className="space-y-2">
                    <Label>Encoding</Label>
                     <Input
                      value={config.options?.encoding || 'utf-8'}
                      onChange={(e) => handleNestedConfigChange('options', 'encoding', e.target.value)}
                      placeholder="Enter encoding (e.g., utf-8)"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="validation" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Validation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Reusing validation UI from Evaluator node - will need refinement for Exporter */}
                 <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Validation settings for Exporter node are not yet fully defined or implemented.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </ScrollArea>
    </Tabs>
  );

  // Render the appropriate configuration panel based on node type
  const renderConfigPanel = (config: any) => {
    if (!node || !node.type || !config) return null;

    switch (node.type) {
      case 'source':
        return renderSourceConfig(config as SourceNodeConfig);
      case 'generator':
        return renderGeneratorConfig(config as GeneratorNodeConfig);
      case 'evaluator':
        return renderEvaluatorConfig(config as EvaluatorNodeConfig);
      case 'exporter':
        return renderExporterConfig(config as ExporterNodeConfig);
      default:
        return <div>No configuration available for this node type.</div>;
    }
  };

  return (
    <div className="flex h-full flex-col">
      {notification && (
        <Alert variant={notification.type === 'error' ? 'destructive' : 'default'} className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{notification.message}</AlertDescription>
        </Alert>
      )}
      {errors.length > 0 && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {errors.map((error, index) => (
              <p key={index}>{error}</p>
            ))}
          </AlertDescription>
        </Alert>
      )}
      {renderConfigPanel(pendingConfig)}
      {node && (
        <div className="p-4 border-t">
          <Button 
            onClick={handleSaveConfig} 
            className="w-full"
            disabled={Object.values(validationState).some(v => !v.isValid)}
          >
            Save Configuration
          </Button>
        </div>
      )}
    </div>
  );
}

export default NodeConfigPanel; 