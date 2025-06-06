'use client';

import { Node } from 'reactflow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

interface ConfigPanelProps {
  selectedNode: Node | null;
}

export function ConfigPanel({ selectedNode }: ConfigPanelProps) {
  if (!selectedNode) {
    return (
      <div className="p-4">
        <p className="text-sm text-muted-foreground">Select a node to configure</p>
      </div>
    );
  }

  const renderNodeConfig = () => {
    switch (selectedNode.type) {
      case 'source':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="source-type">Source Type</Label>
              <Select defaultValue="database">
                <SelectTrigger>
                  <SelectValue placeholder="Select source type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="database">Database</SelectItem>
                  <SelectItem value="file">File</SelectItem>
                  <SelectItem value="api">API</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="connection-string">Connection String</Label>
              <Input id="connection-string" placeholder="Enter connection string" />
            </div>
          </div>
        );

      case 'generator':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="generator-type">Generator Type</Label>
              <Select defaultValue="gan">
                <SelectTrigger>
                  <SelectValue placeholder="Select generator type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gan">GAN</SelectItem>
                  <SelectItem value="vae">VAE</SelectItem>
                  <SelectItem value="diffusion">Diffusion</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="batch-size">Batch Size</Label>
              <Input id="batch-size" type="number" defaultValue={32} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="epochs">Epochs</Label>
              <Input id="epochs" type="number" defaultValue={100} />
            </div>
          </div>
        );

      case 'evaluator':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="metrics">Metrics</Label>
              <Select defaultValue="fid">
                <SelectTrigger>
                  <SelectValue placeholder="Select metrics" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fid">FID Score</SelectItem>
                  <SelectItem value="is">Inception Score</SelectItem>
                  <SelectItem value="privacy">Privacy Score</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="threshold">Threshold</Label>
              <Input id="threshold" type="number" defaultValue={0.8} step={0.1} />
            </div>
          </div>
        );

      case 'exporter':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="export-format">Export Format</Label>
              <Select defaultValue="csv">
                <SelectTrigger>
                  <SelectValue placeholder="Select export format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="parquet">Parquet</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="output-path">Output Path</Label>
              <Input id="output-path" placeholder="Enter output path" />
            </div>
          </div>
        );

      default:
        return <div>No configuration available for this node type.</div>;
    }
  };

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Node Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="node-label">Label</Label>
            <Input
              id="node-label"
              value={selectedNode.data.label}
              onChange={(e) => {
                // TODO: Implement label update
              }}
            />
          </div>
          {renderNodeConfig()}
        </CardContent>
      </Card>
    </div>
  );
} 