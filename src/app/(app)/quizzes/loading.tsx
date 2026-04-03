import { Skeleton } from "@/components/ui/skeleton";

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Skeleton card mimicking the quiz card layout. */
const QuizCardSkeleton = () => (
  <div className="flex flex-col gap-4 rounded-xl p-4 ring-1 ring-foreground/10">
    <div className="flex items-start justify-between">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-5 w-20" />
    </div>
    <Skeleton className="h-4 w-32" />
    <Skeleton className="h-4 w-24" />
    <div className="flex items-center justify-between border-t pt-4">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-3 w-20" />
    </div>
  </div>
);

/** Skeleton header mimicking the page header. */
const HeaderSkeleton = () => (
  <div className="flex items-center justify-between">
    <div className="space-y-2">
      <Skeleton className="h-7 w-32" />
      <Skeleton className="h-4 w-64" />
    </div>
    <Skeleton className="h-8 w-40" />
  </div>
);

// ---------------------------------------------------------------------------
// Loading
// ---------------------------------------------------------------------------

/**
 * Skeleton loading state for the quizzes list page.
 * Shows placeholder cards in a responsive grid.
 */
const QuizzesLoading = () => (
  <div className="space-y-6">
    <HeaderSkeleton />
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <QuizCardSkeleton key={i} />
      ))}
    </div>
  </div>
);

export default QuizzesLoading;
