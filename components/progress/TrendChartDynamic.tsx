"use client";

import dynamic from "next/dynamic";
import type { ChartPoint } from "./TrendChart";

const TrendChart = dynamic(
  () => import("./TrendChart").then((m) => m.TrendChart),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-xl border border-white/8 bg-white/3 p-4">
        <div className="h-3 w-24 rounded bg-white/8 mb-4 animate-pulse" />
        <div className="h-[140px] rounded bg-white/4 animate-pulse" />
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
