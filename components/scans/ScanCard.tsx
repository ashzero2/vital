import Link from "next/link";
import { classifyBMI, classifyBodyFat, bmiColor, bodyFatColor } from "@/lib/utils/inbody-metrics";
import { ArrowRight } from "lucide-react";

interface ScanCardProps {
  id: string;
  scanDate: Date | string;
  weightKg: number;
  bodyFatPercent: number;
  skeletalMuscleMassKg: number;
  bmi: number;
  visceralFatLevel?: number | null;
}

function fmt(n: number, decimals = 1) {
  return n.toFixed(decimals);
}

function fmtDate(d: Date | string) {
  return new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function ScanCard({ id, scanDate, weightKg, bodyFatPercent, skeletalMuscleMassKg, bmi, visceralFatLevel }: ScanCardProps) {
  const bmiCat = classifyBMI(bmi);
  const bfCat = classifyBodyFat(bodyFatPercent);

  return (
    <Link
      href={`/scans/${id}`}
      className="group flex items-center justify-between rounded-xl border border-border bg-accent px-5 py-4 transition-all hover:border-border hover:bg-muted"
    >
      <div className="flex items-center gap-6">
        {/* Date */}
        <div className="w-28 shrink-0">
          <p className="text-sm font-medium text-foreground">{fmtDate(scanDate)}</p>
        </div>

        {/* Metrics row */}
        <div className="flex items-center gap-8">
          <Metric label="Weight" value={`${fmt(weightKg)} kg`} />
          <Metric
            label="Body Fat"
            value={`${fmt(bodyFatPercent)}%`}
            valueClass={bodyFatColor(bfCat)}
            sub={bfCat}
          />
          <Metric label="SMM" value={`${fmt(skeletalMuscleMassKg)} kg`} className="hidden sm:block" />
          <Metric
            label="BMI"
            value={fmt(bmi)}
            valueClass={bmiColor(bmiCat)}
            sub={bmiCat}
            className="hidden md:block"
          />
          {visceralFatLevel != null && (
            <Metric label="VFL" value={fmt(visceralFatLevel, 0)} className="hidden lg:block" />
          )}
        </div>
      </div>

      <ArrowRight size={16} className="text-muted-foreground/50 transition-all group-hover:translate-x-1 group-hover:text-foreground/80" />
    </Link>
  );
}

function Metric({
  label,
  value,
  valueClass = "text-foreground",
  sub,
  className = "",
}: {
  label: string;
  value: string;
  valueClass?: string;
  sub?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className={`text-sm font-semibold ${valueClass}`}>{value}</p>
      {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
    </div>
  );
}
