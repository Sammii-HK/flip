import { NextRequest, NextResponse } from "next/server";
import { db } from "./db";

export async function validateApiKey(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    return { error: NextResponse.json({ error: "Missing API key" }, { status: 401 }), apiKey: null };
  }

  const key = auth.slice(7);
  const apiKey = await db.apiKey.findUnique({ where: { key } });

  if (!apiKey) {
    return { error: NextResponse.json({ error: "Invalid API key" }, { status: 401 }), apiKey: null };
  }

  db.apiKey.update({ where: { id: apiKey.id }, data: { lastUsed: new Date() } }).catch(() => {});

  return { error: null, apiKey };
}
