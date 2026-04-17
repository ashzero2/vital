"use client";

import { useRef, useState } from "react";
import { Upload, FileText, Loader2, AlertCircle } from "lucide-react";
import type { InBodyScanInput } from "@/lib/parsers/inbody";

interface ScanUploadProps {
  onParsed: (data: Partial<InBodyScanInput>, missing: string[]) => void;
}

export function ScanUpload({ onParsed }: ScanUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");

  async function upload(file: File) {
    setError("");
    setFileName(file.name);
    setLoading(true);

    const form = new FormData();
    form.append("file", file);

    try {
      const res = await fetch("/api/parse-inbody", { method: "POST", body: form });
      const json = await res.json();

      if (!res.ok || json.error) {
        setError(json.error ?? "Failed to parse file.");
        return;
      }

      onParsed(json.data.parsed, json.data.missing);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    upload(files[0]);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  }

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`w-full rounded-xl border-2 border-dashed p-10 text-center transition-all ${
          dragging
            ? "border-lime-400/60 bg-lime-400/5"
            : "border-border bg-accent hover:border-border hover:bg-muted"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        {loading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={32} className="animate-spin text-lime-400" />
            <p className="text-sm text-muted-foreground">Parsing {fileName}…</p>
          </div>
        ) : fileName && !error ? (
          <div className="flex flex-col items-center gap-3">
            <FileText size={32} className="text-lime-400" />
            <p className="text-sm font-medium text-lime-400">{fileName}</p>
            <p className="text-xs text-muted-foreground">Click to upload a different file</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <Upload size={32} className="text-muted-foreground/50" />
            <div>
              <p className="text-sm font-medium text-foreground/80">
                Drop your InBody export here
              </p>
              <p className="mt-1 text-xs text-muted-foreground">CSV, XLSX or XLS · max 5 MB</p>
            </div>
          </div>
        )}
      </button>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-400/20 bg-red-400/8 px-4 py-3 text-sm text-red-400">
          <AlertCircle size={14} className="shrink-0" />
          {error}
        </div>
      )}

      <p className="text-center text-xs text-muted-foreground/50">
        Fields will be pre-filled in the form below. You can edit anything before saving.
      </p>
    </div>
  );
}
