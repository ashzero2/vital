"use client";

import { useState } from "react";
import { RefreshCw, ChevronDown } from "lucide-react";
import { GenerateForm } from "./GenerateForm";
import type { ScanMetrics } from "./GenerateForm";

interface RegenerateToggleProps {
  latestScanId?: string;
  latestScanMetrics?: ScanMetrics | null;
}

export function RegenerateToggle({ latestScanId, latestScanMetrics }: RegenerateToggleProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col items-end gap-3">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:border-border hover:text-foreground/80 transition-colors"
      >
        <RefreshCw size={12} strokeWidth={1.5} />
        Regenerate
        <ChevronDown
          size={12}
          strokeWidth={1.5}
          className="transition-transform"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>

      {open && (
        <div className="w-full mt-2 rounded-xl border border-border bg-accent p-5">
          <GenerateForm latestScanId={latestScanId} latestScanMetrics={latestScanMetrics} />
        </div>
      )}
    </div>
  );
}
