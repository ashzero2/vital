import { parseInBody } from "@/lib/parsers/inbody";

// Standard InBody CSV with all required + some optional fields
const STANDARD_CSV = `Weight,Body Fat Percent,Body Fat Mass,Skeletal Muscle Mass,Lean Body Mass,BMI,Basal Metabolic Rate,Visceral Fat Level,Total Body Water
78.5,22.3,17.5,33.2,61.0,24.1,1680,8,42.5`;

// CSV with non-standard / aliased column names
const ALIASED_CSV = `Wt,PBF,Fat Mass,SMM,FFM,Body Mass Index,BMR,VFL,TBW
78.5,22.3,17.5,33.2,61.0,24.1,1680,8,42.5`;

// CSV with unknown columns only
const UNKNOWN_CSV = `UnknownCol1,UnknownCol2,RandomHeader
100,200,300`;

describe("parseInBody — CSV", () => {
  it("maps all standard InBody column names correctly", () => {
    const buf = Buffer.from(STANDARD_CSV, "utf-8");
    const { parsed, missing } = parseInBody(buf, ".csv");

    expect(parsed.weightKg).toBe(78.5);
    expect(parsed.bodyFatPercent).toBe(22.3);
    expect(parsed.bodyFatMassKg).toBe(17.5);
    expect(parsed.skeletalMuscleMassKg).toBe(33.2);
    expect(parsed.leanBodyMassKg).toBe(61.0);
    expect(parsed.bmi).toBe(24.1);
    expect(parsed.basalMetabolicRate).toBe(1680);
    expect(parsed.visceralFatLevel).toBe(8);
    expect(parsed.totalBodyWaterL).toBe(42.5);

    // Required fields should all be present
    expect(missing).not.toContain("weightKg");
    expect(missing).not.toContain("bmi");
    expect(missing).not.toContain("bodyFatPercent");
  });

  it("maps aliased / abbreviated column names correctly", () => {
    const buf = Buffer.from(ALIASED_CSV, "utf-8");
    const { parsed } = parseInBody(buf, ".csv");

    expect(parsed.weightKg).toBe(78.5);
    expect(parsed.bodyFatPercent).toBe(22.3);
    expect(parsed.skeletalMuscleMassKg).toBe(33.2);
    expect(parsed.bmi).toBe(24.1);
    expect(parsed.basalMetabolicRate).toBe(1680);
  });

  it("puts unrecognised columns into missing[]", () => {
    const buf = Buffer.from(UNKNOWN_CSV, "utf-8");
    const { parsed, missing } = parseInBody(buf, ".csv");

    expect(Object.keys(parsed)).toHaveLength(0);
    expect(missing).toContain("weightKg");
    expect(missing).toContain("bmi");
    expect(missing).toContain("bodyFatPercent");
  });

  it("handles UTF-8 BOM without error", () => {
    const bom = Buffer.from([0xef, 0xbb, 0xbf]);
    const content = Buffer.from(STANDARD_CSV, "utf-8");
    const buf = Buffer.concat([bom, content]);
    const { parsed } = parseInBody(buf, ".csv");
    expect(parsed.weightKg).toBe(78.5);
  });

  it("returns rawHeaders matching CSV columns", () => {
    const buf = Buffer.from(STANDARD_CSV, "utf-8");
    const { rawHeaders } = parseInBody(buf, ".csv");
    expect(rawHeaders).toContain("Weight");
    expect(rawHeaders).toContain("BMI");
  });

  it("rounds basalMetabolicRate to integer", () => {
    const csv = `Weight,Body Fat Percent,Body Fat Mass,Skeletal Muscle Mass,Lean Body Mass,BMI,Basal Metabolic Rate\n78.5,22.3,17.5,33.2,61.0,24.1,1680.7`;
    const { parsed } = parseInBody(Buffer.from(csv), ".csv");
    expect(parsed.basalMetabolicRate).toBe(1681);
  });
});
