export interface ModelDetails {
  id: string;
  name: string;
  description: string;
  category: string;
  domain: string;
  framework: string;
  metrics: {
    fid_score: number;
    inception_score: number;
    coverage: number;
    diversity: number;
  };
  usage_count: number;
  last_updated: string;
  created_by: string;
  tags: string[];
  model_size: string;
  status: 'active' | 'inactive' | 'deprecated';
  is_public: boolean;
  is_featured: boolean;
  readme: string;
  configuration: {
    input_shape: number[];
    output_shape: number[];
    batch_size: number;
    epochs_trained: number;
    dataset_used: string;
  };
  performance_history: Array<{
    date: string;
    metrics: {
      fid_score: number;
      inception_score: number;
    };
  }>;
  sample_outputs: Array<{
    input_url: string;
    output_url: string;
    generated_at: string;
  }>;
  usage_examples: Array<{
    language: string;
    code: string;
  }>;
  versions: Array<{
    version: string;
    changelog: string;
    download_url: string;
    created_at: string;
  }>;
} 