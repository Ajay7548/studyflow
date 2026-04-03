import { z } from "zod";

/**
 * Schema for creating a new note.
 *
 * - title: 1-200 characters
 * - content: rich HTML content, at least 1 character
 * - contentPlainText: plain text extraction, at least 1 character
 * - subject: subject/category, at least 1 character
 * - tags: optional array of strings, defaults to empty
 */
export const createNoteSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be 200 characters or fewer"),
  content: z.string().min(1, "Content is required"),
  contentPlainText: z.string().min(1, "Plain text content is required"),
  subject: z.string().min(1, "Subject is required"),
  tags: z.array(z.string()).optional().default([]),
});

/**
 * Schema for updating an existing note.
 * All fields from createNoteSchema are optional.
 */
export const updateNoteSchema = createNoteSchema.partial();

/**
 * Schema for searching and paginating notes.
 *
 * - search: optional text query
 * - subject: optional subject filter
 * - page: page number, defaults to 1
 * - limit: results per page, defaults to 12
 */
export const noteSearchSchema = z.object({
  search: z.string().optional(),
  subject: z.string().optional(),
  page: z.coerce.number().optional().default(1),
  limit: z.coerce.number().optional().default(12),
});

/** Inferred type for creating a note. */
export type CreateNoteInput = z.infer<typeof createNoteSchema>;

/** Inferred type for updating a note. */
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;

/** Inferred type for note search parameters. */
export type NoteSearchInput = z.infer<typeof noteSearchSchema>;
