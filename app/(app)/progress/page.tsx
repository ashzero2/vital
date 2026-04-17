import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { TrendingUp, ScanLine } from "lucide-react";
import Link from "next/link";
import { TrendChartDynamic } from "@/components/progress/TrendChartDynamic";
import { ScanTimeline } from "@/components/progress/ScanTimeline";
import type { ChartPoint } from "@/components/progress/TrendChart";

function fmtChartDate(d: Date | string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function toPoints(
  scans: { scanDate: Date; value: number | null }[]
): ChartPoint[] {
  return scans
    .filter((s): s is { scanDate: Date; value: number } => s.value != null)
    .map((s) => ({ date: fmtChartDate(s.scanDate), value: s.value }));
}

export default async function ProgressPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const scans = await prisma.inBodyScan.findMany({
    where: { userId: session.user.id },
    orderBy: { scanDate: "asc" },
    select: {
      id: true,
      scanDate: true,
      weightKg: true,
      bodyFatPercent: true,
      skeletalMuscleMassKg: true,
      visceralFatLevel: true,
      bmi: true,
      notes: true,
    },
  });

  const hasEnough = scans.length >= 2;

  // Build chart data series
  const weightPoints = toPoints(scans.map((s) => ({ scanDate: s.scanDate, value: s.weightKg })));
  const bfPoints = toPoints(scans.map((s) => ({ scanDate: s.scanDate, value: s.bodyFatPercent })));
  const smmPoints = toPoints(scans.map((s) => ({ scanDate: s.scanDate, value: s.skeletalMuscleMassKg })));
  const vflPoints = toPoints(
    scans
      .filter((s) => s.visceralFatLevel != null)
      .map((s) => ({ scanDate: s.scanDate, value: s.visceralFatLevel }))
  );
  const bmiPoints = toPoints(scans.map((s) => ({ scanDate: s.scanDate, value: s.bmi })));

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1
          className="text-2xl font-bold text-foreground tracking-tight"
          style={{ fontFamily: "var(--font-syne), sans-serif" }}
        >
          Progress
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          {scans.length} {scans.length === 1 ? "scan" : "scans"} recorded
        </p>
      </div>

      {/* Empty state — fewer than 2 scans */}
      {!hasEnough && (
        <div className="mb-8 flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-accent py-14 text-center">
          <div className="w-12 h-12 rounded-xl border border-border bg-accent flex items-center justify-center mb-4">
            <TrendingUp size={22} className="text-muted-foreground/50" />
          </div>
          <p className="text-sm font-medium text-muted-foreground mb-1">
            {scans.length === 0 ? "No scans yet" : "Need one more scan"}
          </p>
          <p className="text-xs text-muted-foreground mb-5 max-w-xs">
            {scans.length === 0
              ? "Add at least 2 scans to start tracking your progress over time."
              : "Add a second scan to unlock trend charts and see how your body is changing."}
          </p>
          <Link
            href="/scans/new"
            className="flex items-center gap-2 rounded-lg bg-lime-400 px-4 py-2 text-sm font-bold text-black hover:opacity-90 transition-opacity"
          >
            <ScanLine size={14} />
            {scans.length === 0 ? "Add First Scan" : "Add Scan"}
          </Link>
        </div>
      )}

      {/* Trend charts */}
      {hasEnough && (
        <section className="mb-8">
          <h2 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-4">Trends</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <TrendChartDynamic
              data={weightPoints}
              label="Weight"
              unit="kg"
              color="#a3e635"
            />
            <TrendChartDynamic
              data={bfPoints}
              label="Body Fat %"
              unit="%"
              color="#f87171"
            />
            <TrendChartDynamic
              data={smmPoints}
              label="Skeletal Muscle Mass"
              unit="kg"
              color="#60a5fa"
            />
            <TrendChartDynamic
              data={bmiPoints}
              label="BMI"
              unit=""
              color="#fb923c"
              referenceLine={24.9}
            />
            {vflPoints.length >= 2 && (
              <div className="sm:col-span-2">
                <TrendChartDynamic
                  data={vflPoints}
                  label="Visceral Fat Level"
                  unit=""
                  color="#c084fc"
                  referenceLine={10}
                />
              </div>
            )}
          </div>
        </section>
      )}

      {/* Scan timeline — always shown if any scans */}
      {scans.length > 0 && (
        <section>
          <h2 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-4">
            Scan History
          </h2>
          <ScanTimeline
            scans={scans.map((s) => ({
              id: s.id,
              scanDate: s.scanDate,
              weightKg: s.weightKg,
              bodyFatPercent: s.bodyFatPercent,
              skeletalMuscleMassKg: s.skeletalMuscleMassKg,
              notes: s.notes,
            }))}
          />
        </section>
      )}
    </div>
  );
}
