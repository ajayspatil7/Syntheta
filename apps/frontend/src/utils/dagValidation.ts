import { Node, Edge } from 'reactflow';
import { NodeValidationRules } from '@/types/dag';

export interface ValidationError {
  type: 'connection' | 'configuration' | 'group';
  message: string;
  nodeId?: string;
  edgeId?: string;
}

export function validateConnection(
  sourceNode: Node,
  targetNode: Node,
  edges: Edge[],
): ValidationError | null {
  const sourceType = sourceNode.type as keyof typeof NodeValidationRules;
  const targetType = targetNode.type as keyof typeof NodeValidationRules;

  // Check if source node type exists in validation rules
  if (!NodeValidationRules[sourceType]) {
    return {
      type: 'connection',
      message: `Invalid source node type: ${sourceType}`,
      nodeId: sourceNode.id,
    };
  }

  // Check if target node type exists in validation rules
  if (!NodeValidationRules[targetType]) {
    return {
      type: 'connection',
      message: `Invalid target node type: ${targetType}`,
      nodeId: targetNode.id,
    };
  }

  const sourceRules = NodeValidationRules[sourceType];
  const targetRules = NodeValidationRules[targetType];

  // Check if target is allowed for source
  if (!sourceRules.allowedTargets.includes(targetType)) {
    return {
      type: 'connection',
      message: `Cannot connect ${sourceType} to ${targetType}`,
      nodeId: sourceNode.id,
    };
  }

  // Check if source is allowed for target
  if (!targetRules.allowedSources.includes(sourceType)) {
    return {
      type: 'connection',
      message: `Cannot connect ${sourceType} to ${targetType}`,
      nodeId: targetNode.id,
    };
  }

  // Check max outputs for source
  const sourceOutputs = edges.filter(edge => edge.source === sourceNode.id);
  if (sourceOutputs.length >= sourceRules.maxOutputs) {
    return {
      type: 'connection',
      message: `Maximum outputs (${sourceRules.maxOutputs}) reached for ${sourceType} node`,
      nodeId: sourceNode.id,
    };
  }

  // Check max inputs for target
  const targetInputs = edges.filter(edge => edge.target === targetNode.id);
  if (targetInputs.length >= targetRules.maxInputs) {
    return {
      type: 'connection',
      message: `Maximum inputs (${targetRules.maxInputs}) reached for ${targetType} node`,
      nodeId: targetNode.id,
    };
  }

  return null;
}

export function validateNodeConfiguration(
  node: Node,
  config: any,
): ValidationError | null {
  const nodeType = node.type as keyof typeof NodeValidationRules;
  
  if (!NodeValidationRules[nodeType]) {
    return {
      type: 'configuration',
      message: `Invalid node type: ${nodeType}`,
      nodeId: node.id,
    };
  }

  // Additional configuration validation can be added here
  // For now, we'll rely on the Zod schemas in the types file

  return null;
}

export function validateNodeGroup(
  nodes: Node[],
  groupNodes: string[],
): ValidationError | null {
  // Check if all nodes in the group exist
  const nonExistentNodes = groupNodes.filter(
    nodeId => !nodes.some(node => node.id === nodeId)
  );

  if (nonExistentNodes.length > 0) {
    return {
      type: 'group',
      message: `Nodes not found: ${nonExistentNodes.join(', ')}`,
    };
  }

  return null;
}

export function canConnectNodes(
  sourceNode: Node,
  targetNode: Node,
  edges: Edge[],
): boolean {
  return validateConnection(sourceNode, targetNode, edges) === null;
}

export function getNodeValidationErrors(
  node: Node,
  config: any,
): ValidationError[] {
  const errors: ValidationError[] = [];
  const configError = validateNodeConfiguration(node, config);
  if (configError) {
    errors.push(configError);
  }
  return errors;
} 