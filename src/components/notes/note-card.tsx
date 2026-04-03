import Link from "next/link";
import { Clock, Layers, Brain } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface NoteCardProps {
  /** Serialized note object from MongoDB. */
  note: {
    _id: string;
    title: string;
    subject: string;
    tags: string[];
    contentPlainText: string;
    flashcardCount: number;
    quizCount: number;
    createdAt: string;
  };
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Renders the subject badge. */
const SubjectBadge = ({ subject }: { subject: string }) => (
  <Badge variant="secondary">{subject}</Badge>
);

/** Renders up to 3 tag badges with an overflow indicator. */
const TagBadges = ({ tags }: { tags: string[] }) => {
  if (tags.length === 0) {
    return null;
  }

  const visible = tags.slice(0, 3);
  const remaining = tags.length - visible.length;

  return (
    <div className="flex flex-wrap gap-1">
      {visible.map((tag) => (
        <Badge key={tag} variant="outline" className="text-xs">
          {tag}
        </Badge>
      ))}
      {remaining > 0 && (
        <Badge variant="outline" className="text-xs">
          +{remaining}
        </Badge>
      )}
    </div>
  );
};

/** Truncates text to the given max length with an ellipsis. */
const truncateText = ({ text, maxLength }: { text: string; maxLength: number }) => {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};

/** Truncates plain text to the first 100 characters. */
const NoteExcerpt = ({ text }: { text: string }) => {
  const truncated = truncateText({ text, maxLength: 100 });
  return (
    <p className="line-clamp-2 text-sm text-muted-foreground">{truncated}</p>
  );
};

/** Formats a date string to a readable locale date. */
const FormattedDate = ({ dateString }: { dateString: string }) => {
  const date = new Date(dateString);
  const formatted = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <span className="flex items-center gap-1 text-xs text-muted-foreground">
      <Clock className="size-3" />
      {formatted}
    </span>
  );
};

/** Shows flashcard and quiz counts. */
const NoteCounts = ({
  flashcardCount,
  quizCount,
}: {
  flashcardCount: number;
  quizCount: number;
}) => (
  <div className="flex items-center gap-3 text-xs text-muted-foreground">
    <span className="flex items-center gap-1">
      <Layers className="size-3" />
      {flashcardCount}
    </span>
    <span className="flex items-center gap-1">
      <Brain className="size-3" />
      {quizCount}
    </span>
  </div>
);

// ---------------------------------------------------------------------------
// NoteCard
// ---------------------------------------------------------------------------

/**
 * Card component previewing a note: title, subject, tags, excerpt,
 * date, and flashcard/quiz counts. Links to the note detail page.
 */
export const NoteCard = ({ note }: NoteCardProps) => (
  <Link href={`/notes/${note._id}`} className="group">
    <Card className="h-full transition-shadow group-hover:shadow-md">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="line-clamp-1">{note.title}</CardTitle>
          <SubjectBadge subject={note.subject} />
        </div>
        <CardDescription className="sr-only">
          Note in {note.subject}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <NoteExcerpt text={note.contentPlainText} />
        <TagBadges tags={note.tags} />
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <FormattedDate dateString={note.createdAt} />
        <NoteCounts
          flashcardCount={note.flashcardCount}
          quizCount={note.quizCount}
        />
      </CardFooter>
    </Card>
  </Link>
);
