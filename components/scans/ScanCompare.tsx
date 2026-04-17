import { calculateScanDelta, deltaColor } from "@/lib/utils/inbody-metrics";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";

type ScanLike = {
  weightKg: number;
  bodyFatPercent: number;
  bodyFatMassKg: number;
  skeletalMuscleMassKg: number;
  leanBodyMassKg: number;
  bmi: number;
  visceralFatLevel?: number | null;
};

interface ScanCompareProps {
  current: ScanLike;
  previous: ScanLike;
  previousDate: Date | string;
}

const METRICS: {
  key: keyof ReturnType<typeof calculateScanDelta>;
  label: string;
  unit: string;
  lowerIsBetter?: boolean;
}[] = [
  { key: "weightKg", label: "Weight", unit: "kg" },
  { key: "bodyFatPercent", label: "Body Fat", unit: "%", lowerIsBetter: true },
  { key: "bodyFatMassKg", label: "Fat Mass", unit: "kg", lowerIsBetter: true },
  { key: "skeletalMuscleMassKg", label: "SMM", unit: "kg" },
  { key: "leanBodyMassKg", label: "LBM", unit: "kg" },
  { key: "bmi", label: "BMI", unit: "" },
  { key: "visceralFatLevel", label: "Visceral Fat", unit: "", lowerIsBetter: true },
];

export function ScanCompare({ current, previous, previousDate }: ScanCompareProps) {
  const delta = calculateScanDelta(current, previous);
  const prevDateStr = new Date(previousDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="rounded-xl border border-border bg-accent p-5">
      <p className="mb-4 text-xs uppercase tracking-widest text-muted-foreground">
        vs. scan from {prevDateStr}
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {METRICS.map(({ key, label, unit, lowerIsBetter }) => {
          const val = delta[key];
          if (val === null) return null;
          const color = deltaColor(val, lowerIsBetter);
          const isPos = val > 0;
          const isNeg = val < 0;
          const sign = isPos ? "+" : "";

          return (
            <div key={key} className="rounded-lg border border-border bg-accent p-3">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
              <div className={`mt-1 flex items-center gap-1 ${color}`}>
                {isPos && <TrendingUp size={12} />}
                {isNeg && <TrendingDown size={12} />}
                {!isPos && !isNeg && <Minus size={12} />}
                <span className="text-sm font-semibold">
                  {sign}{val}{unit}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
