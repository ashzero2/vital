import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";

const scanSchema = z.object({
  scanDate: z.string().optional(),
  notes: z.string().optional(),
  // Core — required
  weightKg: z.number(),
  bodyFatPercent: z.number(),
  bodyFatMassKg: z.number(),
  skeletalMuscleMassKg: z.number(),
  leanBodyMassKg: z.number(),
  bmi: z.number(),
  // Optional
  basalMetabolicRate: z.number().int().optional().nullable(),
  visceralFatLevel: z.number().optional().nullable(),
  totalBodyWaterL: z.number().optional().nullable(),
  intracellularWaterL: z.number().optional().nullable(),
  extracellularWaterL: z.number().optional().nullable(),
  proteinKg: z.number().optional().nullable(),
  mineralsKg: z.number().optional().nullable(),
  rightArmLeanKg: z.number().optional().nullable(),
  leftArmLeanKg: z.number().optional().nullable(),
  trunkLeanKg: z.number().optional().nullable(),
  rightLegLeanKg: z.number().optional().nullable(),
  leftLegLeanKg: z.number().optional().nullable(),
  rightArmFatKg: z.number().optional().nullable(),
  leftArmFatKg: z.number().optional().nullable(),
  trunkFatKg: z.number().optional().nullable(),
  rightLegFatKg: z.number().optional().nullable(),
  leftLegFatKg: z.number().optional().nullable(),
});

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "10", 10)));
  const skip = (page - 1) * limit;

  const [scans, total] = await Promise.all([
    prisma.inBodyScan.findMany({
      where: { userId: session.user.id },
      orderBy: { scanDate: "desc" },
      skip,
      take: limit,
      select: {
        id: true,
        scanDate: true,
        weightKg: true,
        bodyFatPercent: true,
        skeletalMuscleMassKg: true,
        bmi: true,
        visceralFatLevel: true,
        notes: true,
        createdAt: true,
      },
    }),
    prisma.inBodyScan.count({ where: { userId: session.user.id } }),
  ]);

  return NextResponse.json({
    data: { scans, total, page, limit, pages: Math.ceil(total / limit) },
    error: null,
  });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ data: null, error: "Invalid JSON." }, { status: 400 });
  }

  const parsed = scanSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { data: null, error: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const { scanDate, ...rest } = parsed.data;

  const scan = await prisma.inBodyScan.create({
    data: {
      ...rest,
      userId: session.user.id,
      scanDate: scanDate ? new Date(scanDate) : new Date(),
    },
  });

  return NextResponse.json({ data: scan, error: null }, { status: 201 });
}
