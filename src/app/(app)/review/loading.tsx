import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Skeleton for the progress bar area. */
const ProgressSkeleton = () => (
  <div className="flex flex-wrap items-center gap-3">
    <Skeleton className="h-4 w-16" />
    <Skeleton className="h-1 flex-1" />
    <Skeleton className="h-4 w-12" />
  </div>
);

/** Skeleton for the flashcard area. */
const CardSkeleton = () => (
  <div className="flex justify-center">
    <Card className="h-72 w-full max-w-xl">
      <CardContent className="flex h-full flex-col items-center justify-center gap-4 p-8">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-6 w-1/2" />
      </CardContent>
    </Card>
  </div>
);

/** Skeleton for the difficulty buttons. */
const ButtonsSkeleton = () => (
  <div className="flex justify-center">
    <div className="flex w-full max-w-xl gap-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-14 flex-1" />
      ))}
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// Loading
// ---------------------------------------------------------------------------

/** Skeleton loading state for the review page. */
const ReviewLoading = () => (
  <div className="space-y-8">
    <div>
      <Skeleton className="h-8 w-48" />
      <Skeleton className="mt-1 h-4 w-32" />
    </div>
    <ProgressSkeleton />
    <CardSkeleton />
    <ButtonsSkeleton />
  </div>
);

export default ReviewLoading;
