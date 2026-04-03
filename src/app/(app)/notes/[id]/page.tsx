import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Note } from "@/models/note";
import { redirect, notFound } from "next/navigation";
import { NoteDetailClient } from "@/components/notes/note-detail-client";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface NoteDetailPageProps {
  params: Promise<{ id: string }>;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface FetchOwnedNoteParams {
  noteId: string;
  userId: string;
}

/** Fetches a single note verifying ownership. Returns null if not found. */
const fetchOwnedNote = async ({ noteId, userId }: FetchOwnedNoteParams) => {
  await connectDB();
  return Note.findOne({ _id: noteId, userId }).lean();
};

/** Serializes a MongoDB note document for client components. */
const serializeNote = ({ note }: { note: Record<string, unknown> }) => ({
  _id: String(note._id),
  title: String(note.title),
  content: String(note.content),
  contentPlainText: String(note.contentPlainText ?? ""),
  subject: String(note.subject),
  tags: (note.tags as string[]) ?? [],
  flashcardCount: Number(note.flashcardCount ?? 0),
  quizCount: Number(note.quizCount ?? 0),
  createdAt: String(note.createdAt),
  updatedAt: String(note.updatedAt),
});

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

/**
 * Note detail and edit page. Awaits params (Next.js 16 async params),
 * fetches the note from MongoDB, and renders the editor with an AI sidebar.
 */
const NoteDetailPage = async ({ params }: NoteDetailPageProps) => {
  const { id } = await params;

  const session = await auth();
  if (!session?.user?.id) {
    redirect("/signin");
  }

  const note = await fetchOwnedNote({ noteId: id, userId: session.user.id });
  if (!note) {
    notFound();
  }

  const serialized = serializeNote({ note: note as Record<string, unknown> });

  return (
    <div className="mx-auto max-w-5xl">
      <NoteDetailClient note={serialized} />
    </div>
  );
};

export default NoteDetailPage;
