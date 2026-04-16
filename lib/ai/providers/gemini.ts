import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AIProvider, InsightParams, MealPlanParams, MealPlanData, WorkoutPlanParams, WorkoutPlanData } from "../types";
import { buildInsightPrompt, buildInsightRetryPrompt } from "../prompts/insights";
import { buildMealPlanPrompt, buildMealPlanRetryPrompt } from "../prompts/meal-plan";
import { buildWorkoutPlanPrompt, buildWorkoutPlanRetryPrompt } from "../prompts/workout-plan";

const MODEL = "gemini-2.0-flash";

export class GeminiProvider implements AIProvider {
  private genAI: GoogleGenerativeAI;

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");
  }

  async generateInsight(params: InsightParams): Promise<string> {
    const prompt = buildInsightPrompt(params);
    return this._call(prompt, 1024);
  }

  async generateMealPlan(params: MealPlanParams): Promise<MealPlanData> {
    const prompt = buildMealPlanPrompt(params);
    const text = await this._callForJson(prompt, buildMealPlanRetryPrompt(params));
    return JSON.parse(text) as MealPlanData;
  }

  async generateWorkoutPlan(params: WorkoutPlanParams): Promise<WorkoutPlanData> {
    const prompt = buildWorkoutPlanPrompt(params);
    const text = await this._callForJson(prompt, buildWorkoutPlanRetryPrompt(params));
    return JSON.parse(text) as WorkoutPlanData;
  }

  private async _callForJson(firstPrompt: string, retryPrompt: string): Promise<string> {
    const text = await this._call(firstPrompt, 4096);
    try {
      JSON.parse(text);
      return text;
    } catch {
      const retryText = await this._call(retryPrompt, 4096);
      JSON.parse(retryText);
      return retryText;
    }
  }

  private async _call(prompt: string, maxTokens: number): Promise<string> {
    const model = this.genAI.getGenerativeModel({
      model: MODEL,
      generationConfig: { maxOutputTokens: maxTokens },
    });
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  }
}
