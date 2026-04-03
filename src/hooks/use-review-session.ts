"use client";

import { useReducer, useCallback, useMemo } from "react";
import { useKeyboard } from "@/hooks/use-keyboard";
import { SM2_QUALITY_MAP } from "@/lib/constants";

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

interface SessionStats {
  reviewed: number;
  correct: number;
  startTime: number;
}

interface ReviewState {
  cards: SerializedFlashcard[];
  currentIndex: number;
  isFlipped: boolean;
  isSubmitting: boolean;
  sessionStats: SessionStats;
}

type ReviewAction =
  | { type: "FLIP_CARD" }
  | { type: "RATE_CARD_START" }
  | { type: "RATE_CARD_SUCCESS"; quality: number }
  | { type: "RATE_CARD_ERROR" };

interface UseReviewSessionParams {
  cards: SerializedFlashcard[];
}

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

/** Converts a boolean to 1 or 0. */
const boolToInt = ({ value }: { value: boolean }): number => {
  if (value) return 1;
  return 0;
};

/** Computes a percentage, returning 0 when total is 0. */
const computePercent = ({ current, total }: { current: number; total: number }): number => {
  if (total === 0) return 0;
  return Math.round((current / total) * 100);
};

const createInitialState = ({ cards }: { cards: SerializedFlashcard[] }): ReviewState => ({
  cards,
  currentIndex: 0,
  isFlipped: false,
  isSubmitting: false,
  sessionStats: { reviewed: 0, correct: 0, startTime: Date.now() },
});

const reviewReducer = (state: ReviewState, action: ReviewAction): ReviewState => {
  if (action.type === "FLIP_CARD") {
    return { ...state, isFlipped: !state.isFlipped };
  }

  if (action.type === "RATE_CARD_START") {
    return { ...state, isSubmitting: true };
  }

  if (action.type === "RATE_CARD_SUCCESS") {
    const isCorrect = action.quality >= 3;
    return {
      ...state,
      currentIndex: state.currentIndex + 1,
      isFlipped: false,
      isSubmitting: false,
      sessionStats: {
        ...state.sessionStats,
        reviewed: state.sessionStats.reviewed + 1,
        correct: state.sessionStats.correct + boolToInt({ value: isCorrect }),
      },
    };
  }

  if (action.type === "RATE_CARD_ERROR") {
    return { ...state, isSubmitting: false };
  }

  return state;
};

// ---------------------------------------------------------------------------
// API helper
// ---------------------------------------------------------------------------

/** Submits a quality rating for a flashcard to the API. */
const submitRating = async ({ cardId, quality }: { cardId: string; quality: number }) => {
  const response = await fetch(`/api/flashcards/${cardId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quality }),
  });

  if (!response.ok) {
    throw new Error("Failed to submit rating");
  }
};

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Manages the entire flashcard review session state using useReducer.
 *
 * Provides card flipping, quality rating submission, progress tracking,
 * session completion detection, and keyboard shortcuts.
 */
export const useReviewSession = ({ cards }: UseReviewSessionParams) => {
  const [state, dispatch] = useReducer(reviewReducer, { cards }, createInitialState);

  const getCurrentCard = useCallback(
    () => state.cards[state.currentIndex] ?? null,
    [state.cards, state.currentIndex],
  );

  const isSessionComplete = useCallback(
    () => state.currentIndex >= state.cards.length,
    [state.currentIndex, state.cards.length],
  );

  const getSessionProgress = useCallback(() => {
    const total = state.cards.length;
    const current = Math.min(state.currentIndex + 1, total);
    const percentComplete = computePercent({ current: state.currentIndex, total });
    return { current, total, percentComplete };
  }, [state.currentIndex, state.cards.length]);

  const flipCard = useCallback(() => {
    if (isSessionComplete()) return;
    dispatch({ type: "FLIP_CARD" });
  }, [isSessionComplete]);

  const rateCard = useCallback(
    async ({ quality }: { quality: number }) => {
      const card = getCurrentCard();
      if (!card) return;
      if (state.isSubmitting) return;

      dispatch({ type: "RATE_CARD_START" });
      try {
        await submitRating({ cardId: card._id, quality });
        dispatch({ type: "RATE_CARD_SUCCESS", quality });
      } catch {
        dispatch({ type: "RATE_CARD_ERROR" });
      }
    },
    [getCurrentCard, state.isSubmitting],
  );

  const shortcuts = useMemo(
    () => ({
      " ": () => flipCard(),
      "1": () => state.isFlipped && rateCard({ quality: SM2_QUALITY_MAP.Again }),
      "2": () => state.isFlipped && rateCard({ quality: SM2_QUALITY_MAP.Hard }),
      "3": () => state.isFlipped && rateCard({ quality: SM2_QUALITY_MAP.Good }),
      "4": () => state.isFlipped && rateCard({ quality: SM2_QUALITY_MAP.Easy }),
    }),
    [flipCard, rateCard, state.isFlipped],
  );

  useKeyboard({ shortcuts, enabled: !isSessionComplete() });

  return {
    state,
    flipCard,
    rateCard,
    getCurrentCard,
    getSessionProgress,
    isSessionComplete,
  };
};
