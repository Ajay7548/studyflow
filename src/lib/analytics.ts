import mongoose from "mongoose";
import { StudySession, Quiz, Note } from "@/models";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Period = "7d" | "30d" | "90d";

export interface DailyStudyPoint {
  date: string;
  minutes: number;
}

export interface QuizScorePoint {
  date: string;
  score: number;
}

export interface SubjectDataPoint {
  subject: string;
  count: number;
}

export interface StudySummary {
  totalMinutes: number;
  avgDuration: number;
  sessionCount: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export const VALID_PERIODS: Period[] = ["7d", "30d", "90d"];

/** Resolves the period query param with a default of 30d. */
export const resolvePeriod = ({ raw }: { raw: string | undefined }): Period => {
  if (raw && VALID_PERIODS.includes(raw as Period)) return raw as Period;
  return "30d";
};

/** Returns a Date representing the start of the given period. */
export const getPeriodStart = ({ period }: { period: Period }): Date => {
  const days = { "7d": 7, "30d": 30, "90d": 90 }[period];
  const start = new Date();
  start.setDate(start.getDate() - days);
  start.setHours(0, 0, 0, 0);
  return start;
};

/** Converts a string userId to a Mongoose ObjectId for aggregation queries. */
const toObjectId = ({ id }: { id: string }) =>
  new mongoose.Types.ObjectId(id);

// ---------------------------------------------------------------------------
// Aggregation queries
// ---------------------------------------------------------------------------

/** Fetches daily study minutes grouped by date. Duration stored in seconds, converted to minutes. */
export const fetchDailyStudy = async ({
  userId,
  since,
}: {
  userId: string;
  since: Date;
}): Promise<DailyStudyPoint[]> =>
  StudySession.aggregate([
    { $match: { userId: toObjectId({ id: userId }), date: { $gte: since } } },
    {
      $group: {
        _id: { $dateToString: { format: "%m/%d", date: "$date" } },
        totalSeconds: { $sum: "$duration" },
      },
    },
    { $sort: { _id: 1 } },
    { $project: { _id: 0, date: "$_id", minutes: { $round: [{ $divide: ["$totalSeconds", 60] }, 1] } } },
  ]);

/** Fetches quiz scores over time. */
export const fetchQuizScores = async ({
  userId,
  since,
}: {
  userId: string;
  since: Date;
}): Promise<QuizScorePoint[]> =>
  Quiz.aggregate([
    {
      $match: {
        userId: toObjectId({ id: userId }),
        status: "completed",
        completedAt: { $gte: since },
        score: { $ne: null },
      },
    },
    { $sort: { completedAt: 1 } },
    {
      $project: {
        _id: 0,
        date: { $dateToString: { format: "%m/%d", date: "$completedAt" } },
        score: 1,
      },
    },
  ]);

/** Fetches note counts grouped by subject. */
export const fetchSubjectBreakdown = async ({
  userId,
}: {
  userId: string;
}): Promise<SubjectDataPoint[]> =>
  Note.aggregate([
    { $match: { userId: toObjectId({ id: userId }) } },
    { $group: { _id: "$subject", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
    { $project: { _id: 0, subject: "$_id", count: 1 } },
  ]);

/** Computes summary stats. Duration in seconds, converted to minutes for display. */
export const computeSummary = async ({
  userId,
  since,
}: {
  userId: string;
  since: Date;
}): Promise<StudySummary> => {
  const [result] = await StudySession.aggregate([
    { $match: { userId: toObjectId({ id: userId }), date: { $gte: since } } },
    {
      $group: {
        _id: null,
        totalSeconds: { $sum: "$duration" },
        avgSeconds: { $avg: "$duration" },
        sessionCount: { $sum: 1 },
      },
    },
  ]);

  return {
    totalMinutes: Math.round((result?.totalSeconds ?? 0) / 60),
    avgDuration: Math.round((result?.avgSeconds ?? 0) / 60),
    sessionCount: result?.sessionCount ?? 0,
  };
};

/** Computes average quiz score over the period. */
export const computeAvgQuizScore = async ({
  userId,
  since,
}: {
  userId: string;
  since: Date;
}): Promise<number> => {
  const [result] = await Quiz.aggregate([
    {
      $match: {
        userId: toObjectId({ id: userId }),
        status: "completed",
        completedAt: { $gte: since },
        score: { $ne: null },
      },
    },
    { $group: { _id: null, avg: { $avg: "$score" } } },
  ]);
  return Math.round(result?.avg ?? 0);
};
