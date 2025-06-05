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
import { useDagStore, useTemporalStore, DagState } from '@/stores/dagStore';
import { SyntheticDataDAG, DagNode, DagEdge } from '@/types/dag';
import { v4 as uuidv4 } from 'uuid';

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
  
  // Use Zustand store with a single selector returning the whole state
  const store = useDagStore((state) => state);

  // Safely access state properties with nullish coalescing
  const dag = store?.dag ?? null;
  const selectedNode = store?.selectedNode ?? null;
  const setDag = store?.setDag;
  const addNode = store?.addNode;
  const updateNode = store?.updateNode;
  const removeNode = store?.removeNode;
  const addEdgeToStore = store?.addEdge;
  const removeEdge = store?.removeEdge;
  const setSelectedNode = store?.setSelectedNode;
  const updateNodeConfig = store?.updateNodeConfig;

  // Get temporal store functions
  const { undo, redo } = useTemporalStore();

  // Use ReactFlow hooks for local node and edge state, initialized from the store
  const [nodes, setNodes, onNodesChange] = useNodesState(dag?.nodes || []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(dag?.edges || []);

  // Effect to sync store changes to local ReactFlow state
  useEffect(() => {
    console.log('DAG state changed:', dag);
    if (dag) {
      setNodes(dag.nodes);
      setEdges(dag.edges);
    }
  }, [dag, setNodes, setEdges]);

  // Custom onNodesChange: update local state and then sync to store
  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      console.log('handleNodesChange called with changes:', changes);
      
      // Apply changes to local state first
      onNodesChange(changes);

      // Then sync to store
      setNodes((nds) => {
        const newNodes = applyNodeChanges(changes, nds);
        
        // Update store with new nodes
        if (setDag) {
          const newDag = {
            ...dag,
            nodes: newNodes,
          };
          console.log('Updating store with new nodes:', newDag);
          setDag(newDag);
        }

        // Handle node selection
        changes.forEach(change => {
          if (change.type === 'select') {
            if (change.selected) {
              const node = newNodes.find(n => n.id === change.id);
              setSelectedNode?.(node || null);
            } else {
              if (selectedNode && selectedNode.id === change.id) {
                setSelectedNode?.(null);
              }
            }
          }
        });

        return newNodes;
      });
    },
    [setNodes, dag, setDag, selectedNode, setSelectedNode],
  );

  // Custom onEdgesChange: update local state and then sync to store
  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      console.log('handleEdgesChange called with changes:', changes);
      
      // Apply changes to local state first
      onEdgesChange(changes);

      // Then sync to store
      setEdges((eds) => {
        const newEdges = applyEdgeChanges(changes, eds);
        
        // Update store with new edges
        if (setDag) {
          const newDag = {
            ...dag,
            edges: newEdges,
          };
          console.log('Updating store with new edges:', newDag);
          setDag(newDag);
        }

        return newEdges;
      });
    },
    [setEdges, dag, setDag],
  );

  // Handler for node configuration changes
  const handleNodeConfigChange = useCallback((nodeId: string, config: any) => {
    console.log('handleNodeConfigChange called for node:', nodeId, 'with config:', config);
    // Update the store directly for config changes
    updateNodeConfig?.(nodeId, config);
  }, [updateNodeConfig]);

  const handleConnect = useCallback(
    (params: Connection | Edge) => {
      console.log('handleConnect called with params:', params);
      
      // Add edge to store
      if (addEdgeToStore) {
        const newEdge: DagEdge = {
          ...params as Omit<DagEdge, 'id'>,
          id: uuidv4(),
        };
        console.log('Adding new edge to store:', newEdge);
        addEdgeToStore(newEdge);
      }
    },
    [addEdgeToStore],
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

      if (reactFlowInstance && reactFlowBounds && addNode) {
        const position = reactFlowInstance.project({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        });
        
        // The addNode action in the store generates the ID, so we just pass the partial node
        const newNodePartial: Omit<DagNode, 'id'> = {
          type,
          position,
          data: { label: `${type.charAt(0).toUpperCase() + type.slice(1)} Node`, config: {} }, // Ensure config is initialized
        };

        console.log('handleDrop - adding new node to store:', newNodePartial);
        // Add node to store
        addNode(newNodePartial);
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
    console.log('handleSaveDAG called');
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
      // We need setDag to be defined here
      if (setDag) {
        console.log('handleSaveDAG - saving dag data:', dagData);
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
        console.log('handleSaveDAG - saved dag response:', savedDag);
        setDag(savedDag);
      }
    } catch (error) {
      console.error('Error saving DAG:', error);
      // Handle error (show notification, etc.)
    }
  }, [reactFlowInstance, dag, setDag]);

  // Load DAG from backend
  const handleLoadDAG = useCallback(async (dagId: string) => {
    console.log('handleLoadDAG called with id:', dagId);
    // We need setDag to be defined here
    if (setDag) {
      try {
        const response = await fetch(`${API_URL}/${dagId}`);
        if (!response.ok) {
          throw new Error('Failed to load DAG');
        }

        const loadedDag = await response.json();
        console.log('handleLoadDAG - loaded dag response:', loadedDag);
        setDag(loadedDag);
      } catch (error) {
        console.error('Error loading DAG:', error);
        // Handle error (show notification, etc.)
      }
    }
  }, [setDag]);

  const handleClearDAG = useCallback(() => {
    console.log('handleClearDAG called');
    // Use the store action to clear the DAG
    store?.clearDag?.();
    localStorage.removeItem('currentDagId'); // Clear stored ID on new DAG
  }, [store]); // Depend on the entire store object

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
    console.log('handleSettings called');
  }, []);

  const handleHelp = useCallback(() => {
    console.log('handleHelp called');
  }, []);

  // Handler for running the DAG
  const handleRunDAG = useCallback(async () => {
    console.log('handleRunDAG called');
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
    console.log('handleEmptyStateAddNode called');
    const defaultNode = {
      type: 'source', // Default to Source node
      position: { x: 250, y: 250 }, // Default position
      data: { label: 'Source Node' }, // Default label
    };
    addNode?.(defaultNode);
    console.log('handleEmptyStateAddNode - addNode store action dispatched');
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
        const nodesToDelete = nodes.filter(node => node.selected);
        const edgesToDelete = edges.filter(edge => edge.selected);

        console.log('Deleting:', { nodesToDelete, edgesToDelete });

        nodesToDelete.forEach(node => removeNode?.(node.id));
        edgesToDelete.forEach(edge => removeEdge?.(edge.id));

        setSelectedNode?.(null);
      } else if ((event.metaKey || event.ctrlKey) && event.key === 'z') {
        event.preventDefault();
        console.log('Undo shortcut pressed');
        undo();
      } else if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key === 'Z') {
        event.preventDefault();
        console.log('Redo shortcut pressed');
        redo();
      } else if (event.key === 'Escape') {
        setSelectedNode?.(null);
      }
    };

    const wrapper = reactFlowWrapper.current;
    if (wrapper) {
      wrapper.addEventListener('keydown', handleKeyDown);
      wrapper.focus();
    }

    return () => {
      if (wrapper) {
        wrapper.removeEventListener('keydown', handleKeyDown);
      }
    };
  }, [nodes, edges, removeNode, removeEdge, setSelectedNode, undo, redo]);

  // Select node when config is changed (optional, might refine this)
  useEffect(() => {
    if (selectedNode) {
        // Find the potentially updated node in the current nodes array
        const updatedNode = nodes.find(n => n.id === selectedNode.id);
        if (updatedNode) {
            setSelectedNode?.(updatedNode);
        }
    }
  }, [nodes, selectedNode, setSelectedNode]);

  // Log store state changes
  useEffect(() => {
    const unsubscribe = useDagStore.subscribe(
      (state) => {
        console.log('Zustand store dag state updated:', state.dag);
      }
    );

    const unsubscribeTemporal = useDagStore.temporal.subscribe(
      (state) => {
        console.log('Temporal store state:', {
          pastStates: state.pastStates.length,
          futureStates: state.futureStates.length
        });
      }
    );

    return () => {
      unsubscribe();
      unsubscribeTemporal();
    };
  }, []);

  return (
    <DagEditorLayout
      nodePalette={<NodePalette onDragStart={onDragStart} />}
      dagCanvas={
        <DagCanvas
          nodes={nodes} // Pass nodes from useNodesState
          edges={edges} // Pass edges from useEdgesState
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          onConnect={handleConnect}
          onDrop={handleDrop}
          onDragOver={(e: React.DragEvent<HTMLDivElement>) => e.preventDefault()}
          selectedNode={selectedNode}
          onNodeSelect={setSelectedNode || (() => {})}
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