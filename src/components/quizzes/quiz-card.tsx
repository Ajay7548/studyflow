import Link from "next/link";
import { Clock, HelpCircle, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface QuizCardProps {
  /** Serialized quiz object from MongoDB. */
  quiz: {
    _id: string;
    title: string;
    noteTitle: string;
    status: "pending" | "completed";
    score: number | null;
    totalQuestions: number;
    correctAnswers: number;
    createdAt: string;
  };
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Renders a colored status badge for the quiz. */
const StatusBadge = ({ status }: { status: "pending" | "completed" }) => {
  if (status === "completed") {
    return <Badge variant="default">Completed</Badge>;
  }
  return <Badge variant="secondary">Pending</Badge>;
};

/** Shows the score as a fraction and percentage for completed quizzes. */
const ScoreDisplay = ({
  score,
  correctAnswers,
  totalQuestions,
}: {
  score: number | null;
  correctAnswers: number;
  totalQuestions: number;
}) => {
  if (score === null) {
    return (
      <span className="text-sm text-muted-foreground">Not attempted</span>
    );
  }

  return (
    <span className="text-sm font-medium">
      {correctAnswers}/{totalQuestions} — {Math.round(score)}%
    </span>
  );
};

/** Formats a date string to a readable locale date. */
const FormattedDate = ({ dateString }: { dateString: string }) => {
  const date = new Date(dateString);
  const formatted = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <span className="flex items-center gap-1 text-xs text-muted-foreground">
      <Clock className="size-3" />
      {formatted}
    </span>
  );
};

/** Shows the question count with an icon. */
const QuestionCount = ({ count }: { count: number }) => (
  <span className="flex items-center gap-1 text-xs text-muted-foreground">
    <HelpCircle className="size-3" />
    {count} questions
  </span>
);

// ---------------------------------------------------------------------------
// QuizCard
// ---------------------------------------------------------------------------

/**
 * Card component previewing a quiz: title, note name, status badge,
 * score, question count, and date. Links to the quiz detail page.
 */
export const QuizCard = ({ quiz }: QuizCardProps) => (
  <Link href={`/quizzes/${quiz._id}`} className="group">
    <Card className="h-full transition-shadow group-hover:shadow-md">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="line-clamp-1">{quiz.title}</CardTitle>
          <StatusBadge status={quiz.status} />
        </div>
        <CardDescription className="line-clamp-1">
          From: {quiz.noteTitle}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="size-4 text-muted-foreground" />
          <ScoreDisplay
            score={quiz.score}
            correctAnswers={quiz.correctAnswers}
            totalQuestions={quiz.totalQuestions}
          />
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <FormattedDate dateString={quiz.createdAt} />
        <QuestionCount count={quiz.totalQuestions} />
      </CardFooter>
    </Card>
  </Link>
);
