import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface NodePreviewProps {
  data: any;
  type: 'json' | 'text' | 'image' | 'table';
  className?: string;
}

export function NodePreview({ data, type, className }: NodePreviewProps) {
  const renderContent = () => {
    switch (type) {
      case 'json':
        return (
          <pre className="overflow-auto rounded-md bg-muted p-4 text-sm">
            {JSON.stringify(data, null, 2)}
          </pre>
        );
      case 'text':
        return (
          <div className="whitespace-pre-wrap rounded-md bg-muted p-4 text-sm">
            {data}
          </div>
        );
      case 'image':
        return (
          <div className="relative aspect-video overflow-hidden rounded-md">
            <img
              src={data}
              alt="Preview"
              className="h-full w-full object-cover"
            />
          </div>
        );
      case 'table':
        return (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b bg-muted">
                  {Object.keys(data[0] || {}).map((header) => (
                    <th
                      key={header}
                      className="px-4 py-2 text-left font-medium"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row: any, i: number) => (
                  <tr
                    key={i}
                    className="border-b hover:bg-muted/50"
                  >
                    {Object.values(row).map((cell: any, j: number) => (
                      <td key={j} className="px-4 py-2">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Card className={className}>
      <CardContent className="p-4">
        {renderContent()}
      </CardContent>
    </Card>
  );
} 