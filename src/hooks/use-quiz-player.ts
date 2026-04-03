"use client";

import { useCallback, useEffect, useReducer } from "react";
import { useStudyTimer } from "@/hooks/use-study-timer";

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

interface QuizPlayerState {
  currentQuestionIndex: number;
  answers: Record<number, number>;
  isSubmitting: boolean;
  isComplete: boolean;
}

type QuizPlayerAction =
  | { type: "SELECT_ANSWER"; questionIndex: number; answerIndex: number }
  | { type: "NEXT_QUESTION" }
  | { type: "PREVIOUS_QUESTION" }
  | { type: "SUBMIT_START" }
  | { type: "SUBMIT_SUCCESS" }
  | { type: "SUBMIT_FAILURE" };

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

const initialState: QuizPlayerState = {
  currentQuestionIndex: 0,
  answers: {},
  isSubmitting: false,
  isComplete: false,
};

const quizPlayerReducer = (
  state: QuizPlayerState,
  action: QuizPlayerAction
): QuizPlayerState => {
  if (action.type === "SELECT_ANSWER") {
    return {
      ...state,
      answers: { ...state.answers, [action.questionIndex]: action.answerIndex },
    };
  }
  if (action.type === "NEXT_QUESTION") {
    return { ...state, currentQuestionIndex: state.currentQuestionIndex + 1 };
  }
  if (action.type === "PREVIOUS_QUESTION") {
    return { ...state, currentQuestionIndex: state.currentQuestionIndex - 1 };
  }
  if (action.type === "SUBMIT_START") {
    return { ...state, isSubmitting: true };
  }
  if (action.type === "SUBMIT_SUCCESS") {
    return { ...state, isSubmitting: false, isComplete: true };
  }
  if (action.type === "SUBMIT_FAILURE") {
    return { ...state, isSubmitting: false };
  }
  return state;
};

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Custom hook managing quiz-taking state: answer selection, navigation,
 * submission, timer, and progress tracking.
 *
 * @example
 * ```tsx
 * const player = useQuizPlayer({ quizId: "abc", questions });
 * ```
 */
export const useQuizPlayer = ({
  quizId,
  questions,
}: {
  quizId: string;
  questions: QuizQuestion[];
}) => {
  const [state, dispatch] = useReducer(quizPlayerReducer, initialState);
  const timer = useStudyTimer();

  useEffect(() => {
    timer.startTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectAnswer = useCallback(
    ({ questionIndex, answerIndex }: { questionIndex: number; answerIndex: number }) => {
      dispatch({ type: "SELECT_ANSWER", questionIndex, answerIndex });
    },
    []
  );

  const goToNextQuestion = useCallback(() => {
    if (state.currentQuestionIndex >= questions.length - 1) return;
    dispatch({ type: "NEXT_QUESTION" });
  }, [state.currentQuestionIndex, questions.length]);

  const goToPreviousQuestion = useCallback(() => {
    if (state.currentQuestionIndex <= 0) return;
    dispatch({ type: "PREVIOUS_QUESTION" });
  }, [state.currentQuestionIndex]);

  const submitQuiz = useCallback(async () => {
    dispatch({ type: "SUBMIT_START" });
    timer.stopTimer();

    try {
      const response = await fetch(`/api/quizzes/${quizId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: state.answers,
          timeTakenSeconds: timer.elapsedSeconds,
        }),
      });

      if (!response.ok) {
        dispatch({ type: "SUBMIT_FAILURE" });
        return;
      }

      dispatch({ type: "SUBMIT_SUCCESS" });
    } catch {
      dispatch({ type: "SUBMIT_FAILURE" });
    }
  }, [quizId, state.answers, timer]);

  const getCurrentQuestion = useCallback(
    () => questions[state.currentQuestionIndex],
    [questions, state.currentQuestionIndex]
  );

  const getProgress = useCallback(
    () => ({
      current: state.currentQuestionIndex + 1,
      total: questions.length,
      answered: Object.keys(state.answers).length,
    }),
    [state.currentQuestionIndex, questions.length, state.answers]
  );

  const isAnswered = useCallback(
    ({ questionIndex }: { questionIndex: number }) =>
      questionIndex in state.answers,
    [state.answers]
  );

  const getSelectedAnswer = useCallback(
    ({ questionIndex }: { questionIndex: number }) =>
      state.answers[questionIndex] ?? null,
    [state.answers]
  );

  return {
    ...state,
    timer,
    selectAnswer,
    goToNextQuestion,
    goToPreviousQuestion,
    submitQuiz,
    getCurrentQuestion,
    getProgress,
    isAnswered,
    getSelectedAnswer,
  };
};
