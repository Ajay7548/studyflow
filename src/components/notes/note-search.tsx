"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SUBJECTS } from "@/lib/constants";
import { useDebounce } from "@/hooks/use-debounce";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SubjectFilterProps {
  value: string;
  onValueChange: ({ subject }: { subject: string }) => void;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Native select for filtering notes by subject. */
const SubjectFilter = ({ value, onValueChange }: SubjectFilterProps) => (
  <select
    value={value}
    onChange={(e) => onValueChange({ subject: e.target.value })}
    className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 sm:w-48"
    aria-label="Filter by subject"
  >
    <option value="" className="bg-background text-foreground">All Subjects</option>
    {SUBJECTS.map((s) => (
      <option key={s} value={s} className="bg-background text-foreground">
        {s}
      </option>
    ))}
  </select>
);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface BuildSearchUrlParams {
  search: string;
  subject: string;
}

/** Constructs a URL path with non-empty query parameters. */
const buildSearchUrl = ({ search, subject }: BuildSearchUrlParams): string => {
  const params = new URLSearchParams();
  if (search) {
    params.set("search", search);
  }
  if (subject) {
    params.set("subject", subject);
  }
  const qs = params.toString();
  if (!qs) return "/notes";
  return `/notes?${qs}`;
};

// ---------------------------------------------------------------------------
// NoteSearch
// ---------------------------------------------------------------------------

/**
 * Client component with a debounced search input and subject filter.
 * Updates the URL search params to drive server-side data fetching.
 */
export const NoteSearch = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [subject, setSubject] = useState(searchParams.get("subject") ?? "");

  const debouncedSearch = useDebounce({ value: search, delay: 400 });

  const navigateWithParams = useCallback(
    ({ search: s, subject: sub }: BuildSearchUrlParams) => {
      const url = buildSearchUrl({ search: s, subject: sub });
      router.push(url);
    },
    [router],
  );

  useEffect(() => {
    navigateWithParams({ search: debouncedSearch, subject });
  }, [debouncedSearch, subject, navigateWithParams]);

  const handleSubjectChange = useCallback(
    ({ subject: s }: { subject: string }) => {
      setSubject(s);
    },
    [],
  );

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search notes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
          aria-label="Search notes"
        />
      </div>
      <SubjectFilter value={subject} onValueChange={handleSubjectChange} />
    </div>
  );
};
