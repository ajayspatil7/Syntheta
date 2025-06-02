import { z } from 'zod';

// Define the data payload for each node, including its specific config
export interface DagNodeData {
  label: string; // Display label for the node
  config?: SourceNodeConfig | GeneratorNodeConfig | EvaluatorNodeConfig | ExporterNodeConfig; // Optional specific configuration
  // Add other common node data properties here (e.g., description, status)
}

// Define the structure for a node in the DAG
// Combine ReactFlow's Node type with our custom data type using intersection
import { Node as ReactFlowNode } from 'reactflow';

export type DagNode = ReactFlowNode<DagNodeData>;

// Define the structure for an edge in the DAG
// Use ReactFlow's Edge type directly or combine if needed
import { Edge as ReactFlowEdge } from 'reactflow';

export type DagEdge = ReactFlowEdge;

// Define the overall DAG structure
export interface SyntheticDataDAG {
  id?: string; // Optional ID for saving/loading
  name: string;
  description?: string;
  nodes: DagNode[];
  edges: DagEdge[];
  // Add other DAG-level properties here (e.g., creation date, last modified, workspace ID)
}

// Source Node Configuration
export const SourceNodeConfigSchema = z.object({
  type: z.enum(['csv', 'postgresql', 'mysql', 'minio', 's3', 'api', 'kafka']),
  connection: z.object({
    // Database connections
    host: z.string().optional(),
    port: z.number().optional(),
    database: z.string().optional(),
    username: z.string().optional(),
    password: z.string().optional(),
    ssl: z.boolean().optional(),
    
    // File storage connections
    bucket: z.string().optional(),
    path: z.string().optional(),
    region: z.string().optional(),
    credentials: z.object({
      access_key: z.string().optional(),
      secret_key: z.string().optional(),
    }).optional(),
    
    // API connections
    url: z.string().optional(),
    method: z.enum(['GET', 'POST', 'PUT', 'DELETE']).optional(),
    headers: z.record(z.string()).optional(),
    auth: z.object({
      type: z.enum(['basic', 'bearer', 'api_key']).optional(),
      token: z.string().optional(),
    }).optional(),
    
    // Kafka connections
    bootstrap_servers: z.string().optional(),
    topic: z.string().optional(),
    group_id: z.string().optional(),
  }),
  schema: z.object({
    columns: z.array(z.object({
      name: z.string(),
      type: z.enum(['string', 'number', 'boolean', 'date', 'datetime', 'json', 'array']),
      nullable: z.boolean().optional(),
      description: z.string().optional(),
      constraints: z.object({
        min: z.number().optional(),
        max: z.number().optional(),
        pattern: z.string().optional(),
        unique: z.boolean().optional(),
        required: z.boolean().optional(),
      }).optional(),
    })),
  }).optional(),
  options: z.object({
    // CSV options
    delimiter: z.string().optional(),
    encoding: z.string().optional(),
    has_header: z.boolean().optional(),
    
    // Database options
    query: z.string().optional(),
    batch_size: z.number().optional(),
    
    // API options
    pagination: z.object({
      enabled: z.boolean().optional(),
      type: z.enum(['offset', 'cursor', 'page']).optional(),
      param_name: z.string().optional(),
    }).optional(),
    
    // Kafka options
    auto_offset_reset: z.enum(['earliest', 'latest']).optional(),
    max_poll_records: z.number().optional(),
  }).optional(),
  validation: z.object({
    required_columns: z.array(z.string()).optional(),
    data_quality_rules: z.array(z.object({
      column: z.string(),
      rule: z.enum(['not_null', 'unique', 'range', 'pattern', 'custom']),
      params: z.record(z.any()).optional(),
    })).optional(),
  }).optional(),
});

export type SourceNodeConfig = z.infer<typeof SourceNodeConfigSchema>;

