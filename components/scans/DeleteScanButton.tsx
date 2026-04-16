"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";

export function DeleteScanButton({ scanId }: { scanId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    try {
      const res = await fetch(`/api/scans/${scanId}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/scans");
        router.refresh();
      }
    } finally {
      setLoading(false);
      setConfirming(false);
    }
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-white/50">Delete this scan?</span>
        <button
          onClick={() => setConfirming(false)}
          className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-white/50 hover:text-white"
        >
          Cancel
        </button>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-lg bg-red-500/20 border border-red-400/30 px-3 py-1.5 text-sm text-red-400 hover:bg-red-500/30 disabled:opacity-50"
        >
          {loading ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
          Delete
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="flex items-center gap-1.5 rounded-lg border border-white/8 px-3 py-1.5 text-sm text-white/40 transition-colors hover:border-red-400/30 hover:text-red-400"
    >
      <Trash2 size={14} />
      Delete
    </button>
  );
}
