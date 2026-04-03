"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface QuestionDisplayProps {
  /** The question text to show. */
  question: string;
  /** Array of four answer options. */
  options: string[];
  /** Index of the currently selected option, or null. */
  selectedAnswer: number | null;
  /** Callback when an option is selected. */
  onSelectAnswer: ({ answerIndex }: { answerIndex: number }) => void;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Maps a numeric index to a letter label (A, B, C, D). */
const getOptionLabel = ({ index }: { index: number }): string =>
  String.fromCharCode(65 + index);

/** Returns the appropriate variant and className for an option button. */
const getOptionStyle = ({
  index,
  selectedAnswer,
}: {
  index: number;
  selectedAnswer: number | null;
}): { variant: "outline" | "default"; className: string } => {
  if (selectedAnswer === index) {
    return {
      variant: "default",
      className: "justify-start text-left h-auto py-3 px-4",
    };
  }
  return {
    variant: "outline",
    className: "justify-start text-left h-auto py-3 px-4",
  };
};

/** Renders a single clickable option button. */
const OptionButton = ({
  index,
  text,
  selectedAnswer,
  onSelect,
}: {
  index: number;
  text: string;
  selectedAnswer: number | null;
  onSelect: () => void;
}) => {
  const style = getOptionStyle({ index, selectedAnswer });
  const label = getOptionLabel({ index });

  return (
    <Button
      variant={style.variant}
      className={cn("w-full", style.className)}
      onClick={onSelect}
    >
      <span className="mr-3 font-semibold">{label}.</span>
      <span className="flex-1">{text}</span>
    </Button>
  );
};

// ---------------------------------------------------------------------------
// QuestionDisplay
// ---------------------------------------------------------------------------

/**
 * Renders a single multiple-choice question with four option buttons.
 * Highlights the currently selected answer.
 */
export const QuestionDisplay = ({
  question,
  options,
  selectedAnswer,
  onSelectAnswer,
}: QuestionDisplayProps) => (
  <div className="space-y-6">
    <h2 className="text-lg font-semibold leading-relaxed">{question}</h2>
    <div className="flex flex-col gap-3">
      {options.map((option, index) => (
        <OptionButton
          key={index}
          index={index}
          text={option}
          selectedAnswer={selectedAnswer}
          onSelect={() => onSelectAnswer({ answerIndex: index })}
        />
      ))}
    </div>
  </div>
);
