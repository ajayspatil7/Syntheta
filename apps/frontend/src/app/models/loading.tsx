export default function Loading() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          <div className="h-10 w-40 bg-muted animate-pulse rounded" />
        </div>
        <div className="flex flex-col gap-4">
          <div className="h-10 w-full max-w-md bg-muted animate-pulse rounded" />
          <div className="h-10 w-full bg-muted animate-pulse rounded" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-[300px] bg-muted animate-pulse rounded-lg"
          />
        ))}
      </div>
    </div>
  );
} 