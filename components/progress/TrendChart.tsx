"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";

export interface ChartPoint {
  date: string;
  value: number;
}

interface TrendChartProps {
  data: ChartPoint[];
  label: string;
  unit: string;
  color?: string;
  referenceLine?: number;
}

function CustomTooltip({
  active,
  payload,
  label,
  unit,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
  unit: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-lg border border-border px-3 py-2 text-sm bg-card"
    >
      <p className="text-muted-foreground text-[11px] mb-0.5">{label}</p>
      <p className="text-foreground font-semibold">
        {payload[0].value.toFixed(1)}
        <span className="text-muted-foreground font-normal ml-1 text-xs">{unit}</span>
      </p>
    </div>
  );
}

export function TrendChart({
  data,
  label,
  unit,
  color = "#a3e635",
  referenceLine,
}: TrendChartProps) {
  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const padding = Math.max((max - min) * 0.2, 0.5);

  return (
    <div className="rounded-xl border border-border bg-accent p-4 pb-2">
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-4">{label}</p>
      <ResponsiveContainer width="100%" height={140}>
        <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.04)"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            tickMargin={8}
          />
          <YAxis
            domain={[min - padding, max + padding]}
            tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => v.toFixed(1)}
            width={40}
          />
          <Tooltip
            content={(props) => (
              <CustomTooltip
                active={props.active}
                payload={props.payload as unknown as { value: number }[] | undefined}
                label={props.label as string | undefined}
                unit={unit}
              />
            )}
            cursor={{ stroke: "rgba(255,255,255,0.1)", strokeWidth: 1 }}
          />
          {referenceLine != null && (
            <ReferenceLine
              y={referenceLine}
              stroke="rgba(255,255,255,0.15)"
              strokeDasharray="4 4"
            />
          )}
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={{ fill: "#fff", stroke: color, strokeWidth: 2, r: 3 }}
            activeDot={{ fill: color, stroke: "#0a0a0a", strokeWidth: 2, r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
