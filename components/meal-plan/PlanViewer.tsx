"use client";

import { useState } from "react";
import type { MealPlanData, MealEntry } from "@/lib/ai/types";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function MacroPill({
  label,
  value,
  unit,
  variant,
}: {
  label: string;
  value: number;
  unit: string;
  variant: "protein" | "carbs" | "fat" | "cal";
}) {
  const styles: Record<string, string> = {
    protein: "bg-blue-400/10 text-blue-400",
    carbs: "bg-amber-400/10 text-amber-400",
    fat: "bg-rose-400/10 text-rose-400",
    cal: "bg-white/6 text-white/50",
  };
  return (
    <span className={`inline-flex items-baseline gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium ${styles[variant]}`}>
      {label && <span className="opacity-60 text-[10px]">{label}</span>}
      {value}
      <span className="opacity-60 text-[10px]">{unit}</span>
    </span>
  );
}

function MealCard({ title, meal }: { title: string; meal: MealEntry }) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/3 p-4">
      <p className="text-[10px] uppercase tracking-widest text-white/30 mb-2">{title}</p>
      <p className="text-sm font-medium text-white mb-3 leading-snug">{meal.name}</p>
      <div className="flex flex-wrap gap-1.5">
        <MacroPill label="P" value={meal.protein} unit="g" variant="protein" />
        <MacroPill label="C" value={meal.carbs} unit="g" variant="carbs" />
        <MacroPill label="F" value={meal.fat} unit="g" variant="fat" />
        <MacroPill label="" value={meal.calories} unit="kcal" variant="cal" />
      </div>
    </div>
  );
}

export function PlanViewer({ plan }: { plan: MealPlanData }) {
  // Find the first available day index to start on
  const dayMap = new Map(plan.days.map((d) => [d.day, d]));
  const firstAvailableIdx = DAYS.findIndex((d) => dayMap.has(d));
  const [activeIdx, setActiveIdx] = useState(firstAvailableIdx >= 0 ? firstAvailableIdx : 0);

  const dayData = dayMap.get(DAYS[activeIdx]);

  return (
    <div>
      {/* Day tabs */}
      <div className="flex overflow-x-auto border-b border-white/6 mb-5" style={{ scrollbarWidth: "none" }}>
        {DAYS.map((d, i) => {
          const available = dayMap.has(d);
          const active = i === activeIdx;
          return (
            <button
              key={d}
              onClick={() => available && setActiveIdx(i)}
              className={`flex-shrink-0 px-3.5 pb-3 pt-1 text-[11px] font-medium border-b-2 transition-all ${
                active
                  ? "text-lime-400 border-lime-400"
                  : available
                  ? "text-white/40 border-transparent hover:text-white/60"
                  : "text-white/15 border-transparent cursor-default"
              }`}
            >
              {d.slice(0, 3)}
            </button>
          );
        })}
      </div>

      {dayData ? (
        <div className="space-y-3">
          <MealCard title="Breakfast" meal={dayData.breakfast} />
          <MealCard title="Lunch" meal={dayData.lunch} />
          <MealCard title="Dinner" meal={dayData.dinner} />

          {dayData.snacks.length > 0 && (
            <>
              {dayData.snacks.map((snack, i) => (
                <MealCard
                  key={i}
                  title={dayData.snacks.length > 1 ? `Snack ${i + 1}` : "Snack"}
                  meal={snack}
                />
              ))}
            </>
          )}

          {/* Daily totals */}
          <div className="rounded-xl border border-white/6 bg-white/2 px-4 py-3">
            <p className="text-[10px] uppercase tracking-widest text-white/30 mb-2">Daily Totals</p>
            <div className="flex flex-wrap gap-2">
              <MacroPill label="Protein" value={dayData.totalProtein} unit="g" variant="protein" />
              <MacroPill label="Carbs" value={dayData.totalCarbs} unit="g" variant="carbs" />
              <MacroPill label="Fat" value={dayData.totalFat} unit="g" variant="fat" />
              <MacroPill label="" value={dayData.totalCalories} unit="kcal" variant="cal" />
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-white/6 bg-white/2 p-8 text-center">
          <p className="text-sm text-white/30">No data for this day</p>
        </div>
      )}

      {/* Notes */}
      {plan.notes && (
        <div className="mt-4 rounded-xl border border-white/6 bg-white/2 p-4">
          <p className="text-[10px] uppercase tracking-widest text-white/30 mb-2">Notes</p>
          <p className="text-sm text-white/50 leading-relaxed">{plan.notes}</p>
        </div>
      )}
    </div>
  );
}
