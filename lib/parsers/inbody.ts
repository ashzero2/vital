import { parseCSV } from "./csv-parser";
import { parseExcel } from "./excel-parser";
import { buildAliasLookup, normaliseHeader, COLUMN_MAP } from "./column-map";

export interface InBodyScanInput {
  weightKg: number;
  bodyFatPercent: number;
  bodyFatMassKg: number;
  skeletalMuscleMassKg: number;
  leanBodyMassKg: number;
  bmi: number;
  basalMetabolicRate?: number;
  visceralFatLevel?: number;
  totalBodyWaterL?: number;
  intracellularWaterL?: number;
  extracellularWaterL?: number;
  proteinKg?: number;
  mineralsKg?: number;
  rightArmLeanKg?: number;
  leftArmLeanKg?: number;
  trunkLeanKg?: number;
  rightLegLeanKg?: number;
  leftLegLeanKg?: number;
  rightArmFatKg?: number;
  leftArmFatKg?: number;
  trunkFatKg?: number;
  rightLegFatKg?: number;
  leftLegFatKg?: number;
}

export interface InBodyParseResult {
  parsed: Partial<InBodyScanInput>;
  missing: string[];
  rawHeaders: string[];
}

const REQUIRED_FIELDS: (keyof InBodyScanInput)[] = [
  "weightKg",
  "bodyFatPercent",
  "bodyFatMassKg",
  "skeletalMuscleMassKg",
  "leanBodyMassKg",
  "bmi",
];

export function parseInBody(
  buffer: Buffer,
  extension: string
): InBodyParseResult {
  const ext = extension.toLowerCase().replace(/^\./, "");

  const raw =
    ext === "csv"
      ? parseCSV(buffer)
      : parseExcel(buffer);

  const aliasLookup = buildAliasLookup();
  const parsed: Partial<InBodyScanInput> = {};
  const matchedFields = new Set<string>();

  // Use first data row for field extraction
  const row = raw.rows[0] ?? {};

  for (const header of raw.headers) {
    const normalised = normaliseHeader(header);
    const field = aliasLookup.get(normalised);
    if (!field) continue;

    const rawValue = row[header];
    if (rawValue === undefined || rawValue === "") continue;

    const num = parseFloat(String(rawValue).replace(/[^0-9.\-]/g, ""));
    if (isNaN(num)) continue;

    // Integer fields
    if (field === "basalMetabolicRate") {
      (parsed as Record<string, number>)[field] = Math.round(num);
    } else {
      (parsed as Record<string, number>)[field] = num;
    }

    matchedFields.add(field);
  }

  // Derive leanBodyMassKg = weight − bodyFatMass when not present in export
  if (!matchedFields.has("leanBodyMassKg") && parsed.weightKg != null && parsed.bodyFatMassKg != null) {
    parsed.leanBodyMassKg = Math.round((parsed.weightKg - parsed.bodyFatMassKg) * 100) / 100;
    matchedFields.add("leanBodyMassKg");
  }

  // Determine which canonical fields had no matching column
  const allFields = Object.keys(COLUMN_MAP) as (keyof InBodyScanInput)[];
  const missing = allFields.filter((f) => !matchedFields.has(f));

  return {
    parsed,
    missing,
    rawHeaders: raw.headers,
  };
}

export { REQUIRED_FIELDS };
