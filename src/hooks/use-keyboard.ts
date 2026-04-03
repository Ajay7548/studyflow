"use client";

import { useEffect } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface UseKeyboardParams {
  /** Map of keyboard keys to handler functions. */
  shortcuts: Record<string, () => void>;
  /** Whether the shortcuts are currently active. Defaults to true. */
  enabled?: boolean;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Registers global keyboard shortcuts and cleans up on unmount.
 *
 * Ignores events when the active element is an input, textarea, or
 * contenteditable to avoid interfering with text entry.
 */
export const useKeyboard = ({
  shortcuts,
  enabled = true,
}: UseKeyboardParams) => {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (isTypingInInput({ target: event.target })) return;

      const handler = shortcuts[event.key];
      if (!handler) return;

      event.preventDefault();
      handler();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shortcuts, enabled]);
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns true when the event target is an editable field. */
const isTypingInInput = ({ target }: { target: EventTarget | null }) => {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;

  const tag = target.tagName.toLowerCase();
  return tag === "input" || tag === "textarea" || tag === "select";
};
