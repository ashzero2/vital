"use client";

import { useState } from "react";
import { Flame, Moon } from "lucide-react";
import type { WorkoutPlanData, WorkoutDay } from "@/lib/ai/types";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function TrainingDay({ day }: { day: WorkoutDay }) {
  return (
    <div className="space-y-4">
      {/* Focus header */}
      <div className="rounded-xl border border-lime-400/15 bg-lime-400/5 px-4 py-3">
        <p className="text-[10px] uppercase tracking-widest text-lime-400/60 mb-0.5">{day.day}</p>
        <p className="text-sm font-semibold text-white">{day.focus}</p>
      </div>

      {/* Exercise table */}
      <div className="rounded-xl border border-white/8 bg-white/3 overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[1fr_auto_auto_auto] gap-3 px-4 py-2.5 border-b border-white/6">
          <p className="text-[10px] uppercase tracking-widest text-white/25">Exercise</p>
          <p className="text-[10px] uppercase tracking-widest text-white/25 text-right">Sets</p>
          <p className="text-[10px] uppercase tracking-widest text-white/25 text-right w-14">Reps</p>
          <p className="text-[10px] uppercase tracking-widest text-white/25 text-right w-14">Rest</p>
        </div>

        {/* Rows */}
        {day.exercises.map((ex, i) => (
          <div
            key={i}
            className={`px-4 py-3 ${i < day.exercises.length - 1 ? "border-b border-white/4" : ""}`}
          >
            <div className="grid grid-cols-[1fr_auto_auto_auto] gap-3 items-start">
              <div>
                <p className="text-sm text-white">{ex.name}</p>
                {ex.notes && (
                  <p className="text-[11px] text-white/30 mt-0.5 leading-snug">{ex.notes}</p>
                )}
              </div>
              <p className="text-sm font-medium text-white/70 text-right tabular-nums">{ex.sets}</p>
              <p className="text-sm font-medium text-white/70 text-right tabular-nums w-14">{ex.reps}</p>
              <p className="text-[12px] text-white/40 text-right w-14 leading-tight">{ex.rest}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Cardio */}
      {day.cardio && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-400/15 bg-amber-400/5 px-4 py-3">
          <Flame size={14} className="text-amber-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-[10px] uppercase tracking-widest text-amber-400/60 mb-0.5">Cardio</p>
            <p className="text-sm text-white/70">{day.cardio}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function RestDay({ dayName }: { dayName: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-white/6 bg-white/2 py-12 text-center">
      <Moon size={28} className="text-white/15 mb-3" />
      <p className="text-sm font-medium text-white/40">{dayName}</p>
      <p className="text-xs text-white/20 mt-1">Rest & Recovery</p>
    </div>
  );
}

export function PlanViewer({ plan }: { plan: WorkoutPlanData }) {
  const dayMap = new Map(plan.days.map((d) => [d.day, d]));

  // Start on first training day
  const firstTrainingIdx = DAYS.findIndex((d) => dayMap.has(d));
  const [activeIdx, setActiveIdx] = useState(firstTrainingIdx >= 0 ? firstTrainingIdx : 0);

  const trainingDay = dayMap.get(DAYS[activeIdx]);

  return (
    <div>
      {/* Day tabs */}
      <div
        className="flex overflow-x-auto border-b border-white/6 mb-5"
        style={{ scrollbarWidth: "none" }}
      >
        {DAYS.map((d, i) => {
          const isTraining = dayMap.has(d);
          const active = i === activeIdx;
          return (
            <button
              key={d}
              onClick={() => setActiveIdx(i)}
              className={`relative flex-shrink-0 px-3.5 pb-3 pt-1 text-[11px] font-medium border-b-2 transition-all ${
                active
                  ? "text-lime-400 border-lime-400"
                  : "text-white/35 border-transparent hover:text-white/60"
              }`}
            >
              {d.slice(0, 3)}
              {isTraining && !active && (
                <span className="absolute bottom-2.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-lime-400/40" />
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {trainingDay ? (
        <TrainingDay day={trainingDay} />
      ) : (
        <RestDay dayName={DAYS[activeIdx]} />
      )}

      {/* Plan notes */}
      {plan.notes && (
        <div className="mt-4 rounded-xl border border-white/6 bg-white/2 p-4">
          <p className="text-[10px] uppercase tracking-widest text-white/30 mb-2">Notes</p>
          <p className="text-sm text-white/50 leading-relaxed">{plan.notes}</p>
        </div>
      )}
    </div>
  );
}
