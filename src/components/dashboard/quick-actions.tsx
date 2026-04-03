import Link from "next/link";
import { FileText, Repeat, Brain, BookOpen } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface QuickActionsProps {
  cardsDue: number;
}

interface ActionItem {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ACTIONS: ActionItem[] = [
  {
    href: "/notes/new",
    icon: FileText,
    title: "Create Note",
    description: "Write a new study note",
  },
  {
    href: "/review",
    icon: Repeat,
    title: "Review Cards",
    description: "Practice due flashcards",
  },
  {
    href: "/quizzes",
    icon: Brain,
    title: "Take Quiz",
    description: "Test your knowledge",
  },
  {
    href: "/notes",
    icon: BookOpen,
    title: "Browse Notes",
    description: "View all your notes",
  },
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Renders a badge showing the number of due cards, if any. */
const DueBadge = ({ count }: { count: number }) => {
  if (count === 0) return null;
  return <Badge variant="secondary">{count} due</Badge>;
};

/** Renders a single quick-action card. */
const ActionCard = ({
  action,
  cardsDue,
}: {
  action: ActionItem;
  cardsDue: number;
}) => {
  const Icon = action.icon;
  const showBadge = action.href === "/review";

  return (
    <Link href={action.href} className="group">
      <Card className="transition-shadow group-hover:shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <Icon className="size-5 text-primary" />
            </div>
            {showBadge && <DueBadge count={cardsDue} />}
          </div>
          <CardTitle>{action.title}</CardTitle>
          <CardDescription>{action.description}</CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
};

// ---------------------------------------------------------------------------
// QuickActions
// ---------------------------------------------------------------------------

/**
 * Displays quick action cards linking to key features.
 * The "Review Cards" action shows a badge with the number of due cards.
 */
export const QuickActions = ({ cardsDue }: QuickActionsProps) => (
  <div>
    <h2 className="mb-4 text-lg font-semibold">Quick Actions</h2>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {ACTIONS.map((action) => (
        <ActionCard key={action.href} action={action} cardsDue={cardsDue} />
      ))}
    </div>
  </div>
);
