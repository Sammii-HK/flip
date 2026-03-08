import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { error, apiKey } = await validateApiKey(req);
  if (error) return error;

  const flags = await db.flag.findMany({
    where: { apiKeyId: apiKey!.id },
    select: { key: true, enabled: true },
  });

  const experiments = await db.experiment.findMany({
    where: { apiKeyId: apiKey!.id, status: "running" },
    select: { key: true },
  });

  return NextResponse.json({ flags, experiments: experiments.map((e) => e.key) });
}
