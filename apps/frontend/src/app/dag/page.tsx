"use client";

import React, { useCallback, useRef, useState, useMemo, useEffect } from 'react';
import ReactFlow, {
  addEdge,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
  ReactFlowInstance,
  Node,
  applyNodeChanges,
  NodeChange,
  applyEdgeChanges,
  EdgeChange,
} from 'reactflow';
import { DagEditorLayout } from '@/components/layout/DagEditorLayout';
import { NodePalette } from '@/components/dag/NodePalette';
import { DagCanvas } from '@/components/dag/DagCanvas';
import NodeConfigPanel from '@/components/dag/NodeConfigPanel';
import { useDagStore } from '@/stores/dagStore';

import 'reactflow/dist/style.css';

// Import custom nodes
import SourceNode from '@/components/dag/nodes/SourceNode';
import GeneratorNode from '@/components/dag/nodes/GeneratorNode';
import EvaluatorNode from '@/components/dag/nodes/EvaluatorNode';
import ExporterNode from '@/components/dag/nodes/ExporterNode';

// Initial nodes and edges (we can remove these later as nodes will be added via drag and drop)
// const initialNodes: Node[] = [
//   // { id: '1', position: { x: 0, y: 0 }, data: { label: 'Input Node' } },
//   // { id: '2', position: { x: 0, y: 100 }, data: { label: 'Processor Node' } },
// ];
// const initialEdges: Edge[] = [
//   // { id: 'e1-2', source: '1', target: '2' }
// ];

let id = 0;
const getId = () => `dndnode_${id++}`;

const flowKey = 'syntheta-dag-data';

// Function to get initial nodes from local storage
const getInitialNodes = () => {
    if (typeof window !== 'undefined') {
        const savedFlow = localStorage.getItem(flowKey);
        if (savedFlow) {
            const flow = JSON.parse(savedFlow);
            return flow.nodes || [];
        }
    }
    return [];
};

// Function to get initial edges from local storage
const getInitialEdges = () => {
     if (typeof window !== 'undefined') {
        const savedFlow = localStorage.getItem(flowKey);
        if (savedFlow) {
            const flow = JSON.parse(savedFlow);
            return flow.edges || [];
        }
    }
    return [];
};

