import { NextResponse } from "next/server";
import {
  streamText,
  convertToModelMessages,
  type UIMessage,
} from "ai";

import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";
import { getGroqModel } from "@/lib/ai";
import { RATE_LIMIT } from "@/lib/constants";
import { Note } from "@/models";

const MAX_NOTE_LENGTH = 6000;
const CHAT_RATE_LIMIT = 20;

/** Truncates note content to fit within the model context window. */
const truncateContent = ({ content }: { content: string }) => {
  if (content.length <= MAX_NOTE_LENGTH) return content;
  return content.slice(0, MAX_NOTE_LENGTH);
};

/** Builds the system prompt, optionally including note context. */
const buildSystemPrompt = ({
  noteContent,
}: {
  noteContent: string | null;
}) => {
  const base =
    "You are a helpful study assistant for StudyFlow. " +
    "Help students understand concepts, answer questions about their notes, " +
    "and provide clear explanations. Keep responses concise and educational.";

  if (!noteContent) {
    return base;
  }

  return (
    base +
    "\n\nThe student is currently studying the following notes. " +
    "Use this context to provide relevant answers:\n\n" +
    noteContent
  );
};

/**
 * POST /api/ai/chat
 *
 * Streams an AI study assistant response. Optionally accepts a noteId
 * to ground the conversation in specific note content.
 */
export const POST = async (request: Request) => {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { allowed } = checkRateLimit({
    key: `ai:chat:${session.user.id}`,
    limit: CHAT_RATE_LIMIT,
    windowMs: RATE_LIMIT.AI_WINDOW_MS,
  });
  if (!allowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const body = await request.json();
  const messages = body.messages as UIMessage[];
  const noteId = body.noteId as string | undefined;

  let noteContent: string | null = null;

  if (noteId) {
    await connectDB();
    const note = await Note.findOne({ _id: noteId, userId: session.user.id });
    if (note) {
      noteContent = truncateContent({ content: note.contentPlainText });
    }
  }

  const modelMessages = await convertToModelMessages(messages);

  const result = streamText({
    model: getGroqModel(),
    system: buildSystemPrompt({ noteContent }),
    messages: modelMessages,
  });

  return result.toUIMessageStreamResponse();
};
