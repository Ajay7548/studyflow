"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SessionStats {
  reviewed: number;
  correct: number;
  startTime: number;
}

interface SessionSummaryProps {
  stats: SessionStats;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Formats milliseconds into a human-readable duration string. */
const formatDuration = ({ ms }: { ms: number }) => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes === 0) return `${seconds}s`;
  return `${minutes}m ${seconds}s`;
};

/** Computes accuracy as a whole-number percentage. */
const computeAccuracy = ({ correct, total }: { correct: number; total: number }) => {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
};

/** Logs the completed review session to the server. */
const logStudySession = async ({
  stats,
  durationMs,
}: {
  stats: SessionStats;
  durationMs: number;
}) => {
  await fetch("/api/study-sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "review",
      duration: Math.floor(durationMs / 1000),
      cardsReviewed: stats.reviewed,
      correctCards: stats.correct,
      date: new Date().toISOString(),
    }),
  });
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Displays a single stat (label + value) in the summary grid. */
const StatItem = ({ label, value }: { label: string; value: string }) => (
  <div className="text-center">
    <p className="text-2xl font-bold">{value}</p>
    <p className="text-sm text-muted-foreground">{label}</p>
  </div>
);

/** Action buttons shown after the summary. */
const SummaryActions = () => (
  <div className="flex gap-3">
    <Link href="/dashboard">
      <Button variant="outline">Back to Dashboard</Button>
    </Link>
    <Link href="/review">
      <Button>Review More</Button>
    </Link>
  </div>
);

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Summary screen shown after a review session completes.
 * Displays cards reviewed, accuracy, and time taken.
 * Logs the session to the server on mount.
 */
export const SessionSummary = ({ stats }: SessionSummaryProps) => {
  const hasLogged = useRef(false);
  const durationMs = Date.now() - stats.startTime;
  const accuracy = computeAccuracy({ correct: stats.correct, total: stats.reviewed });

  useEffect(() => {
    if (hasLogged.current) return;
    hasLogged.current = true;
    logStudySession({ stats, durationMs });
  }, [stats, durationMs]);

  return (
    <div className="flex flex-col items-center gap-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Session Complete</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-4">
          <StatItem label="Reviewed" value={String(stats.reviewed)} />
          <StatItem label="Accuracy" value={`${accuracy}%`} />
          <StatItem label="Time" value={formatDuration({ ms: durationMs })} />
        </CardContent>
      </Card>
      <SummaryActions />
    </div>
  );
};
