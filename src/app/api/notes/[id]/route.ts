import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Note } from "@/models/note";
import { Flashcard } from "@/models/flashcard";
import { Quiz } from "@/models/quiz";
import { updateNoteSchema } from "@/lib/validations/note";
import { stripHtmlTags } from "@/lib/sanitize";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type RouteContext = { params: Promise<{ id: string }> };

interface FindOwnedNoteParams {
  noteId: string;
  userId: string;
}

/** Finds a note only if it belongs to the given user. */
const findOwnedNote = async ({ noteId, userId }: FindOwnedNoteParams) => {
  await connectDB();
  return Note.findOne({ _id: noteId, userId });
};

// ---------------------------------------------------------------------------
// GET /api/notes/[id]
// ---------------------------------------------------------------------------

/** Returns a single note by ID, verifying ownership. */
export const GET = async (_request: NextRequest, { params }: RouteContext) => {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const note = await findOwnedNote({ noteId: id, userId: session.user.id });
    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    return NextResponse.json(note);
  } catch (error) {
    console.error("[GET /api/notes/[id]]", error);
    return NextResponse.json(
      { error: "Failed to fetch note" },
      { status: 500 },
    );
  }
};

// ---------------------------------------------------------------------------
// PUT /api/notes/[id]
// ---------------------------------------------------------------------------

/** Updates an existing note, re-stripping plain text when content changes. */
export const PUT = async (request: NextRequest, { params }: RouteContext) => {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const note = await findOwnedNote({ noteId: id, userId: session.user.id });
    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = updateNoteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const updates: Record<string, unknown> = { ...parsed.data };

    if (parsed.data.content) {
      updates.contentPlainText = stripHtmlTags({ html: parsed.data.content });
    }

    const updated = await Note.findByIdAndUpdate(id, updates, { new: true });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PUT /api/notes/[id]]", error);
    return NextResponse.json(
      { error: "Failed to update note" },
      { status: 500 },
    );
  }
};

// ---------------------------------------------------------------------------
// DELETE /api/notes/[id]
// ---------------------------------------------------------------------------

/** Deletes a note and cascades to related flashcards and quizzes. */
export const DELETE = async (
  _request: NextRequest,
  { params }: RouteContext,
) => {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const note = await findOwnedNote({ noteId: id, userId: session.user.id });
    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    await Promise.all([
      Flashcard.deleteMany({ noteId: id }),
      Quiz.deleteMany({ noteId: id }),
      Note.findByIdAndDelete(id),
    ]);

    return NextResponse.json({ message: "Note deleted" });
  } catch (error) {
    console.error("[DELETE /api/notes/[id]]", error);
    return NextResponse.json(
      { error: "Failed to delete note" },
      { status: 500 },
    );
  }
};
