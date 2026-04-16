import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { getAIProvider } from "@/lib/ai";

const bodySchema = z.object({
  caloricTarget: z.number().int().positive(),
  goal: z.enum(["cut", "maintain", "bulk"]),
  region: z.string().optional(),
  scanId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ data: null, error: "Invalid JSON." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { data: null, error: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const { caloricTarget, goal, region, scanId } = parsed.data;

  // Optionally attach scan context
  let scanSnapshot = undefined;
  if (scanId) {
    const scan = await prisma.inBodyScan.findUnique({
      where: { id: scanId },
      select: {
        userId: true,
        scanDate: true,
        weightKg: true,
        bodyFatPercent: true,
        bodyFatMassKg: true,
        skeletalMuscleMassKg: true,
        leanBodyMassKg: true,
        bmi: true,
        basalMetabolicRate: true,
        visceralFatLevel: true,
        totalBodyWaterL: true,
      },
    });
    if (!scan || scan.userId !== session.user.id) {
      return NextResponse.json({ data: null, error: "Scan not found." }, { status: 404 });
    }
    scanSnapshot = scan;
  }

  try {
    const ai = getAIProvider();
    const planData = await ai.generateMealPlan({ caloricTarget, goal, region, scan: scanSnapshot });

    const record = await prisma.mealPlan.create({
      data: {
        userId: session.user.id,
        planData: JSON.stringify(planData),
        caloricTarget,
        goal,
        region: region ?? null,
      },
    });

    return NextResponse.json({ data: { id: record.id, planData }, error: null }, { status: 201 });
  } catch (err) {
    console.error("[meal-plan] AI generation failed:", err);
    return NextResponse.json(
      { data: null, error: "AI generation failed. Please try again." },
      { status: 502 }
    );
  }
}

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  }

  const plans = await prisma.mealPlan.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      caloricTarget: true,
      goal: true,
      region: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ data: plans, error: null });
}
