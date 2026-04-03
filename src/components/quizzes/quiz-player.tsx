"use client";

import { useRouter } from "next/navigation";
import { Timer, ChevronLeft, ChevronRight, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { QuestionDisplay } from "@/components/quizzes/question-display";
import { useQuizPlayer } from "@/hooks/use-quiz-player";

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

interface QuizPlayerProps {
  quizId: string;
  questions: QuizQuestion[];
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Shows the current timer with a clock icon. */
const TimerDisplay = ({ formattedTime }: { formattedTime: string }) => (
  <div className="flex items-center gap-2 text-sm text-muted-foreground">
    <Timer className="size-4" />
    <span className="tabular-nums">{formattedTime}</span>
  </div>
);

/** Shows "Question X of Y" progress text. */
const ProgressText = ({ current, total }: { current: number; total: number }) => (
  <span className="text-sm font-medium">
    Question {current} of {total}
  </span>
);

/** Returns the submit button label based on submitting state. */
const getSubmitLabel = ({ isSubmitting }: { isSubmitting: boolean }): string => {
  if (isSubmitting) return "Submitting...";
  return "Submit Quiz";
};

/** Shows how many questions have been answered. */
const AnsweredCount = ({ answered, total }: { answered: number; total: number }) => (
  <span className="text-xs text-muted-foreground">
    {answered}/{total} answered
  </span>
);

/** Determines whether the submit button should render. */
const shouldShowSubmit = ({
  current,
  total,
  answered,
}: {
  current: number;
  total: number;
  answered: number;
}) => current === total && answered === total;

// ---------------------------------------------------------------------------
// QuizPlayer
// ---------------------------------------------------------------------------

/**
 * Client component for taking a quiz. Shows one question at a time
 * with navigation, progress tracking, a timer, and a submit button.
 */
export const QuizPlayer = ({ quizId, questions }: QuizPlayerProps) => {
  const router = useRouter();
  const player = useQuizPlayer({ quizId, questions });
  const currentQuestion = player.getCurrentQuestion();
  const progress = player.getProgress();
  const selectedAnswer = player.getSelectedAnswer({
    questionIndex: player.currentQuestionIndex,
  });

  if (player.isComplete) {
    router.refresh();
    return null;
  }

  const showSubmit = shouldShowSubmit({
    current: progress.current,
    total: progress.total,
    answered: progress.answered,
  });

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="space-y-1">
          <ProgressText current={progress.current} total={progress.total} />
          <AnsweredCount answered={progress.answered} total={progress.total} />
        </div>
        <TimerDisplay formattedTime={player.timer.formattedTime} />
      </CardHeader>

      <CardContent>
        <QuestionDisplay
          question={currentQuestion.question}
          options={currentQuestion.options}
          selectedAnswer={selectedAnswer}
          onSelectAnswer={({ answerIndex }) =>
            player.selectAnswer({
              questionIndex: player.currentQuestionIndex,
              answerIndex,
            })
          }
        />
      </CardContent>

      <CardFooter className="flex items-center justify-between gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={player.currentQuestionIndex <= 0}
          onClick={player.goToPreviousQuestion}
        >
          <ChevronLeft className="size-4" />
          Previous
        </Button>

        <div className="flex gap-2">
          {showSubmit && (
            <Button
              size="sm"
              disabled={player.isSubmitting}
              onClick={player.submitQuiz}
            >
              <Send className="size-4" />
              {getSubmitLabel({ isSubmitting: player.isSubmitting })}
            </Button>
          )}
          {!showSubmit && (
            <Button
              variant="outline"
              size="sm"
              disabled={player.currentQuestionIndex >= questions.length - 1}
              onClick={player.goToNextQuestion}
            >
              Next
              <ChevronRight className="size-4" />
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};
