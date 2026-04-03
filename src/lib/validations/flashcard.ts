import { z } from "zod";

const objectIdRegex = /^[a-f\d]{24}$/i;

/**
 * Schema for a single flashcard within a creation request.
 *
 * - front: question side, 1-1000 characters
 * - back: answer side, 1-2000 characters
 */
const flashcardItemSchema = z.object({
  front: z
    .string()
    .min(1, "Front side is required")
    .max(1000, "Front side must be 1000 characters or fewer"),
  back: z
    .string()
    .min(1, "Back side is required")
    .max(2000, "Back side must be 2000 characters or fewer"),
});

/**
 * Schema for creating a batch of flashcards linked to a note.
 *
 * - cards: array of { front, back } pairs
 * - noteId: MongoDB ObjectId string referencing the source note
 */
export const createFlashcardsSchema = z.object({
  cards: z.array(flashcardItemSchema).min(1, "At least one card is required"),
  noteId: z.string().regex(objectIdRegex, "Invalid note ID format"),
});

/**
 * Schema for submitting a flashcard review rating (SM-2 algorithm).
 *
 * - quality: integer from 0 (complete blackout) to 5 (perfect recall)
 */
export const updateFlashcardSchema = z.object({
  quality: z
    .number()
    .int("Quality must be an integer")
    .min(0, "Quality must be at least 0")
    .max(5, "Quality must be at most 5"),
});

/** Inferred type for creating flashcards. */
export type CreateFlashcardsInput = z.infer<typeof createFlashcardsSchema>;

/** Inferred type for a flashcard review update. */
export type UpdateFlashcardInput = z.infer<typeof updateFlashcardSchema>;
