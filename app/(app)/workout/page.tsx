import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { Dumbbell, Sparkles } from "lucide-react";
import type { WorkoutPlanData } from "@/lib/ai/types";
import { GenerateForm } from "@/components/workout/GenerateForm";
import { PlanViewer } from "@/components/workout/PlanViewer";
import { RegenerateToggle } from "@/components/workout/RegenerateToggle";

function fmtDate(d: Date | string) {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

export default async function WorkoutPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const [latestPlanRecord, latestScan] = await Promise.all([
    prisma.workoutPlan.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.inBodyScan.findFirst({
      where: { userId: session.user.id },
      orderBy: { scanDate: "desc" },
      select: { id: true },
    }),
  ]);

  const latestScanId = latestScan?.id;
  const plan: WorkoutPlanData | null = latestPlanRecord
    ? (JSON.parse(latestPlanRecord.planData) as WorkoutPlanData)
    : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1
            className="text-2xl font-bold text-foreground tracking-tight"
            style={{ fontFamily: "var(--font-syne), sans-serif" }}
          >
            Workout Plan
          </h1>
          {latestPlanRecord && (
            <p className="text-xs text-muted-foreground mt-1">
              Generated {fmtDate(latestPlanRecord.createdAt)} ·{" "}
              {latestPlanRecord.splitType} · {latestPlanRecord.daysPerWeek}d/week
            </p>
          )}
        </div>
        {plan && <RegenerateToggle latestScanId={latestScanId} />}
      </div>

      {/* No plan — show form */}
      {!plan && (
        <>
          <div className="mb-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-accent py-10 text-center">
            <div className="w-12 h-12 rounded-xl border border-border bg-accent flex items-center justify-center mb-4">
              <Dumbbell size={22} className="text-muted-foreground/50" />
            </div>
            <p className="text-sm font-medium text-muted-foreground mb-1">No workout plan yet</p>
            <p className="text-xs text-muted-foreground">
              Generate a personalised plan based on your goals.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-accent p-5">
            <div className="flex items-center gap-2 mb-5">
              <Sparkles size={15} className="text-lime-400" />
              <h2 className="text-sm font-semibold text-foreground">Generate Plan</h2>
            </div>
            <GenerateForm latestScanId={latestScanId} />
          </div>
        </>
      )}

      {/* Has plan — show viewer */}
      {plan && <PlanViewer plan={plan} />}
    </div>
  );
}
