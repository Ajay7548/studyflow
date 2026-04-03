import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Brain, BookOpen } from "lucide-react";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Quiz, Note } from "@/models";
import { Button } from "@/components/ui/button";
import { QuizCard } from "@/components/quizzes/quiz-card";
import { EmptyState } from "@/components/shared/empty-state";

/** @see https://nextjs.org/docs/app/api-reference/functions/generate-metadata */
export const metadata: Metadata = {
  title: "Quizzes | StudyFlow",
};

// ---------------------------------------------------------------------------
// Data fetching
// ---------------------------------------------------------------------------

/** Fetches all quizzes for the authenticated user, most recent first. */
const fetchUserQuizzes = async ({ userId }: { userId: string }) => {
  await connectDB();

  const quizzes = await Quiz.find({ userId })
    .sort({ createdAt: -1 })
    .lean();

  const noteIds = [...new Set(quizzes.map((q) => q.noteId.toString()))];
  const notes = await Note.find({ _id: { $in: noteIds } })
    .select("title")
    .lean();

  const noteTitleMap = new Map(
    notes.map((n) => [n._id.toString(), n.title])
  );

  return quizzes.map((q) => ({
    _id: q._id.toString(),
    title: q.title,
    noteTitle: noteTitleMap.get(q.noteId.toString()) ?? "Deleted note",
    status: q.status as "pending" | "completed",
    score: q.score ?? null,
    totalQuestions: q.totalQuestions,
    correctAnswers: q.correctAnswers,
    createdAt: q.createdAt.toISOString(),
  }));
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Page header with title and a CTA linking to notes. */
const PageHeader = () => (
  <div className="flex items-center justify-between">
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Quizzes</h1>
      <p className="text-sm text-muted-foreground">
        Test your knowledge with AI-generated quizzes
      </p>
    </div>
    <Link href="/notes">
      <Button variant="outline">
        <BookOpen className="size-4" />
        Generate from Notes
      </Button>
    </Link>
  </div>
);

/** Grid of quiz cards. */
const QuizGrid = ({
  quizzes,
}: {
  quizzes: Awaited<ReturnType<typeof fetchUserQuizzes>>;
}) => (
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {quizzes.map((quiz) => (
      <QuizCard key={quiz._id} quiz={quiz} />
    ))}
  </div>
);

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

/**
 * Server component listing all quizzes for the authenticated user.
 * Shows quiz cards sorted by most recent, or an empty state if none exist.
 */
const QuizzesPage = async () => {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  const quizzes = await fetchUserQuizzes({ userId: session.user.id });

  return (
    <div className="space-y-6">
      <PageHeader />
      {quizzes.length === 0 && (
        <EmptyState
          icon={Brain}
          title="No quizzes yet"
          description="Generate a quiz from any of your notes to test your knowledge."
          action={{ label: "Go to Notes", href: "/notes" }}
        />
      )}
      {quizzes.length > 0 && <QuizGrid quizzes={quizzes} />}
    </div>
  );
};

export default QuizzesPage;
