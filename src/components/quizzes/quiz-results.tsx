"use client";

import Link from "next/link";
import { CheckCircle2, XCircle, ArrowLeft, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  userAnswer: number | null;
}

interface QuizResultsProps {
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  questions: QuizQuestion[];
  timeTakenSeconds: number | null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns a color class based on the score percentage. */
const getScoreColor = ({ score }: { score: number }): string => {
  if (score >= 80) return "text-green-600 dark:text-green-400";
  if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
  return "text-red-600 dark:text-red-400";
};

/** Returns a background class based on the score percentage. */
const getScoreBg = ({ score }: { score: number }): string => {
  if (score >= 80) return "bg-green-50 dark:bg-green-950/30";
  if (score >= 60) return "bg-yellow-50 dark:bg-yellow-950/30";
  return "bg-red-50 dark:bg-red-950/30";
};

/** Formats seconds into a human readable duration. */
const formatDuration = ({ seconds }: { seconds: number }): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
};

/** Formats the user's answer into a readable label. */
const getUserAnswerLabel = ({ question }: { question: QuizQuestion }): string => {
  if (question.userAnswer === null) return "No answer";
  return `${getOptionLabel({ index: question.userAnswer })}. ${question.options[question.userAnswer]}`;
};

/** Maps a numeric index to a letter label (A, B, C, D). */
const getOptionLabel = ({ index }: { index: number }): string =>
  String.fromCharCode(65 + index);

/** Returns the text color class for a correct or incorrect answer. */
const getAnswerColorClass = ({ isCorrect }: { isCorrect: boolean }): string => {
  if (isCorrect) return "text-green-600 dark:text-green-400";
  return "text-red-600 dark:text-red-400";
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Large score banner at the top of results. */
const ScoreBanner = ({
  score,
  correctAnswers,
  totalQuestions,
}: {
  score: number;
  correctAnswers: number;
  totalQuestions: number;
}) => (
  <div
    className={cn(
      "flex flex-col items-center gap-2 rounded-lg p-6",
      getScoreBg({ score })
    )}
  >
    <span className={cn("text-4xl font-bold", getScoreColor({ score }))}>
      {correctAnswers}/{totalQuestions}
    </span>
    <span className={cn("text-lg font-medium", getScoreColor({ score }))}>
      {Math.round(score)}%
    </span>
  </div>
);

/** Shows time taken for the quiz. */
const TimeTaken = ({ seconds }: { seconds: number | null }) => {
  if (seconds === null) return null;

  return (
    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
      <Clock className="size-4" />
      <span>Time taken: {formatDuration({ seconds })}</span>
    </div>
  );
};

/** Renders a single question result with correct/incorrect indicator. */
const QuestionResult = ({
  question,
  index,
}: {
  question: QuizQuestion;
  index: number;
}) => {
  const isCorrect = question.userAnswer === question.correctAnswer;
  const userLabel = getUserAnswerLabel({ question });
  const correctLabel = `${getOptionLabel({ index: question.correctAnswer })}. ${question.options[question.correctAnswer]}`;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start gap-3">
          {isCorrect && (
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-green-600 dark:text-green-400" />
          )}
          {!isCorrect && (
            <XCircle className="mt-0.5 size-5 shrink-0 text-red-600 dark:text-red-400" />
          )}
          <CardTitle className="text-sm font-medium leading-relaxed">
            {index + 1}. {question.question}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 pl-12 text-sm">
        <p>
          <span className="text-muted-foreground">Your answer: </span>
          <span className={getAnswerColorClass({ isCorrect })}>
            {userLabel}
          </span>
        </p>
        {!isCorrect && (
          <p>
            <span className="text-muted-foreground">Correct answer: </span>
            <span className="text-green-600 dark:text-green-400">
              {correctLabel}
            </span>
          </p>
        )}
        <p className="text-muted-foreground">{question.explanation}</p>
      </CardContent>
    </Card>
  );
};

// ---------------------------------------------------------------------------
// QuizResults
// ---------------------------------------------------------------------------

/**
 * Displays completed quiz results: score banner, time taken,
 * per-question breakdown with correct/incorrect indicators, and
 * a back navigation button.
 */
export const QuizResults = ({
  score,
  correctAnswers,
  totalQuestions,
  questions,
  timeTakenSeconds,
}: QuizResultsProps) => (
  <div className="mx-auto max-w-2xl space-y-6">
    <ScoreBanner
      score={score}
      correctAnswers={correctAnswers}
      totalQuestions={totalQuestions}
    />
    <TimeTaken seconds={timeTakenSeconds} />
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Question Breakdown</h2>
      {questions.map((q, i) => (
        <QuestionResult key={i} question={q} index={i} />
      ))}
    </div>
    <div className="flex justify-center pt-4">
      <Link href="/quizzes">
        <Button variant="outline">
          <ArrowLeft className="size-4" />
          Back to Quizzes
        </Button>
      </Link>
    </div>
  </div>
);
