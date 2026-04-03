"use client";

import { RefreshCw, Save, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface FlashcardItem {
  front: string;
  back: string;
}

interface QuizQuestionItem {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

/** Returns the correct singular or plural form based on count. */
const pluralize = ({ count, singular, plural }: { count: number; singular: string; plural: string }) => {
  if (count === 1) return singular;
  return plural;
};

/** Returns the CSS class for an option row based on correctness. */
const getOptionRowClass = ({ isCorrect }: { isCorrect: boolean }) => {
  if (isCorrect) return "font-medium text-green-600 dark:text-green-400";
  return "text-muted-foreground";
};

/** Type guard to determine if a result is a flashcard. */
const isFlashcard = (
  item: FlashcardItem | QuizQuestionItem
): item is FlashcardItem => "front" in item;

/** Returns the correct option label for a zero-based index. */
const optionLabel = ({ index }: { index: number }) =>
  String.fromCharCode(65 + index);

/**
 * Previews AI-generated flashcards or quiz questions.
 *
 * Allows users to review, remove individual items, save all results
 * to the database, or regenerate with a fresh AI call.
 */
export const GenerationPreview = ({
  results,
  onRemove,
  onSave,
  onRegenerate,
  isLoading,
}: {
  results: Array<FlashcardItem | QuizQuestionItem>;
  onRemove: ({ index }: { index: number }) => void;
  onSave: () => void;
  onRegenerate: () => void;
  isLoading: boolean;
}) => {
  if (results.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">
          {results.length} {pluralize({ count: results.length, singular: "item", plural: "items" })} generated
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onRegenerate}
            disabled={isLoading}
          >
            <RefreshCw className="mr-1 size-3" />
            Regenerate
          </Button>
          <Button size="sm" onClick={onSave} disabled={isLoading}>
            <Save className="mr-1 size-3" />
            Save All
          </Button>
        </div>
      </div>

      <ScrollArea className="max-h-[400px]">
        <div className="flex flex-col gap-2">
          {results.map((item, index) => (
            <PreviewCard
              key={index}
              item={item}
              index={index}
              onRemove={onRemove}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

/** Renders a single preview card for either a flashcard or quiz question. */
const PreviewCard = ({
  item,
  index,
  onRemove,
}: {
  item: FlashcardItem | QuizQuestionItem;
  index: number;
  onRemove: ({ index }: { index: number }) => void;
}) => (
  <Card size="sm">
    <CardContent className="relative">
      <Button
        variant="ghost"
        size="icon-xs"
        className="absolute top-1 right-1"
        onClick={() => onRemove({ index })}
      >
        <Trash2 className="size-3" />
      </Button>

      <PreviewContent item={item} />
    </CardContent>
  </Card>
);

/** Renders the appropriate preview content based on item type. */
const PreviewContent = ({ item }: { item: FlashcardItem | QuizQuestionItem }) => {
  if (isFlashcard(item)) return <FlashcardPreview item={item} />;
  return <QuizQuestionPreview item={item} />;
};

/** Displays the front and back of a flashcard preview. */
const FlashcardPreview = ({ item }: { item: FlashcardItem }) => (
  <div className="pr-6 text-sm">
    <p className="font-medium">{item.front}</p>
    <p className="mt-1 text-muted-foreground">{item.back}</p>
  </div>
);

/** Displays a quiz question with its options and correct answer. */
const QuizQuestionPreview = ({ item }: { item: QuizQuestionItem }) => (
  <div className="pr-6 text-sm">
    <p className="font-medium">{item.question}</p>
    <ul className="mt-1 space-y-0.5">
      {item.options.map((opt, i) => (
        <OptionRow
          key={i}
          label={optionLabel({ index: i })}
          text={opt}
          isCorrect={i === item.correctAnswer}
        />
      ))}
    </ul>
    <p className="mt-1 text-xs text-muted-foreground">
      {item.explanation}
    </p>
  </div>
);

/** Renders a single quiz option row with correct-answer highlighting. */
const OptionRow = ({
  label,
  text,
  isCorrect,
}: {
  label: string;
  text: string;
  isCorrect: boolean;
}) => (
  <li className={getOptionRowClass({ isCorrect })}>
    {label}. {text}
  </li>
);
