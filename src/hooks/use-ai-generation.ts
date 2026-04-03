"use client";

import { useCallback, useRef, useState } from "react";

interface FlashcardResult {
  front: string;
  back: string;
}

interface QuizQuestionResult {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

type GenerationResult = FlashcardResult | QuizQuestionResult;

type GenerationType = "flashcards" | "quiz";

interface GenerateParams {
  noteId: string;
  count?: number;
  difficulty?: string;
}

interface SaveFlashcardsParams {
  noteId: string;
  results: FlashcardResult[];
}

interface SaveQuizParams {
  noteId: string;
  title: string;
  results: QuizQuestionResult[];
}

/** Posts flashcard results to the bulk-create endpoint. */
const saveFlashcardsToDb = async ({ noteId, results }: SaveFlashcardsParams) => {
  const response = await fetch("/api/flashcards", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ noteId, cards: results }),
  });
  if (!response.ok) {
    const body = await response.json();
    throw new Error(body.error ?? "Failed to save flashcards");
  }
  return response.json();
};

/** Posts quiz results to the quiz creation endpoint. */
const saveQuizToDb = async ({ noteId, title, results }: SaveQuizParams) => {
  const response = await fetch("/api/quizzes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ noteId, title, questions: results }),
  });
  if (!response.ok) {
    const body = await response.json();
    throw new Error(body.error ?? "Failed to save quiz");
  }
  return response.json();
};

/** Resolves the correct API endpoint based on generation type. */
const ENDPOINTS: Record<GenerationType, string> = {
  flashcards: "/api/ai/generate-flashcards",
  quiz: "/api/ai/generate-quiz",
};

/** Returns the API endpoint for the given generation type. */
const getEndpoint = ({ type }: { type: GenerationType }) => ENDPOINTS[type];

/** Persists generated results to the correct endpoint based on type. */
const persistResults = async ({
  type,
  noteId,
  title,
  results,
}: {
  type: GenerationType;
  noteId: string;
  title?: string;
  results: GenerationResult[];
}) => {
  if (type === "flashcards") {
    return saveFlashcardsToDb({ noteId, results: results as FlashcardResult[] });
  }
  return saveQuizToDb({
    noteId,
    title: title ?? "AI-Generated Quiz",
    results: results as QuizQuestionResult[],
  });
};

/**
 * Custom hook for AI-powered flashcard and quiz generation.
 *
 * Manages loading, error, and result state. Provides generate,
 * save, remove, and clear actions for the generation workflow.
 *
 * @example
 * ```tsx
 * const { results, isLoading, generate, saveResults } =
 *   useAiGeneration({ type: "flashcards" });
 * ```
 */
export const useAiGeneration = ({ type }: { type: GenerationType }) => {
  const [results, setResults] = useState<GenerationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const generate = useCallback(
    async ({ noteId, count, difficulty }: GenerateParams) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setIsLoading(true);
      setError(null);
      setResults([]);

      try {
        const response = await fetch(getEndpoint({ type }), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ noteId, count, difficulty }),
          signal: controller.signal,
        });

        if (!response.ok) {
          const body = await response.json();
          throw new Error(body.error ?? "Generation failed");
        }

        const json = await response.json();
        setResults(json.data);
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    },
    [type]
  );

  const saveResults = useCallback(
    async ({ noteId, title }: { noteId: string; title?: string }) => {
      setIsLoading(true);
      setError(null);

      try {
        await persistResults({ type, noteId, title, results });
        setResults([]);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    },
    [type, results]
  );

  const removeResult = useCallback(({ index }: { index: number }) => {
    setResults((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return { results, isLoading, error, generate, saveResults, removeResult, clearResults };
};
