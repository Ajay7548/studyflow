"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Note } from "@/models/note";
import { Flashcard } from "@/models/flashcard";
import { Quiz } from "@/models/quiz";
import { createNoteSchema, updateNoteSchema } from "@/lib/validations/note";
import { stripHtmlTags } from "@/lib/sanitize";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface GetSessionUserIdResult {
  userId: string | null;
  error: string | null;
}

/** Extracts the authenticated user ID or returns an error message. */
const getSessionUserId = async (): Promise<GetSessionUserIdResult> => {
  const session = await auth();
  if (!session?.user?.id) {
    return { userId: null, error: "Unauthorized" };
  }
  return { userId: session.user.id, error: null };
};

// ---------------------------------------------------------------------------
// createNote
// ---------------------------------------------------------------------------

interface CreateNoteParams {
  formData: {
    title: string;
    content: string;
    subject: string;
    tags: string[];
  };
}

/** Creates a new note, validates input, strips HTML, and revalidates /notes. */
export const createNote = async ({ formData }: CreateNoteParams) => {
  const { userId, error } = await getSessionUserId();
  if (!userId) {
    return { success: false, error };
  }

  const contentPlainText = stripHtmlTags({ html: formData.content });
  const parsed = createNoteSchema.safeParse({
    ...formData,
    contentPlainText,
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().fieldErrors };
  }

  await connectDB();

  const note = await Note.create({
    ...parsed.data,
    contentPlainText,
    userId,
  });

  revalidatePath("/notes");

  return { success: true, noteId: note._id.toString() };
};

// ---------------------------------------------------------------------------
// updateNote
// ---------------------------------------------------------------------------

interface UpdateNoteParams {
  id: string;
  formData: {
    title?: string;
    content?: string;
    subject?: string;
    tags?: string[];
  };
}

/** Updates an existing note, re-strips plain text if content changed, and revalidates. */
export const updateNote = async ({ id, formData }: UpdateNoteParams) => {
  const { userId, error } = await getSessionUserId();
  if (!userId) {
    return { success: false, error };
  }

  const parsed = updateNoteSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().fieldErrors };
  }

  await connectDB();

  const note = await Note.findOne({ _id: id, userId });
  if (!note) {
    return { success: false, error: "Note not found" };
  }

  const updates: Record<string, unknown> = { ...parsed.data };

  if (parsed.data.content) {
    updates.contentPlainText = stripHtmlTags({ html: parsed.data.content });
  }

  await Note.findByIdAndUpdate(id, updates);

  revalidatePath("/notes");
  revalidatePath(`/notes/${id}`);

  return { success: true };
};

// ---------------------------------------------------------------------------
// deleteNote
// ---------------------------------------------------------------------------

interface DeleteNoteParams {
  id: string;
}

/** Deletes a note with cascade removal of related flashcards and quizzes. */
export const deleteNote = async ({ id }: DeleteNoteParams) => {
  const { userId, error } = await getSessionUserId();
  if (!userId) {
    return { success: false, error };
  }

  await connectDB();

  const note = await Note.findOne({ _id: id, userId });
  if (!note) {
    return { success: false, error: "Note not found" };
  }

  await Promise.all([
    Flashcard.deleteMany({ noteId: id }),
    Quiz.deleteMany({ noteId: id }),
    Note.findByIdAndDelete(id),
  ]);

  revalidatePath("/notes");

  return { success: true };
};
