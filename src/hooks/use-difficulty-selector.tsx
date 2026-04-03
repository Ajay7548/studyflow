"use client";

import { useCallback, useState } from "react";

import { Button } from "@/components/ui/button";

const DIFFICULTY_OPTIONS = ["easy", "medium", "hard"] as const;

/** Returns the variant for a difficulty button based on selection state. */
const getButtonVariant = ({ isSelected }: { isSelected: boolean }): "default" | "outline" => {
  if (isSelected) return "default";
  return "outline";
};

/** Capitalizes the first letter of a difficulty label. */
const capitalize = ({ text }: { text: string }) =>
  text.charAt(0).toUpperCase() + text.slice(1);

/**
 * Hook that manages a difficulty selector for quiz generation.
 *
 * Returns the current difficulty value and a DifficultySelector
 * component that renders toggle buttons for easy, medium, and hard.
 */
export const useDifficultySelector = () => {
  const [difficulty, setDifficulty] = useState<string>("medium");

  const DifficultySelector = useCallback(
    () => (
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted-foreground">
          Difficulty
        </label>
        <div className="flex gap-1">
          {DIFFICULTY_OPTIONS.map((option) => (
            <Button
              key={option}
              variant={getButtonVariant({ isSelected: difficulty === option })}
              size="sm"
              onClick={() => setDifficulty(option)}
              className="flex-1"
            >
              {capitalize({ text: option })}
            </Button>
          ))}
        </div>
      </div>
    ),
    [difficulty]
  );

  return { difficulty, DifficultySelector };
};
