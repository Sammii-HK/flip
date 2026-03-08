import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createFlagSchema } from "@/lib/schemas";

const DEMO_KEY_ID = process.env.DEMO_API_KEY_ID || "";

export async function GET() {
  const flags = await db.flag.findMany({
    where: { apiKeyId: DEMO_KEY_ID },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(flags);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = createFlagSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const flag = await db.flag.create({
    data: { ...parsed.data, apiKeyId: DEMO_KEY_ID },
  });
  return NextResponse.json(flag, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const { id, enabled } = await req.json();
  const flag = await db.flag.update({
    where: { id },
    data: { enabled },
  });
  return NextResponse.json(flag);
}
