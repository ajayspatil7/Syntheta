import { Handle, Position } from 'reactflow';
import React from 'react';
import { Database } from 'lucide-react';

function SourceNode({
  data,
  selected,
}: { 
  data: { label: string };
  selected?: boolean;
}) {
  return (
    <div className={`px-4 py-2 shadow-md rounded-md bg-syntheta-surface border-2 ${
      selected ? 'border-syntheta-primary shadow-lg' : 'border-syntheta-neutral'
    } text-syntheta-dark`}>
      <div className="flex items-center">
        {/* Icon */}
        <Database className="mr-2 h-5 w-5 text-syntheta-primary" />
        <div className="text-lg font-bold">{data.label}</div>
      </div>
      <Handle type="source" position={Position.Right} id="a" className="!bg-syntheta-primary" />
    </div>
  );
}

export default SourceNode; 