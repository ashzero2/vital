import type { MealPlanParams } from "../types";

const MEAL_PLAN_SCHEMA = `{
  "days": [
    {
      "day": "Monday",
      "breakfast": { "name": "string", "protein": number, "carbs": number, "fat": number, "calories": number },
      "lunch":     { "name": "string", "protein": number, "carbs": number, "fat": number, "calories": number },
      "dinner":    { "name": "string", "protein": number, "carbs": number, "fat": number, "calories": number },
      "snacks":    [{ "name": "string", "protein": number, "carbs": number, "fat": number, "calories": number }],
      "totalProtein": number,
      "totalCarbs": number,
      "totalFat": number,
      "totalCalories": number
    }
  ],
  "notes": "optional string"
}`;

export function buildMealPlanPrompt({ caloricTarget, goal, region, scan }: MealPlanParams): string {
  const goalDesc = goal === "cut"
    ? "fat loss (caloric deficit)"
    : goal === "bulk"
    ? "muscle gain (caloric surplus)"
    : "body recomposition (maintenance calories)";

  const lines: string[] = [
    "You are a registered dietitian creating a personalised 7-day meal plan.",
    `Goal: ${goalDesc}`,
    `Daily caloric target: ${caloricTarget} kcal`,
    `Cuisine preference: ${region ?? "balanced international"}`,
  ];

  if (scan) {
    lines.push(`Client stats: ${scan.weightKg} kg, ${scan.bodyFatPercent}% body fat, ${scan.skeletalMuscleMassKg} kg skeletal muscle mass`);
  }

  lines.push(
    "",
    "Requirements:",
    "- Include breakfast, lunch, dinner, and 1–2 snacks per day.",
    "- Vary meals across days (do not repeat the same meal).",
    "- Ensure daily totals stay within ±50 kcal of the caloric target.",
    "- Use realistic portion sizes with accurate macros.",
    "- Provide exactly 7 days (Monday–Sunday).",
    "",
    "IMPORTANT: Reply with valid JSON only. No markdown fences, no explanation text before or after.",
    "JSON schema to follow exactly:",
    MEAL_PLAN_SCHEMA,
  );

  return lines.join("\n");
}

export function buildMealPlanRetryPrompt(params: MealPlanParams): string {
  return (
    buildMealPlanPrompt(params) +
    "\n\nYour previous response was not valid JSON. Reply with ONLY the raw JSON object — no markdown, no ```json fences, no prose."
  );
}
