import { NextResponse } from 'next/server';
import { ModelCard } from '@/types/model-library';

// In a real app, this would be stored in a database
let models: ModelCard[] = [];

export async function POST(request: Request) {
  try {
    const modelData = await request.json();

    // Validate required fields
    const requiredFields = [
      'name',
      'description',
      'category',
      'domain',
      'framework',
      'tags',
    ];

    for (const field of requiredFields) {
      if (!modelData[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Generate a unique ID
    const id = modelData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Create the new model
    const newModel: ModelCard = {
      id,
      name: modelData.name,
      description: modelData.description,
      category: modelData.category,
      domain: modelData.domain,
      framework: modelData.framework,
      metrics: modelData.metrics || {},
      usage_count: 0,
      last_updated: new Date().toISOString(),
      created_by: 'syntheta-team', // In a real app, this would be the authenticated user
      tags: modelData.tags,
      model_size: modelData.model_size || '0B',
      status: 'draft',
      is_public: modelData.is_public || false,
      is_featured: false,
    };

    // Add the model to our "database"
    models.push(newModel);

    return NextResponse.json(newModel, { status: 201 });
  } catch (error) {
    console.error('Error creating model:', error);
    return NextResponse.json(
      { error: 'Failed to create model' },
      { status: 500 }
    );
  }
} 