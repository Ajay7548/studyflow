"use client";

import { Loader2, Sparkles, Brain, MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAiGeneration } from "@/hooks/use-ai-generation";
import { GenerationPreview } from "@/components/ai/generation-preview";
import { AiChat } from "@/components/ai/ai-chat";
import { useCountSelector } from "@/hooks/use-count-selector";
import { useDifficultySelector } from "@/hooks/use-difficulty-selector";

/**
 * AI-powered sidebar for the note detail page.
 *
 * Provides three tabs: Generate Flashcards, Generate Quiz, and Ask AI.
 * Each tab uses the corresponding API endpoint for AI generation or chat.
 */
export const AiSidebar = ({ noteId }: { noteId: string }) => (
  <div className="flex h-full flex-col">
    <Tabs defaultValue="flashcards" className="flex h-full flex-col">
      <TabsList className="w-full">
        <TabsTrigger value="flashcards">
          <Sparkles className="mr-1 size-3" />
          Flashcards
        </TabsTrigger>
        <TabsTrigger value="quiz">
          <Brain className="mr-1 size-3" />
          Quiz
        </TabsTrigger>
        <TabsTrigger value="chat">
          <MessageCircle className="mr-1 size-3" />
          Ask AI
        </TabsTrigger>
      </TabsList>

      <TabsContent value="flashcards" className="flex-1 overflow-auto p-3">
        <FlashcardsTab noteId={noteId} />
      </TabsContent>
      <TabsContent value="quiz" className="flex-1 overflow-auto p-3">
        <QuizTab noteId={noteId} />
      </TabsContent>
      <TabsContent value="chat" className="flex-1 overflow-hidden">
        <AiChat noteId={noteId} />
      </TabsContent>
    </Tabs>
  </div>
);

/** Flashcards generation tab with count selector and preview. */
const FlashcardsTab = ({ noteId }: { noteId: string }) => {
  const { results, isLoading, error, generate, saveResults, removeResult } =
    useAiGeneration({ type: "flashcards" });

  const { count, CountSelector } = useCountSelector();

  const handleGenerate = () => {
    generate({ noteId, count });
  };

  const handleSave = () => {
    saveResults({ noteId });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <p className="text-sm text-muted-foreground">
          Generate flashcards from your notes using AI.
        </p>
        <CountSelector />
        <GenerateButton
          label="Generate Flashcards"
          isLoading={isLoading}
          onClick={handleGenerate}
        />
      </div>
      <ErrorMessage error={error} />
      <GenerationPreview
        results={results}
        onRemove={removeResult}
        onSave={handleSave}
        onRegenerate={handleGenerate}
        isLoading={isLoading}
      />
    </div>
  );
};

/** Quiz generation tab with count and difficulty selectors and preview. */
const QuizTab = ({ noteId }: { noteId: string }) => {
  const { results, isLoading, error, generate, saveResults, removeResult } =
    useAiGeneration({ type: "quiz" });

  const { count, CountSelector } = useCountSelector();
  const { difficulty, DifficultySelector } = useDifficultySelector();

  const handleGenerate = () => {
    generate({ noteId, count, difficulty });
  };

  const handleSave = () => {
    saveResults({ noteId, title: "AI-Generated Quiz" });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <p className="text-sm text-muted-foreground">
          Generate a multiple-choice quiz from your notes.
        </p>
        <CountSelector />
        <DifficultySelector />
        <GenerateButton
          label="Generate Quiz"
          isLoading={isLoading}
          onClick={handleGenerate}
        />
      </div>
      <ErrorMessage error={error} />
      <GenerationPreview
        results={results}
        onRemove={removeResult}
        onSave={handleSave}
        onRegenerate={handleGenerate}
        isLoading={isLoading}
      />
    </div>
  );
};

/** Renders the button interior when loading. */
const GenerateButtonLoading = () => (
  <>
    <Loader2 className="mr-1 size-4 animate-spin" />
    Generating...
  </>
);

/** Renders the button interior when idle. */
const GenerateButtonIdle = ({ label }: { label: string }) => (
  <>
    <Sparkles className="mr-1 size-4" />
    {label}
  </>
);

/** Renders the generate button content based on loading state. */
const GenerateButtonContent = ({ label, isLoading }: { label: string; isLoading: boolean }) => {
  if (isLoading) return <GenerateButtonLoading />;
  return <GenerateButtonIdle label={label} />;
};

/** Reusable generate button with loading state. */
const GenerateButton = ({
  label,
  isLoading,
  onClick,
}: {
  label: string;
  isLoading: boolean;
  onClick: () => void;
}) => (
  <Button onClick={onClick} disabled={isLoading} className="w-full">
    <GenerateButtonContent label={label} isLoading={isLoading} />
  </Button>
);

/** Displays an error message when present. */
const ErrorMessage = ({ error }: { error: string | null }) => {
  if (!error) return null;

  return (
    <p className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
      {error}
    </p>
  );
};
