import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BookOpen, FileText, Repeat, Brain } from "lucide-react";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Note, Flashcard, Quiz, StudySession, User } from "@/models";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { QuickActions } from "@/components/dashboard/quick-actions";

/** @see https://nextjs.org/docs/app/api-reference/functions/generate-metadata */
export const metadata: Metadata = {
  title: "Dashboard | StudyFlow",
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DashboardStats {
  notesCount: number;
  cardsDue: number;
  quizzesCompleted: number;
  studyStreak: number;
}

interface SessionItem {
  _id: string;
  type: "review" | "quiz" | "note-reading";
  duration: number;
  cardsReviewed: number;
  score: number | null;
  date: string;
}

// ---------------------------------------------------------------------------
// Data fetching
// ---------------------------------------------------------------------------

/** Converts a value to a number, or null if the value is null/undefined. */
const toNullableNumber = ({ value }: { value: unknown }): number | null => {
  if (value == null) return null;
  return Number(value);
};

/** Fetches all dashboard stats in parallel for the given user. */
const fetchDashboardStats = async ({
  userId,
}: {
  userId: string;
}): Promise<DashboardStats> => {
  const now = new Date();

  const [notesCount, cardsDue, quizzesCompleted, user] = await Promise.all([
    Note.countDocuments({ userId }),
    Flashcard.countDocuments({ userId, nextReviewDate: { $lte: now } }),
    Quiz.countDocuments({ userId, status: "completed" }),
    User.findById(userId).select("streak").lean(),
  ]);

  const streak = (user as Record<string, unknown> | null)?.streak as
    | { current: number }
    | undefined;

  return {
    notesCount,
    cardsDue,
    quizzesCompleted,
    studyStreak: streak?.current ?? 0,
  };
};

/** Fetches the 5 most recent study sessions for the given user. */
const fetchRecentSessions = async ({
  userId,
}: {
  userId: string;
}): Promise<SessionItem[]> => {
  const docs = await StudySession.find({ userId })
    .sort({ date: -1 })
    .limit(5)
    .lean();

  return (docs as Array<Record<string, unknown>>).map((d) => ({
    _id: String(d._id),
    type: d.type as SessionItem["type"],
    duration: Number(d.duration),
    cardsReviewed: Number(d.cardsReviewed ?? 0),
    score: toNullableNumber({ value: d.score }),
    date: String(d.date),
  }));
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Welcome banner shown when the user has no data yet. */
const WelcomeBanner = () => (
  <div className="rounded-lg border bg-card p-6">
    <div className="flex items-start gap-4">
      <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
        <BookOpen className="size-6 text-primary" />
      </div>
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Welcome to StudyFlow!</h2>
        <p className="text-sm text-muted-foreground">
          Get started in three easy steps:
        </p>
        <ol className="list-inside list-decimal space-y-1 text-sm text-muted-foreground">
          <li>Create your first study note</li>
          <li>Generate flashcards from your notes with AI</li>
          <li>Review cards daily to build your streak</li>
        </ol>
      </div>
    </div>
  </div>
);

/** Determines if this is a new user with no content yet. */
const isNewUser = ({ stats }: { stats: DashboardStats }): boolean =>
  stats.notesCount === 0 &&
  stats.cardsDue === 0 &&
  stats.quizzesCompleted === 0;

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

/**
 * Dashboard page. Server component that fetches user stats and recent
 * study sessions from MongoDB, then renders stat cards, activity feed,
 * and quick action buttons.
 */
const DashboardPage = async () => {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/signin");
  }

  await connectDB();

  const [stats, recentSessions] = await Promise.all([
    fetchDashboardStats({ userId: session.user.id }),
    fetchRecentSessions({ userId: session.user.id }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {session.user.name ?? "there"}.
        </p>
      </div>

      {isNewUser({ stats }) && <WelcomeBanner />}

      <StatsCards
        notesCount={stats.notesCount}
        cardsDue={stats.cardsDue}
        quizzesCompleted={stats.quizzesCompleted}
        studyStreak={stats.studyStreak}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <RecentActivity sessions={recentSessions} />
        <QuickActions cardsDue={stats.cardsDue} />
      </div>
    </div>
  );
};

export default DashboardPage;
