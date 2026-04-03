"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DailyStudyPoint {
  date: string;
  minutes: number;
}

interface StudyChartProps {
  data: DailyStudyPoint[];
}

// ---------------------------------------------------------------------------
// StudyChart
// ---------------------------------------------------------------------------

/**
 * Client component rendering an area chart of daily study minutes
 * over the selected period using Recharts.
 */
export const StudyChart = ({ data }: StudyChartProps) => {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        No study data for this period.
      </div>
    );
  }

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={256}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="studyGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12, fill: "#9ca3af" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "#9ca3af" }}
            tickLine={false}
            axisLine={false}
            unit="m"
          />
          <Tooltip
            contentStyle={{
              borderRadius: "8px",
              fontSize: "12px",
              border: "1px solid hsl(var(--border))",
              backgroundColor: "hsl(var(--card))",
              color: "hsl(var(--card-foreground))",
            }}
            labelStyle={{ color: "hsl(var(--muted-foreground))" }}
            formatter={(value) => [`${Number(value)} min`, "Study Time"]}
          />
          <Area
            type="monotone"
            dataKey="minutes"
            stroke="#3b82f6"
            fill="url(#studyGradient)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
