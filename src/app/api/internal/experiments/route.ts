import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createExperimentSchema } from "@/lib/schemas";

const DEMO_KEY_ID = process.env.DEMO_API_KEY_ID || "";

export async function GET() {
  const experiments = await db.experiment.findMany({
    where: { apiKeyId: DEMO_KEY_ID },
    include: {
      variants: true,
      _count: { select: { events: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(experiments);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = createExperimentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { variants, ...data } = parsed.data;

  const experiment = await db.experiment.create({
    data: {
      ...data,
      apiKeyId: DEMO_KEY_ID,
      variants: { create: variants },
    },
    include: { variants: true },
  });

  return NextResponse.json(experiment, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const { id, status } = await req.json();
  const experiment = await db.experiment.update({
    where: { id },
    data: { status },
  });
  return NextResponse.json(experiment);
}
