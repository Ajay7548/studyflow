import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { StudySession, User } from "@/models";

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

const VALID_TYPES = new Set(["review", "quiz", "note-reading"]);

/** Validates the POST request body for creating a study session. */
const parseCreateBody = async ({ request }: { request: Request }) => {
  try {
    const body = await request.json();

    if (!body.type || !VALID_TYPES.has(body.type)) {
      return { data: null, error: "Invalid session type" };
    }
    if (typeof body.duration !== "number" || body.duration < 0) {
      return { data: null, error: "Duration must be a non-negative number" };
    }
    if (!body.date || isNaN(Date.parse(body.date))) {
      return { data: null, error: "Invalid date" };
    }

    return { data: body, error: null };
  } catch {
    return { data: null, error: "Invalid JSON body" };
  }
};

// ---------------------------------------------------------------------------
// Streak logic
// ---------------------------------------------------------------------------

/** Updates the user's study streak based on the session date. */
const updateUserStreak = async ({
  userId,
  sessionDate,
}: {
  userId: string;
  sessionDate: Date;
}) => {
  const user = await User.findById(userId);
  if (!user) return;

  const today = stripTime({ date: sessionDate });
  const lastStudy = parseLastStudyDate({ date: user.streak.lastStudyDate });

  const streakData = computeStreak({
    currentStreak: user.streak.current,
    longestStreak: user.streak.longest,
    today,
    lastStudyDate: lastStudy,
  });

  user.streak.current = streakData.current;
  user.streak.longest = streakData.longest;
  user.streak.lastStudyDate = sessionDate;

  await user.save();
};

/** Parses the last study date into a time-stripped Date, or null if absent. */
const parseLastStudyDate = ({ date }: { date: unknown }): Date | null => {
  if (!date) return null;
  return stripTime({ date: new Date(date as string) });
};

/** Strips time from a date, returning midnight UTC. */
const stripTime = ({ date }: { date: Date }) =>
  new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));

/** Computes the updated streak values. */
const computeStreak = ({
  currentStreak,
  longestStreak,
  today,
  lastStudyDate,
}: {
  currentStreak: number;
  longestStreak: number;
  today: Date;
  lastStudyDate: Date | null;
}) => {
  if (!lastStudyDate) {
    return { current: 1, longest: Math.max(longestStreak, 1) };
  }

  const diffDays = Math.floor(
    (today.getTime() - lastStudyDate.getTime()) / 86_400_000,
  );

  if (diffDays === 0) {
    return { current: currentStreak, longest: longestStreak };
  }

  if (diffDays === 1) {
    const newCurrent = currentStreak + 1;
    return { current: newCurrent, longest: Math.max(longestStreak, newCurrent) };
  }

  return { current: 1, longest: Math.max(longestStreak, 1) };
};

// ---------------------------------------------------------------------------
// GET /api/study-sessions
// ---------------------------------------------------------------------------

/** Parses date range filters from URL search params. */
const parseDateRange = ({ searchParams }: { searchParams: URLSearchParams }) => {
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const filter: Record<string, unknown> = {};
  if (from) filter.$gte = new Date(from);
  if (to) filter.$lte = new Date(to);

  if (Object.keys(filter).length === 0) return null;
  return filter;
};

/**
 * GET /api/study-sessions
 *
 * Lists study sessions for the authenticated user.
 * Supports optional `from` and `to` date range query params.
 */
export const GET = async (request: NextRequest) => {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const query: Record<string, unknown> = { userId: session.user.id };
  const dateRange = parseDateRange({ searchParams: request.nextUrl.searchParams });

  if (dateRange) {
    query.date = dateRange;
  }

  const sessions = await StudySession.find(query)
    .sort({ date: -1 })
    .limit(50)
    .lean();

  return NextResponse.json({ success: true, data: sessions });
};

// ---------------------------------------------------------------------------
// POST /api/study-sessions
// ---------------------------------------------------------------------------

/**
 * POST /api/study-sessions
 *
 * Creates a study session record and updates the user's study streak.
 * Requires authentication.
 */
export const POST = async (request: Request) => {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error: parseError } = await parseCreateBody({ request });
  if (parseError) {
    return NextResponse.json({ error: parseError }, { status: 400 });
  }

  await connectDB();

  const studySession = await StudySession.create({
    userId: session.user.id,
    type: data!.type,
    duration: data!.duration,
    cardsReviewed: data!.cardsReviewed ?? 0,
    correctCards: data!.correctCards ?? 0,
    quizId: data!.quizId ?? null,
    score: data!.score ?? null,
    date: new Date(data!.date),
  });

  await updateUserStreak({
    userId: session.user.id,
    sessionDate: new Date(data!.date),
  });

  return NextResponse.json(
    { success: true, data: studySession },
    { status: 201 },
  );
};
