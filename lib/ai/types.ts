// ─── Scan snapshot passed to AI ──────────────────────────────────────────

export interface ScanSnapshot {
  scanDate: Date | string;
  weightKg: number;
  bodyFatPercent: number;
  bodyFatMassKg: number;
  skeletalMuscleMassKg: number;
  leanBodyMassKg: number;
  bmi: number;
  basalMetabolicRate?: number | null;
  visceralFatLevel?: number | null;
  totalBodyWaterL?: number | null;
}

// ─── Params ───────────────────────────────────────────────────────────────

export interface InsightParams {
  scan: ScanSnapshot;
  previousScan?: ScanSnapshot;
}

export interface MealPlanParams {
  caloricTarget: number;
  goal: "cut" | "maintain" | "bulk";
  region?: string;
  scan?: ScanSnapshot;
}

export interface WorkoutPlanParams {
  daysPerWeek: number;
  splitType: "PPL" | "Upper-Lower" | "Full Body" | "Bro Split";
  scan?: ScanSnapshot;
}

// ─── Output data shapes ───────────────────────────────────────────────────

export interface MealEntry {
  name: string;
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
}

export interface DayMeals {
  day: string;
  breakfast: MealEntry;
  lunch: MealEntry;
  dinner: MealEntry;
  snacks: MealEntry[];
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalCalories: number;
}

export interface MealPlanData {
  days: DayMeals[];
  notes?: string;
}

export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  rest: string;
  notes?: string;
}

export interface WorkoutDay {
  day: string;
  focus: string;
  exercises: Exercise[];
  cardio?: string;
}

export interface WorkoutPlanData {
  days: WorkoutDay[];
  notes?: string;
}

// ─── Provider interface ───────────────────────────────────────────────────

export interface AIProvider {
  generateInsight(params: InsightParams): Promise<string>;
  generateMealPlan(params: MealPlanParams): Promise<MealPlanData>;
  generateWorkoutPlan(params: WorkoutPlanParams): Promise<WorkoutPlanData>;
}
