'use client';

import { DagEditorLayout } from "@/components/layout/DagEditorLayout";
import { RunHistory } from "@/components/dag/RunHistory";
import { NodePalette } from "@/components/dag/NodePalette";
import { DagCanvas } from "@/components/dag/DagCanvas";
import { ConfigPanel } from "@/components/dag/ConfigPanel";
import { useCallback, useRef, useState } from "react";
import { Node, Edge, Connection, ReactFlowInstance, applyNodeChanges, applyEdgeChanges } from "reactflow";
import useDagStore from "@/stores/dagStore";
import { DagNode, DagEdge, DagNodeData, SyntheticDataDAG } from "@/types/dag";
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { Button } from '@/components/ui/button';
import { History } from 'lucide-react';

import NodeConfigPanel from "@/components/dag/NodeConfigPanel";

export default function DAGEditorPage({ params }: { params: { id: string } }) {
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [showRunHistory, setShowRunHistory] = useState(false);

  const {
    dag,
    addNode,
    updateNode,
    removeNode,
    addEdge,
    removeEdge,
    setSelectedNode: setDagSelectedNode,
    clearDag,
    setDag
  } = useDagStore(state => state);

  const handleDragStart = useCallback((event: React.DragEvent<HTMLDivElement>, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();

    const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
    const type = event.dataTransfer.getData('application/reactflow');

    if (typeof type === 'undefined' || !type || !reactFlowBounds || !reactFlowInstance) {
      return;
    }

    const position = reactFlowInstance.screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });

    addNode({
      type,
      position,
      data: { label: `${type.charAt(0).toUpperCase() + type.slice(1)} Node` } as DagNodeData,
    });
  }, [reactFlowInstance, addNode]);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const handleNodesChange = useCallback((changes: any[]) => {
    if (!dag) return;

    const updatedNodes = applyNodeChanges(changes, dag.nodes);

    changes.forEach(change => {
      if (change.type === 'select') {
        if (change.selected) {
          const node = updatedNodes.find((n: Node) => n.id === change.id);
          setSelectedNode(node || null);
        } else {
          if (selectedNode && selectedNode.id === change.id) {
             setSelectedNode(null);
          }
        }
      }
    });

    setDag({ ...dag, nodes: updatedNodes as DagNode[] });

  }, [dag, setDag, selectedNode, setSelectedNode]);

  const handleEdgesChange = useCallback((changes: any[]) => {
     if (!dag) return;
     const updatedEdges = applyEdgeChanges(changes, dag.edges);
     setDag({ ...dag, edges: updatedEdges as DagEdge[] });
  }, [dag, setDag]);

  const handleConnect = useCallback((params: Connection | Edge) => {
    if (params.source && params.target) {
      addEdge({
        source: params.source,
        target: params.target,
        type: 'default',
      } as DagEdge);
    }
  }, [addEdge]);

  const handleSave = useCallback(async () => {
    if (!dag) {
      console.log('No DAG data to save.');
      return;
    }

    const method = params.id === 'new' ? 'POST' : 'PUT';
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    const url = params.id === 'new' ? `${backendUrl}/api/v1/dags/` : `${backendUrl}/api/v1/dags/${params.id}`;

    try {
      console.log(`${method}ing DAG to ${url}`, dag);
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dag),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error(`Failed to ${method.toLowerCase()} DAG:`, response.status, errorData);
        // Optionally show a user-facing error message
      } else {
        const savedDag = await response.json();
        console.log(`DAG ${method.toLowerCase()}ed successfully:`, savedDag);
        // If a new DAG was created, update the URL to the new DAG ID
        if (params.id === 'new' && savedDag.id) {
          // This requires using a router hook, if available in Next.js App Router
          // For now, we'll just log it.
          console.log('New DAG created with ID:', savedDag.id);
          // In a real app, you might redirect: router.push(`/dag/${savedDag.id}`);
        }
        // Optionally show a user-facing success message
      }
    } catch (error) {
      console.error(`Error ${method.toLowerCase()}ing DAG:`, error);
      // Optionally show a user-facing error message
    }
  }, [dag, params.id]);

  const handleRun = useCallback(() => {
    console.log('Running DAG:', dag);
  }, [dag]);

  const handleNodeSelect = useCallback((node: Node | null) => {
    setSelectedNode(node);
  }, [setSelectedNode]);

  const handlePaneClick = useCallback(() => {
    setSelectedNode(null);
  }, [setSelectedNode]);

  // Content for the runHistory prop, conditionally rendered
  const runHistoryContent = showRunHistory ? (
    console.log('Rendering Run History Panel'), // Keep log for debugging
    <PanelGroup direction="vertical">
      <Panel defaultSize={75}>
        <div className="h-full" /> {/* Placeholder for upper panel if needed, or canvas can go here */}
      </Panel>
      <PanelResizeHandle className="h-2 bg-border" />
      <Panel defaultSize={25}>
        <div className="h-full border-t">
          {/* Pass the current DAG ID to RunHistory */}
          <RunHistory dagId={params.id} />
        </div>
      </Panel>
    </PanelGroup>
  ) : (
    console.log('Hiding Run History Panel'), // Keep log for debugging
    null
  );

  return (
    <div className="flex h-screen">
      <div className="flex-1 flex flex-col">
        <DagEditorLayout
          nodePalette={
            <div className="h-full border-r">
              <NodePalette onDragStart={handleDragStart} />
            </div>
          }
          dagCanvas={
             <div className="h-full relative"> {/* Ensure canvas area has height */}
                <DagCanvas
                   selectedNode={selectedNode}
                   onNodeSelect={handleNodeSelect}
                   onSave={handleSave}
                   onRun={handleRun}
                   onClear={clearDag}
                   onUndo={() => {}}
                   onRedo={() => {}}
                   onZoomIn={() => reactFlowInstance?.zoomIn()}
                   onZoomOut={() => reactFlowInstance?.zoomOut()}
                   onFitView={() => reactFlowInstance?.fitView()}
                   onSettings={() => {}}
                   onHelp={() => {}}
                   onInit={setReactFlowInstance}
                   reactFlowWrapper={reactFlowWrapper}
                   nodes={dag?.nodes || []}
                   edges={dag?.edges || []}
                   onNodesChange={handleNodesChange}
                   onEdgesChange={handleEdgesChange}
                   onConnect={handleConnect}
                   onDrop={handleDrop}
                   onDragOver={handleDragOver}
                   onAddNode={addNode}
                   onPaneClick={handlePaneClick}
                />
                 <Button
                  variant="outline"
                  size="icon"
                  className="absolute bottom-4 right-4"
                  onClick={() => setShowRunHistory(!showRunHistory)}
                >
                  <History className="h-4 w-4" />
                </Button>
              </div>
          }
          configPanel={
            <div className="h-full border-l">
              <NodeConfigPanel node={selectedNode} onConfigChange={() => {}} />
            </div>
          }
          // Pass the conditionally rendered content to the runHistory prop
          runHistory={runHistoryContent as React.ReactNode | undefined}
        />
      </div>
    </div>
  );
} 