import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import Link from "next/link";
import { ScanCard } from "@/components/scans/ScanCard";
import { Plus, ScanLine } from "lucide-react";

const PAGE_SIZE = 10;

export default async function ScansPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10));
  const skip = (page - 1) * PAGE_SIZE;

  const [scans, total] = await Promise.all([
    prisma.inBodyScan.findMany({
      where: { userId: session.user.id },
      orderBy: { scanDate: "desc" },
      skip,
      take: PAGE_SIZE,
    }),
    prisma.inBodyScan.count({ where: { userId: session.user.id } }),
  ]);

  const pages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Scans</h1>
          <p className="text-sm text-muted-foreground">
            {total} {total === 1 ? "scan" : "scans"} recorded
          </p>
        </div>
        <Link
          href="/scans/new"
          className="flex items-center gap-2 rounded-lg bg-lime-400 px-4 py-2 text-sm font-bold text-black transition-opacity hover:opacity-90"
        >
          <Plus size={16} />
          New Scan
        </Link>
      </div>

      {/* Empty state */}
      {scans.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-accent py-20 text-center">
          <ScanLine size={40} className="mb-4 text-muted-foreground/50" />
          <p className="text-sm font-medium text-muted-foreground">No scans yet</p>
          <p className="mt-1 text-xs text-muted-foreground">Add your first InBody scan to get started.</p>
          <Link
            href="/scans/new"
            className="mt-6 flex items-center gap-2 rounded-lg bg-lime-400 px-4 py-2 text-sm font-bold text-black"
          >
            <Plus size={14} />
            Add Scan
          </Link>
        </div>
      )}

      {/* Scan list */}
      {scans.length > 0 && (
        <div className="space-y-2">
          {scans.map((scan) => (
            <ScanCard
              key={scan.id}
              id={scan.id}
              scanDate={scan.scanDate}
              weightKg={scan.weightKg}
              bodyFatPercent={scan.bodyFatPercent}
              skeletalMuscleMassKg={scan.skeletalMuscleMassKg}
              bmi={scan.bmi}
              visceralFatLevel={scan.visceralFatLevel}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          {page > 1 && (
            <Link
              href={`/scans?page=${page - 1}`}
              className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:border-border hover:text-foreground"
            >
              Previous
            </Link>
          )}
          <span className="text-sm text-muted-foreground">
            Page {page} of {pages}
          </span>
          {page < pages && (
            <Link
              href={`/scans?page=${page + 1}`}
              className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:border-border hover:text-foreground"
            >
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
