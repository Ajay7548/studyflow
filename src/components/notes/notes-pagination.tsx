// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface NotesPaginationProps {
  page: number;
  totalPages: number;
}

interface PaginationLinkProps {
  page: number;
  disabled: boolean;
  label: string;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** A single pagination link that is disabled at bounds. */
const PaginationLink = ({ page, disabled, label }: PaginationLinkProps) => {
  if (disabled) {
    return (
      <span className="text-sm text-muted-foreground/50">{label}</span>
    );
  }

  return (
    <a
      href={`/notes?page=${page}`}
      className="text-sm font-medium text-primary hover:underline"
    >
      {label}
    </a>
  );
};

// ---------------------------------------------------------------------------
// NotesPagination
// ---------------------------------------------------------------------------

/** Simple previous/next pagination displayed below the note grid. */
export const NotesPagination = ({ page, totalPages }: NotesPaginationProps) => {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-center gap-4 pt-4">
      <PaginationLink page={page - 1} disabled={page <= 1} label="Previous" />
      <span className="text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </span>
      <PaginationLink
        page={page + 1}
        disabled={page >= totalPages}
        label="Next"
      />
    </div>
  );
};
