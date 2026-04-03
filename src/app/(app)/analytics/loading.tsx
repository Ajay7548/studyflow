import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Skeleton for a single summary stat block. */
const StatSkeleton = () => (
  <div className="space-y-2">
    <Skeleton className="h-4 w-24" />
    <Skeleton className="h-8 w-16" />
  </div>
);

/** Skeleton for a chart card. */
const ChartCardSkeleton = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-4 w-48" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-64 w-full" />
    </CardContent>
  </Card>
);

// ---------------------------------------------------------------------------
// Loading
// ---------------------------------------------------------------------------

/** Skeleton loading state for the analytics page. */
const AnalyticsLoading = () => (
  <div className="space-y-8">
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-56" />
      </div>
      <div className="flex gap-1">
        <Skeleton className="h-8 w-12 rounded-md" />
        <Skeleton className="h-8 w-12 rounded-md" />
        <Skeleton className="h-8 w-12 rounded-md" />
      </div>
    </div>

    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <StatSkeleton key={i} />
      ))}
    </div>

    <ChartCardSkeleton />

    <div className="grid gap-6 lg:grid-cols-2">
      <ChartCardSkeleton />
      <ChartCardSkeleton />
    </div>
  </div>
);

export default AnalyticsLoading;
