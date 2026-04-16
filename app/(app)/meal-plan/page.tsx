import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { Utensils, Sparkles } from "lucide-react";
import type { MealPlanData } from "@/lib/ai/types";
import { GenerateForm } from "@/components/meal-plan/GenerateForm";
import { PlanViewer } from "@/components/meal-plan/PlanViewer";
import { RegenerateToggle } from "@/components/meal-plan/RegenerateToggle";

function fmtDate(d: Date | string) {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

export default async function MealPlanPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const [latestPlanRecord, latestScan] = await Promise.all([
    prisma.mealPlan.findFirst({
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
  const plan: MealPlanData | null = latestPlanRecord
    ? (JSON.parse(latestPlanRecord.planData) as MealPlanData)
    : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1
            className="text-2xl font-bold text-white tracking-tight"
            style={{ fontFamily: "var(--font-syne), sans-serif" }}
          >
            Meal Plan
          </h1>
          {latestPlanRecord && (
            <p className="text-xs text-white/30 mt-1">
              Generated {fmtDate(latestPlanRecord.createdAt)} ·{" "}
              <span className="capitalize">{latestPlanRecord.goal}</span> ·{" "}
              {latestPlanRecord.caloricTarget} kcal
              {latestPlanRecord.region && ` · ${latestPlanRecord.region}`}
            </p>
          )}
        </div>
        {plan && <RegenerateToggle latestScanId={latestScanId} />}
      </div>

      {/* No plan — show form */}
      {!plan && (
        <>
          <div className="mb-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/2 py-10 text-center">
            <div className="w-12 h-12 rounded-xl border border-white/8 bg-white/4 flex items-center justify-center mb-4">
              <Utensils size={22} className="text-white/20" />
            </div>
            <p className="text-sm font-medium text-white/50 mb-1">No meal plan yet</p>
            <p className="text-xs text-white/25">
              Generate a personalised 7-day plan below.
            </p>
          </div>

          <div className="rounded-xl border border-white/8 bg-white/3 p-5">
            <div className="flex items-center gap-2 mb-5">
              <Sparkles size={15} className="text-lime-400" />
              <h2 className="text-sm font-semibold text-white">Generate Plan</h2>
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
