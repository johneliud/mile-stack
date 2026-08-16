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

/** Skeleton for a project card (client & freelancer dashboards) */
export function ProjectCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-5 shadow-sm">
      {/* header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2 flex-1">
          <Skeleton className="h-5 w-2/3 rounded-md" />
          <Skeleton className="h-3.5 w-1/3 rounded-md" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full shrink-0" />
      </div>
      {/* progress bar */}
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between">
          <Skeleton className="h-3 w-32 rounded-md" />
          <Skeleton className="h-3 w-16 rounded-md" />
        </div>
        <Skeleton className="h-1.5 w-full rounded-full" />
      </div>
      {/* freelancer */}
      <Skeleton className="h-4 w-40 rounded-md" />
      {/* milestones */}
      <div className="border-t border-border pt-4 flex flex-col gap-2">
        <Skeleton className="h-3.5 w-20 rounded-md" />
        <Skeleton className="h-8 w-full rounded-md" />
        <Skeleton className="h-8 w-full rounded-md" />
        <Skeleton className="h-8 w-full rounded-md" />
      </div>
      {/* footer */}
      <div className="border-t border-border pt-4 flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <Skeleton className="h-3 w-16 rounded-md" />
          <Skeleton className="h-6 w-24 rounded-md" />
        </div>
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
    </div>
  );
}

/** Skeleton for a freelancer card (talent browse page) */
export function FreelancerCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-4 shadow-sm">
      {/* name + address */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-2 flex-1">
          <Skeleton className="h-5 w-1/2 rounded-md" />
          <Skeleton className="h-5 w-24 rounded-md" />
        </div>
        <Skeleton className="h-6 w-14 rounded-full shrink-0" />
      </div>
      {/* bio */}
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-3.5 w-full rounded-md" />
        <Skeleton className="h-3.5 w-4/5 rounded-md" />
      </div>
      {/* skills */}
      <div className="flex gap-1.5 flex-wrap">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-5 w-14 rounded-full" />
        <Skeleton className="h-5 w-18 rounded-full" />
      </div>
      {/* footer */}
      <div className="border-t border-border pt-4 flex items-center gap-3">
        <Skeleton className="h-4 w-14 rounded-md" />
        <Skeleton className="h-4 w-16 rounded-md" />
        <Skeleton className="h-4 w-20 rounded-md ml-auto" />
      </div>
    </div>
  );
}

/** Skeleton for the freelancer public profile page */
export function FreelancerProfileSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header card */}
      <div className="bg-card border border-border rounded-2xl shadow-sm p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-5">
        <Skeleton className="h-16 w-16 rounded-2xl shrink-0" />
        <div className="flex flex-col gap-3 flex-1">
          <Skeleton className="h-8 w-48 rounded-md" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-32 rounded-lg" />
            <Skeleton className="h-6 w-28 rounded-full" />
          </div>
        </div>
        <Skeleton className="h-9 w-32 rounded-lg shrink-0" />
      </div>

      {/* Body */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col gap-3">
            <Skeleton className="h-3.5 w-12 rounded-md" />
            <Skeleton className="h-4 w-full rounded-md" />
            <Skeleton className="h-4 w-full rounded-md" />
            <Skeleton className="h-4 w-3/4 rounded-md" />
          </div>
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col gap-3">
            <Skeleton className="h-3.5 w-12 rounded-md" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-14 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-6 w-18 rounded-full" />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col gap-3">
            <Skeleton className="h-3.5 w-20 rounded-md" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
              <div className="flex flex-col gap-1.5">
                <Skeleton className="h-6 w-8 rounded-md" />
                <Skeleton className="h-3.5 w-28 rounded-md" />
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col gap-2">
            <Skeleton className="h-3.5 w-10 rounded-md mb-1" />
            <Skeleton className="h-9 w-full rounded-lg" />
            <Skeleton className="h-9 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Skeleton for the listing detail page */
export function ListingDetailSkeleton() {
  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Main */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-9 w-2/3 rounded-md" />
          <Skeleton className="h-4 w-24 rounded-md" />
        </div>
        {/* Description card */}
        <div className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-3">
          <Skeleton className="h-3.5 w-20 rounded-md" />
          <Skeleton className="h-4 w-full rounded-md" />
          <Skeleton className="h-4 w-full rounded-md" />
          <Skeleton className="h-4 w-4/5 rounded-md" />
        </div>
        {/* Skills card */}
        <div className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-3">
          <Skeleton className="h-3.5 w-28 rounded-md" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-7 w-16 rounded-full" />
            <Skeleton className="h-7 w-20 rounded-full" />
            <Skeleton className="h-7 w-14 rounded-full" />
          </div>
        </div>
        {/* Milestones card */}
        <div className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-3">
          <Skeleton className="h-3.5 w-20 rounded-md" />
          <div className="divide-y divide-border">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between gap-4 py-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-6 w-6 rounded-full shrink-0" />
                  <Skeleton className="h-4 w-36 rounded-md" />
                </div>
                <Skeleton className="h-4 w-16 rounded-md" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="flex flex-col gap-4">
        <div className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-2">
          <Skeleton className="h-3.5 w-20 rounded-md" />
          <Skeleton className="h-9 w-28 rounded-md" />
          <Skeleton className="h-4 w-24 rounded-md" />
        </div>
        <div className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-4">
          <Skeleton className="h-5 w-32 rounded-md" />
          <Skeleton className="h-20 w-full rounded-lg" />
          <Skeleton className="h-9 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}

/** Skeleton for an application card */
export function ApplicationCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-4 w-28 rounded-md" />
          <Skeleton className="h-3.5 w-16 rounded-md" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full shrink-0" />
      </div>
      <div className="border-t border-border pt-4 flex flex-col gap-1.5">
        <Skeleton className="h-3.5 w-full rounded-md" />
        <Skeleton className="h-3.5 w-full rounded-md" />
        <Skeleton className="h-3.5 w-3/5 rounded-md" />
      </div>
    </div>
  );
}
