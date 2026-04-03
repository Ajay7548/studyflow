import { z } from "zod";

const objectIdRegex = /^[a-f\d]{24}$/i;

/**
 * Schema for a single quiz question.
 *
 * - question: the question text
 * - options: exactly 4 answer choices
 * - correctAnswer: index (0-3) of the correct option
 * - explanation: explanation of the correct answer
 */
export const quizQuestionSchema = z.object({
  question: z.string().min(1, "Question is required"),
  options: z
    .array(z.string())
    .length(4, "Exactly 4 options are required"),
  correctAnswer: z
    .number()
    .int("Correct answer must be an integer")
    .min(0, "Correct answer index must be at least 0")
    .max(3, "Correct answer index must be at most 3"),
  explanation: z.string().min(1, "Explanation is required"),
});

/**
 * Schema for creating a new quiz linked to a note.
 *
 * - title: quiz title
 * - questions: array of quiz question objects
 * - noteId: MongoDB ObjectId string referencing the source note
 */
export const createQuizSchema = z.object({
  title: z.string().min(1, "Title is required"),
  questions: z
    .array(quizQuestionSchema)
    .min(1, "At least one question is required"),
  noteId: z.string().regex(objectIdRegex, "Invalid note ID format"),
});

/**
 * Schema for submitting quiz answers.
 *
 * - answers: array of selected option indices (one per question)
 * - timeTakenSeconds: total time spent on the quiz in seconds
 */
export const submitQuizSchema = z.object({
  answers: z.array(z.number().int().min(0).max(3)),
  timeTakenSeconds: z
    .number()
    .min(0, "Time taken must be a positive number"),
});

/** Inferred type for a quiz question. */
export type QuizQuestionInput = z.infer<typeof quizQuestionSchema>;

/** Inferred type for creating a quiz. */
export type CreateQuizInput = z.infer<typeof createQuizSchema>;

/** Inferred type for submitting quiz answers. */
export type SubmitQuizInput = z.infer<typeof submitQuizSchema>;
