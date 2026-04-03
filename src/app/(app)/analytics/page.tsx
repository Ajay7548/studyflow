import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import {
  resolvePeriod,
  getPeriodStart,
  fetchDailyStudy,
  fetchQuizScores,
  fetchSubjectBreakdown,
  computeSummary,
  computeAvgQuizScore,
  VALID_PERIODS,
  type Period,
} from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { ChartsSection } from "@/components/analytics/charts-section";

/** @see https://nextjs.org/docs/app/api-reference/functions/generate-metadata */
export const metadata: Metadata = {
  title: "Analytics | StudyFlow",
};

/** Extracts a string param or returns undefined if not a string. */
const extractStringParam = ({ value }: { value: string | string[] | undefined }): string | undefined => {
  if (typeof value === "string") return value;
  return undefined;
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Renders a small summary stat. */
const SummaryStat = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => (
  <div className="space-y-1">
    <p className="text-sm text-muted-foreground">{label}</p>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);

/** Returns the appropriate class for a period filter link. */
const getPeriodLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "rounded-md px-3 py-1 text-sm transition-colors",
    isActive && "bg-primary text-primary-foreground",
    !isActive && "text-muted-foreground hover:bg-muted"
  );

/** Renders the period filter links. */
const PeriodFilter = ({ current }: { current: Period }) => (
  <div className="flex gap-1">
    {VALID_PERIODS.map((p) => (
      <Link
        key={p}
        href={`/analytics?period=${p}`}
        className={getPeriodLinkClass({ isActive: p === current })}
      >
        {p}
      </Link>
    ))}
  </div>
);

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AnalyticsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

/**
 * Analytics page. Server component that awaits searchParams for the
 * period filter and fetches aggregated study data from MongoDB.
 */
const AnalyticsPage = async ({ searchParams }: AnalyticsPageProps) => {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/signin");
  }

  const resolved = await searchParams;
  const rawPeriod = extractStringParam({ value: resolved.period });
  const period = resolvePeriod({ raw: rawPeriod });
  const since = getPeriodStart({ period });

  await connectDB();
  const userId = session.user.id;

  const [dailyStudy, quizScores, subjects, summary, avgScore] =
    await Promise.all([
      fetchDailyStudy({ userId, since }),
      fetchQuizScores({ userId, since }),
      fetchSubjectBreakdown({ userId }),
      computeSummary({ userId, since }),
      computeAvgQuizScore({ userId, since }),
    ]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Track your study habits and performance.
          </p>
        </div>
        <PeriodFilter current={period} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryStat label="Total Study Time" value={`${summary.totalMinutes}m`} />
        <SummaryStat label="Sessions" value={String(summary.sessionCount)} />
        <SummaryStat label="Avg Session" value={`${summary.avgDuration}m`} />
        <SummaryStat label="Avg Quiz Score" value={`${avgScore}%`} />
      </div>

      <ChartsSection
        dailyStudy={dailyStudy}
        quizScores={quizScores}
        subjects={subjects}
      />
    </div>
  );
};

export default AnalyticsPage;
