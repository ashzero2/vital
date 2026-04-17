"use client";

import dynamic from "next/dynamic";
import type { ChartPoint } from "./TrendChart";

const TrendChart = dynamic(
  () => import("./TrendChart").then((m) => m.TrendChart),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-xl border border-border bg-accent p-4">
        <div className="h-3 w-24 rounded bg-muted mb-4 animate-pulse" />
        <div className="h-[140px] rounded bg-accent animate-pulse" />
      </div>
    ),
  }
);

interface Props {
  data: ChartPoint[];
  label: string;
  unit: string;
  color?: string;
  referenceLine?: number;
}

export function TrendChartDynamic(props: Props) {
  return <TrendChart {...props} />;
}
