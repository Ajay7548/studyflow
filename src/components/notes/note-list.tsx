"use client";

import { FileText } from "lucide-react";
import { NoteCard } from "@/components/notes/note-card";
import { EmptyState } from "@/components/shared/empty-state";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SerializedNote {
  _id: string;
  title: string;
  subject: string;
  tags: string[];
  contentPlainText: string;
  flashcardCount: number;
  quizCount: number;
  createdAt: string;
}

interface NoteListProps {
  /** Array of serialized notes to display. */
  notes: SerializedNote[];
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Grid of note cards. */
const NoteGrid = ({ notes }: { notes: SerializedNote[] }) => (
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {notes.map((note) => (
      <NoteCard key={note._id} note={note} />
    ))}
  </div>
);

// ---------------------------------------------------------------------------
// NoteList
// ---------------------------------------------------------------------------

/**
 * Client component that renders a responsive grid of NoteCards.
 * Shows an empty state with a CTA when no notes exist.
 */
export const NoteList = ({ notes }: NoteListProps) => {
  if (notes.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No notes yet"
        description="Create your first note to start studying. Notes can be turned into flashcards and quizzes."
        action={{ label: "Create Note", href: "/notes/new" }}
      />
    );
  }

  return <NoteGrid notes={notes} />;
};
