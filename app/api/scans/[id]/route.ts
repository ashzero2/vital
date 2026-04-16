import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";

const patchSchema = z.object({
  notes: z.string().max(2000).optional(),
});

type Params = { params: Promise<{ id: string }> };

async function getScanForUser(id: string, userId: string) {
  return prisma.inBodyScan.findFirst({ where: { id, userId } });
}

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const scan = await getScanForUser(id, session.user.id);
  if (!scan) {
    return NextResponse.json({ data: null, error: "Scan not found." }, { status: 404 });
  }

  return NextResponse.json({ data: scan, error: null });
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await getScanForUser(id, session.user.id);
  if (!existing) {
    return NextResponse.json({ data: null, error: "Scan not found." }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ data: null, error: "Invalid JSON." }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { data: null, error: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const updated = await prisma.inBodyScan.update({
    where: { id },
    data: { notes: parsed.data.notes },
  });

  return NextResponse.json({ data: updated, error: null });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await getScanForUser(id, session.user.id);
  if (!existing) {
    return NextResponse.json({ data: null, error: "Scan not found." }, { status: 404 });
  }

  await prisma.inBodyScan.delete({ where: { id } });
  return NextResponse.json({ data: { id }, error: null });
}
