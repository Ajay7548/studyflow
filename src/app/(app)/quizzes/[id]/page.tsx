import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Quiz } from "@/models";
import type { IQuizQuestion } from "@/types";
import { QuizPlayer } from "@/components/quizzes/quiz-player";
import { QuizResults } from "@/components/quizzes/quiz-results";

// ---------------------------------------------------------------------------
// Data fetching
// ---------------------------------------------------------------------------

/** Fetches a quiz by ID and verifies the user owns it. */
const fetchQuizForUser = async ({
  quizId,
  userId,
}: {
  quizId: string;
  userId: string;
}) => {
  await connectDB();

  const quiz = await Quiz.findById(quizId).lean();
  if (!quiz) return null;
  if (quiz.userId.toString() !== userId) return null;

  return {
    _id: quiz._id.toString(),
    title: quiz.title,
    status: quiz.status as "pending" | "completed",
    score: quiz.score ?? 0,
    totalQuestions: quiz.totalQuestions,
    correctAnswers: quiz.correctAnswers,
    timeTakenSeconds: quiz.timeTakenSeconds ?? null,
    questions: quiz.questions.map((q: IQuizQuestion) => ({
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      userAnswer: q.userAnswer ?? null,
    })),
  };
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Header showing the quiz title. */
const QuizHeader = ({ title }: { title: string }) => (
  <div>
    <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
  </div>
);

/** Renders the QuizPlayer for a pending quiz. */
const PendingQuizView = ({
  quiz,
}: {
  quiz: NonNullable<Awaited<ReturnType<typeof fetchQuizForUser>>>;
}) => <QuizPlayer quizId={quiz._id} questions={quiz.questions} />;

/** Renders the QuizResults for a completed quiz. */
const CompletedQuizView = ({
  quiz,
}: {
  quiz: NonNullable<Awaited<ReturnType<typeof fetchQuizForUser>>>;
}) => (
  <QuizResults
    score={quiz.score}
    correctAnswers={quiz.correctAnswers}
    totalQuestions={quiz.totalQuestions}
    questions={quiz.questions}
    timeTakenSeconds={quiz.timeTakenSeconds}
  />
);

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

/**
 * Server component for viewing a single quiz.
 * Shows QuizPlayer for pending quizzes, QuizResults for completed ones.
 * Validates ownership before rendering.
 */
const QuizDetailPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  const quiz = await fetchQuizForUser({
    quizId: id,
    userId: session.user.id,
  });
  if (!quiz) notFound();

  return (
    <div className="space-y-6">
      <QuizHeader title={quiz.title} />
      {quiz.status === "pending" && <PendingQuizView quiz={quiz} />}
      {quiz.status === "completed" && <CompletedQuizView quiz={quiz} />}
    </div>
  );
};

export default QuizDetailPage;
