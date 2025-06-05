import { create, StateCreator, StoreApi } from 'zustand';
import { SyntheticDataDAG, DagNode, DagEdge } from '@/types/dag';
import { v4 as uuidv4 } from 'uuid';
import { temporal, TemporalState } from 'zundo';
// import shallow from 'zustand/shallow'; // Uncomment if you want to use shallow equality

// Define the base state interface
export interface DagState {
  // DAG state
  dag: SyntheticDataDAG;
  selectedNode: DagNode | null;
  selectedEdge: DagEdge | null;
  
  // Actions
  setDag: (dag: SyntheticDataDAG) => void;
  addNode: (node: Omit<DagNode, 'id'>) => void;
  updateNode: (nodeId: string, data: Partial<DagNode['data']>) => void;
  removeNode: (nodeId: string) => void;
  addEdge: (edge: Omit<DagEdge, 'id'>) => void;
  removeEdge: (edgeId: string) => void;
  setSelectedNode: (node: DagNode | null) => void;
  setSelectedEdge: (edge: DagEdge | null) => void;
  updateNodeConfig: (nodeId: string, config: any) => void;
  clearDag: () => void;
}

// Create the base store
const createDagStore: StateCreator<DagState> = (set, get) => ({
  // Initial state
  dag: {
    name: 'New DAG',
    nodes: [],
    edges: [],
  },
  selectedNode: null,
  selectedEdge: null,

  // Actions
  setDag: (dag: SyntheticDataDAG) => {
    set({ dag });
  },
  
  addNode: (node: Omit<DagNode, 'id'>) => {
    const newId = uuidv4();
    
    // Initialize default config based on node type
    const getDefaultConfig = (type: string) => {
      switch (type) {
        case 'source':
          return {
            type: 'csv',
            connection: {},
            options: {},
            schema: { columns: [] },
            validation: { required_columns: [], data_quality_rules: [] },
          };
        case 'generator':
          return {
            type: 'ctgan',
            parameters: {
              num_samples: 1000,
            },
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
            destination: {
              path: '',
            },
            options: {},
            validation: { required_metrics: [], thresholds: {} },
          };
        default:
          return {};
      }
    };

    const newNode: DagNode = {
      ...node,
      id: newId,
      data: {
        ...node.data,
        config: getDefaultConfig(node.type || '')
      }
    };
    
    const currentState = get();
    set({
      dag: {
        ...currentState.dag,
        nodes: [...currentState.dag.nodes, newNode],
      }
    });
  },

  updateNode: (nodeId: string, data: Partial<DagNode['data']>) => {
    const currentState = get();
    set({
      dag: {
        ...currentState.dag,
        nodes: currentState.dag.nodes.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, ...data } }
            : node
        ),
      }
    });
  },

  removeNode: (nodeId: string) => {
    const currentState = get();
    set({
      dag: {
        ...currentState.dag,
        nodes: currentState.dag.nodes.filter((node) => node.id !== nodeId),
        edges: currentState.dag.edges.filter(
          (edge) => edge.source !== nodeId && edge.target !== nodeId
        ),
      }
    });
  },

  addEdge: (edge: Omit<DagEdge, 'id'>) => {
    const newId = uuidv4();
    const newEdge: DagEdge = {
      ...edge,
      id: newId,
    };
    
    const currentState = get();
    set({
      dag: {
        ...currentState.dag,
        edges: [...currentState.dag.edges, newEdge],
      }
    });
  },

  removeEdge: (edgeId: string) => {
    const currentState = get();
    set({
      dag: {
        ...currentState.dag,
        edges: currentState.dag.edges.filter((edge) => edge.id !== edgeId),
      }
    });
  },

  setSelectedNode: (node: DagNode | null) => set({ selectedNode: node }),
  setSelectedEdge: (edge: DagEdge | null) => set({ selectedEdge: edge }),

  updateNodeConfig: (nodeId: string, config: any) => {
    const currentState = get();
    set({
      dag: {
        ...currentState.dag,
        nodes: currentState.dag.nodes.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, config } }
            : node
        ),
      }
    });
  },

  clearDag: () => {
    set({
      dag: {
        name: 'New DAG',
        nodes: [],
        edges: [],
      },
      selectedNode: null,
      selectedEdge: null,
    });
  },
});

// Create the store with temporal middleware
export const useDagStore = create<DagState>()(
  temporal(createDagStore, {
    partialize: (state) => ({
      dag: state.dag,
    }),
    limit: 50,
    onSave: (state) => {
      console.log('Saving temporal state:', state);
    },
  })
);

// Export temporal actions and state
export const useTemporalStore = () => {
  const temporalStore = useDagStore.temporal;
  const state = temporalStore.getState();
  
  return {
    undo: () => {
      if (state.pastStates.length > 0) {
        console.log('Undoing to state:', state.pastStates[state.pastStates.length - 1]);
        state.undo();
      }
    },
    redo: () => {
      if (state.futureStates.length > 0) {
        console.log('Redoing to state:', state.futureStates[0]);
        state.redo();
      }
    },
    clearHistory: state.clear,
    canUndo: state.pastStates.length > 0,
    canRedo: state.futureStates.length > 0,
  };
};

// Export convenience hooks for undo/redo state
export const useCanUndo = () => useDagStore.temporal.getState().pastStates.length > 0;
export const useCanRedo = () => useDagStore.temporal.getState().futureStates.length > 0;

// Export convenience functions for undo/redo actions
export const undo = () => {
  const state = useDagStore.temporal.getState();
  if (state.pastStates.length > 0) {
    console.log('Undoing to state:', state.pastStates[state.pastStates.length - 1]);
    state.undo();
  }
};

export const redo = () => {
  const state = useDagStore.temporal.getState();
  if (state.futureStates.length > 0) {
    console.log('Redoing to state:', state.futureStates[0]);
    state.redo();
  }
};

export const clearHistory = () => useDagStore.temporal.getState().clear();

export default useDagStore; 