"use client";

import { SM2_QUALITY_MAP } from "@/lib/constants";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DifficultyButtonsProps {
  onRate: ({ quality }: { quality: number }) => void;
  isSubmitting: boolean;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DIFFICULTY_OPTIONS = [
  {
    label: "Again",
    quality: SM2_QUALITY_MAP.Again,
    key: "1",
    bg: "bg-red-500/10 hover:bg-red-500/20 border-red-500/30",
    text: "text-red-500",
  },
  {
    label: "Hard",
    quality: SM2_QUALITY_MAP.Hard,
    key: "2",
    bg: "bg-orange-500/10 hover:bg-orange-500/20 border-orange-500/30",
    text: "text-orange-500",
  },
  {
    label: "Good",
    quality: SM2_QUALITY_MAP.Good,
    key: "3",
    bg: "bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/30",
    text: "text-blue-500",
  },
  {
    label: "Easy",
    quality: SM2_QUALITY_MAP.Easy,
    key: "4",
    bg: "bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30",
    text: "text-emerald-500",
  },
] as const;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Four difficulty rating buttons (Again/Hard/Good/Easy).
 * Color-coded with keyboard shortcut hints.
 */
export const DifficultyButtons = ({
  onRate,
  isSubmitting,
}: DifficultyButtonsProps) => (
  <div className="flex w-full max-w-2xl gap-3">
    {DIFFICULTY_OPTIONS.map((option) => (
      <button
        key={option.label}
        type="button"
        className={`flex flex-1 flex-col items-center gap-1 rounded-xl border px-4 py-4 transition-colors disabled:opacity-40 ${option.bg}`}
        disabled={isSubmitting}
        onClick={() => onRate({ quality: option.quality })}
      >
        <span className={`text-sm font-bold ${option.text}`}>{option.label}</span>
        <kbd className="text-xs text-muted-foreground font-mono">{option.key}</kbd>
      </button>
    ))}
  </div>
);
