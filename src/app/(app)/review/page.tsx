import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Flashcard } from "@/models";
import { ReviewSession } from "@/components/flashcards/review-session";

/** @see https://nextjs.org/docs/app/api-reference/functions/generate-metadata */
export const metadata: Metadata = {
  title: "Review | StudyFlow",
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ReviewPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

// ---------------------------------------------------------------------------
// Data fetching
// ---------------------------------------------------------------------------

/** Returns the correct singular or plural form based on count. */
const pluralize = ({ count, singular, plural }: { count: number; singular: string; plural: string }) => {
  if (count === 1) return singular;
  return plural;
};

/** Extracts a string param or returns null if not a string. */
const extractStringParam = ({ value }: { value: string | string[] | undefined }): string | null => {
  if (typeof value === "string") return value;
  return null;
};

/** Fetches flashcards due for review, optionally filtered by noteId. */
const fetchDueFlashcards = async ({
  userId,
  noteId,
}: {
  userId: string;
  noteId: string | null;
}) => {
  await connectDB();

  const filter: Record<string, unknown> = {
    userId,
    nextReviewDate: { $lte: new Date() },
  };

  if (noteId) {
    filter.noteId = noteId;
  }

  const cards = await Flashcard.find(filter)
    .sort({ nextReviewDate: 1 })
    .lean();

  return cards;
};

/** Serializes MongoDB documents for client component consumption. */
const serializeCards = ({ cards }: { cards: Array<Record<string, unknown>> }) =>
  cards.map((card) => ({
    _id: String(card._id),
    front: String(card.front),
    back: String(card.back),
    repetitions: Number(card.repetitions ?? 0),
    interval: Number(card.interval ?? 0),
    difficulty: Number(card.difficulty ?? 2.5),
  }));

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Empty state displayed when no cards are due for review. */
const EmptyState = () => (
  <div className="flex flex-col items-center justify-center gap-4 py-16">
    <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-3xl">
      &#10003;
    </div>
    <h2 className="text-xl font-semibold">No cards due for review!</h2>
    <p className="text-sm text-muted-foreground">
      All caught up. Check back later or create more flashcards.
    </p>
  </div>
);

/** Page heading with the count of due cards. */
const ReviewHeader = ({ count }: { count: number }) => (
  <div>
    <h1 className="text-2xl font-bold tracking-tight">Review Flashcards</h1>
    <p className="text-sm text-muted-foreground">
      {count} {pluralize({ count, singular: "card", plural: "cards" })} due for review
    </p>
  </div>
);

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

/**
 * Server component for the flashcard review page.
 *
 * Awaits async searchParams (Next.js 16) for an optional noteId filter,
 * fetches due flashcards from MongoDB, and renders either an empty state
 * or the client-side ReviewSession component.
 */
const ReviewPage = async ({ searchParams }: ReviewPageProps) => {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/signin");
  }

  const resolvedParams = await searchParams;
  const noteId = extractStringParam({ value: resolvedParams.noteId });

  const rawCards = await fetchDueFlashcards({ userId: session.user.id, noteId });
  const cards = serializeCards({ cards: rawCards });

  if (cards.length === 0) {
    return (
      <div className="space-y-8">
        <ReviewHeader count={0} />
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <ReviewHeader count={cards.length} />
      <ReviewSession cards={cards} />
    </div>
  );
};

export default ReviewPage;
