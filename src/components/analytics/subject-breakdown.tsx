"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SubjectDataPoint {
  subject: string;
  count: number;
}

interface SubjectBreakdownProps {
  data: SubjectDataPoint[];
}

// ---------------------------------------------------------------------------
// SubjectBreakdown
// ---------------------------------------------------------------------------

/**
 * Horizontal bar chart showing notes per subject.
 * Uses explicit colors for dark mode visibility.
 */
export const SubjectBreakdown = ({ data }: SubjectBreakdownProps) => {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        No subject data available.
      </div>
    );
  }

  const chartHeight = Math.max(200, data.length * 50);

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 20, left: 0, bottom: 0 }}
        >
          <XAxis
            type="number"
            tick={{ fontSize: 12, fill: "#9ca3af" }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <YAxis
            type="category"
            dataKey="subject"
            tick={{ fontSize: 12, fill: "#9ca3af" }}
            tickLine={false}
            axisLine={false}
            width={100}
          />
          <Tooltip
            contentStyle={{
              borderRadius: "8px",
              fontSize: "12px",
              border: "1px solid hsl(var(--border))",
              backgroundColor: "hsl(var(--card))",
              color: "hsl(var(--card-foreground))",
            }}
            labelStyle={{ color: "hsl(var(--card-foreground))", fontWeight: 600 }}
            formatter={(value) => [`${Number(value)}`, "Notes"]}
            cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }}
          />
          <Bar
            dataKey="count"
            fill="#3b82f6"
            radius={[0, 6, 6, 0]}
            barSize={24}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
