import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AIProvider, InsightParams, MealPlanParams, MealPlanData, WorkoutPlanParams, WorkoutPlanData } from "../types";
import { buildInsightPrompt, buildInsightRetryPrompt } from "../prompts/insights";
import { buildMealPlanPrompt, buildMealPlanRetryPrompt } from "../prompts/meal-plan";
import { buildWorkoutPlanPrompt, buildWorkoutPlanRetryPrompt } from "../prompts/workout-plan";

// Primary model, fallback used when primary returns 503
const PRIMARY_MODEL = "gemini-flash-latest";
const FALLBACK_MODEL = "gemini-2.0-flash";

const RETRY_DELAYS_MS = [3000, 8000]; // 2 retries: wait 3s then 8s

function isRetryable(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  return err.message.includes("503") || err.message.includes("Service Unavailable");
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function stripJsonFences(text: string): string {
  return text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim();
}

export class GeminiProvider implements AIProvider {
  private genAI: GoogleGenerativeAI;

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");
  }

  async generateInsight(params: InsightParams): Promise<string> {
    return this._callWithRetry(buildInsightPrompt(params), 1024);
  }

  async generateMealPlan(params: MealPlanParams): Promise<MealPlanData> {
    const text = await this._callForJson(
      buildMealPlanPrompt(params),
      buildMealPlanRetryPrompt(params),
    );
    return JSON.parse(text) as MealPlanData;
  }

  async generateWorkoutPlan(params: WorkoutPlanParams): Promise<WorkoutPlanData> {
    const text = await this._callForJson(
      buildWorkoutPlanPrompt(params),
      buildWorkoutPlanRetryPrompt(params),
    );
    return JSON.parse(text) as WorkoutPlanData;
  }

  private async _callForJson(firstPrompt: string, retryPrompt: string): Promise<string> {
    const text = await this._callWithRetry(firstPrompt, 8192, true);
    const cleaned = stripJsonFences(text);
    try {
      JSON.parse(cleaned);
      return cleaned;
    } catch {
      const retryText = await this._callWithRetry(retryPrompt, 8192, true);
      const retryClean = stripJsonFences(retryText);
      JSON.parse(retryClean); // throws if still invalid
      return retryClean;
    }
  }

  /** Calls PRIMARY_MODEL, retries on 503 with backoff, falls back to FALLBACK_MODEL. */
  private async _callWithRetry(prompt: string, maxTokens: number, json = false): Promise<string> {
    let lastErr: unknown;

    for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
      if (attempt > 0) {
        await sleep(RETRY_DELAYS_MS[attempt - 1]);
      }
      try {
        return await this._call(PRIMARY_MODEL, prompt, maxTokens, json);
      } catch (err) {
        lastErr = err;
        if (!isRetryable(err)) break;
        console.warn(`[gemini] 503 on attempt ${attempt + 1}, retrying…`);
      }
    }

    console.warn(`[gemini] Primary model unavailable, trying fallback ${FALLBACK_MODEL}`);
    try {
      return await this._call(FALLBACK_MODEL, prompt, maxTokens, json);
    } catch (fallbackErr) {
      throw lastErr ?? fallbackErr;
    }
  }

  private async _call(model: string, prompt: string, maxTokens: number, json = false): Promise<string> {
    const m = this.genAI.getGenerativeModel({
      model,
      generationConfig: {
        maxOutputTokens: maxTokens,
        ...(json ? { responseMimeType: "application/json" } : {}),
      },
    });
    const result = await m.generateContent(prompt);
    return result.response.text().trim();
  }
}
