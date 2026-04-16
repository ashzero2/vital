import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import Link from "next/link";
import {
  classifyBMI, classifyBodyFat, classifyVisceralFat,
  bmiColor, bodyFatColor, visceralFatColor,
} from "@/lib/utils/inbody-metrics";
import { ScanCompare } from "@/components/scans/ScanCompare";
import { DeleteScanButton } from "@/components/scans/DeleteScanButton";
import { ChevronLeft } from "lucide-react";

type Params = { params: Promise<{ id: string }> };

function fmt(n: number | null | undefined, decimals = 1) {
  return n != null ? n.toFixed(decimals) : "—";
}

function fmtDate(d: Date | string) {
  return new Date(d).toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
}

export default async function ScanDetailPage({ params }: Params) {
  const session = await auth();
  if (!session) redirect("/login");

  const { id } = await params;
  const scan = await prisma.inBodyScan.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!scan) notFound();

  // Previous scan for comparison
  const previous = await prisma.inBodyScan.findFirst({
    where: { userId: session.user.id, scanDate: { lt: scan.scanDate } },
    orderBy: { scanDate: "desc" },
  });

  const bmiCat = classifyBMI(scan.bmi);
  const bfCat = classifyBodyFat(scan.bodyFatPercent);
  const vflCat = scan.visceralFatLevel != null
    ? classifyVisceralFat(scan.visceralFatLevel)
    : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      {/* Back */}
      <Link
        href="/scans"
        className="mb-6 inline-flex items-center gap-1 text-sm text-white/40 hover:text-white/70"
      >
        <ChevronLeft size={14} />
        All Scans
      </Link>

      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Scan Details</h1>
          <p className="mt-1 text-sm text-white/40">{fmtDate(scan.scanDate)}</p>
        </div>
        <DeleteScanButton scanId={scan.id} />
      </div>

      {/* Core metrics grid */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <MetricCard
          label="Weight"
          value={fmt(scan.weightKg)}
          unit="kg"
        />
        <MetricCard
          label="Body Fat"
          value={fmt(scan.bodyFatPercent)}
          unit="%"
          tag={bfCat}
          tagColor={bodyFatColor(bfCat)}
        />
        <MetricCard
          label="Fat Mass"
          value={fmt(scan.bodyFatMassKg)}
          unit="kg"
        />
        <MetricCard
          label="Skeletal Muscle"
          value={fmt(scan.skeletalMuscleMassKg)}
          unit="kg"
        />
        <MetricCard
          label="Lean Body Mass"
          value={fmt(scan.leanBodyMassKg)}
          unit="kg"
        />
        <MetricCard
          label="BMI"
          value={fmt(scan.bmi)}
          tag={bmiCat}
          tagColor={bmiColor(bmiCat)}
        />
        {scan.basalMetabolicRate != null && (
          <MetricCard label="BMR" value={String(scan.basalMetabolicRate)} unit="kcal" />
        )}
        {scan.visceralFatLevel != null && vflCat && (
          <MetricCard
            label="Visceral Fat"
            value={fmt(scan.visceralFatLevel, 0)}
            tag={vflCat}
            tagColor={visceralFatColor(vflCat)}
          />
        )}
        {scan.totalBodyWaterL != null && (
          <MetricCard label="Total Body Water" value={fmt(scan.totalBodyWaterL)} unit="L" />
        )}
      </div>

      {/* Segmental breakdown */}
      {(scan.rightArmLeanKg || scan.trunkLeanKg || scan.rightLegLeanKg) && (
        <section className="mb-6">
          <h2 className="mb-3 text-xs uppercase tracking-widest text-white/30">Segmental Lean Mass</h2>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {[
              { label: "R. Arm", value: scan.rightArmLeanKg },
              { label: "L. Arm", value: scan.leftArmLeanKg },
              { label: "Trunk", value: scan.trunkLeanKg },
              { label: "R. Leg", value: scan.rightLegLeanKg },
              { label: "L. Leg", value: scan.leftLegLeanKg },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-lg border border-white/6 bg-white/3 p-3 text-center">
                <p className="text-[10px] text-white/30">{label}</p>
                <p className="text-sm font-semibold text-white">{fmt(value)} <span className="text-[10px] text-white/30">kg</span></p>
              </div>
            ))}
          </div>
        </section>
      )}

      {(scan.rightArmFatKg || scan.trunkFatKg || scan.rightLegFatKg) && (
        <section className="mb-6">
          <h2 className="mb-3 text-xs uppercase tracking-widest text-white/30">Segmental Fat Mass</h2>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {[
              { label: "R. Arm", value: scan.rightArmFatKg },
              { label: "L. Arm", value: scan.leftArmFatKg },
              { label: "Trunk", value: scan.trunkFatKg },
              { label: "R. Leg", value: scan.rightLegFatKg },
              { label: "L. Leg", value: scan.leftLegFatKg },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-lg border border-white/6 bg-white/3 p-3 text-center">
                <p className="text-[10px] text-white/30">{label}</p>
                <p className="text-sm font-semibold text-white">{fmt(value)} <span className="text-[10px] text-white/30">kg</span></p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Notes */}
      {scan.notes && (
        <section className="mb-6 rounded-xl border border-white/6 bg-white/3 p-5">
          <h2 className="mb-2 text-xs uppercase tracking-widest text-white/30">Notes</h2>
          <p className="text-sm text-white/70 whitespace-pre-wrap">{scan.notes}</p>
        </section>
      )}

      {/* Comparison */}
      {previous && (
        <section>
          <h2 className="mb-3 text-xs uppercase tracking-widest text-white/30">Changes Since Last Scan</h2>
          <ScanCompare current={scan} previous={previous} previousDate={previous.scanDate} />
        </section>
      )}
    </div>
  );
}

function MetricCard({
  label, value, unit, tag, tagColor,
}: {
  label: string;
  value: string;
  unit?: string;
  tag?: string;
  tagColor?: string;
}) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/3 p-4">
      <p className="text-[10px] uppercase tracking-widest text-white/30">{label}</p>
      <p className="mt-1 text-xl font-bold text-white">
        {value}
        {unit && <span className="ml-1 text-xs font-normal text-white/30">{unit}</span>}
      </p>
      {tag && <p className={`text-xs font-medium ${tagColor}`}>{tag}</p>}
    </div>
  );
}