function DAGBuilder() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  
  // Use Zustand store
  const {
    dag,
    selectedNode,
    setDag,
    addNode,
    updateNode,
    removeNode,
    addEdge: addEdgeToStore,
    removeEdge,
    setSelectedNode,
    updateNodeConfig,
    // Get history actions from store
    undo,
    redo,
  } = useDagStore();

  // Initialize nodes and edges from store
  const [nodes, setNodes, onNodesChange] = useNodesState(dag?.nodes || []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(dag?.edges || []);

  // Update local state when store changes
  useEffect(() => {
    console.log('page.tsx: dag state changed', dag);
    if (dag) {
      setNodes(dag.nodes);
      setEdges(dag.edges);
      console.log('page.tsx: local nodes and edges updated', dag.nodes, dag.edges);
    }
  }, [dag, setNodes, setEdges]);

  // Custom onNodesChange to handle node selection and update store
  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((nds) => {
        const newNodes = applyNodeChanges(changes, nds);
        
        // Update store with new nodes
        if (dag) {
          setDag({
            ...dag,
            nodes: newNodes,
          });
        }
        
        return newNodes;
      });
      
      changes.forEach(change => {
        if (change.type === 'select') {
          if (change.selected) {
            const node = nodes.find(n => n.id === change.id);
            setSelectedNode(node || null);
          } else {
            if (selectedNode && selectedNode.id === change.id) {
              setSelectedNode(null);
            }
          }
        }
        if (change.type === 'select' && change.selected === false && nodes.every(n => n.id !== change.id)) {
          setSelectedNode(null);
        }
      });
    },
    [setNodes, nodes, dag, setDag, selectedNode, setSelectedNode],
  );

  // Custom onEdgesChange to update store
  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges((eds) => {
        const newEdges = applyEdgeChanges(changes, eds);
        
        // Update store with new edges
        if (dag) {
          setDag({
            ...dag,
            edges: newEdges,
          });
        }
        
        return newEdges;
      });
    },
    [setEdges, dag, setDag],
  );

  // Handler for node configuration changes
  const handleNodeConfigChange = useCallback((nodeId: string, config: any) => {
    updateNodeConfig(nodeId, config);
  }, [updateNodeConfig]);

  const handleConnect = useCallback(
    (params: Connection | Edge) => {
      setEdges((eds) => {
        const newEdges = addEdge(params, eds);
        
        // Update store with new edge
        if (dag) {
          setDag({
            ...dag,
            edges: newEdges,
          });
        }
        
        return newEdges;
      });
    },
    [setEdges, dag, setDag],
  );

  const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');

      // check if the dropped element is valid
      if (typeof type === 'undefined' || !type) {
        return;
      }

      // Use the bounds of the ReactFlow wrapper to calculate position
      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();

      if (reactFlowInstance && reactFlowBounds) {
        const position = reactFlowInstance.project({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        });
        
        const newNode = {
          type,
          position,
          data: { label: `${type.charAt(0).toUpperCase() + type.slice(1)} Node` },
        };

        // Add node to store
        addNode(newNode);
      }
    },
    [reactFlowInstance, addNode],
  );

  const onInit = useCallback((instance: ReactFlowInstance) => {
    setReactFlowInstance(instance);
    // Initial load can be added here if a default DAG ID is available or specified
    // Attach instance to ref for access in onDrop (workaround)
    if (reactFlowWrapper.current) {
      (reactFlowWrapper.current as any).reactFlowInstance = instance;
    }
  }, [reactFlowWrapper]);

  // Register custom node types
  const nodeTypes = useMemo(() => ({
    source: SourceNode,
    generator: GeneratorNode,
    evaluator: EvaluatorNode,
    exporter: ExporterNode,
  }), []);

  // Backend API Integration
  const API_URL = "http://localhost:8000/api/v1/dags"; // Replace with your backend URL

  // Save DAG to backend
  const handleSaveDAG = useCallback(async () => {
    if (!reactFlowInstance || !dag) return;

    const flow = reactFlowInstance.toObject();
    const dagName = dag.name || "My Syntheta DAG";
    const dagId = dag.id;

    const dagData = {
      id: dagId,
      name: dagName,
      nodes: flow.nodes,
      edges: flow.edges,
    };

    try {
      const response = await fetch(API_URL, {
        method: dagId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dagData),
      });

      if (!response.ok) {
        throw new Error('Failed to save DAG');
      }

      const savedDag = await response.json();
      setDag(savedDag);
    } catch (error) {
      console.error('Error saving DAG:', error);
      // Handle error (show notification, etc.)
    }
  }, [reactFlowInstance, dag, setDag]);

  // Load DAG from backend
  const handleLoadDAG = useCallback(async (dagId: string) => {
    try {
      const response = await fetch(`${API_URL}/${dagId}`);
      if (!response.ok) {
        throw new Error('Failed to load DAG');
      }

      const loadedDag = await response.json();
      setDag(loadedDag);
    } catch (error) {
      console.error('Error loading DAG:', error);
      // Handle error (show notification, etc.)
    }
  }, [setDag]);

  const handleClearDAG = useCallback(() => {
    setNodes([]);
    setEdges([]);
    localStorage.removeItem('currentDagId'); // Clear stored ID on new DAG
  }, [setNodes, setEdges]);

  const handleZoomIn = useCallback(() => {
    reactFlowInstance?.zoomIn();
  }, [reactFlowInstance]);

  const handleZoomOut = useCallback(() => {
    reactFlowInstance?.zoomOut();
  }, [reactFlowInstance]);

  const handleFitView = useCallback(() => {
    reactFlowInstance?.fitView();
  }, [reactFlowInstance]);

  const handleSettings = useCallback(() => {
    console.log('Opening settings...');
  }, []);

  const handleHelp = useCallback(() => {
    console.log('Opening help...');
  }, []);

  // Handler for running the DAG
  const handleRunDAG = useCallback(async () => {
    if (!dag) {
      console.error('No DAG to run.');
      return;
    }

    console.log('Attempting to run DAG:', dag);

    try {
      // Replace with your backend endpoint for running DAGs
      const response = await fetch(`${API_URL}/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dag),
      });

      if (!response.ok) {
        throw new Error(`Failed to run DAG: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('DAG execution initiated:', result);
      // TODO: Handle execution status and results in the UI
    } catch (error) {
      console.error('Error running DAG:', error);
      // TODO: Display error to the user
    }
  }, [dag, API_URL]);

  // Handler for the "Add Your First Node" button in EmptyState
  const handleEmptyStateAddNode = useCallback(() => {
    console.log('page.tsx: handleEmptyStateAddNode called');
    const defaultNode = {
      type: 'source', // Default to Source node
      position: { x: 250, y: 250 }, // Default position
      data: { label: 'Source Node' }, // Default label
    };
    addNode(defaultNode);
    console.log('page.tsx: addNode store action dispatched');
  }, [addNode]);

  // Example of how to use load (add buttons/input in render)
  const [loadDagIdInput, setLoadDagIdInput] = useState('');

  const handleLoadButtonClick = () => {
      if (loadDagIdInput) {
          handleLoadDAG(loadDagIdInput);
      }
  };

  // Keyboard shortcuts for Undo/Redo/Delete
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Delete' || event.key === 'Backspace') {
        // Prevent default browser behavior for backspace in inputs
        if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
          return;
        }
         // Delete selected nodes and edges
        setNodes((nds) => nds.filter(node => !node.selected));
        setEdges((eds) => eds.filter(edge => !edge.selected));
         setSelectedNode(null); // Deselect any node after deletion
      } else if ((event.metaKey || event.ctrlKey) && event.key === 'z') { // Cmd+Z or Ctrl+Z
        event.preventDefault(); // Prevent default undo behavior
        // Implement undo functionality
      } else if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key === 'Z') { // Cmd+Shift+Z or Ctrl+Shift+Z
         event.preventDefault(); // Prevent default redo behavior
         // Implement redo functionality
      } else if (event.key === 'Escape') { // Esc key
         setSelectedNode(null); // Deselect node
      }
       // Add other shortcuts here (Cmd+A, Cmd+D, Space for pan)
    };

    const wrapper = reactFlowWrapper.current;
    if (wrapper) {
      wrapper.addEventListener('keydown', handleKeyDown);
      wrapper.focus(); // Ensure the wrapper can receive focus
    }

    return () => {
      if (wrapper) {
        wrapper.removeEventListener('keydown', handleKeyDown);
      }
    };
  }, [nodes, edges, setNodes, setEdges, setSelectedNode, reactFlowWrapper]); // Add dependencies

  // Select node when config is changed (optional, might refine this)
  useEffect(() => {
    if (selectedNode) {
        // Find the potentially updated node in the current nodes array
        const updatedNode = nodes.find(n => n.id === selectedNode.id);
        if (updatedNode) {
            setSelectedNode(updatedNode);
        }
    }
  }, [nodes, selectedNode]);

  return (
    <DagEditorLayout
      nodePalette={<NodePalette onDragStart={onDragStart} />}
      dagCanvas={
        <DagCanvas
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          onConnect={handleConnect}
          onDrop={handleDrop}
          onDragOver={(e: React.DragEvent<HTMLDivElement>) => e.preventDefault()}
          selectedNode={selectedNode}
          onNodeSelect={setSelectedNode}
          onSave={handleSaveDAG}
          onRun={handleRunDAG}
          onClear={handleClearDAG}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onFitView={handleFitView}
          onSettings={handleSettings}
          onHelp={handleHelp}
          onInit={onInit}
          reactFlowWrapper={reactFlowWrapper}
          nodeTypes={nodeTypes}
          onAddNode={handleEmptyStateAddNode}
          onUndo={undo}
          onRedo={redo}
        />
      }
      configPanel={<NodeConfigPanel node={selectedNode} onConfigChange={handleNodeConfigChange} />}
    />
  );
}

export default DAGBuilder; 