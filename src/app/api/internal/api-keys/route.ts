import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateApiKey } from "@/lib/utils";

export async function GET() {
  const keys = await db.apiKey.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      key: true,
      createdAt: true,
      lastUsed: true,
    },
  });
  return NextResponse.json(keys);
}

export async function POST(req: NextRequest) {
  const { name } = await req.json();
  const key = generateApiKey();

  const apiKey = await db.apiKey.create({
    data: { name: name || "Default", key },
  });

  return NextResponse.json(apiKey, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  await db.apiKey.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
