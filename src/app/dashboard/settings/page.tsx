import { db } from "@/lib/db";
import { ApiKeyManager } from "@/components/api-key-manager";
import { SdkSnippet } from "@/components/sdk-snippet";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
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

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Settings</h1>

      <section className="mb-12">
        <h2 className="text-lg font-semibold mb-4">API Keys</h2>
        <ApiKeyManager initialKeys={keys} />
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">SDK Integration</h2>
        <SdkSnippet />
      </section>
    </div>
  );
}
