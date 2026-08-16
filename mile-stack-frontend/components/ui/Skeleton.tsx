export function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-muted ${className ?? ""}`} />;
}

/** Skeleton for a listing card (projects page & client dashboard) */
export function ListingCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-4 shadow-sm">
      {/* title + badge */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2 flex-1">
          <Skeleton className="h-5 w-3/4 rounded-md" />
          <Skeleton className="h-3.5 w-1/2 rounded-md" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full shrink-0" />
      </div>
      {/* meta row */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-4 w-20 rounded-md" />
        <Skeleton className="h-4 w-24 rounded-md" />
        <Skeleton className="h-4 w-20 rounded-md" />
      </div>
      {/* footer */}
      <div className="border-t border-border pt-4 flex items-center justify-between">
        <Skeleton className="h-4 w-24 rounded-md" />
        <Skeleton className="h-8 w-36 rounded-lg" />
      </div>
    </div>
  );
}
