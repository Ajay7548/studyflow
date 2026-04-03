"use client";

import { useReviewSession } from "@/hooks/use-review-session";
import { Flashcard } from "@/components/flashcards/flashcard";
import { DifficultyButtons } from "@/components/flashcards/difficulty-buttons";
import { SessionSummary } from "@/components/flashcards/session-summary";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SerializedFlashcard {
  _id: string;
  front: string;
  back: string;
  repetitions: number;
  interval: number;
  difficulty: number;
}

interface ReviewSessionProps {
  cards: SerializedFlashcard[];
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Visual progress bar with card count. */
const ReviewProgress = ({
  current,
  total,
  percentComplete,
}: {
  current: number;
  total: number;
  percentComplete: number;
}) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">
        Card <span className="font-bold text-foreground">{current}</span> of {total}
      </span>
      <span className="font-mono text-muted-foreground">{percentComplete}%</span>
    </div>
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
      <div
        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-500"
        style={{ width: `${percentComplete}%` }}
      />
    </div>
  </div>
);

/** Rating controls — only shown when card is flipped. */
const RatingSection = ({
  isFlipped,
  isSubmitting,
  onRate,
}: {
  isFlipped: boolean;
  isSubmitting: boolean;
  onRate: ({ quality }: { quality: number }) => void;
}) => {
  if (!isFlipped) return null;

  return (
    <div className="space-y-2 text-center">
      <p className="text-sm font-medium text-muted-foreground">How well did you know this?</p>
      <DifficultyButtons onRate={onRate} isSubmitting={isSubmitting} />
    </div>
  );
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Review session orchestrator. Manages the flow from card presentation
 * through rating to session summary.
 */
export const ReviewSession = ({ cards }: ReviewSessionProps) => {
  const {
    state,
    flipCard,
    rateCard,
    getCurrentCard,
    getSessionProgress,
    isSessionComplete,
  } = useReviewSession({ cards });

  if (isSessionComplete()) {
    return <SessionSummary stats={state.sessionStats} />;
  }

  const currentCard = getCurrentCard();
  if (!currentCard) return null;

  const progress = getSessionProgress();

  return (
    <div className="mx-auto max-w-2xl space-y-10">
      <ReviewProgress
        current={progress.current}
        total={progress.total}
        percentComplete={progress.percentComplete}
      />

      <Flashcard
        front={currentCard.front}
        back={currentCard.back}
        isFlipped={state.isFlipped}
        onFlip={flipCard}
      />

      <RatingSection
        isFlipped={state.isFlipped}
        isSubmitting={state.isSubmitting}
        onRate={rateCard}
      />
    </div>
  );
};
