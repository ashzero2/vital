"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2 } from "lucide-react";

type SplitType = "PPL" | "Upper-Lower" | "Full Body" | "Bro Split";

interface GenerateFormProps {
  latestScanId?: string;
}

const inputCls =
  "w-full rounded-lg border border-white/8 bg-white/4 px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-lime-400/40 focus:bg-white/5 transition-colors";

const labelCls = "block text-[10px] uppercase tracking-widest text-white/40 mb-2";

export function GenerateForm({ latestScanId }: GenerateFormProps) {
  const router = useRouter();
  const [daysPerWeek, setDaysPerWeek] = useState("4");
  const [splitType, setSplitType] = useState<SplitType>("PPL");
  const [useScan, setUseScan] = useState(!!latestScanId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);

    try {
      const body: Record<string, unknown> = {
        daysPerWeek: parseInt(daysPerWeek, 10),
        splitType,
      };
      if (useScan && latestScanId) body.scanId = latestScanId;

      const res = await fetch("/api/workout-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok || json.error) {
        setError(typeof json.error === "string" ? json.error : "Generation failed. Please try again.");
        return;
      }
      router.refresh();
      router.replace("/workout");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Days Per Week</label>
          <select
            value={daysPerWeek}
            onChange={(e) => setDaysPerWeek(e.target.value)}
            className={inputCls + " cursor-pointer"}
            style={{ background: "rgba(255,255,255,0.04)" }}
          >
            {[1, 2, 3, 4, 5, 6, 7].map((n) => (
              <option key={n} value={n} style={{ background: "#1a1a1a" }}>
                {n} {n === 1 ? "day" : "days"}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Training Split</label>
          <select
            value={splitType}
            onChange={(e) => setSplitType(e.target.value as SplitType)}
            className={inputCls + " cursor-pointer"}
            style={{ background: "rgba(255,255,255,0.04)" }}
          >
            <option value="PPL" style={{ background: "#1a1a1a" }}>PPL — Push / Pull / Legs</option>
            <option value="Upper-Lower" style={{ background: "#1a1a1a" }}>Upper-Lower Split</option>
            <option value="Full Body" style={{ background: "#1a1a1a" }}>Full Body</option>
            <option value="Bro Split" style={{ background: "#1a1a1a" }}>Bro Split</option>
          </select>
        </div>
      </div>

      {latestScanId && (
        <label className="flex items-center gap-3 cursor-pointer group select-none">
          <button
            type="button"
            role="switch"
            aria-checked={useScan}
            onClick={() => setUseScan((v) => !v)}
            className="relative flex-shrink-0 w-10 h-5 rounded-full transition-colors duration-200"
            style={{ background: useScan ? "#a3e635" : "rgba(255,255,255,0.1)" }}
          >
            <span
              className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200"
              style={{ transform: useScan ? "translateX(20px)" : "translateX(0)" }}
            />
          </button>
          <span className="text-sm text-white/50 group-hover:text-white/70 transition-colors">
            Personalise using latest scan data
          </span>
        </label>
      )}

      {error && (
        <p className="rounded-lg border border-red-400/20 bg-red-400/8 px-4 py-3 text-sm text-red-400">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-lime-400 px-6 py-3 text-sm font-bold text-black transition-opacity disabled:opacity-60 hover:opacity-90"
      >
        {loading ? (
          <>
            <Loader2 size={14} className="animate-spin" />
            Generating… this may take a moment
          </>
        ) : (
          <>
            <Sparkles size={14} />
            Generate Workout Plan
          </>
        )}
      </button>
    </form>
  );
}
