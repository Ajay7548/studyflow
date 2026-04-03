import { NextResponse } from "next/server";
import { generateText } from "ai";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";
import { getGroqModel } from "@/lib/ai";
import { RATE_LIMIT } from "@/lib/constants";
import { Note } from "@/models";

const MAX_NOTE_LENGTH = 6000;

/** Zod schema to validate the parsed AI response. */
const flashcardSchema = z.object({
  flashcards: z.array(
    z.object({ front: z.string(), back: z.string() })
  ),
});

/** Parses a numeric field from the request body with a fallback default. */
const parseNumericField = ({
  value,
  fallback,
}: {
  value: unknown;
  fallback: number;
}) => {
  if (typeof value === "number") return value;
  return fallback;
};

/** Extracts and validates the request body for flashcard generation. */
const parseBody = async ({ request }: { request: Request }) => {
  const body = await request.json();
  const noteId = body.noteId as string | undefined;
  const count = parseNumericField({ value: body.count, fallback: 10 });

  if (!noteId) {
    return { noteId: null, count, error: "noteId is required" };
  }
  return { noteId, count, error: null };
};

/** Truncates note content to fit within the model context window. */
const truncateContent = ({ content }: { content: string }) => {
  if (content.length <= MAX_NOTE_LENGTH) return content;
  return content.slice(0, MAX_NOTE_LENGTH);
};

/** Extracts and sanitizes JSON from AI response text. */
const extractJsonFromResponse = ({ text }: { text: string }): string => {
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenceMatch ? fenceMatch[1].trim() : text.trim();

  // Replace literal control characters (newlines/tabs inside string values) with spaces
  // then fix invalid escape sequences (e.g. LaTeX \( \times) that break JSON.parse
  return raw
    .replace(/[\x00-\x1F\x7F]/g, " ")
    .replace(/\\(?!["\\/bfnrtu])/g, "\\\\");
};

/**
 * POST /api/ai/generate-flashcards
 *
 * Generates AI flashcards from a note's plain text content using generateText
 * with explicit JSON instructions. Returns a preview array; cards are not
 * persisted until the user confirms.
 */
export const POST = async (request: Request) => {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { allowed } = checkRateLimit({
    key: `ai:flashcards:${session.user.id}`,
    limit: RATE_LIMIT.AI_MAX_REQUESTS,
    windowMs: RATE_LIMIT.AI_WINDOW_MS,
  });
  if (!allowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const { noteId, count, error: parseError } = await parseBody({ request });
  if (parseError) {
    return NextResponse.json({ error: parseError }, { status: 400 });
  }

  await connectDB();

  const note = await Note.findOne({ _id: noteId, userId: session.user.id });
  if (!note) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }

  const noteContent = truncateContent({ content: note.contentPlainText });

  const { text } = await generateText({
    model: getGroqModel(),
    prompt: `You are an expert educator. Create exactly ${count} flashcards from the notes below.

Rules:
- Each card tests ONE concept. Use varied types: definitions, applications, comparisons.
- Front: clear question or prompt. Back: concise but complete answer.
- No yes/no questions. No trivially obvious questions.

Respond ONLY with valid JSON in this exact format (no extra text):
{"flashcards":[{"front":"question","back":"answer"}]}

Notes:
${noteContent}`,
  });

  const raw = extractJsonFromResponse({ text });
  const parsed = flashcardSchema.safeParse(JSON.parse(raw));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "AI returned invalid format. Please try again." },
      { status: 502 }
    );
  }

  return NextResponse.json({ success: true, data: parsed.data.flashcards });
};
