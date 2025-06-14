import { Package } from "lucide-react";

interface ComingSoonProps {
  featureName: string;
}

export default function ComingSoon({ featureName }: ComingSoonProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] rounded-xl bg-white/60 backdrop-blur-xl border border-white/20 p-8 text-center">
      <Package className="h-12 w-12 text-syntheta-dark/40 mb-4" />
      <h2 className="text-xl font-medium text-syntheta-dark mb-2">
        {featureName} - Coming Soon!
      </h2>
      <p className="text-sm text-syntheta-dark/60 max-w-md">
        We're actively working on bringing the {featureName} functionality to you.
        Stay tuned for exciting updates!
      </p>
    </div>
  );
} 