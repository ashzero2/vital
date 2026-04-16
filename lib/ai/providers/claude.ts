import Anthropic from "@anthropic-ai/sdk";
import type { AIProvider, InsightParams, MealPlanParams, MealPlanData, WorkoutPlanParams, WorkoutPlanData } from "../types";
import { buildInsightPrompt, buildInsightRetryPrompt } from "../prompts/insights";
import { buildMealPlanPrompt, buildMealPlanRetryPrompt } from "../prompts/meal-plan";
import { buildWorkoutPlanPrompt, buildWorkoutPlanRetryPrompt } from "../prompts/workout-plan";

const MODEL = "claude-sonnet-4-6";

export class ClaudeProvider implements AIProvider {
  private client: Anthropic;

  constructor() {
    this.client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }

  async generateInsight(params: InsightParams): Promise<string> {
    const prompt = buildInsightPrompt(params);

    const msg = await this.client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: [
        {
          type: "text",
          text: "You are a certified fitness and nutrition coach.",
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [{ role: "user", content: prompt }],
    });

    const block = msg.content.find((b) => b.type === "text");
    if (!block || block.type !== "text") throw new Error("No text in Claude response");
    return block.text.trim();
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
    const text = await this._call(firstPrompt);
    try {
      JSON.parse(text);
      return text;
    } catch {
      // retry once with stricter prompt
      const retryText = await this._call(retryPrompt);
      JSON.parse(retryText); // throws if still invalid — caller handles
      return retryText;
    }
  }

  private async _call(userPrompt: string): Promise<string> {
    const msg = await this.client.messages.create({
      model: MODEL,
      max_tokens: 4096,
      system: [
        {
          type: "text",
          text: "You are a certified fitness and nutrition coach. Reply only with what is asked — no extra prose.",
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [{ role: "user", content: userPrompt }],
    });

    const block = msg.content.find((b) => b.type === "text");
    if (!block || block.type !== "text") throw new Error("No text in Claude response");
    return block.text.trim();
  }
}
