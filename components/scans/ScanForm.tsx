"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import type { InBodyScanInput } from "@/lib/parsers/inbody";

// ─── Validation schema ────────────────────────────────────────────────────

const schema = z.object({
  scanDate: z.string().optional(),
  notes: z.string().optional(),
  weightKg: z.number({ error: "Required" }).positive(),
  bodyFatPercent: z.number({ error: "Required" }).min(0).max(100),
  bodyFatMassKg: z.number({ error: "Required" }).positive(),
  skeletalMuscleMassKg: z.number({ error: "Required" }).positive(),
  leanBodyMassKg: z.number({ error: "Required" }).positive(),
  bmi: z.number({ error: "Required" }).positive(),
  basalMetabolicRate: z.number().int().positive().optional().nullable(),
  visceralFatLevel: z.number().positive().optional().nullable(),
  totalBodyWaterL: z.number().positive().optional().nullable(),
  intracellularWaterL: z.number().positive().optional().nullable(),
  extracellularWaterL: z.number().positive().optional().nullable(),
  proteinKg: z.number().positive().optional().nullable(),
  mineralsKg: z.number().positive().optional().nullable(),
  rightArmLeanKg: z.number().positive().optional().nullable(),
  leftArmLeanKg: z.number().positive().optional().nullable(),
  trunkLeanKg: z.number().positive().optional().nullable(),
  rightLegLeanKg: z.number().positive().optional().nullable(),
  leftLegLeanKg: z.number().positive().optional().nullable(),
  rightArmFatKg: z.number().positive().optional().nullable(),
  leftArmFatKg: z.number().positive().optional().nullable(),
  trunkFatKg: z.number().positive().optional().nullable(),
  rightLegFatKg: z.number().positive().optional().nullable(),
  leftLegFatKg: z.number().positive().optional().nullable(),
});

type FormValues = z.infer<typeof schema>;
type FieldErrors = Partial<Record<keyof FormValues, string>>;

// ─── Field config ─────────────────────────────────────────────────────────

const CORE_FIELDS: { key: keyof FormValues; label: string; unit: string; step: string }[] = [
  { key: "weightKg", label: "Weight", unit: "kg", step: "any" },
  { key: "bodyFatPercent", label: "Body Fat %", unit: "%", step: "any" },
  { key: "bodyFatMassKg", label: "Body Fat Mass", unit: "kg", step: "any" },
  { key: "skeletalMuscleMassKg", label: "Skeletal Muscle Mass", unit: "kg", step: "any" },
  { key: "leanBodyMassKg", label: "Lean Body Mass", unit: "kg", step: "any" },
  { key: "bmi", label: "BMI", unit: "", step: "any" },
];

const OPTIONAL_FIELDS: { key: keyof FormValues; label: string; unit: string; step: string }[] = [
  { key: "basalMetabolicRate", label: "Basal Metabolic Rate", unit: "kcal", step: "any" },
  { key: "visceralFatLevel", label: "Visceral Fat Level", unit: "", step: "any" },
  { key: "totalBodyWaterL", label: "Total Body Water", unit: "L", step: "any" },
  { key: "intracellularWaterL", label: "Intracellular Water", unit: "L", step: "any" },
  { key: "extracellularWaterL", label: "Extracellular Water", unit: "L", step: "any" },
  { key: "proteinKg", label: "Protein", unit: "kg", step: "any" },
  { key: "mineralsKg", label: "Minerals", unit: "kg", step: "any" },
];

const SEGMENTAL_LEAN: { key: keyof FormValues; label: string }[] = [
  { key: "rightArmLeanKg", label: "Right Arm" },
  { key: "leftArmLeanKg", label: "Left Arm" },
  { key: "trunkLeanKg", label: "Trunk" },
  { key: "rightLegLeanKg", label: "Right Leg" },
  { key: "leftLegLeanKg", label: "Left Leg" },
];

const SEGMENTAL_FAT: { key: keyof FormValues; label: string }[] = [
  { key: "rightArmFatKg", label: "Right Arm" },
  { key: "leftArmFatKg", label: "Left Arm" },
  { key: "trunkFatKg", label: "Trunk" },
  { key: "rightLegFatKg", label: "Right Leg" },
  { key: "leftLegFatKg", label: "Left Leg" },
];

// ─── Props ────────────────────────────────────────────────────────────────

// Fields that can be derived from other fields when not in the export
const DERIVED_FIELDS: Partial<Record<keyof InBodyScanInput, string>> = {
  leanBodyMassKg: "Weight − Body Fat Mass",
};

