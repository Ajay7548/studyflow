"use client";

import dynamic from "next/dynamic";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// ---------------------------------------------------------------------------
// Dynamic imports for Recharts (client-only, no SSR)
// ---------------------------------------------------------------------------

const ChartSkeleton = () => <Skeleton className="h-[300px] w-full" />;

const StudyChart = dynamic(
  () =>
    import("@/components/analytics/study-chart").then((m) => m.StudyChart),
  { ssr: false, loading: ChartSkeleton }
);

const PerformanceChart = dynamic(
  () =>
    import("@/components/analytics/performance-chart").then(
      (m) => m.PerformanceChart
    ),
  { ssr: false, loading: ChartSkeleton }
);

const SubjectBreakdown = dynamic(
  () =>
    import("@/components/analytics/subject-breakdown").then(
      (m) => m.SubjectBreakdown
    ),
  { ssr: false, loading: ChartSkeleton }
);

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ChartsSectionProps {
  dailyStudy: Array<{ date: string; minutes: number }>;
  quizScores: Array<{ date: string; score: number }>;
  subjects: Array<{ subject: string; count: number }>;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/** Renders all analytics charts. Client component to allow dynamic imports with ssr: false. */
export const ChartsSection = ({
  dailyStudy,
  quizScores,
  subjects,
}: ChartsSectionProps) => (
  <>
    <Card>
      <CardHeader>
        <CardTitle>Study Time</CardTitle>
        <CardDescription>Minutes studied per day</CardDescription>
      </CardHeader>
      <CardContent>
        <StudyChart data={dailyStudy} />
      </CardContent>
    </Card>

    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Quiz Performance</CardTitle>
          <CardDescription>Score trend over time</CardDescription>
        </CardHeader>
        <CardContent>
          <PerformanceChart data={quizScores} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Subjects</CardTitle>
          <CardDescription>Notes by subject</CardDescription>
        </CardHeader>
        <CardContent>
          <SubjectBreakdown data={subjects} />
        </CardContent>
      </Card>
    </div>
  </>
);