// Generator Node Configuration
export const GeneratorNodeConfigSchema = z.object({
  type: z.enum(['ctgan', 'tvae', 'copulagan', 'gaussian', 'uniform', 'custom']),
  parameters: z.object({
    // Common parameters
    num_samples: z.number().min(1),
    batch_size: z.number().min(1).optional(),
    epochs: z.number().min(1).optional(),
    learning_rate: z.number().min(0).optional(),
    
    // CTGAN specific
    embedding_dim: z.number().min(1).optional(),
    generator_dim: z.array(z.number()).optional(),
    discriminator_dim: z.array(z.number()).optional(),
    
    // TVAE specific
    compress_dims: z.array(z.number()).optional(),
    decompress_dims: z.array(z.number()).optional(),
    
    // CopulaGAN specific
    n_clusters: z.number().min(1).optional(),
    
    // Custom generator
    custom_script: z.string().optional(),
    custom_requirements: z.array(z.string()).optional(),
  }),
  constraints: z.array(z.object({
    column: z.string(),
    type: z.enum(['range', 'distribution', 'correlation', 'custom']),
    params: z.object({
      // Range constraints
      min: z.number().optional(),
      max: z.number().optional(),
      
      // Distribution constraints
      distribution: z.enum(['normal', 'uniform', 'exponential', 'custom']).optional(),
      mean: z.number().optional(),
      std: z.number().optional(),
      
      // Correlation constraints
      correlated_with: z.string().optional(),
      correlation_type: z.enum(['pearson', 'spearman', 'kendall']).optional(),
      correlation_value: z.number().optional(),
      
      // Custom constraints
      custom_rule: z.string().optional(),
    }),
  })).optional(),
  data_quality: z.object({
    privacy: z.object({
      anonymization: z.boolean().optional(),
      k_anonymity: z.number().optional(),
      l_diversity: z.number().optional(),
      t_closeness: z.number().optional(),
    }).optional(),
    validation: z.object({
      required_metrics: z.array(z.string()).optional(),
      thresholds: z.record(z.number()).optional(),
    }).optional(),
  }).optional(),
  output_format: z.object({
    schema: z.object({
      columns: z.array(z.object({
        name: z.string(),
        type: z.enum(['string', 'number', 'boolean', 'date', 'datetime', 'json', 'array']),
        nullable: z.boolean().optional(),
        description: z.string().optional(),
        constraints: z.object({
          min: z.number().optional(),
          max: z.number().optional(),
          pattern: z.string().optional(),
          unique: z.boolean().optional(),
          required: z.boolean().optional(),
        }).optional(),
      })),
    }).optional(),
  }).optional(),
});

export type GeneratorNodeConfig = z.infer<typeof GeneratorNodeConfigSchema>;

// Define schema for Data Quality Rule
export const DataQualityRuleSchema = z.object({
  column: z.string(),
  rule: z.enum(['not_null', 'unique', 'range', 'pattern', 'custom']),
  params: z.record(z.any()).optional(),
});

export type DataQualityRule = z.infer<typeof DataQualityRuleSchema>;

// Evaluator Node Configuration
export const EvaluatorNodeConfigSchema = z.object({
  metrics: z.array(z.string()).optional(), // Make metrics optional as per usage
  validation: z.object({
    required_metrics: z.array(z.string()).optional(),
    thresholds: z.record(z.number()).optional(),
    data_quality_rules: z.array(DataQualityRuleSchema).optional(),
  }).optional(),
});

export type EvaluatorNodeConfig = z.infer<typeof EvaluatorNodeConfigSchema>;

// Exporter Node Configuration
export const ExporterNodeConfigSchema = z.object({
  type: z.enum(['csv', 'json', 'minio', 's3']),
  destination: z.object({
    path: z.string().optional(),
    bucket: z.string().optional(),
  }),
  options: z.object({
    delimiter: z.string().optional(),
    encoding: z.string().optional(),
  }).optional(),
  validation: z.object({
    required_metrics: z.array(z.string()).optional(),
    thresholds: z.record(z.number()).optional(),
  }).optional(),
});

export type ExporterNodeConfig = z.infer<typeof ExporterNodeConfigSchema>;

// Node Validation Rules
export interface NodeValidationRule {
  maxInputs: number;
  maxOutputs: number;
  allowedSources: string[];
  allowedTargets: string[];
}

export const NodeValidationRules = z.object({
  source: z.object({
    maxInputs: z.literal(0),
    maxOutputs: z.literal(1),
    allowedSources: z.array(z.string()).max(0), // Source nodes cannot have sources
    allowedTargets: z.array(z.enum(['transform', 'analysis', 'exporter'])),
  }),
  transform: z.object({
    maxInputs: z.literal(1),
    maxOutputs: z.literal(1),
    allowedSources: z.array(z.enum(['source', 'transform', 'generator'])),
    allowedTargets: z.array(z.enum(['transform', 'analysis', 'exporter'])),
  }),
  generator: z.object({
    maxInputs: z.literal(0),
    maxOutputs: z.literal(1),
    allowedSources: z.array(z.string()).max(0), // Generator nodes cannot have sources
    allowedTargets: z.array(z.enum(['transform', 'analysis', 'exporter'])),
  }),
  analysis: z.object({
    maxInputs: z.literal(1),
    maxOutputs: z.literal(0), // Analysis nodes are typically endpoints
    allowedSources: z.array(z.enum(['source', 'transform', 'generator'])),
    allowedTargets: z.array(z.string()).max(0), // Analysis nodes cannot have targets
  }),
  exporter: z.object({
    maxInputs: z.literal(1),
    maxOutputs: z.literal(0), // Exporter nodes are endpoints
    allowedSources: z.array(z.enum(['source', 'transform', 'generator', 'analysis'])),
    allowedTargets: z.array(z.string()).max(0), // Exporter nodes cannot have targets
  }),
});

export type NodeValidationRules = z.infer<typeof NodeValidationRules>;

// Node Group Configuration
export const NodeGroupConfigSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  nodes: z.array(z.string()), // Array of node IDs in the group
});

export type NodeGroupConfig = z.infer<typeof NodeGroupConfigSchema>; 