import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface NodeDataPreviewProps {
  data: any[];
  columns: {
    key: string;
    label: string;
  }[];
  className?: string;
}

export function NodeDataPreview({ data, columns, className }: NodeDataPreviewProps) {
  return (
    <div className={cn("rounded-lg border", className)}>
      <ScrollArea className="h-[300px]">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key}>{column.label}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {columns.map((column) => (
                  <TableCell key={column.key}>
                    {typeof row[column.key] === 'object'
                      ? JSON.stringify(row[column.key])
                      : String(row[column.key] ?? '')}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
} 