interface ScanFormProps {
  prefill?: Partial<InBodyScanInput>;
  missingFields?: string[];
}

// ─── Component ────────────────────────────────────────────────────────────

export function ScanForm({ prefill, missingFields = [] }: ScanFormProps) {
  const router = useRouter();
  const submittingRef = useRef(false);
  const [values, setValues] = useState<Partial<Record<keyof FormValues, string>>>({
    scanDate: new Date().toISOString().split("T")[0],
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  // Apply prefill when it changes (from upload)
  useEffect(() => {
    if (!prefill) return;
    setValues((prev) => ({
      ...prev,
      ...Object.fromEntries(
        Object.entries(prefill)
          .filter(([, v]) => v != null)
          .map(([k, v]) => [k, String(v)])
      ),
    }));
  }, [prefill]);

  function set(key: keyof FormValues, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function parseNum(val: string | undefined): number | null {
    if (!val || val.trim() === "") return null;
    const n = parseFloat(val);
    return isNaN(n) ? null : n;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submittingRef.current) return;
    setServerError("");

    const payload = {
      scanDate: values.scanDate,
      notes: values.notes,
      weightKg: parseNum(values.weightKg),
      bodyFatPercent: parseNum(values.bodyFatPercent),
      bodyFatMassKg: parseNum(values.bodyFatMassKg),
      skeletalMuscleMassKg: parseNum(values.skeletalMuscleMassKg),
      leanBodyMassKg: parseNum(values.leanBodyMassKg),
      bmi: parseNum(values.bmi),
      basalMetabolicRate: parseNum(values.basalMetabolicRate)
        ? Math.round(parseNum(values.basalMetabolicRate)!)
        : null,
      visceralFatLevel: parseNum(values.visceralFatLevel),
      totalBodyWaterL: parseNum(values.totalBodyWaterL),
      intracellularWaterL: parseNum(values.intracellularWaterL),
      extracellularWaterL: parseNum(values.extracellularWaterL),
      proteinKg: parseNum(values.proteinKg),
      mineralsKg: parseNum(values.mineralsKg),
      rightArmLeanKg: parseNum(values.rightArmLeanKg),
      leftArmLeanKg: parseNum(values.leftArmLeanKg),
      trunkLeanKg: parseNum(values.trunkLeanKg),
      rightLegLeanKg: parseNum(values.rightLegLeanKg),
      leftLegLeanKg: parseNum(values.leftLegLeanKg),
      rightArmFatKg: parseNum(values.rightArmFatKg),
      leftArmFatKg: parseNum(values.leftArmFatKg),
      trunkFatKg: parseNum(values.trunkFatKg),
      rightLegFatKg: parseNum(values.rightLegFatKg),
      leftLegFatKg: parseNum(values.leftLegFatKg),
    };

    const result = schema.safeParse(payload);
    if (!result.success) {
      const fe: FieldErrors = {};
      for (const [field, msgs] of Object.entries(result.error.flatten().fieldErrors)) {
        fe[field as keyof FormValues] = msgs?.[0];
      }
      setErrors(fe);
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);
    try {
      const res = await fetch("/api/scans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });
      const json = await res.json();
      if (!res.ok || json.error) {
        setServerError(typeof json.error === "string" ? json.error : "Failed to save scan.");
        return;
      }
      router.push("/scans");
      router.refresh();
    } catch {
      setServerError("Network error. Please try again.");
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }

  const isMissing = (key: string) => missingFields.includes(key);
  const isCalculated = (key: keyof InBodyScanInput) =>
    prefill != null &&
    prefill[key] != null &&
    key in DERIVED_FIELDS &&
    !missingFields.includes(key);

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Scan date + notes */}
      <Section title="Scan Details">
        <Field label="Scan Date" error={errors.scanDate}>
          <input
            type="date"
            value={values.scanDate ?? ""}
            onChange={(e) => set("scanDate", e.target.value)}
            className={inputCls()}
          />
        </Field>
        <Field label="Notes" className="col-span-full">
          <textarea
            value={values.notes ?? ""}
            onChange={(e) => set("notes", e.target.value)}
            rows={2}
            placeholder="Optional notes about this scan…"
            className={inputCls("resize-none")}
          />
        </Field>
      </Section>

      {/* Core metrics */}
      <Section title="Core Metrics" subtitle="All fields required">
        {CORE_FIELDS.map(({ key, label, unit, step }) => (
          <Field
            key={key}
            label={label}
            unit={unit}
            error={errors[key]}
            missing={isMissing(key)}
            calculated={isCalculated(key as keyof InBodyScanInput) ? DERIVED_FIELDS[key as keyof InBodyScanInput] : undefined}
            required
          >
            <input
              type="number"
              step={step}
              min="0"
              value={values[key] ?? ""}
              onChange={(e) => set(key, e.target.value)}
              placeholder="—"
              className={inputCls(errors[key] ? "border-red-400/50" : isMissing(key) ? "border-amber-400/40" : "")}
            />
          </Field>
        ))}
      </Section>

      {/* Optional metrics */}
      <Section title="Optional Metrics">
        {OPTIONAL_FIELDS.map(({ key, label, unit, step }) => (
          <Field key={key} label={label} unit={unit} missing={isMissing(key)}>
            <input
              type="number"
              step={step}
              min="0"
              value={values[key] ?? ""}
              onChange={(e) => set(key, e.target.value)}
              placeholder="—"
              className={inputCls(isMissing(key) ? "border-amber-400/40" : "")}
            />
          </Field>
        ))}
      </Section>

      {/* Segmental lean */}
      <Section title="Segmental Lean Mass" subtitle="kg per segment">
        {SEGMENTAL_LEAN.map(({ key, label }) => (
          <Field key={key} label={label} unit="kg" missing={isMissing(key)}>
            <input
              type="number"
              step="any"
              min="0"
              value={values[key] ?? ""}
              onChange={(e) => set(key, e.target.value)}
              placeholder="—"
              className={inputCls(isMissing(key) ? "border-amber-400/40" : "")}
            />
          </Field>
        ))}
      </Section>

      {/* Segmental fat */}
      <Section title="Segmental Fat Mass" subtitle="kg per segment">
        {SEGMENTAL_FAT.map(({ key, label }) => (
          <Field key={key} label={label} unit="kg" missing={isMissing(key)}>
            <input
              type="number"
              step="any"
              min="0"
              value={values[key] ?? ""}
              onChange={(e) => set(key, e.target.value)}
              placeholder="—"
              className={inputCls(isMissing(key) ? "border-amber-400/40" : "")}
            />
          </Field>
        ))}
      </Section>

      {/* Missing field legend */}
      {missingFields.length > 0 && (
        <p className="text-xs text-amber-400/70">
          <span className="mr-1 inline-block h-2 w-2 rounded-sm border border-amber-400/40 bg-amber-400/10" />
          Amber border = field not found in uploaded file. Fill in manually if available.
        </p>
      )}

      {/* Server error */}
      {serverError && (
        <p className="rounded-lg border border-red-400/20 bg-red-400/8 px-4 py-3 text-sm text-red-400">
          {serverError}
        </p>
      )}

      {/* Submit */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-border px-5 py-2.5 text-sm text-muted-foreground transition-colors hover:border-border hover:text-foreground/80"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex items-center gap-2 rounded-lg bg-lime-400 px-6 py-2.5 text-sm font-bold text-black transition-opacity disabled:opacity-60 hover:opacity-90"
        >
          {submitting && <Loader2 size={14} className="animate-spin" />}
          Save Scan
        </button>
      </div>
    </form>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-4 border-b border-border pb-2">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">{children}</div>
    </div>
  );
}

function Field({
  label,
  unit,
  error,
  missing,
  required,
  calculated,
  className = "",
  children,
}: {
  label: string;
  unit?: string;
  error?: string;
  missing?: boolean;
  required?: boolean;
  calculated?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label className="mb-1.5 flex items-center gap-1 text-[11px] uppercase tracking-widest text-muted-foreground">
        {label}
        {unit && <span className="text-muted-foreground/50">({unit})</span>}
        {required && <span className="text-lime-400">*</span>}
        {missing && !required && <span className="text-amber-400/60 text-[9px]">missing</span>}
      </label>
      {children}
      {calculated && (
        <p className="mt-1 text-[10px] text-sky-400/70">
          calculated: {calculated}
        </p>
      )}
      {error && <p className="mt-1 text-[11px] text-red-400">{error}</p>}
    </div>
  );
}

function inputCls(extra = "") {
  return `w-full rounded-lg border border-border bg-accent px-3 py-2 text-sm text-foreground placeholder-muted-foreground outline-none transition-colors focus:border-lime-400/40 focus:bg-muted ${extra}`;
}
