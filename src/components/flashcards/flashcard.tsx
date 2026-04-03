"use client";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FlashcardProps {
  front: string;
  back: string;
  isFlipped: boolean;
  onFlip: () => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const getCardRotation = ({ isFlipped }: { isFlipped: boolean }) => {
  if (isFlipped) return "rotateY(180deg)";
  return "rotateY(0deg)";
};

const getFaceRotation = ({ side }: { side: "front" | "back" }) => {
  if (side === "front") return "rotateY(0deg)";
  return "rotateY(180deg)";
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** One face of the flashcard (front or back). */
const CardFace = ({
  label,
  text,
  side,
}: {
  label: string;
  text: string;
  side: "front" | "back";
}) => {
  const isFront = side === "front";
  const accentColor = isFront ? "text-blue-400" : "text-emerald-400";
  const dotColor = isFront ? "bg-blue-400" : "bg-emerald-400";

  return (
    <div
      className="absolute inset-0"
      style={{ transform: getFaceRotation({ side }), backfaceVisibility: "hidden" }}
    >
      <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-border/50 bg-card p-10 shadow-lg">
        <div className="mb-6 flex items-center gap-2">
          <span className={`inline-block size-2 rounded-full ${dotColor}`} />
          <span className={`text-xs font-semibold uppercase tracking-widest ${accentColor}`}>
            {label}
          </span>
        </div>
        <p className="max-w-lg text-center text-xl leading-relaxed font-medium">
          {text}
        </p>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Animated flashcard with 3D flip transition.
 * Click or press Space to reveal the answer.
 */
export const Flashcard = ({ front, back, isFlipped, onFlip }: FlashcardProps) => (
  <div className="flex flex-col items-center">
    <button
      type="button"
      onClick={onFlip}
      className="w-full max-w-2xl cursor-pointer focus:outline-none"
      style={{ perspective: "1200px" }}
      aria-label={isFlipped ? "Showing answer" : "Showing question"}
    >
      <div
        className="relative h-80 w-full transition-transform duration-500 ease-in-out"
        style={{ transformStyle: "preserve-3d", transform: getCardRotation({ isFlipped }) }}
      >
        <CardFace label="Question" text={front} side="front" />
        <CardFace label="Answer" text={back} side="back" />
      </div>
    </button>

    <p className="mt-4 text-sm text-muted-foreground">
      Click or press <kbd className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">Space</kbd> to flip
    </p>
  </div>
);
