import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";
import { RATE_LIMIT, ITEMS_PER_PAGE } from "@/lib/constants";
import { createQuizSchema } from "@/lib/validations/quiz";
import { Quiz, Note } from "@/models";

/** Parses pagination and filter params from the URL search params. */
const parseListParams = ({ searchParams }: { searchParams: URLSearchParams }) => {
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || ITEMS_PER_PAGE));
  const noteId = searchParams.get("noteId");
  const status = searchParams.get("status");
  return { page, limit, noteId, status };
};

/** Builds the Mongoose filter query for quiz listing. */
const buildFilter = ({
  userId,
  noteId,
  status,
}: {
  userId: string;
  noteId: string | null;
  status: string | null;
}) => {
  const filter: Record<string, unknown> = { userId };

  if (noteId) {
    filter.noteId = noteId;
  }

  if (status === "pending" || status === "completed") {
    filter.status = status;
  }

  return filter;
};

/**
 * GET /api/quizzes
 *
 * Lists quizzes for the authenticated user with optional filters
 * for noteId and status. Supports pagination.
 */
export const GET = async (request: NextRequest) => {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const { page, limit, noteId, status } = parseListParams({
    searchParams: request.nextUrl.searchParams,
  });

  const filter = buildFilter({ userId: session.user.id, noteId, status });
  const skip = (page - 1) * limit;

  const [quizzes, total] = await Promise.all([
    Quiz.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Quiz.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limit);

  return NextResponse.json({
    success: true,
    data: quizzes,
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

/** Validates the quiz creation request body. */
const parseCreateBody = async ({ request }: { request: Request }) => {
  const body = await request.json();
  const result = createQuizSchema.safeParse(body);

  if (!result.success) {
    const firstError = result.error.issues[0]?.message ?? "Invalid input";
    return { data: null, error: firstError };
  }

  return { data: result.data, error: null };
};

/**
 * POST /api/quizzes
 *
 * Creates a quiz linked to a note. Sets initial state as pending
 * and increments the parent note's quizCount.
 */
export const POST = async (request: Request) => {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { allowed } = checkRateLimit({
    key: `quizzes:create:${session.user.id}`,
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

  const questionsWithDefaults = data!.questions.map((q) => ({
    ...q,
    userAnswer: null,
  }));

  const quiz = await Quiz.create({
    title: data!.title,
    noteId: data!.noteId,
    userId: session.user.id,
    questions: questionsWithDefaults,
    totalQuestions: data!.questions.length,
    correctAnswers: 0,
    score: null,
    status: "pending",
    completedAt: null,
    timeTakenSeconds: null,
  });

  await Note.updateOne({ _id: data!.noteId }, { $inc: { quizCount: 1 } });

  return NextResponse.json({ success: true, data: quiz }, { status: 201 });
};
