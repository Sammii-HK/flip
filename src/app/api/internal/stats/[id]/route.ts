import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { computeStats } from "@/lib/stats";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const experiment = await db.experiment.findUnique({
    where: { id },
    include: { variants: true },
  });

  if (!experiment) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const variantStats = await Promise.all(
    experiment.variants.map(async (v) => {
      const [exposures, conversions] = await Promise.all([
        db.event.count({
          where: { variantId: v.id, type: "exposure" },
        }),
        db.event.count({
          where: { variantId: v.id, type: "conversion" },
        }),
      ]);
      return { key: v.key, name: v.name, exposures, conversions };
    })
  );

  const stats = computeStats(variantStats);

  return NextResponse.json({
    experiment: {
      id: experiment.id,
      key: experiment.key,
      name: experiment.name,
      status: experiment.status,
      goalEvent: experiment.goalEvent,
    },
    ...stats,
  });
}
