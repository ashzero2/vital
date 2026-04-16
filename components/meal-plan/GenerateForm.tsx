"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2 } from "lucide-react";

interface GenerateFormProps {
  latestScanId?: string;
}

const inputCls =
  "w-full rounded-lg border border-white/8 bg-white/4 px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-lime-400/40 focus:bg-white/5 transition-colors";

const labelCls = "block text-[10px] uppercase tracking-widest text-white/40 mb-2";

export function GenerateForm({ latestScanId }: GenerateFormProps) {
  const router = useRouter();
  const [caloricTarget, setCaloricTarget] = useState("2000");
  const [goal, setGoal] = useState<"cut" | "maintain" | "bulk">("maintain");
  const [region, setRegion] = useState("");
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
        caloricTarget: parseInt(caloricTarget, 10),
        goal,
      };
      if (region.trim()) body.region = region.trim();
      if (useScan && latestScanId) body.scanId = latestScanId;

      const res = await fetch("/api/meal-plan", {
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
      router.replace("/meal-plan");
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
          <label className={labelCls}>Caloric Target <span className="text-white/20 normal-case tracking-normal">(kcal)</span></label>
          <input
            type="number"
            min="800"
            max="6000"
            step="50"
            required
            value={caloricTarget}
            onChange={(e) => setCaloricTarget(e.target.value)}
            placeholder="2000"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Goal</label>
          <select
            value={goal}
            onChange={(e) => setGoal(e.target.value as "cut" | "maintain" | "bulk")}
            className={inputCls + " cursor-pointer"}
            style={{ background: "rgba(255,255,255,0.04)" }}
          >
            <option value="cut" style={{ background: "#1a1a1a" }}>Cut — Fat Loss</option>
            <option value="maintain" style={{ background: "#1a1a1a" }}>Maintain — Recomposition</option>
            <option value="bulk" style={{ background: "#1a1a1a" }}>Bulk — Muscle Gain</option>
          </select>
        </div>
      </div>

      <div>
        <label className={labelCls}>
          Cuisine Region{" "}
          <span className="text-white/20 normal-case tracking-normal">(optional)</span>
        </label>
        <input
          type="text"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          placeholder="e.g. Indian, Mediterranean, Japanese…"
          className={inputCls}
        />
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
            Generate 7-Day Plan
          </>
        )}
      </button>
    </form>
  );
}
