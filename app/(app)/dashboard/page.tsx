import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import Link from "next/link";
import { Plus, Utensils, Dumbbell, ScanLine, TrendingDown, TrendingUp, ArrowRight } from "lucide-react";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function fmtDate(d: Date | string) {
  return new Date(d).toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });
}

function fmt(n: number | null | undefined, dec = 1) {
  return n != null ? n.toFixed(dec) : "—";
}

function daysSince(d: Date) {
  return Math.floor((Date.now() - new Date(d).getTime()) / 86_400_000);
}

function Delta({
  value,
  goodDirection,
  unit = "",
}: {
  value: number;
  goodDirection: "up" | "down" | "neutral";
  unit?: string;
}) {
  const sign = value > 0 ? "+" : "";
  const isGood =
    goodDirection === "neutral"
      ? null
      : goodDirection === "down"
      ? value < 0
      : value > 0;
  const color =
    isGood === null
      ? "text-muted-foreground/50"
      : isGood
      ? "text-emerald-400"
      : "text-red-400";
  const Icon = value > 0 ? TrendingUp : TrendingDown;

  return (
    <span className={`inline-flex items-center gap-0.5 text-[11px] font-medium ${color}`}>
      <Icon size={11} strokeWidth={2} />
      {sign}{value.toFixed(1)}{unit}
    </span>
  );
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const userId = session.user.id;
  const firstName = (session.user.name ?? session.user.email ?? "").split(" ")[0];

  // Parallel fetches
  const [latestScan, totalScans, bestBfScan, latestMealPlan, latestWorkoutPlan] = await Promise.all([
    prisma.inBodyScan.findFirst({
      where: { userId },
      orderBy: { scanDate: "desc" },
    }),
    prisma.inBodyScan.count({ where: { userId } }),
    prisma.inBodyScan.findFirst({
      where: { userId },
      orderBy: { bodyFatPercent: "asc" },
      select: { bodyFatPercent: true },
    }),
    prisma.mealPlan.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: { id: true, createdAt: true, goal: true },
    }),
    prisma.workoutPlan.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: { id: true, createdAt: true, splitType: true },
    }),
  ]);

  // Previous scan for deltas
  const previousScan = latestScan
    ? await prisma.inBodyScan.findFirst({
        where: { userId, scanDate: { lt: latestScan.scanDate } },
        orderBy: { scanDate: "desc" },
      })
    : null;

  const daysSinceScan = latestScan ? daysSince(latestScan.scanDate) : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Greeting */}
      <div className="mb-8">
        <p className="text-xs uppercase tracking-widest text-muted-foreground/50 mb-1">
          {fmtDate(new Date())}
        </p>
        <h1
          className="text-2xl font-bold text-foreground tracking-tight"
          style={{ fontFamily: "var(--font-syne), sans-serif" }}
        >
          {greeting()}, {firstName}
        </h1>
      </div>

      {/* Latest scan card */}
      {latestScan ? (
        <section className="mb-5">
          <div className="rounded-xl border border-border bg-accent p-5 relative overflow-hidden">
            {/* Subtle glow */}
            <div
              className="absolute -top-10 -right-10 w-40 h-40 rounded-full pointer-events-none"
              style={{ background: "radial-gradient(ellipse, rgba(163,230,53,0.06) 0%, transparent 70%)" }}
            />

            <div className="flex items-start justify-between mb-5">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground/50 mb-1">Latest Scan</p>
                <p className="text-sm text-muted-foreground">{fmtDate(latestScan.scanDate)}</p>
              </div>
              <Link
                href={`/scans/${latestScan.id}`}
                className="flex items-center gap-1 text-xs text-lime-400 hover:text-lime-300 transition-colors"
              >
                View full <ArrowRight size={12} />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {/* Weight */}
              <div className="rounded-lg border border-border bg-accent p-3">
                <p className="text-[9px] uppercase tracking-widest text-muted-foreground/50 mb-1">Weight</p>
                <p className="text-lg font-bold text-foreground leading-none">
                  {fmt(latestScan.weightKg)}
                  <span className="text-xs font-normal text-muted-foreground/50 ml-0.5">kg</span>
                </p>
                {previousScan && (
                  <div className="mt-1">
                    <Delta
                      value={latestScan.weightKg - previousScan.weightKg}
                      goodDirection="neutral"
                      unit=" kg"
                    />
                  </div>
                )}
              </div>

              {/* Body fat */}
              <div className="rounded-lg border border-border bg-accent p-3">
                <p className="text-[9px] uppercase tracking-widest text-muted-foreground/50 mb-1">Body Fat</p>
                <p className="text-lg font-bold text-foreground leading-none">
                  {fmt(latestScan.bodyFatPercent)}
                  <span className="text-xs font-normal text-muted-foreground/50 ml-0.5">%</span>
                </p>
                {previousScan && (
                  <div className="mt-1">
                    <Delta
                      value={latestScan.bodyFatPercent - previousScan.bodyFatPercent}
                      goodDirection="down"
                      unit="%"
                    />
                  </div>
                )}
              </div>

              {/* Skeletal muscle */}
              <div className="rounded-lg border border-border bg-accent p-3">
                <p className="text-[9px] uppercase tracking-widest text-muted-foreground/50 mb-1">Muscle</p>
                <p className="text-lg font-bold text-foreground leading-none">
                  {fmt(latestScan.skeletalMuscleMassKg)}
                  <span className="text-xs font-normal text-muted-foreground/50 ml-0.5">kg</span>
                </p>
                {previousScan && (
                  <div className="mt-1">
                    <Delta
                      value={latestScan.skeletalMuscleMassKg - previousScan.skeletalMuscleMassKg}
                      goodDirection="up"
                      unit=" kg"
                    />
                  </div>
                )}
              </div>

              {/* BMI */}
              <div className="rounded-lg border border-border bg-accent p-3">
                <p className="text-[9px] uppercase tracking-widest text-muted-foreground/50 mb-1">BMI</p>
                <p className="text-lg font-bold text-foreground leading-none">
                  {fmt(latestScan.bmi)}
                </p>
                {previousScan && (
                  <div className="mt-1">
                    <Delta
                      value={latestScan.bmi - previousScan.bmi}
                      goodDirection="neutral"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="mb-5">
          <div className="rounded-xl border border-dashed border-border bg-accent p-10 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-xl bg-accent border border-border flex items-center justify-center mb-4">
              <ScanLine size={22} className="text-muted-foreground/50" />
            </div>
            <p className="text-sm font-medium text-muted-foreground mb-1">No scans yet</p>
            <p className="text-xs text-muted-foreground mb-5">Add your first InBody scan to start tracking your body composition.</p>
            <Link
              href="/scans/new"
              className="flex items-center gap-2 rounded-lg bg-lime-400 px-4 py-2 text-sm font-bold text-black hover:opacity-90 transition-opacity"
            >
              <Plus size={14} />
              Add First Scan
            </Link>
          </div>
        </section>
      )}

      {/* Stats strip */}
      {totalScans > 0 && (
        <div className="mb-5 grid grid-cols-3 gap-2">
          <div className="rounded-xl border border-border bg-accent px-4 py-3 text-center">
            <p className="text-xl font-bold text-foreground" style={{ fontFamily: "var(--font-syne), sans-serif" }}>
              {totalScans}
            </p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground/50 mt-0.5">
              {totalScans === 1 ? "Scan" : "Scans"}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-accent px-4 py-3 text-center">
            <p className="text-xl font-bold text-foreground" style={{ fontFamily: "var(--font-syne), sans-serif" }}>
              {daysSinceScan === 0 ? "Today" : daysSinceScan === 1 ? "1d" : `${daysSinceScan}d`}
            </p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground/50 mt-0.5">Last Scan</p>
          </div>
          <div className="rounded-xl border border-border bg-accent px-4 py-3 text-center">
            <p className="text-xl font-bold text-foreground" style={{ fontFamily: "var(--font-syne), sans-serif" }}>
              {bestBfScan ? fmt(bestBfScan.bodyFatPercent) : "—"}
              <span className="text-xs font-normal text-muted-foreground/50">%</span>
            </p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground/50 mt-0.5">Best BF%</p>
          </div>
        </div>
      )}

      {/* Quick actions */}
      <section>
        <h2 className="text-[10px] uppercase tracking-widest text-muted-foreground/50 mb-3">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <Link
            href="/scans/new"
            className="group flex items-start gap-4 rounded-xl border border-border bg-accent p-4 hover:border-border hover:bg-accent transition-all"
          >
            <div className="w-9 h-9 rounded-lg border border-lime-400/20 bg-lime-400/8 flex items-center justify-center flex-shrink-0">
              <Plus size={17} className="text-lime-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground group-hover:text-lime-400 transition-colors">New Scan</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">Log InBody measurements</p>
            </div>
          </Link>

          <Link
            href="/meal-plan"
            className="group flex items-start gap-4 rounded-xl border border-border bg-accent p-4 hover:border-border hover:bg-accent transition-all"
          >
            <div className="w-9 h-9 rounded-lg border border-border bg-accent flex items-center justify-center flex-shrink-0">
              <Utensils size={16} className="text-muted-foreground hover:text-foreground/80 transition-colors" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Meal Plan</p>
              {latestMealPlan ? (
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed capitalize">{latestMealPlan.goal} · view latest</p>
              ) : (
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">AI-generated 7-day plan</p>
              )}
            </div>
          </Link>

          <Link
            href="/workout"
            className="group flex items-start gap-4 rounded-xl border border-border bg-accent p-4 hover:border-border hover:bg-accent transition-all"
          >
            <div className="w-9 h-9 rounded-lg border border-border bg-accent flex items-center justify-center flex-shrink-0">
              <Dumbbell size={16} className="text-muted-foreground hover:text-foreground/80 transition-colors" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Workout</p>
              {latestWorkoutPlan ? (
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{latestWorkoutPlan.splitType} · view plan</p>
              ) : (
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">Personalised training plan</p>
              )}
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}
