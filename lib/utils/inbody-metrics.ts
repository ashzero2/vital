// ─── Classification types ─────────────────────────────────────────────────

export type BMICategory = "Underweight" | "Normal" | "Overweight" | "Obese";
export type BodyFatCategory =
  | "Essential Fat"
  | "Athletic"
  | "Fitness"
  | "Acceptable"
  | "Obese";
export type VisceralFatCategory = "Normal" | "High" | "Very High";
export type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "very_active";
export type Goal = "cut" | "maintain" | "bulk";

export interface MacroResult {
  protein: number; // g
  carbs: number;   // g
  fat: number;     // g
  calories: number;
}

export interface ScanDelta {
  weightKg: number | null;
  bodyFatPercent: number | null;
  bodyFatMassKg: number | null;
  skeletalMuscleMassKg: number | null;
  leanBodyMassKg: number | null;
  bmi: number | null;
  visceralFatLevel: number | null;
}

// ─── BMI ─────────────────────────────────────────────────────────────────

export function classifyBMI(bmi: number): BMICategory {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal";
  if (bmi < 30) return "Overweight";
  return "Obese";
}

// ─── Body fat % ──────────────────────────────────────────────────────────

export function classifyBodyFat(
  bfPercent: number,
  gender: "male" | "female" = "male",
  age: number = 30
): BodyFatCategory {
  // ACE body fat percentage categories — adjusted for age
  const isOlder = age >= 60;

  if (gender === "male") {
    const offsets = isOlder ? [3, 3, 3, 3] : [0, 0, 0, 0];
    if (bfPercent < 2 + offsets[0]) return "Essential Fat";
    if (bfPercent < 14 + offsets[1]) return "Athletic";
    if (bfPercent < 18 + offsets[2]) return "Fitness";
    if (bfPercent < 25 + offsets[3]) return "Acceptable";
    return "Obese";
  } else {
    const offsets = isOlder ? [3, 3, 3, 3] : [0, 0, 0, 0];
    if (bfPercent < 10 + offsets[0]) return "Essential Fat";
    if (bfPercent < 21 + offsets[1]) return "Athletic";
    if (bfPercent < 25 + offsets[2]) return "Fitness";
    if (bfPercent < 32 + offsets[3]) return "Acceptable";
    return "Obese";
  }
}

// ─── Visceral fat ────────────────────────────────────────────────────────

export function classifyVisceralFat(level: number): VisceralFatCategory {
  if (level < 10) return "Normal";
  if (level < 15) return "High";
  return "Very High";
}

// ─── TDEE ────────────────────────────────────────────────────────────────

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  return Math.round(bmr * ACTIVITY_MULTIPLIERS[activityLevel]);
}

// ─── Macros ──────────────────────────────────────────────────────────────

export function calculateMacros(tdee: number, goal: Goal): MacroResult {
  let calories: number;
  let proteinRatio: number; // % of calories
  let fatRatio: number;

  switch (goal) {
    case "cut":
      calories = Math.round(tdee * 0.8);
      proteinRatio = 0.35;
      fatRatio = 0.25;
      break;
    case "bulk":
      calories = Math.round(tdee * 1.15);
      proteinRatio = 0.3;
      fatRatio = 0.25;
      break;
    case "maintain":
    default:
      calories = tdee;
      proteinRatio = 0.3;
      fatRatio = 0.25;
      break;
  }

  const protein = Math.round((calories * proteinRatio) / 4);
  const fat = Math.round((calories * fatRatio) / 9);
  const carbs = Math.round((calories - protein * 4 - fat * 9) / 4);

  return { protein, carbs, fat, calories };
}

// ─── Scan delta ──────────────────────────────────────────────────────────

type ScanLike = {
  weightKg?: number | null;
  bodyFatPercent?: number | null;
  bodyFatMassKg?: number | null;
  skeletalMuscleMassKg?: number | null;
  leanBodyMassKg?: number | null;
  bmi?: number | null;
  visceralFatLevel?: number | null;
};

function diff(current?: number | null, previous?: number | null): number | null {
  if (current == null || previous == null) return null;
  return Math.round((current - previous) * 100) / 100;
}

export function calculateScanDelta(current: ScanLike, previous: ScanLike): ScanDelta {
  return {
    weightKg: diff(current.weightKg, previous.weightKg),
    bodyFatPercent: diff(current.bodyFatPercent, previous.bodyFatPercent),
    bodyFatMassKg: diff(current.bodyFatMassKg, previous.bodyFatMassKg),
    skeletalMuscleMassKg: diff(current.skeletalMuscleMassKg, previous.skeletalMuscleMassKg),
    leanBodyMassKg: diff(current.leanBodyMassKg, previous.leanBodyMassKg),
    bmi: diff(current.bmi, previous.bmi),
    visceralFatLevel: diff(current.visceralFatLevel, previous.visceralFatLevel),
  };
}

// ─── Color helpers ───────────────────────────────────────────────────────

export function bmiColor(cat: BMICategory): string {
  switch (cat) {
    case "Normal": return "text-lime-400";
    case "Underweight": return "text-amber-400";
    case "Overweight": return "text-amber-400";
    case "Obese": return "text-red-400";
  }
}

export function bodyFatColor(cat: BodyFatCategory): string {
  switch (cat) {
    case "Essential Fat":
    case "Athletic":
    case "Fitness": return "text-lime-400";
    case "Acceptable": return "text-amber-400";
    case "Obese": return "text-red-400";
  }
}

export function visceralFatColor(cat: VisceralFatCategory): string {
  switch (cat) {
    case "Normal": return "text-lime-400";
    case "High": return "text-amber-400";
    case "Very High": return "text-red-400";
  }
}

export function deltaColor(value: number | null, lowerIsBetter = false): string {
  if (value === null || value === 0) return "text-white/40";
  const positive = lowerIsBetter ? value < 0 : value > 0;
  return positive ? "text-lime-400" : "text-red-400";
}
