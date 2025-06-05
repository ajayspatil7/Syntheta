import { NextResponse } from 'next/server';
import { ModelCard, ModelFilters } from '@/types/model-library';

// Temporary sample data - in a real app, this would come from a database
const sampleModels: ModelCard[] = [
  {
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
  },
  {
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
  },
];

export async function POST(request: Request) {
  try {
    const filters: ModelFilters = await request.json();

    // Filter models based on the provided filters
    let filteredModels = sampleModels.filter((model) => {
      // Search query filter
      if (
        filters.searchQuery &&
        !model.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) &&
        !model.description.toLowerCase().includes(filters.searchQuery.toLowerCase()) &&
        !model.tags.some((tag) =>
          tag.toLowerCase().includes(filters.searchQuery.toLowerCase())
        )
      ) {
        return false;
      }

      // Category filter
      if (
        filters.selectedCategory !== 'all' &&
        model.category !== filters.selectedCategory
      ) {
        return false;
      }

      // Domain filter
      if (
        filters.filterBy.domain.length > 0 &&
        !filters.filterBy.domain.includes(model.domain)
      ) {
        return false;
      }

      // Framework filter
      if (
        filters.filterBy.framework.length > 0 &&
        !filters.filterBy.framework.includes(model.framework)
      ) {
        return false;
      }

      // Status filter
      if (
        filters.filterBy.status.length > 0 &&
        !filters.filterBy.status.includes(model.status)
      ) {
        return false;
      }

      return true;
    });

    // Sort models based on the provided sort option
    filteredModels.sort((a, b) => {
      switch (filters.sortBy) {
        case 'popularity':
          return b.usage_count - a.usage_count;
        case 'recent':
          return new Date(b.last_updated).getTime() - new Date(a.last_updated).getTime();
        case 'name':
          return a.name.localeCompare(b.name);
        case 'performance':
          return (b.metrics.fid_score ?? 0) - (a.metrics.fid_score ?? 0);
        default:
          return 0;
      }
    });

    return NextResponse.json(filteredModels);
  } catch (error) {
    console.error('Error fetching models:', error);
    return NextResponse.json(
      { error: 'Failed to fetch models' },
      { status: 500 }
    );
  }
} 