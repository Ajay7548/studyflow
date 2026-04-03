import { Clock, BookOpen, Brain, Repeat } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SessionItem {
  _id: string;
  type: "review" | "quiz" | "note-reading";
  duration: number;
  cardsReviewed: number;
  score: number | null;
  date: string;
}

interface RecentActivityProps {
  sessions: SessionItem[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const SESSION_META: Record<
  SessionItem["type"],
  { label: string; icon: React.ComponentType<{ className?: string }> }
> = {
  review: { label: "Flashcard Review", icon: Repeat },
  quiz: { label: "Quiz", icon: Brain },
  "note-reading": { label: "Note Reading", icon: BookOpen },
};

/** Formats minutes into a human-readable duration string. */
const formatDuration = ({ minutes }: { minutes: number }): string => {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (m > 0) return `${h}h ${m}m`;
  return `${h}h`;
};

/** Formats an ISO date string to a short relative date. */
const formatDate = ({ iso }: { iso: string }): string => {
  const date = new Date(iso);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

/** Returns a detail string for the session based on its type. */
const getSessionDetail = ({ session }: { session: SessionItem }): string => {
  if (session.type === "review") return `${session.cardsReviewed} cards`;
  if (session.type === "quiz" && session.score !== null)
    return `Score: ${session.score}%`;
  return "";
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Renders a single activity row. */
const ActivityRow = ({ session }: { session: SessionItem }) => {
  const meta = SESSION_META[session.type];
  const Icon = meta.icon;
  const detail = getSessionDetail({ session });

  return (
    <div className="flex items-center gap-3 py-2">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted">
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <div className="flex-1 space-y-0.5">
        <p className="text-sm font-medium leading-none">{meta.label}</p>
        <p className="text-xs text-muted-foreground">
          {formatDuration({ minutes: session.duration })}
          {detail && ` · ${detail}`}
        </p>
      </div>
      <span className="text-xs text-muted-foreground">
        {formatDate({ iso: session.date })}
      </span>
    </div>
  );
};

/** Renders an empty state when there are no sessions yet. */
const EmptyActivity = () => (
  <div className="flex flex-col items-center gap-2 py-8 text-center">
    <Clock className="size-8 text-muted-foreground" />
    <p className="text-sm text-muted-foreground">No study sessions yet.</p>
    <p className="text-xs text-muted-foreground">
      Start reviewing flashcards or taking a quiz to track your progress.
    </p>
  </div>
);

// ---------------------------------------------------------------------------
// RecentActivity
// ---------------------------------------------------------------------------

/**
 * Displays the last 5 study sessions with type, duration, and date.
 * Shows an empty state when no sessions exist.
 */
export const RecentActivity = ({ sessions }: RecentActivityProps) => (
  <Card>
    <CardHeader>
      <CardTitle>Recent Activity</CardTitle>
      <CardDescription>Your last study sessions</CardDescription>
    </CardHeader>
    <CardContent>
      {sessions.length === 0 && <EmptyActivity />}
      {sessions.length > 0 && (
        <div className="divide-y">
          {sessions.map((s) => (
            <ActivityRow key={s._id} session={s} />
          ))}
        </div>
      )}
    </CardContent>
  </Card>
);
