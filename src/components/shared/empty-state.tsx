import Link from "next/link";
import { Button } from "@/components/ui/button";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface EmptyStateActionProps {
  label: string;
  href: string;
}

interface EmptyStateProps {
  /** Lucide icon component to render. */
  icon: React.ComponentType<{ className?: string }>;
  /** Heading text. */
  title: string;
  /** Descriptive subtext below the heading. */
  description: string;
  /** Optional CTA button that links to another page. */
  action?: EmptyStateActionProps;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Renders the optional action button linking to a page. */
const EmptyStateAction = ({ label, href }: EmptyStateActionProps) => (
  <Link href={href}>
    <Button>{label}</Button>
  </Link>
);

// ---------------------------------------------------------------------------
// EmptyState
// ---------------------------------------------------------------------------

/**
 * Reusable empty-state placeholder with an icon, title, description,
 * and an optional action button.
 */
export const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
    <div className="flex size-16 items-center justify-center rounded-full bg-muted">
      <Icon className="size-8 text-muted-foreground" />
    </div>
    <div className="space-y-1">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
    </div>
    {action && <EmptyStateAction label={action.label} href={action.href} />}
  </div>
);
