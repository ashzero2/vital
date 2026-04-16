"use client";

import { useState } from "react";
import { ScanForm } from "@/components/scans/ScanForm";
import { ScanUpload } from "@/components/scans/ScanUpload";
import type { InBodyScanInput } from "@/lib/parsers/inbody";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

type Tab = "manual" | "upload";

export default function NewScanPage() {
  const [tab, setTab] = useState<Tab>("manual");
  const [prefill, setPrefill] = useState<Partial<InBodyScanInput> | undefined>();
  const [missingFields, setMissingFields] = useState<string[]>([]);

  function handleParsed(data: Partial<InBodyScanInput>, missing: string[]) {
    setPrefill(data);
    setMissingFields(missing);
    // Switch to form after upload
    setTab("manual");
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      {/* Back link */}
      <Link
        href="/scans"
        className="mb-6 inline-flex items-center gap-1 text-sm text-white/40 hover:text-white/70"
      >
        <ChevronLeft size={14} />
        All Scans
      </Link>

      <h1 className="mb-6 text-2xl font-bold text-white">New Scan</h1>

      {/* Tabs */}
      <div className="mb-8 flex gap-1 rounded-lg border border-white/8 bg-white/3 p-1 w-fit">
        {(["manual", "upload"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-md px-5 py-2 text-sm font-medium transition-all ${
              tab === t
                ? "bg-white/10 text-white"
                : "text-white/40 hover:text-white/60"
            }`}
          >
            {t === "manual" ? "Manual Entry" : "Upload File"}
          </button>
        ))}
      </div>

      {/* Upload tab */}
      {tab === "upload" && (
        <ScanUpload onParsed={handleParsed} />
      )}

      {/* Form — always present, but hidden when on upload tab and no prefill yet */}
      <div className={tab === "upload" && !prefill ? "hidden" : ""}>
        {tab === "upload" && prefill && (
          <div className="mb-6 rounded-lg border border-lime-400/20 bg-lime-400/5 px-4 py-3 text-sm text-lime-400">
            File parsed successfully. Review and fill any missing fields below.
          </div>
        )}
        <ScanForm prefill={prefill} missingFields={missingFields} />
      </div>
    </div>
  );
}
