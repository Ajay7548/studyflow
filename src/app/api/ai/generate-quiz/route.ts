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
const quizSchema = z.object({
  questions: z.array(
    z.object({
      question: z.string(),
      options: z.array(z.string()).length(4),
      correctAnswer: z.number().int().min(0).max(3),
      explanation: z.string(),
    })
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

/** Extracts and validates the request body for quiz generation. */
const parseBody = async ({ request }: { request: Request }) => {
  const body = await request.json();
  const noteId = body.noteId as string | undefined;
  const count = parseNumericField({ value: body.count, fallback: 5 });
  const difficulty = (body.difficulty as string) ?? "medium";

  if (!noteId) {
    return { noteId: null, count, difficulty, error: "noteId is required" };
  }
  return { noteId, count, difficulty, error: null };
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
 * POST /api/ai/generate-quiz
 *
 * Generates AI quiz questions from a note's plain text content using
 * generateText with explicit JSON instructions. Returns a preview array;
 * the quiz is not persisted until the user confirms.
 */
export const POST = async (request: Request) => {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { allowed } = checkRateLimit({
    key: `ai:quiz:${session.user.id}`,
    limit: RATE_LIMIT.AI_MAX_REQUESTS,
    windowMs: RATE_LIMIT.AI_WINDOW_MS,
  });
  if (!allowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const { noteId, count, difficulty, error: parseError } = await parseBody({
    request,
  });
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
    prompt: `You are an expert educator. Create exactly ${count} multiple-choice questions at ${difficulty} difficulty from the notes below.

Rules:
- Each question has exactly 4 options. correctAnswer is the 0-based index (0-3).
- Include plausible distractors. Provide a clear explanation for each answer.
- Cover different topics from the notes. No "all/none of the above" options.

Respond ONLY with valid JSON in this exact format (no extra text):
{"questions":[{"question":"text","options":["A","B","C","D"],"correctAnswer":0,"explanation":"why"}]}

Notes:
${noteContent}`,
  });

  const raw = extractJsonFromResponse({ text });
  const parsed = quizSchema.safeParse(JSON.parse(raw));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "AI returned invalid format. Please try again." },
      { status: 502 }
    );
  }

  return NextResponse.json({ success: true, data: parsed.data.questions });
};
