"use client";

import { useState } from "react";
import { RefreshCw, ChevronDown } from "lucide-react";
import { GenerateForm } from "./GenerateForm";

interface RegenerateToggleProps {
  latestScanId?: string;
}

export function RegenerateToggle({ latestScanId }: RegenerateToggleProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col items-end gap-3">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/50 hover:border-white/20 hover:text-white/80 transition-colors"
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
        <div className="w-full mt-2 rounded-xl border border-white/8 bg-white/3 p-5">
          <GenerateForm latestScanId={latestScanId} />
        </div>
      )}
    </div>
  );
}
