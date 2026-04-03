"use client";

import { useRef, useEffect, useMemo } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Loader2, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

/** Returns the appropriate styling class for a message role. */
const getMessageBubbleClass = ({ role }: { role: string }) => {
  if (role === "user") return "ml-auto bg-primary text-primary-foreground";
  return "mr-auto bg-muted";
};

/** Determines if the chat is currently waiting for a response. */
const isStreamActive = ({ status }: { status: string }) =>
  status === "submitted" || status === "streaming";

/** Extracts readable text from a message's parts array. */
const getMessageText = ({
  parts,
}: {
  parts: Array<{ type: string; text?: string }>;
}) =>
  parts
    .filter((p) => p.type === "text")
    .map((p) => p.text ?? "")
    .join("");

/**
 * AI chat interface component for the study assistant.
 *
 * Uses the Vercel AI SDK's useChat hook to stream messages from
 * the /api/ai/chat endpoint, optionally grounded in note content.
 */
export const AiChat = ({ noteId }: { noteId: string }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/ai/chat",
        body: { noteId },
      }),
    [noteId]
  );

  const { messages, sendMessage, status, error } = useChat({
    id: `chat-${noteId}`,
    transport,
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const input = new FormData(form).get("message") as string;
    if (!input.trim()) return;

    sendMessage({ text: input.trim() });
    form.reset();
  };

  return (
    <div className="flex h-full flex-col">
      <ScrollArea className="flex-1 p-3">
        <MessageList messages={messages} />
        <StreamingIndicator status={status} />
        <ErrorBanner error={error} />
        <div ref={bottomRef} />
      </ScrollArea>

      <form onSubmit={handleSubmit} className="flex gap-2 border-t p-3">
        <Input
          name="message"
          placeholder="Ask about your notes..."
          autoComplete="off"
          disabled={isStreamActive({ status })}
        />
        <Button type="submit" size="icon" disabled={isStreamActive({ status })}>
          <Send className="size-4" />
        </Button>
      </form>
    </div>
  );
};

/** Renders the list of chat messages. */
const MessageList = ({
  messages,
}: {
  messages: Array<{
    id: string;
    role: string;
    parts: Array<{ type: string; text?: string }>;
  }>;
}) => (
  <div className="flex flex-col gap-3">
    {messages.map((msg) => (
      <div
        key={msg.id}
        className={`max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${getMessageBubbleClass({ role: msg.role })}`}
      >
        {getMessageText({ parts: msg.parts })}
      </div>
    ))}
  </div>
);

/** Shows a loading indicator while the assistant is streaming. */
const StreamingIndicator = ({ status }: { status: string }) => {
  if (!isStreamActive({ status })) return null;

  return (
    <div className="flex items-center gap-2 py-2 text-xs text-muted-foreground">
      <Loader2 className="size-3 animate-spin" />
      <span>Thinking...</span>
    </div>
  );
};

/** Displays an error banner when a chat error occurs. */
const ErrorBanner = ({ error }: { error: Error | undefined }) => {
  if (!error) return null;

  return (
    <div className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
      {error.message}
    </div>
  );
};
