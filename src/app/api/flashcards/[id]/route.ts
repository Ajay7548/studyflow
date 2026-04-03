import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { updateFlashcardSchema } from "@/lib/validations/flashcard";
import { calculateNextReview } from "@/lib/spaced-repetition";
import { Flashcard, Note } from "@/models";

/** Validates the review-quality request body. */
const parseReviewBody = async ({ request }: { request: Request }) => {
  const body = await request.json();
  const result = updateFlashcardSchema.safeParse(body);

  if (!result.success) {
    const firstError = result.error.issues[0]?.message ?? "Invalid input";
    return { data: null, error: firstError };
  }

  return { data: result.data, error: null };
};

/**
 * PUT /api/flashcards/[id]
 *
 * Submits a review quality rating for a flashcard and updates its
 * SM-2 spaced repetition state (interval, easiness, next review date).
 */
export const PUT = async (
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const { data, error: parseError } = await parseReviewBody({ request });
  if (parseError) {
    return NextResponse.json({ error: parseError }, { status: 400 });
  }

  await connectDB();

  const flashcard = await Flashcard.findOne({
    _id: id,
    userId: session.user.id,
  });
  if (!flashcard) {
    return NextResponse.json(
      { error: "Flashcard not found" },
      { status: 404 }
    );
  }

  const nextReview = calculateNextReview({
    quality: data!.quality,
    repetitions: flashcard.repetitions,
    interval: flashcard.interval,
    easinessFactor: flashcard.difficulty,
  });

  flashcard.repetitions = nextReview.repetitions;
  flashcard.interval = nextReview.interval;
  flashcard.difficulty = nextReview.easinessFactor;
  flashcard.nextReviewDate = nextReview.nextReviewDate;
  flashcard.lastReviewedAt = new Date();

  await flashcard.save();

  return NextResponse.json({ success: true, data: flashcard });
};

/**
 * DELETE /api/flashcards/[id]
 *
 * Deletes a single flashcard and decrements its parent note's flashcardCount.
 */
export const DELETE = async (
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  await connectDB();

  const flashcard = await Flashcard.findOneAndDelete({
    _id: id,
    userId: session.user.id,
  });
  if (!flashcard) {
    return NextResponse.json(
      { error: "Flashcard not found" },
      { status: 404 }
    );
  }

  await Note.updateOne(
    { _id: flashcard.noteId },
    { $inc: { flashcardCount: -1 } }
  );

  return NextResponse.json({ success: true, message: "Flashcard deleted" });
};
