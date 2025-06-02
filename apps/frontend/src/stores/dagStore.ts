import { create, StateCreator } from 'zustand';
import { SyntheticDataDAG, DagNode, DagEdge, NodeValidationRules } from '@/types/dag';
import { v4 as uuidv4 } from 'uuid';

interface DagState {
  // DAG state
  dag: SyntheticDataDAG | null;
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

  // History state and actions
  history: SyntheticDataDAG[];
  historyIndex: number;
  saveHistory: () => void;
  undo: () => void;
  redo: () => void;
}

const createDagStore: StateCreator<DagState> = (set, get) => ({
  // Initial state
  dag: {
    name: 'New DAG',
    nodes: [],
    edges: [],
  },
  selectedNode: null,
  selectedEdge: null,

  // History initial state
  history: [],
  historyIndex: -1,

  // Actions
  setDag: (dag: SyntheticDataDAG) => {
    set({ dag });
    get().saveHistory();
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
        config: getDefaultConfig(node.type || '') // Initialize config here
      }
    };
    
    set((state: DagState) => ({
      dag: state.dag ? {
        ...state.dag,
        nodes: [...state.dag.nodes, newNode],
      } : null,
    }));
    get().saveHistory();
  },

  updateNode: (nodeId: string, data: Partial<DagNode['data']>) => {
    set((state: DagState) => ({
      dag: state.dag ? {
        ...state.dag,
        nodes: state.dag.nodes.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, ...data } }
            : node
        ),
      } : null,
    }));
    get().saveHistory();
  },

  removeNode: (nodeId: string) => {
    set((state: DagState) => ({
      dag: state.dag ? {
        ...state.dag,
        nodes: state.dag.nodes.filter((node) => node.id !== nodeId),
        edges: state.dag.edges.filter(
          (edge) => edge.source !== nodeId && edge.target !== nodeId
        ),
      } : null,
    }));
    get().saveHistory();
  },

  addEdge: (edge: Omit<DagEdge, 'id'>) => {
    const newId = uuidv4();
    const newEdge: DagEdge = {
      ...edge,
      id: newId,
    };
    
    set((state: DagState) => ({
      dag: state.dag ? {
        ...state.dag,
        edges: [...state.dag.edges, newEdge],
      } : null,
    }));
    get().saveHistory();
  },

  removeEdge: (edgeId: string) => {
    set((state: DagState) => ({
      dag: state.dag ? {
        ...state.dag,
        edges: state.dag.edges.filter((edge) => edge.id !== edgeId),
      } : null,
    }));
    get().saveHistory();
  },

  setSelectedNode: (node: DagNode | null) => set({ selectedNode: node }),
  setSelectedEdge: (edge: DagEdge | null) => set({ selectedEdge: edge }),

  updateNodeConfig: (nodeId: string, config: any) => {
    set((state: DagState) => ({
      dag: state.dag ? {
        ...state.dag,
        nodes: state.dag.nodes.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, config } }
            : node
        ),
      } : null,
    }));
    get().saveHistory();
  },

  // History actions
  saveHistory: () => {
    const currentDag = get().dag;
    if (currentDag) {
      set((state) => {
        const newHistory = state.history.slice(0, state.historyIndex + 1);
        newHistory.push(currentDag);
        return {
          history: newHistory,
          historyIndex: newHistory.length - 1,
        };
      });
    }
  },

  undo: () => {
    set((state) => {
      if (state.historyIndex > 0) {
        const newIndex = state.historyIndex - 1;
        const previousDag = state.history[newIndex];
        return {
          dag: previousDag,
          historyIndex: newIndex,
        };
      }
      return {}; // No change if at the beginning of history
    });
  },

  redo: () => {
    set((state) => {
      if (state.historyIndex < state.history.length - 1) {
        const newIndex = state.historyIndex + 1;
        const nextDag = state.history[newIndex];
        return {
          dag: nextDag,
          historyIndex: newIndex,
        };
      }
      return {}; // No change if at the end of history
    });
  },
});

export const useDagStore = create<DagState>(
  // Add middleware here if needed (e.g., persist)
  createDagStore
); 