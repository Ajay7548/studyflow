"use client";

import { useCallback, useState } from "react";

import { Button } from "@/components/ui/button";

const COUNT_OPTIONS = [5, 10, 15] as const;

/** Returns the variant for a count button based on selection state. */
const getButtonVariant = ({ isSelected }: { isSelected: boolean }): "default" | "outline" => {
  if (isSelected) return "default";
  return "outline";
};

/**
 * Hook that manages a count selector for AI generation.
 *
 * Returns the current count value and a CountSelector component
 * that renders toggle buttons for 5, 10, and 15.
 */
export const useCountSelector = () => {
  const [count, setCount] = useState<number>(10);

  const CountSelector = useCallback(
    () => (
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted-foreground">
          Number of items
        </label>
        <div className="flex gap-1">
          {COUNT_OPTIONS.map((option) => (
            <Button
              key={option}
              variant={getButtonVariant({ isSelected: count === option })}
              size="sm"
              onClick={() => setCount(option)}
              className="flex-1"
            >
              {option}
            </Button>
          ))}
        </div>
      </div>
    ),
    [count]
  );

  return { count, CountSelector };
};
