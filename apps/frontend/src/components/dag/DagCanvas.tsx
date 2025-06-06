'use client';

import React, { useCallback, useState, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  Connection,
  addEdge,
  Panel,
  NodeProps as ReactFlowNodeProps,
  ReactFlowInstance,
  OnNodesChange,
  OnEdgesChange,
  applyNodeChanges,
  applyEdgeChanges,
  Handle,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Button } from "@/components/ui/button";
import { Database, Cpu, BarChart2, FileOutput, ZoomIn, ZoomOut, Maximize2, Minimize2, Save } from 'lucide-react';
import { themes } from '@/lib/themes';
import { NodeValidationRules } from '@/types/dag';
import { cn } from "@/lib/utils";
import { Node as CustomNode } from './Node';
import { Edge as CustomEdge } from './Edge';
import { Toolbar } from './Toolbar';
import { EmptyState } from './EmptyState';
import useDagStore, { useTemporalStore } from '@/stores/dagStore';

// Wrapper component to make our Node component compatible with ReactFlow
function NodeWrapper(props: ReactFlowNodeProps) {
  const { data } = props;
  return <CustomNode {...data} />;
}

const edgeTypes = {
  default: CustomEdge,
};

interface DagCanvasProps {
  selectedNode: Node | null;
  onNodeSelect: (node: Node | null) => void;
  onSave: () => void;
  onRun: () => void;
  onClear: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  onSettings: () => void;
  onHelp: () => void;
  onInit: (instance: ReactFlowInstance) => void;
  reactFlowWrapper: React.RefObject<HTMLDivElement>;
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: (params: Connection | Edge) => void;
  onDrop: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
  nodeTypes?: Record<string, React.ComponentType<any>>;
  onAddNode: (newNode: Omit<Node, 'id'>) => void;
  onPaneClick: () => void;
}

export function DagCanvas({
  selectedNode,
  onNodeSelect,
  onSave,
  onRun,
  onClear,
  onUndo,
  onRedo,
  onZoomIn,
  onZoomOut,
  onFitView,
  onSettings,
  onHelp,
  onInit,
  reactFlowWrapper,
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onDrop,
  onDragOver,
  nodeTypes: customNodeTypes,
  onAddNode,
  onPaneClick,
}: DagCanvasProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Use Zustand store with a single selector returning the whole state
  const store = useDagStore((state) => state);

  // Safely access clearDag with optional chaining
  const clearDag = store?.clearDag;
  const { undo, redo } = useTemporalStore();

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    onNodeSelect(node);
  }, [onNodeSelect]);

  // Merge custom node types with default ones
  const mergedNodeTypes = useMemo(() => ({
    ...nodeTypes,
    ...customNodeTypes,
  }), [customNodeTypes]);

  // Handle node changes
  const handleNodesChange = useCallback((changes: any[]) => {
    onNodesChange(changes);
  }, [onNodesChange]);

  // Handle edge changes
  const handleEdgesChange = useCallback((changes: any[]) => {
    onEdgesChange(changes);
  }, [onEdgesChange]);

  // Handle connections
  const handleConnect = useCallback((params: Connection | Edge) => {
    onConnect(params);
  }, [onConnect]);

  return (
    <div className={cn("flex flex-col h-full w-full", isFullscreen && "fixed inset-0 z-50")} ref={reactFlowWrapper}>
      <Toolbar
        onSave={onSave}
        onRun={onRun}
        onClear={clearDag || (() => {})}
        onUndo={undo}
        onRedo={redo}
        onZoomIn={onZoomIn}
        onZoomOut={onZoomOut}
        onFitView={onFitView}
        onSettings={onSettings}
        onHelp={onHelp}
      />
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          onConnect={handleConnect}
          onDragOver={onDragOver}
          onDrop={onDrop}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          nodeTypes={mergedNodeTypes}
          edgeTypes={edgeTypes}
          fitView
          onInit={onInit}
          nodesDraggable={true}
          nodesConnectable={true}
          elementsSelectable={true}
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
        {nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="pointer-events-auto">
              <EmptyState onAddNode={() => onAddNode({
                type: 'source',
                position: { x: 250, y: 250 },
                data: { label: 'Source Node' }
              })} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Custom Node Components
function SourceNode({ data }: { data: any }) {
  return (
    <div
      className="group relative rounded-lg border border-border bg-background p-4 shadow-sm transition-all hover:shadow-md"
      style={{ borderColor: themes.light.node.source }}
    >
      <div className="flex items-center space-x-2">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-md"
          style={{ backgroundColor: themes.light.node.source }}
        >
          <Database className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-medium">{data.label}</p>
          <p className="text-xs text-muted-foreground">{data.type}</p>
        </div>
      </div>
      {/* <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-primary opacity-0 transition-opacity group-hover:opacity-100" /> */}
      <Handle type="source" position={Position.Right} className="w-3 h-3" />
    </div>
  );
}

function GeneratorNode({ data }: { data: any }) {
  return (
    <div
      className="group relative rounded-lg border border-border bg-background p-4 shadow-sm transition-all hover:shadow-md"
      style={{ borderColor: themes.light.node.generator }}
    >
      <div className="flex items-center space-x-2">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-md"
          style={{ backgroundColor: themes.light.node.generator }}
        >
          <Cpu className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-medium">{data.label}</p>
          <p className="text-xs text-muted-foreground">{data.type}</p>
        </div>
      </div>
      {/* <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-primary opacity-0 transition-opacity group-hover:opacity-100" /> */}
      <Handle type="target" position={Position.Left} className="w-3 h-3" />
      <Handle type="source" position={Position.Right} className="w-3 h-3" />
    </div>
  );
}

function EvaluatorNode({ data }: { data: any }) {
  return (
    <div
      className="group relative rounded-lg border border-border bg-background p-4 shadow-sm transition-all hover:shadow-md"
      style={{ borderColor: themes.light.node.evaluator }}
    >
      <div className="flex items-center space-x-2">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-md"
          style={{ backgroundColor: themes.light.node.evaluator }}
        >
          <BarChart2 className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-medium">{data.label}</p>
          <p className="text-xs text-muted-foreground">{data.type}</p>
        </div>
      </div>
      {/* <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-primary opacity-0 transition-opacity group-hover:opacity-100" /> */}
      <Handle type="target" position={Position.Left} className="w-3 h-3" />
      <Handle type="source" position={Position.Right} className="w-3 h-3" />
    </div>
  );
}

function ExporterNode({ data }: { data: any }) {
  return (
    <div
      className="group relative rounded-lg border border-border bg-background p-4 shadow-sm transition-all hover:shadow-md"
      style={{ borderColor: themes.light.node.exporter }}
    >
      <div className="flex items-center space-x-2">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-md"
          style={{ backgroundColor: themes.light.node.exporter }}
        >
          <FileOutput className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-medium">{data.label}</p>
          <p className="text-xs text-muted-foreground">{data.type}</p>
        </div>
      </div>
      {/* <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-primary opacity-0 transition-opacity group-hover:opacity-100" /> */}
      <Handle type="target" position={Position.Left} className="w-3 h-3" />
    </div>
  );
}

// Define nodeTypes outside of the component to avoid recreation on each render
const nodeTypes = {
  source: SourceNode,
  generator: GeneratorNode,
  evaluator: EvaluatorNode,
  exporter: ExporterNode,
}; 