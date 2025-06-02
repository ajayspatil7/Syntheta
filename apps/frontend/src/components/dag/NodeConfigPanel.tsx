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
import { AlertCircle, Upload, Database } from 'lucide-react';
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
} from '@/types/dag';
import { getNodeValidationErrors } from '@/utils/dagValidation';
import { z } from 'zod';
import { ScrollArea } from "@/components/ui/scroll-area";

interface NodeConfigPanelProps {
  node: Node | null;
  onConfigChange: (nodeId: string, config: any) => void;
}

function NodeConfigPanel({ node, onConfigChange }: NodeConfigPanelProps) {
  const [errors, setErrors] = React.useState<string[]>([]);
  const [requiredMetricInput, setRequiredMetricInput] = React.useState('');
  const [thresholdMetricInput, setThresholdMetricInput] = React.useState('');
  const [thresholdValueInput, setThresholdValueInput] = React.useState('');

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
          validation: { required_metrics: [], thresholds: {} },
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
    } else {
      setPendingConfig(null);
    }
  }, [node]);

  if (!node) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center">
        <div className="space-y-4">
          <div className="mx-auto h-12 w-12 rounded-full bg-muted p-2">
            <Database className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">No Node Selected</h3>
            <p className="text-sm text-muted-foreground">
              Select a node to view and configure its properties.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Update local pending config
  const handleConfigChange = (key: string, value: unknown) => {
    const updatedConfig = {
      ...(pendingConfig || {}),
      [key]: value,
    };
    setPendingConfig(updatedConfig);
    // Validation will happen on Save
  };

  // Update local pending nested config
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
    // Validation will happen on Save
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
          validationResult = { success: true, data: pendingConfig }; // No schema for this type
      }

      if (!validationResult.success && validationResult.error) {
        setErrors(validationResult.error.errors.map(err => `${err.path.join('.')}: ${err.message}`));
      } else {
        setErrors([]); // Clear errors if validation passes
        // Dispatch the config change to the store
        onConfigChange(node.id, pendingConfig);
      }

    } catch (error) {
      console.error("Validation error:", error);
      setErrors([`An unexpected validation error occurred: ${error}`]);
    }
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
                            onChange={handleFileUpload}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Delimiter</Label>
                        <Input
                          value={config.options?.delimiter || ','}
                          onChange={(e) => handleNestedConfigChange('options', 'delimiter', e.target.value)}
                          placeholder="Enter delimiter"
                        />
                      </div>
                    </div>
                  )}

                  {['postgresql', 'mysql'].includes(config.type) && (
                    <>
                      <div className="space-y-2">
                        <Label>Host</Label>
                        <Input
                          value={config.connection?.host || ''}
                          onChange={(e) => handleNestedConfigChange('connection', 'host', e.target.value)}
                          placeholder="Enter host"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Port</Label>
                        <Input
                          type="number"
                          value={config.connection?.port || ''}
                          onChange={(e) => handleNestedConfigChange('connection', 'port', parseInt(e.target.value))}
                          placeholder="Enter port"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Database</Label>
                        <Input
                          value={config.connection?.database || ''}
                          onChange={(e) => handleNestedConfigChange('connection', 'database', e.target.value)}
                          placeholder="Enter database name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Username</Label>
                        <Input
                          value={config.connection?.username || ''}
                          onChange={(e) => handleNestedConfigChange('connection', 'username', e.target.value)}
                          placeholder="Enter username"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Password</Label>
                        <Input
                          type="password"
                          value={config.connection?.password || ''}
                          onChange={(e) => handleNestedConfigChange('connection', 'password', e.target.value)}
                          placeholder="Enter password"
                        />
                      </div>
                    </>
                  )}

                  {['minio', 's3'].includes(config.type) && (
                    <>
                      <div className="space-y-2">
                        <Label>Bucket</Label>
                        <Input
                          value={config.connection?.bucket || ''}
                          onChange={(e) => handleNestedConfigChange('connection', 'bucket', e.target.value)}
                          placeholder="Enter bucket name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Path</Label>
                        <Input
                          value={config.connection?.path || ''}
                          onChange={(e) => handleNestedConfigChange('connection', 'path', e.target.value)}
                          placeholder="Enter file path"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Region</Label>
                        <Input
                          value={config.connection?.region || ''}
                          onChange={(e) => handleNestedConfigChange('connection', 'region', e.target.value)}
                          placeholder="Enter region"
                        />
                      </div>
                    </>
                  )}

                  {config.type === 'api' && (
                    <>
                      <div className="space-y-2">
                        <Label>URL</Label>
                        <Input
                          value={config.connection?.url || ''}
                          onChange={(e) => handleNestedConfigChange('connection', 'url', e.target.value)}
                          placeholder="Enter API URL"
                        />
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
                      </div>
                    </>
                  )}

                  {config.type === 'kafka' && (
                    <>
                      <div className="space-y-2">
                        <Label>Bootstrap Servers</Label>
                        <Input
                          value={config.connection?.bootstrap_servers || ''}
                          onChange={(e) => handleNestedConfigChange('connection', 'bootstrap_servers', e.target.value)}
                          placeholder="Enter bootstrap servers"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Topic</Label>
                        <Input
                          value={config.connection?.topic || ''}
                          onChange={(e) => handleNestedConfigChange('connection', 'topic', e.target.value)}
                          placeholder="Enter topic"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Group ID</Label>
                        <Input
                          value={config.connection?.group_id || ''}
                          onChange={(e) => handleNestedConfigChange('connection', 'group_id', e.target.value)}
                          placeholder="Enter group ID"
                        />
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="schema" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Schema Configuration</CardTitle>
                </CardHeader>
                <CardContent>
                  {(config.schema?.columns || []).map((column: { name: string; type: string }, index: number) => (
                    <div key={index}> {/* Render schema fields */} </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="options" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Options</CardTitle>
                </CardHeader>
                <CardContent>
                  {config.options && (
                    <div> {/* Render options UI */} </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="validation" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Validation Rules</CardTitle>
                </CardHeader>
                <CardContent>
                  {(config.validation?.required_columns || []).map((rule: string, index: number) => (
                    <div key={index}> {/* Render validation fields */} </div>
                  ))}
                  {(config.validation?.data_quality_rules || []).map((rule: DataQualityRule, index: number) => (
                    <div key={index}> {/* Render data quality rule fields */} </div>
                  ))}
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
      <TabsList>
        <TabsTrigger value="parameters">Parameters</TabsTrigger>
        <TabsTrigger value="constraints">Constraints</TabsTrigger>
        <TabsTrigger value="data_quality">Data Quality</TabsTrigger>
        <TabsTrigger value="output">Output</TabsTrigger>
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
                </div>

                {config.type === 'ctgan' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Number of Samples</Label>
                      <Input
                        type="number"
                        value={config.parameters?.num_samples ?? ''}
                        onChange={(e) => handleNestedConfigChange('parameters', 'num_samples', parseInt(e.target.value))}
                        placeholder="Enter number of samples"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Batch Size</Label>
                      <Input
                        type="number"
                        value={config.parameters?.batch_size ?? ''}
                        onChange={(e) => handleNestedConfigChange('parameters', 'batch_size', parseInt(e.target.value))}
                        placeholder="Enter batch size"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Epochs</Label>
                      <Input
                        type="number"
                        value={config.parameters?.epochs ?? ''}
                        onChange={(e) => handleNestedConfigChange('parameters', 'epochs', parseInt(e.target.value))}
                        placeholder="Enter epochs"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Learning Rate</Label>
                      <Input
                        type="number"
                        value={config.parameters?.learning_rate ?? ''}
                        onChange={(e) => handleNestedConfigChange('parameters', 'learning_rate', parseFloat(e.target.value))}
                        placeholder="Enter learning rate"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Embedding Dimension</Label>
                      <Input
                        type="number"
                        value={config.parameters?.embedding_dim ?? ''}
                        onChange={(e) => handleNestedConfigChange('parameters', 'embedding_dim', parseInt(e.target.value))}
                        placeholder="Enter embedding dimension"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Generator Dimension</Label>
                      <Input
                        value={config.parameters?.generator_dim?.join(',') ?? ''}
                        onChange={(e) => handleNestedConfigChange('parameters', 'generator_dim', e.target.value.split(',').map(Number))}
                        placeholder="Enter generator dimensions (comma-separated)"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Discriminator Dimension</Label>
                      <Input
                        value={config.parameters?.discriminator_dim?.join(',') ?? ''}
                        onChange={(e) => handleNestedConfigChange('parameters', 'discriminator_dim', e.target.value.split(',').map(Number))}
                        placeholder="Enter discriminator dimensions (comma-separated)"
                      />
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
              <CardContent>
                {(config.constraints || []).map((constraint: any, index: number) => (
                  <div key={index}> {/* Render constraint fields */} </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data_quality" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Data Quality & Privacy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Privacy Settings</Label>
                  <div className="flex items-center space-x-2 mt-2">
                    <Switch
                      id="anonymization"
                      checked={config.data_quality?.privacy?.anonymization ?? false}
                      onCheckedChange={(checked) => handleNestedConfigChange('data_quality', 'privacy', { ...(config.data_quality?.privacy || {}), anonymization: checked })}
                    />
                    <Label htmlFor="anonymization">Anonymize Data</Label>
                  </div>
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      UI for k-anonymity, l-diversity, and t-closeness is not yet implemented.
                    </AlertDescription>
                  </Alert>
                </div>

                <div>
                  <Label>Validation Rules</Label>
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      UI for required_metrics and thresholds in the Generator node is not yet implemented.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="output" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Output Format</CardTitle>
              </CardHeader>
              <CardContent>
                {(config.output_format?.schema?.columns || []).map((column: any, index: number) => (
                  <div key={index}> {/* Render output schema fields */} </div>
                ))}
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
                   {config.validation?.data_quality_rules?.map((rule: DataQualityRule, index) => (
                     <div key={index} className="border p-4 rounded space-y-2">
                       <div className="flex justify-between items-center">
                         <Label>Rule {index + 1}</Label>
                         <Button variant="destructive" size="sm"
                           onClick={() => {
                             const updatedRules = (config.validation?.data_quality_rules || []).filter((_, i) => i !== index);
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
                       const updatedRules = [...(config.validation?.data_quality_rules || []), { column: '', rule: 'not_null', params: {} }];
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
                {(config.type === 'minio' || config.type === 's3') && (
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
      {errors.length > 0 && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {errors.map((error, index: number) => (
              <p key={index}>{error}</p>
            ))}
          </AlertDescription>
        </Alert>
      )}
      {renderConfigPanel(pendingConfig)}
      {node && (
        <div className="p-4 border-t">
          <Button onClick={handleSaveConfig} className="w-full">Save Configuration</Button>
        </div>
      )}
    </div>
  );
}

export default NodeConfigPanel; 