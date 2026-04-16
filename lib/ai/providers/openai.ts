import OpenAI from "openai";
import type { AIProvider, InsightParams, MealPlanParams, MealPlanData, WorkoutPlanParams, WorkoutPlanData } from "../types";
import { buildInsightPrompt, buildInsightRetryPrompt } from "../prompts/insights";
import { buildMealPlanPrompt, buildMealPlanRetryPrompt } from "../prompts/meal-plan";
import { buildWorkoutPlanPrompt, buildWorkoutPlanRetryPrompt } from "../prompts/workout-plan";

const MODEL = "gpt-4o";

export class OpenAIProvider implements AIProvider {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  async generateInsight(params: InsightParams): Promise<string> {
    const prompt = buildInsightPrompt(params);
    return this._call("You are a certified fitness and nutrition coach.", prompt, 1024);
  }

  async generateMealPlan(params: MealPlanParams): Promise<MealPlanData> {
    const prompt = buildMealPlanPrompt(params);
    const text = await this._callForJson(
      "You are a certified fitness and nutrition coach. Reply only with JSON.",
      prompt,
      buildMealPlanRetryPrompt(params),
    );
    return JSON.parse(text) as MealPlanData;
  }

  async generateWorkoutPlan(params: WorkoutPlanParams): Promise<WorkoutPlanData> {
    const prompt = buildWorkoutPlanPrompt(params);
    const text = await this._callForJson(
      "You are a certified fitness and nutrition coach. Reply only with JSON.",
      prompt,
      buildWorkoutPlanRetryPrompt(params),
    );
    return JSON.parse(text) as WorkoutPlanData;
  }

  private async _callForJson(system: string, firstPrompt: string, retryPrompt: string): Promise<string> {
    const text = await this._call(system, firstPrompt, 4096);
    try {
      JSON.parse(text);
      return text;
    } catch {
      const retryText = await this._call(system, retryPrompt, 4096);
      JSON.parse(retryText);
      return retryText;
    }
  }

  private async _call(system: string, userPrompt: string, maxTokens: number): Promise<string> {
    const res = await this.client.chat.completions.create({
      model: MODEL,
      max_tokens: maxTokens,
      messages: [
        { role: "system", content: system },
        { role: "user", content: userPrompt },
      ],
    });
    return res.choices[0]?.message?.content?.trim() ?? "";
  }
}
