"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface ScanEntry {
  id: string;
  scanDate: Date | string;
  weightKg: number;
  bodyFatPercent: number;
  skeletalMuscleMassKg: number;
  notes: string | null;
}

function fmtDate(d: Date | string) {
  return new Date(d).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function ScanTimeline({ scans }: { scans: ScanEntry[] }) {
  // Newest first
  const sorted = [...scans].sort(
    (a, b) => new Date(b.scanDate).getTime() - new Date(a.scanDate).getTime()
  );

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-[7px] top-2 bottom-2 w-px bg-white/6" />

      <div className="space-y-2">
        {sorted.map((scan, i) => (
          <Link
            key={scan.id}
            href={`/scans/${scan.id}`}
            className="group flex items-start gap-4 rounded-xl border border-white/6 bg-white/2 p-4 hover:border-white/12 hover:bg-white/3 transition-all"
          >
            {/* Timeline dot */}
            <div className="relative flex-shrink-0 mt-0.5">
              <div
                className={`w-3.5 h-3.5 rounded-full border-2 ${
                  i === 0
                    ? "border-lime-400 bg-lime-400/20"
                    : "border-white/20 bg-white/4"
                }`}
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p
                  className={`text-xs font-medium ${i === 0 ? "text-lime-400" : "text-white/40"}`}
                >
                  {fmtDate(scan.scanDate)}
                  {i === 0 && (
                    <span className="ml-2 text-[10px] text-lime-400/60 uppercase tracking-widest">
                      latest
                    </span>
                  )}
                </p>
                <ArrowRight
                  size={12}
                  className="flex-shrink-0 text-white/20 group-hover:text-white/50 transition-colors"
                />
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1.5">
                <span className="text-sm text-white">
                  {scan.weightKg.toFixed(1)}
                  <span className="text-white/30 text-xs ml-0.5">kg</span>
                </span>
                <span className="text-sm text-white/60">
                  {scan.bodyFatPercent.toFixed(1)}
                  <span className="text-white/30 text-xs ml-0.5">% BF</span>
                </span>
                <span className="text-sm text-white/60">
                  {scan.skeletalMuscleMassKg.toFixed(1)}
                  <span className="text-white/30 text-xs ml-0.5">kg SMM</span>
                </span>
              </div>

              {scan.notes && (
                <p className="mt-1.5 text-xs text-white/25 truncate">{scan.notes}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
