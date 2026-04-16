import type { InsightParams } from "../types";

function fmt(n: number, d = 1) {
  return n.toFixed(d);
}

function fmtDate(d: Date | string) {
  return new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export function buildInsightPrompt({ scan, previousScan }: InsightParams): string {
  const lines: string[] = [
    "You are a certified fitness and nutrition coach analysing an InBody body composition scan.",
    "Write a clear, personalised analysis in 3–4 paragraphs of plain text (no markdown, no bullet points, no headers).",
    "Be encouraging but honest. Highlight what is going well and what needs attention.",
    "Do not recommend specific supplements or medications.",
    "",
    `SCAN DATE: ${fmtDate(scan.scanDate)}`,
    `Weight: ${fmt(scan.weightKg)} kg`,
    `Body Fat: ${fmt(scan.bodyFatPercent)}% (${fmt(scan.bodyFatMassKg)} kg fat mass)`,
    `Skeletal Muscle Mass: ${fmt(scan.skeletalMuscleMassKg)} kg`,
    `Lean Body Mass: ${fmt(scan.leanBodyMassKg)} kg`,
    `BMI: ${fmt(scan.bmi)}`,
  ];

  if (scan.basalMetabolicRate) lines.push(`BMR: ${scan.basalMetabolicRate} kcal`);
  if (scan.visceralFatLevel != null) lines.push(`Visceral Fat Level: ${scan.visceralFatLevel}`);
  if (scan.totalBodyWaterL != null) lines.push(`Total Body Water: ${fmt(scan.totalBodyWaterL)} L`);

  if (previousScan) {
    lines.push("", `PREVIOUS SCAN (${fmtDate(previousScan.scanDate)}):`);
    lines.push(`Weight: ${fmt(previousScan.weightKg)} kg → change: ${fmt(scan.weightKg - previousScan.weightKg)} kg`);
    lines.push(`Body Fat: ${fmt(previousScan.bodyFatPercent)}% → change: ${fmt(scan.bodyFatPercent - previousScan.bodyFatPercent)}%`);
    lines.push(`Skeletal Muscle Mass: ${fmt(previousScan.skeletalMuscleMassKg)} kg → change: ${fmt(scan.skeletalMuscleMassKg - previousScan.skeletalMuscleMassKg)} kg`);
  }

  lines.push("", "Write your analysis now:");

  return lines.join("\n");
}

export function buildInsightRetryPrompt(params: InsightParams): string {
  return (
    buildInsightPrompt(params) +
    "\n\nIMPORTANT: Reply with plain text only — no JSON, no markdown formatting."
  );
}
