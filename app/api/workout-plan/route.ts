import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { getAIProvider } from "@/lib/ai";

const bodySchema = z.object({
  daysPerWeek: z.number().int().min(1).max(7),
  splitType: z.enum(["PPL", "Upper-Lower", "Full Body", "Bro Split"]),
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

  const { daysPerWeek, splitType, scanId } = parsed.data;

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
    const planData = await ai.generateWorkoutPlan({ daysPerWeek, splitType, scan: scanSnapshot });

    const record = await prisma.workoutPlan.create({
      data: {
        userId: session.user.id,
        planData: JSON.stringify(planData),
        daysPerWeek,
        splitType,
      },
    });

    return NextResponse.json({ data: { id: record.id, planData }, error: null }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[workout-plan] AI generation failed:", message);
    return NextResponse.json(
      { data: null, error: `AI generation failed: ${message}` },
      { status: 502 }
    );
  }
}

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  }

  const plans = await prisma.workoutPlan.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      daysPerWeek: true,
      splitType: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ data: plans, error: null });
}
