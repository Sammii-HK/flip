import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/lib/auth";
import { db } from "@/lib/db";
import { trackSchema } from "@/lib/schemas";

export async function POST(req: NextRequest) {
  const { error, apiKey } = await validateApiKey(req);
  if (error) return error;

  const body = await req.json();
  const parsed = trackSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { experimentKey, visitorId, variantKey, eventName, metadata } = parsed.data;

  const experiment = await db.experiment.findUnique({
    where: { apiKeyId_key: { apiKeyId: apiKey!.id, key: experimentKey } },
    include: { variants: true },
  });

  if (!experiment) {
    return NextResponse.json({ error: "Experiment not found" }, { status: 404 });
  }

  const variant = experiment.variants.find((v) => v.key === variantKey);
  if (!variant) {
    return NextResponse.json({ error: "Variant not found" }, { status: 404 });
  }

  await db.event.create({
    data: {
      type: "conversion",
      visitorId,
      experimentId: experiment.id,
      variantId: variant.id,
      apiKeyId: apiKey!.id,
      eventName,
      metadata: (metadata as Record<string, string | number | boolean>) ?? undefined,
    },
  });

  return NextResponse.json({ ok: true });
}
