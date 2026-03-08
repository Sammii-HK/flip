import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/lib/auth";
import { db } from "@/lib/db";
import { assignVariant } from "@/lib/hashing";
import { decideSchema } from "@/lib/schemas";

export async function POST(req: NextRequest) {
  const { error, apiKey } = await validateApiKey(req);
  if (error) return error;

  const body = await req.json();
  const parsed = decideSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { flagKey, visitorId: providedVid } = parsed.data;

  // Check if it's a simple flag
  const flag = await db.flag.findUnique({
    where: { apiKeyId_key: { apiKeyId: apiKey!.id, key: flagKey } },
  });

  if (flag) {
    return NextResponse.json({ flagKey, enabled: flag.enabled, type: "flag" });
  }

  // Check if it's an experiment
  const experiment = await db.experiment.findUnique({
    where: { apiKeyId_key: { apiKeyId: apiKey!.id, key: flagKey } },
    include: { variants: { orderBy: { key: "asc" } } },
  });

  if (!experiment) {
    return NextResponse.json({ error: "Flag or experiment not found" }, { status: 404 });
  }

  if (experiment.status !== "running") {
    return NextResponse.json({
      flagKey,
      variant: experiment.variants[0]?.key ?? "control",
      type: "experiment",
      status: experiment.status,
    });
  }

  const visitorId = providedVid || req.cookies.get("flip_vid")?.value || crypto.randomUUID();
  const variantKey = assignVariant(visitorId, experiment.key, experiment.variants);
  const variant = experiment.variants.find((v) => v.key === variantKey);

  if (variant) {
    // Record exposure
    db.event
      .create({
        data: {
          type: "exposure",
          visitorId,
          experimentId: experiment.id,
          variantId: variant.id,
          apiKeyId: apiKey!.id,
        },
      })
      .catch(() => {});
  }

  const res = NextResponse.json({
    flagKey,
    variant: variantKey,
    type: "experiment",
    visitorId,
  });

  if (!providedVid && !req.cookies.get("flip_vid")) {
    res.cookies.set("flip_vid", visitorId, {
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
      sameSite: "lax",
    });
  }

  return res;
}
