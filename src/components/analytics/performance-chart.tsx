"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface QuizScorePoint {
  date: string;
  score: number;
}

interface PerformanceChartProps {
  data: QuizScorePoint[];
}

// ---------------------------------------------------------------------------
// PerformanceChart
// ---------------------------------------------------------------------------

/**
 * Client component rendering a line chart of quiz score trends
 * over time using Recharts.
 */
export const PerformanceChart = ({ data }: PerformanceChartProps) => {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        No quiz data for this period.
      </div>
    );
  }

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={256}>
        <LineChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
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
            domain={[0, 100]}
            unit="%"
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
            formatter={(value) => [`${Number(value)}%`, "Score"]}
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
