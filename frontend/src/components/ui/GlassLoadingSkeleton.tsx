export function GlassLoadingSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`glass-shimmer rounded-lg ${className}`}>
      <div className="h-full w-full bg-white/30 animate-pulse"></div>
    </div>
  );
}

export function GlassCardSkeleton() {
  return (
    <div className="glass rounded-xl p-6 space-y-4">
      <GlassLoadingSkeleton className="h-40" />
      <GlassLoadingSkeleton className="h-6 w-3/4" />
      <GlassLoadingSkeleton className="h-4 w-1/2" />
      <div className="flex gap-2">
        <GlassLoadingSkeleton className="h-10 w-20" />
        <GlassLoadingSkeleton className="h-10 w-20" />
      </div>
    </div>
  );
}

export function GlassListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="glass rounded-xl overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <GlassLoadingSkeleton className="w-12 h-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <GlassLoadingSkeleton className="h-4 w-1/2" />
              <GlassLoadingSkeleton className="h-3 w-3/4" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
