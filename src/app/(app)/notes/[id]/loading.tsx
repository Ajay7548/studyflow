import { Skeleton } from "@/components/ui/skeleton";

// ---------------------------------------------------------------------------
// Loading
// ---------------------------------------------------------------------------

/** Skeleton loading state for the note detail page. */
const NoteDetailLoading = () => (
  <div className="mx-auto max-w-5xl space-y-6">
    <div className="flex items-center justify-between">
      <Skeleton className="h-8 w-64" />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>

    <div className="flex gap-2">
      <Skeleton className="h-5 w-24" />
      <Skeleton className="h-5 w-16" />
      <Skeleton className="h-5 w-16" />
    </div>

    <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-[400px] w-full rounded-lg" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-32 w-full rounded-lg" />
      </div>
    </div>
  </div>
);

export default NoteDetailLoading;
