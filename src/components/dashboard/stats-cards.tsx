import { FileText, Repeat, Brain, Flame } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  description: string;
}

interface StatsCardsProps {
  notesCount: number;
  cardsDue: number;
  quizzesCompleted: number;
  studyStreak: number;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Renders a single stat card with icon, value, and description. */
const StatCard = ({ icon: Icon, label, value, description }: StatCardProps) => (
  <Card>
    <CardHeader>
      <div className="flex items-center justify-between">
        <CardDescription>{label}</CardDescription>
        <div className="flex size-8 items-center justify-center rounded-md bg-primary/10">
          <Icon className="size-4 text-primary" />
        </div>
      </div>
      <CardTitle className="text-2xl font-bold">{value}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
  </Card>
);

// ---------------------------------------------------------------------------
// StatsCards
// ---------------------------------------------------------------------------

/**
 * Server component displaying four stat cards in a responsive grid:
 * notes count, flashcards due, quizzes completed, and study streak.
 */
export const StatsCards = ({
  notesCount,
  cardsDue,
  quizzesCompleted,
  studyStreak,
}: StatsCardsProps) => (
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
    <StatCard
      icon={FileText}
      label="Total Notes"
      value={notesCount}
      description="Study notes created"
    />
    <StatCard
      icon={Repeat}
      label="Cards Due"
      value={cardsDue}
      description="Flashcards ready for review"
    />
    <StatCard
      icon={Brain}
      label="Quizzes Completed"
      value={quizzesCompleted}
      description="Knowledge checks passed"
    />
    <StatCard
      icon={Flame}
      label="Study Streak"
      value={studyStreak}
      description="Consecutive days studied"
    />
  </div>
);
