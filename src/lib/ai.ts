import { groq } from "@ai-sdk/groq";

/**
 * Returns a Groq language model instance configured with Llama 3.3 70B.
 *
 * This is the primary model used throughout StudyFlow for AI-powered features
 * such as flashcard generation, quiz creation, and note summarization.
 *
 * Use with Vercel AI SDK functions:
 *
 * @example
 * ```ts
 * import { generateObject } from "ai";
 * import { getGroqModel } from "@/lib/ai";
 *
 * const { object } = await generateObject({
 *   model: getGroqModel(),
 *   schema: myZodSchema,
 *   prompt: "Generate flashcards for...",
 * });
 * ```
 *
 * @example
 * ```ts
 * import { streamText } from "ai";
 * import { getGroqModel } from "@/lib/ai";
 *
 * const result = streamText({
 *   model: getGroqModel(),
 *   prompt: "Summarize the following notes...",
 * });
 * ```
 */
export const getGroqModel = () => {
  return groq("llama-3.3-70b-versatile");
};
