import { NextRequest } from "next/server";
import { ModelDetails } from '@/types/model-library';


// Temporary sample data - in a real app, this would come from a database
const sampleDetails: Record<string, ModelDetails> = {
  'stylegan3-healthcare': {
    id: 'stylegan3-healthcare',
    name: 'StyleGAN3 Medical Imaging',
    description: 'High-resolution synthetic medical scan generator trained on diverse anatomical structures',
    category: 'GAN',
    domain: 'Healthcare',
    framework: 'PyTorch',
    metrics: {
      fid_score: 12.4,
      inception_score: 8.2,
      coverage: 0.89,
      diversity: 0.76,
    },
    usage_count: 1247,
    last_updated: '2024-01-15T10:30:00Z',
    created_by: 'syntheta-team',
    tags: ['medical', 'x-ray', 'ct-scan', 'privacy-safe'],
    model_size: '2.1GB',
    status: 'active',
    is_public: true,
    is_featured: true,
    readme: `# StyleGAN3 Medical Imaging

This model is trained on a diverse dataset of medical scans to generate high-quality synthetic medical images. It's particularly useful for:

- Training medical imaging AI models
- Data augmentation
- Privacy-preserving research
- Educational purposes

## Features

- High-resolution output (256x256)
- Diverse anatomical structures
- Privacy-safe synthetic data
- Multiple modalities (X-ray, CT, MRI)

## Usage

The model can be used through our Python SDK or REST API. See the code examples tab for detailed usage instructions.

## Performance

The model achieves state-of-the-art performance on medical image generation tasks, with a FID score of 12.4 and an Inception Score of 8.2.`,
    configuration: {
      input_shape: [256, 256, 3],
      output_shape: [256, 256, 3],
      batch_size: 32,
      epochs_trained: 100,
      dataset_used: 'Medical Imaging Dataset v2.0',
    },
    performance_history: [
      {
        date: '2024-01-15T10:30:00Z',
        metrics: {
          fid_score: 12.4,
          inception_score: 8.2,
        },
      },
      {
        date: '2024-01-01T10:30:00Z',
        metrics: {
          fid_score: 13.2,
          inception_score: 7.9,
        },
      },
    ],
    sample_outputs: [
      {
        input_url: '/samples/medical/input1.jpg',
        output_url: '/samples/medical/output1.jpg',
        generated_at: '2024-01-15T10:30:00Z',
      },
      {
        input_url: '/samples/medical/input2.jpg',
        output_url: '/samples/medical/output2.jpg',
        generated_at: '2024-01-15T10:30:00Z',
      },
    ],
    usage_examples: [
      {
        language: 'Python',
        code: `import torch
from syntheta import load_model

# Load the model
model = load_model("stylegan3-healthcare")

# Generate a batch of synthetic medical images
images = model.generate(batch_size=4)

# Save the generated images
for i, image in enumerate(images):
    image.save(f"synthetic_medical_{i}.png")`,
      },
      {
        language: 'REST API',
        code: `curl -X POST https://api.syntheta.ai/v1/models/stylegan3-healthcare/generate \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"batch_size": 4}'`,
      },
    ],
    versions: [
      {
        version: '1.0.0',
        changelog: 'Initial release with basic medical image generation capabilities',
        download_url: '/models/stylegan3-healthcare-v1.0.0.pt',
        created_at: '2024-01-15T10:30:00Z',
      },
      {
        version: '0.9.0',
        changelog: 'Beta release with improved diversity',
        download_url: '/models/stylegan3-healthcare-v0.9.0.pt',
        created_at: '2024-01-01T10:30:00Z',
      },
    ],
  },
  'diffusion-manufacturing': {
    id: 'diffusion-manufacturing',
    name: 'Diffusion Manufacturing Defects',
    description: 'Synthetic manufacturing defect generator for quality control training',
    category: 'Diffusion',
    domain: 'Manufacturing',
    framework: 'PyTorch',
    metrics: {
      fid_score: 15.2,
      inception_score: 7.8,
      coverage: 0.92,
      diversity: 0.85,
    },
    usage_count: 856,
    last_updated: '2024-02-01T14:20:00Z',
    created_by: 'syntheta-team',
    tags: ['manufacturing', 'quality-control', 'defects', 'inspection'],
    model_size: '1.8GB',
    status: 'active',
    is_public: true,
    is_featured: false,
    readme: `# Diffusion Manufacturing Defects

This model generates synthetic manufacturing defects for training quality control systems. It's designed to help:

- Train defect detection models
- Test quality control systems
- Develop inspection algorithms
- Validate defect classification

## Features

- Multiple defect types
- Realistic defect patterns
- Configurable defect parameters
- High-quality output

## Usage

The model can be used through our Python SDK or REST API. See the code examples tab for detailed usage instructions.`,
    configuration: {
      input_shape: [512, 512, 3],
      output_shape: [512, 512, 3],
      batch_size: 16,
      epochs_trained: 150,
      dataset_used: 'Manufacturing Defects Dataset v1.0',
    },
    performance_history: [
      {
        date: '2024-02-01T14:20:00Z',
        metrics: {
          fid_score: 15.2,
          inception_score: 7.8,
        },
      },
    ],
    sample_outputs: [
      {
        input_url: '/samples/manufacturing/input1.jpg',
        output_url: '/samples/manufacturing/output1.jpg',
        generated_at: '2024-02-01T14:20:00Z',
      },
    ],
    usage_examples: [
      {
        language: 'Python',
        code: `import torch
from syntheta import load_model

# Load the model
model = load_model("diffusion-manufacturing")

# Generate synthetic defects
defects = model.generate(
    defect_types=["scratch", "dent"],
    severity=0.7,
    batch_size=4
)

# Save the generated images
for i, defect in enumerate(defects):
    defect.save(f"manufacturing_defect_{i}.png")`,
      },
    ],
    versions: [
      {
        version: '1.0.0',
        changelog: 'Initial release with basic defect generation capabilities',
        download_url: '/models/diffusion-manufacturing-v1.0.0.pt',
        created_at: '2024-02-01T14:20:00Z',
      },
    ],
  },
};

// Fixed: Proper Next.js App Router API route type
export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = context.params;
  const modelDetails = sampleDetails[id];

  if (!modelDetails) {
    return new Response(
      JSON.stringify({ error: "Model not found" }),
      { status: 404 }
    );
  }

  return new Response(JSON.stringify(modelDetails));
}