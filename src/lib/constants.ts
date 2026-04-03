// ─── App ─────────────────────────────────────────────────────────────

/** Display name used in headers, metadata, and emails. */
export const APP_NAME = "StudyFlow";

/** Default number of items per paginated list page. */
export const ITEMS_PER_PAGE = 12;

// ─── Subjects ────────────────────────────────────────────────────────

/** Pre-defined study subjects shown in dropdown selectors. */
export const SUBJECTS = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Computer Science",
  "History",
  "Geography",
  "English",
  "Economics",
  "Psychology",
  "Philosophy",
  "Law",
  "Medicine",
  "Engineering",
  "Art",
  "Music",
  "Other",
] as const;

export type Subject = (typeof SUBJECTS)[number];

// ─── SM-2 Spaced Repetition ─────────────────────────────────────────

/** Starting easiness factor for a new flashcard (SM-2). */
export const SM2_INITIAL_EASINESS = 2.5;

/** Floor value; easiness never drops below this (SM-2). */
export const SM2_MIN_EASINESS = 1.3;

/** Quality score labels used in the review UI (SM-2 scale). */
export const SM2_QUALITY_MAP = {
  Again: 1,
  Hard: 3,
  Good: 4,
  Easy: 5,
} as const;

export type SM2Quality = keyof typeof SM2_QUALITY_MAP;

// ─── AI ──────────────────────────────────────────────────────────────

/** Groq model identifier used for all AI generation calls. */
export const AI_MODEL = "llama-3.3-70b-versatile";

// ─── Rate Limiting ───────────────────────────────────────────────────

/** Rate limit window durations in milliseconds. */
export const RATE_LIMIT = {
  /** Window for general API routes. */
  DEFAULT_WINDOW_MS: 60 * 1000,
  /** Max requests per default window. */
  DEFAULT_MAX_REQUESTS: 60,

  /** Window for AI generation endpoints. */
  AI_WINDOW_MS: 60 * 1000,
  /** Max AI requests per window. */
  AI_MAX_REQUESTS: 10,

  /** Window for auth endpoints (login, register). */
  AUTH_WINDOW_MS: 15 * 60 * 1000,
  /** Max auth attempts per window. */
  AUTH_MAX_REQUESTS: 15,
} as const;
