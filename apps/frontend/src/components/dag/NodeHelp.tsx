import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface HelpSection {
  id: string;
  title: string;
  content: React.ReactNode;
}

interface NodeHelpProps {
  sections: HelpSection[];
  className?: string;
}

export function NodeHelp({ sections, className }: NodeHelpProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Help & Documentation</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={sections[0]?.id} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            {sections.map((section) => (
              <TabsTrigger
                key={section.id}
                value={section.id}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {section.title}
              </TabsTrigger>
            ))}
          </TabsList>
          {sections.map((section) => (
            <TabsContent key={section.id} value={section.id}>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                {section.content}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
} 