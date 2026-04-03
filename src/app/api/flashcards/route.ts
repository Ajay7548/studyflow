import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";
import { RATE_LIMIT, ITEMS_PER_PAGE } from "@/lib/constants";
import { createFlashcardsSchema } from "@/lib/validations/flashcard";
import { Flashcard, Note } from "@/models";

/** Parses pagination and filter params from the URL search params. */
const parseListParams = ({ searchParams }: { searchParams: URLSearchParams }) => {
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || ITEMS_PER_PAGE));
  const noteId = searchParams.get("noteId");
  const due = searchParams.get("due") === "true";
  return { page, limit, noteId, due };
};

/** Builds the Mongoose filter query for flashcard listing. */
const buildFilter = ({
  userId,
  noteId,
  due,
}: {
  userId: string;
  noteId: string | null;
  due: boolean;
}) => {
  const filter: Record<string, unknown> = { userId };

  if (noteId) {
    filter.noteId = noteId;
  }

  if (due) {
    filter.nextReviewDate = { $lte: new Date() };
  }

  return filter;
};

/**
 * GET /api/flashcards
 *
 * Lists flashcards for the authenticated user with optional filters
 * for noteId and due-for-review status. Supports pagination.
 */
export const GET = async (request: NextRequest) => {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const { page, limit, noteId, due } = parseListParams({
    searchParams: request.nextUrl.searchParams,
  });

  const filter = buildFilter({ userId: session.user.id, noteId, due });
  const skip = (page - 1) * limit;

  const [flashcards, total] = await Promise.all([
    Flashcard.find(filter)
      .sort({ nextReviewDate: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Flashcard.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limit);

  return NextResponse.json({
    success: true,
    data: flashcards,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  });
};

/** Validates the bulk-create request body against the flashcard schema. */
const parseCreateBody = async ({ request }: { request: Request }) => {
  const body = await request.json();
  const result = createFlashcardsSchema.safeParse(body);

  if (!result.success) {
    const firstError = result.error.issues[0]?.message ?? "Invalid input";
    return { data: null, error: firstError };
  }

  return { data: result.data, error: null };
};

/**
 * POST /api/flashcards
 *
 * Bulk-creates flashcards linked to a note. Sets SM-2 defaults
 * and increments the parent note's flashcardCount.
 */
export const POST = async (request: Request) => {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { allowed } = checkRateLimit({
    key: `flashcards:create:${session.user.id}`,
    limit: RATE_LIMIT.DEFAULT_MAX_REQUESTS,
    windowMs: RATE_LIMIT.DEFAULT_WINDOW_MS,
  });
  if (!allowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const { data, error: parseError } = await parseCreateBody({ request });
  if (parseError) {
    return NextResponse.json({ error: parseError }, { status: 400 });
  }

  await connectDB();

  const note = await Note.findOne({
    _id: data!.noteId,
    userId: session.user.id,
  });
  if (!note) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }

  const docs = data!.cards.map((card) => ({
    front: card.front,
    back: card.back,
    noteId: data!.noteId,
    userId: session.user.id,
    difficulty: 2.5,
    interval: 0,
    repetitions: 0,
    nextReviewDate: new Date(),
    lastReviewedAt: null,
  }));

  const created = await Flashcard.insertMany(docs);

  await Note.updateOne(
    { _id: data!.noteId },
    { $inc: { flashcardCount: created.length } }
  );

  return NextResponse.json(
    { success: true, data: created },
    { status: 201 }
  );
};
