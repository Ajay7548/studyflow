const MILLISECONDS_PER_DAY = 86_400_000;
const MINIMUM_EASINESS_FACTOR = 1.3;

interface CalculateNextReviewParams {
  /** SM-2 quality rating: 0 (complete blackout) to 5 (perfect recall). */
  quality: number;
  /** Current number of consecutive successful repetitions. */
  repetitions: number;
  /** Current inter-repetition interval in days. */
  interval: number;
  /** Current easiness factor (>= 1.3). */
  easinessFactor: number;
}

interface CalculateNextReviewResult {
  repetitions: number;
  interval: number;
  easinessFactor: number;
  nextReviewDate: Date;
}

/**
 * Calculates the next review schedule for a flashcard using the SM-2 algorithm.
 *
 * The SM-2 algorithm adjusts the review interval based on how well the user
 * recalled the card. A quality rating below 3 resets progress; 3 or above
 * advances the card through increasing intervals.
 *
 * @returns Updated repetition state and the next review date.
 */
export const calculateNextReview = ({
  quality,
  repetitions,
  interval,
  easinessFactor,
}: CalculateNextReviewParams): CalculateNextReviewResult => {
  const newEasinessFactorRaw =
    easinessFactor +
    (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  const newEasinessFactor = Math.max(MINIMUM_EASINESS_FACTOR, newEasinessFactorRaw);

  if (quality < 3) {
    return {
      repetitions: 0,
      interval: 1,
      easinessFactor: newEasinessFactor,
      nextReviewDate: new Date(Date.now() + MILLISECONDS_PER_DAY),
    };
  }

  const newRepetitions = repetitions + 1;
  const newInterval = computeInterval({
    repetitions: newRepetitions,
    previousInterval: interval,
    easinessFactor: newEasinessFactor,
  });

  return {
    repetitions: newRepetitions,
    interval: newInterval,
    easinessFactor: newEasinessFactor,
    nextReviewDate: new Date(Date.now() + newInterval * MILLISECONDS_PER_DAY),
  };
};

interface ComputeIntervalParams {
  repetitions: number;
  previousInterval: number;
  easinessFactor: number;
}

/**
 * Determines the inter-repetition interval for a given repetition count.
 */
const computeInterval = ({
  repetitions,
  previousInterval,
  easinessFactor,
}: ComputeIntervalParams): number => {
  if (repetitions === 1) {
    return 1;
  }

  if (repetitions === 2) {
    return 6;
  }

  return Math.round(previousInterval * easinessFactor);
};

interface GetFlashcardsDueCountParams {
  /** Array of flashcard objects, each with a nextReviewDate field. */
  flashcards: Array<{ nextReviewDate: Date | string }>;
}

/**
 * Counts how many flashcards are due for review right now.
 *
 * A card is due when its nextReviewDate is at or before the current time.
 */
export const getFlashcardsDueCount = ({
  flashcards,
}: GetFlashcardsDueCountParams): number => {
  const now = Date.now();

  return flashcards.filter(
    (card) => new Date(card.nextReviewDate).getTime() <= now
  ).length;
};

interface MapQualityToLabelParams {
  /** SM-2 quality rating: 0-5. */
  quality: number;
}

const QUALITY_LABELS: Record<number, string> = {
  0: "Again",
  1: "Again",
  2: "Hard",
  3: "Good",
  4: "Easy",
  5: "Easy",
};

/**
 * Maps a numeric SM-2 quality rating to a human-readable label.
 *
 * - 0-1: "Again" (complete failure, needs immediate re-study)
 * - 2: "Hard" (recalled with serious difficulty)
 * - 3: "Good" (recalled with some hesitation)
 * - 4-5: "Easy" (recalled effortlessly)
 */
export const mapQualityToLabel = ({
  quality,
}: MapQualityToLabelParams): string => {
  return QUALITY_LABELS[quality] ?? "Unknown";
};
