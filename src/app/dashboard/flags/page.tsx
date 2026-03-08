import { db } from "@/lib/db";
import { FlagList } from "@/components/flag-list";

export const dynamic = "force-dynamic";

const DEMO_KEY_ID = process.env.DEMO_API_KEY_ID || "";

export default async function FlagsPage() {
  const flags = await db.flag.findMany({
    where: { apiKeyId: DEMO_KEY_ID },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Feature Flags</h1>
      </div>
      <FlagList initialFlags={flags} />
    </div>
  );
}
