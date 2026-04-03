"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NoteEditor } from "@/components/notes/note-editor";
import { SUBJECTS } from "@/lib/constants";
import { createNote, updateNote } from "@/actions/notes";

interface NoteFormProps {
  /** Existing note data for edit mode. Omit for create mode. */
  initialData?: {
    _id: string;
    title: string;
    content: string;
    subject: string;
    tags: string[];
  };
}

/** Native select dropdown for choosing a subject. */
const SubjectSelect = ({
  value,
  onValueChange,
}: {
  value: string;
  onValueChange: ({ subject }: { subject: string }) => void;
}) => (
  <div className="space-y-2">
    <Label htmlFor="subject">Subject</Label>
    <select
      id="subject"
      value={value}
      onChange={(e) => onValueChange({ subject: e.target.value })}
      className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <option value="" className="bg-background text-foreground">Select a subject</option>
      {SUBJECTS.map((s) => (
        <option key={s} value={s} className="bg-background text-foreground">
          {s}
        </option>
      ))}
    </select>
  </div>
);

/** Input for comma-separated tags. */
const TagsInput = ({
  value,
  onValueChange,
}: {
  value: string;
  onValueChange: ({ tags }: { tags: string }) => void;
}) => (
  <div className="space-y-2">
    <Label htmlFor="tags">Tags (comma-separated)</Label>
    <Input
      id="tags"
      placeholder="e.g. calculus, derivatives, limits"
      value={value}
      onChange={(e) => onValueChange({ tags: e.target.value })}
    />
  </div>
);

/** Submits the note to the appropriate server action. */
const submitNote = async ({ isEditMode, initialData, formData }: {
  isEditMode: boolean;
  initialData?: { _id: string };
  formData: { title: string; content: string; subject: string; tags: string[] };
}) => {
  if (isEditMode) return updateNote({ id: initialData!._id, formData });
  return createNote({ formData });
};

/** Extracts a human-readable error message from a server action result. */
const getErrorMessage = ({ error }: { error: unknown }): string => {
  if (typeof error === "string") return error;
  return "Validation failed. Please check your input.";
};

/** Extracts the noteId from a create result when present. */
const extractNoteId = ({ result }: { result: Record<string, unknown> }): string | null => {
  if ("noteId" in result) return result.noteId as string;
  return null;
};

/** Returns the submit button label based on mode. */
const getSubmitLabel = ({ isEditMode }: { isEditMode: boolean }) => {
  if (isEditMode) return "Save Changes";
  return "Create Note";
};

/** Parses a comma-separated tags string into a trimmed array. */
const parseTagsString = ({ raw }: { raw: string }): string[] =>
  raw.split(",").map((t) => t.trim()).filter(Boolean);

/** Client-side form for creating or editing notes. Uses server actions for persistence. */
export const NoteForm = ({ initialData }: NoteFormProps) => {
  const router = useRouter();
  const isEditMode = Boolean(initialData);

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [subject, setSubject] = useState(initialData?.subject ?? "");
  const [tagsRaw, setTagsRaw] = useState(
    initialData?.tags.join(", ") ?? "",
  );
  const [content, setContent] = useState(initialData?.content ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleContentChange = useCallback(({ html }: { html: string }) => {
    setContent(html);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const tags = parseTagsString({ raw: tagsRaw });
    const formData = { title, content, subject, tags };

    const result = await submitNote({ isEditMode, initialData, formData });

    setIsSubmitting(false);

    if (!result.success) {
      const errorMessage = getErrorMessage({ error: result.error });
      setError(errorMessage);
      return;
    }

    if (isEditMode) {
      router.refresh();
      return;
    }

    const noteId = extractNoteId({ result });
    if (noteId) {
      router.push(`/notes/${noteId}`);
      return;
    }

    router.push("/notes");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          placeholder="Note title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={200}
        />
      </div>

      <SubjectSelect
        value={subject}
        onValueChange={({ subject: s }) => setSubject(s)}
      />

      <TagsInput
        value={tagsRaw}
        onValueChange={({ tags }) => setTagsRaw(tags)}
      />

      <div className="space-y-2">
        <Label>Content</Label>
        <NoteEditor
          initialContent={initialData?.content}
          onChange={handleContentChange}
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
          {getSubmitLabel({ isEditMode })}
        </Button>
      </div>
    </form>
  );
};
