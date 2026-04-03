import type { Metadata } from "next";
import { Suspense } from "react";
import type { SortOrder } from "mongoose";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Note } from "@/models/note";
import { noteSearchSchema } from "@/lib/validations/note";
import { NoteList } from "@/components/notes/note-list";
import { NoteSearch } from "@/components/notes/note-search";
import { NotesPagination } from "@/components/notes/notes-pagination";
import { redirect } from "next/navigation";

/** @see https://nextjs.org/docs/app/api-reference/functions/generate-metadata */
export const metadata: Metadata = {
  title: "Notes | StudyFlow",
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface NotesPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface FetchUserNotesParams {
  userId: string;
  search?: string;
  subject?: string;
  page: number;
  limit: number;
}

/** Returns the sort order based on whether a text search is active. */
const getSortOrder = ({ isSearch }: { isSearch: boolean }): Record<string, SortOrder | { $meta: string }> => {
  if (isSearch) return { score: { $meta: "textScore" } };
  return { createdAt: -1 };
};

/** Extracts validated search params with defaults. */
const extractSearchParams = ({ parsed }: { parsed: { success: boolean; data?: { search?: string; subject?: string; page: number; limit: number } } }) => {
  if (!parsed.success) return { search: undefined, subject: undefined, page: 1, limit: 12 };
  return {
    search: parsed.data!.search,
    subject: parsed.data!.subject,
    page: parsed.data!.page,
    limit: parsed.data!.limit,
  };
};

/** Returns the correct singular or plural form based on count. */
const pluralize = ({ count, singular, plural }: { count: number; singular: string; plural: string }) => {
  if (count === 1) return singular;
  return plural;
};

/** Fetches paginated notes directly from MongoDB for the server component. */
const fetchUserNotes = async ({
  userId,
  search,
  subject,
  page,
  limit,
}: FetchUserNotesParams) => {
  await connectDB();

  const query: Record<string, unknown> = { userId };

  if (subject) {
    query.subject = subject;
  }
  if (search) {
    query.$text = { $search: search };
  }

  const skip = (page - 1) * limit;

  const sort: Record<string, SortOrder | { $meta: string }> = getSortOrder({ isSearch: Boolean(search) });

  const [notes, total] = await Promise.all([
    Note.find(query).sort(sort).skip(skip).limit(limit).lean(),
    Note.countDocuments(query),
  ]);

  return { notes, total, totalPages: Math.ceil(total / limit) };
};

/** Serializes MongoDB documents for client component consumption. */
const serializeNotes = ({
  notes,
}: {
  notes: Array<Record<string, unknown>>;
}) =>
  notes.map((n) => ({
    _id: String(n._id),
    title: String(n.title),
    subject: String(n.subject),
    tags: (n.tags as string[]) ?? [],
    contentPlainText: String(n.contentPlainText ?? ""),
    flashcardCount: Number(n.flashcardCount ?? 0),
    quizCount: Number(n.quizCount ?? 0),
    createdAt: String(n.createdAt),
  }));

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

/**
 * Notes listing page. Server component that fetches notes directly
 * from MongoDB, supports text search and subject filtering via
 * URL search params (Next.js 16 async searchParams).
 */
const NotesPage = async ({ searchParams }: NotesPageProps) => {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/signin");
  }

  const resolvedParams = await searchParams;

  const rawParams: Record<string, unknown> = {};
  if (typeof resolvedParams.search === "string") {
    rawParams.search = resolvedParams.search;
  }
  if (typeof resolvedParams.subject === "string") {
    rawParams.subject = resolvedParams.subject;
  }
  if (typeof resolvedParams.page === "string") {
    rawParams.page = resolvedParams.page;
  }

  const parsed = noteSearchSchema.safeParse(rawParams);
  const { search, subject, page, limit } = extractSearchParams({ parsed });

  const { notes, total, totalPages } = await fetchUserNotes({
    userId: session.user.id,
    search,
    subject,
    page,
    limit,
  });

  const serialized = serializeNotes({ notes });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notes</h1>
          <p className="text-sm text-muted-foreground">
            {total} {pluralize({ count: total, singular: "note", plural: "notes" })} total
          </p>
        </div>
      </div>

      <Suspense fallback={null}>
        <NoteSearch />
      </Suspense>

      <NoteList notes={serialized} />

      <NotesPagination page={page} totalPages={totalPages} />
    </div>
  );
};

export default NotesPage;
