import { NextRequest, NextResponse } from "next/server";
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
} from "@/lib/analytics";

// ---------------------------------------------------------------------------
// GET /api/analytics
// ---------------------------------------------------------------------------

/**
 * Returns aggregated analytics data for the authenticated user.
 * Accepts an optional `period` query param (7d, 30d, 90d).
 */
export const GET = async (request: NextRequest) => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const url = new URL(request.url);
    const period = resolvePeriod({
      raw: url.searchParams.get("period") ?? undefined,
    });
    const since = getPeriodStart({ period });
    const userId = session.user.id;

    const [dailyStudy, summary, quizScores, avgQuizScore, subjects] =
      await Promise.all([
        fetchDailyStudy({ userId, since }),
        computeSummary({ userId, since }),
        fetchQuizScores({ userId, since }),
        computeAvgQuizScore({ userId, since }),
        fetchSubjectBreakdown({ userId }),
      ]);

    return NextResponse.json({
      period,
      dailyStudy,
      summary,
      quizScores,
      avgQuizScore,
      subjects,
    });
  } catch (error) {
    console.error("[GET /api/analytics]", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
};
