import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { getAIProvider } from "@/lib/ai";
import type { ScanSnapshot } from "@/lib/ai/types";

function toSnapshot(scan: {
  scanDate: Date;
  weightKg: number;
  bodyFatPercent: number;
  bodyFatMassKg: number;
  skeletalMuscleMassKg: number;
  leanBodyMassKg: number;
  bmi: number;
  basalMetabolicRate?: number | null;
  visceralFatLevel?: number | null;
  totalBodyWaterL?: number | null;
}): ScanSnapshot {
  return {
    scanDate: scan.scanDate,
    weightKg: scan.weightKg,
    bodyFatPercent: scan.bodyFatPercent,
    bodyFatMassKg: scan.bodyFatMassKg,
    skeletalMuscleMassKg: scan.skeletalMuscleMassKg,
    leanBodyMassKg: scan.leanBodyMassKg,
    bmi: scan.bmi,
    basalMetabolicRate: scan.basalMetabolicRate,
    visceralFatLevel: scan.visceralFatLevel,
    totalBodyWaterL: scan.totalBodyWaterL,
  };
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  }

  let body: { scanId: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ data: null, error: "Invalid JSON." }, { status: 400 });
  }

  if (!body?.scanId || typeof body.scanId !== "string") {
    return NextResponse.json({ data: null, error: "scanId is required." }, { status: 422 });
  }

  // Fetch the scan (and verify ownership)
  const scan = await prisma.inBodyScan.findUnique({
    where: { id: body.scanId },
    select: {
      id: true,
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
      aiInsight: true,
    },
  });

  if (!scan || scan.userId !== session.user.id) {
    return NextResponse.json({ data: null, error: "Scan not found." }, { status: 404 });
  }

  // Return cached insight if already generated
  if (scan.aiInsight) {
    return NextResponse.json({ data: { insight: scan.aiInsight, cached: true }, error: null });
  }

  // Find the previous scan for comparison
  const previousScan = await prisma.inBodyScan.findFirst({
    where: {
      userId: session.user.id,
      scanDate: { lt: scan.scanDate },
    },
    orderBy: { scanDate: "desc" },
    select: {
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

  try {
    const ai = getAIProvider();
    const insight = await ai.generateInsight({
      scan: toSnapshot(scan),
      previousScan: previousScan ? toSnapshot(previousScan) : undefined,
    });

    // Persist insight to avoid re-generating
    await prisma.inBodyScan.update({
      where: { id: scan.id },
      data: { aiInsight: insight },
    });

    return NextResponse.json({ data: { insight, cached: false }, error: null });
  } catch (err) {
    console.error("[insights] AI generation failed:", err);
    return NextResponse.json(
      { data: null, error: "AI generation failed. Please try again." },
      { status: 502 }
    );
  }
}
