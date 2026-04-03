import { Skeleton } from "@/components/ui/skeleton";

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Skeleton for the quiz title. */
const TitleSkeleton = () => <Skeleton className="h-7 w-48" />;

/** Skeleton for a question and its options. */
const QuestionSkeleton = () => (
  <div className="mx-auto max-w-2xl space-y-6 rounded-xl p-6 ring-1 ring-foreground/10">
    <div className="flex items-center justify-between">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-4 w-16" />
    </div>
    <Skeleton className="h-6 w-full" />
    <div className="space-y-3">
      <Skeleton className="h-12 w-full rounded-lg" />
      <Skeleton className="h-12 w-full rounded-lg" />
      <Skeleton className="h-12 w-full rounded-lg" />
      <Skeleton className="h-12 w-full rounded-lg" />
    </div>
    <div className="flex items-center justify-between pt-4">
      <Skeleton className="h-8 w-24" />
      <Skeleton className="h-8 w-20" />
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// Loading
// ---------------------------------------------------------------------------

/**
 * Skeleton loading state for the quiz detail page.
 * Mimics the quiz player layout with placeholder elements.
 */
const QuizDetailLoading = () => (
  <div className="space-y-6">
    <TitleSkeleton />
    <QuestionSkeleton />
  </div>
);

export default QuizDetailLoading;
