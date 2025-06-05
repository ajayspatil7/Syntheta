import { ReactNode } from 'react';

interface ModelsLayoutProps {
  children: ReactNode;
}

export default function ModelsLayout({ children }: ModelsLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto h-16 flex items-center">
          <h1 className="text-xl font-semibold">Syntheta</h1>
        </div>
      </div>
      <main className="relative">
        {children}
      </main>
    </div>
  );
} 