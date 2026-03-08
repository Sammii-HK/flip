import { db } from "@/lib/db";
import { ExperimentList } from "@/components/experiment-list";

export const dynamic = "force-dynamic";

const DEMO_KEY_ID = process.env.DEMO_API_KEY_ID || "";

export default async function ExperimentsPage() {
  const experiments = await db.experiment.findMany({
    where: { apiKeyId: DEMO_KEY_ID },
    include: {
      variants: true,
      _count: { select: { events: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Experiments</h1>
      </div>
      <ExperimentList initialExperiments={experiments} />
    </div>
  );
}
