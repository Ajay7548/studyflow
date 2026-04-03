"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NoteForm } from "@/components/notes/note-form";
import { AiSidebar } from "@/components/ai/ai-sidebar";
import { deleteNote } from "@/actions/notes";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SerializedNote {
  _id: string;
  title: string;
  content: string;
  contentPlainText: string;
  subject: string;
  tags: string[];
  flashcardCount: number;
  quizCount: number;
  createdAt: string;
  updatedAt: string;
}

interface NoteDetailClientProps {
  note: SerializedNote;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Header showing back link, subject badge, and tag badges. */
const NoteHeader = ({ note }: { note: SerializedNote }) => (
  <div className="space-y-3">
    <Link
      href="/notes"
      className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft className="size-4" />
      Back to Notes
    </Link>
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant="secondary">{note.subject}</Badge>
      {note.tags.map((tag) => (
        <Badge key={tag} variant="outline">
          {tag}
        </Badge>
      ))}
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// Delete button
// ---------------------------------------------------------------------------

/** Button that confirms and executes note deletion. */
const DeleteNoteButton = ({ noteId }: { noteId: string }) => {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = useCallback(async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this note? Related flashcards and quizzes will also be deleted.",
    );
    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    const result = await deleteNote({ id: noteId });
    setIsDeleting(false);

    if (result.success) {
      router.push("/notes");
      return;
    }

    alert(result.error ?? "Failed to delete note");
  }, [noteId, router]);

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={handleDelete}
      disabled={isDeleting}
    >
      {isDeleting && <Loader2 className="mr-2 size-4 animate-spin" />}
      <Trash2 className="mr-1 size-4" />
      Delete
    </Button>
  );
};

// ---------------------------------------------------------------------------
// NoteDetailClient
// ---------------------------------------------------------------------------

/**
 * Client wrapper for the note detail page. Renders the edit form
 * in a two-column layout with an AI sidebar placeholder and a delete button.
 */
export const NoteDetailClient = ({ note }: NoteDetailClientProps) => (
  <div className="space-y-6">
    <NoteHeader note={note} />

    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold tracking-tight">Edit Note</h1>
      <DeleteNoteButton noteId={note._id} />
    </div>

    <NoteForm
      initialData={{
        _id: note._id,
        title: note.title,
        content: note.content,
        subject: note.subject,
        tags: note.tags,
      }}
    />

    <div className="pt-4">
      <AiSidebar noteId={note._id} />
    </div>
  </div>
);
