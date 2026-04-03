import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Single skeleton card matching the NoteCard layout. */
const NoteCardSkeleton = () => (
  <Card className="h-full">
    <CardHeader>
      <div className="flex items-start justify-between gap-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-5 w-16" />
      </div>
    </CardHeader>
    <CardContent className="space-y-3">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <div className="flex gap-1">
        <Skeleton className="h-5 w-14" />
        <Skeleton className="h-5 w-14" />
      </div>
    </CardContent>
    <CardFooter className="flex items-center justify-between">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-4 w-16" />
    </CardFooter>
  </Card>
);

// ---------------------------------------------------------------------------
// Loading
// ---------------------------------------------------------------------------

/** Skeleton loading state for the notes listing page. */
const NotesLoading = () => (
  <div className="space-y-6">
    <div>
      <Skeleton className="h-8 w-32" />
      <Skeleton className="mt-1 h-4 w-24" />
    </div>

    <div className="flex flex-col gap-3 sm:flex-row">
      <Skeleton className="h-8 flex-1" />
      <Skeleton className="h-8 w-48" />
    </div>

    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <NoteCardSkeleton key={i} />
      ))}
    </div>
  </div>
);

export default NotesLoading;
