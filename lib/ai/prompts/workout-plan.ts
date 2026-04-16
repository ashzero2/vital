import type { WorkoutPlanParams } from "../types";

const WORKOUT_SCHEMA = `{
  "days": [
    {
      "day": "Monday",
      "focus": "string (e.g. 'Push — Chest, Shoulders, Triceps')",
      "exercises": [
        { "name": "string", "sets": number, "reps": "string", "rest": "string", "notes": "optional string" }
      ],
      "cardio": "optional string (e.g. '10 min incline walk')"
    }
  ],
  "notes": "optional string"
}`;

export function buildWorkoutPlanPrompt({ daysPerWeek, splitType, scan }: WorkoutPlanParams): string {
  const lines: string[] = [
    "You are a certified strength and conditioning coach creating a personalised workout plan.",
    `Training days per week: ${daysPerWeek}`,
    `Training split: ${splitType}`,
  ];

  if (scan) {
    lines.push(`Client stats: ${scan.weightKg} kg bodyweight, ${scan.bodyFatPercent}% body fat, ${scan.skeletalMuscleMassKg} kg skeletal muscle mass`);
  }

  lines.push(
    "",
    "Requirements:",
    `- Provide exactly ${daysPerWeek} training days. Include rest days if needed to fill the week.`,
    "- Each training day should have 4–6 exercises appropriate for the split.",
    "- Include sets, reps (use ranges like '8-12' for hypertrophy), and rest periods.",
    "- Add cardio recommendations where appropriate.",
    "- Balance muscle groups sensibly — avoid overtraining the same muscle two days in a row.",
    "- Notes field for exercises is optional but useful for form cues.",
    "",
    "IMPORTANT: Reply with valid JSON only. No markdown fences, no explanation text before or after.",
    "JSON schema to follow exactly:",
    WORKOUT_SCHEMA,
  );

  return lines.join("\n");
}

export function buildWorkoutPlanRetryPrompt(params: WorkoutPlanParams): string {
  return (
    buildWorkoutPlanPrompt(params) +
    "\n\nYour previous response was not valid JSON. Reply with ONLY the raw JSON object — no markdown, no ```json fences, no prose."
  );
}
