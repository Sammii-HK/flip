import { db } from "@/lib/db";
import { computeStats } from "@/lib/stats";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
import { ExperimentControls } from "@/components/experiment-controls";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function ExperimentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const experiment = await db.experiment.findUnique({
    where: { id },
    include: { variants: { orderBy: { key: "asc" } } },
  });

  if (!experiment) notFound();

  const variantData = await Promise.all(
    experiment.variants.map(async (v) => {
      const [exposures, conversions] = await Promise.all([
        db.event.count({ where: { variantId: v.id, type: "exposure" } }),
        db.event.count({ where: { variantId: v.id, type: "conversion" } }),
      ]);
      return { key: v.key, name: v.name, exposures, conversions };
    })
  );

  const stats = computeStats(variantData);

  return (
    <div>
      <Link
        href="/dashboard/experiments"
        className="flex items-center gap-2 text-sm text-muted-fg hover:text-foreground mb-6"
      >
        <ArrowLeft size={14} />
        Back to experiments
      </Link>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">{experiment.name}</h1>
          <p className="text-muted-fg text-sm font-mono mt-1">{experiment.key}</p>
        </div>
        <ExperimentControls id={experiment.id} status={experiment.status} />
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="border border-border rounded-lg p-4">
          <p className="text-sm text-muted-fg">Total Exposures</p>
          <p className="text-2xl font-bold mt-1">{stats.totalExposures.toLocaleString()}</p>
        </div>
        <div className="border border-border rounded-lg p-4">
          <p className="text-sm text-muted-fg">Total Conversions</p>
          <p className="text-2xl font-bold mt-1">{stats.totalConversions.toLocaleString()}</p>
        </div>
        <div className="border border-border rounded-lg p-4">
          <p className="text-sm text-muted-fg">Goal Event</p>
          <p className="text-2xl font-bold mt-1 font-mono">{experiment.goalEvent}</p>
        </div>
      </div>

      {stats.hasWinner && (
        <div className="mb-6 p-4 border border-success/30 bg-success/5 rounded-lg">
          <p className="text-success font-medium">
            Winner: {stats.variants.find((v) => v.key === stats.winnerKey)?.name} with{" "}
            {((stats.variants.find((v) => v.key === stats.winnerKey)?.rate ?? 0) * 100).toFixed(2)}% conversion rate
          </p>
        </div>
      )}

      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left p-4 font-medium text-muted-fg">Variant</th>
              <th className="text-right p-4 font-medium text-muted-fg">Exposures</th>
              <th className="text-right p-4 font-medium text-muted-fg">Conversions</th>
              <th className="text-right p-4 font-medium text-muted-fg">Rate</th>
              <th className="text-right p-4 font-medium text-muted-fg">Lift</th>
              <th className="text-right p-4 font-medium text-muted-fg">Confidence</th>
              <th className="text-left p-4 font-medium text-muted-fg">Status</th>
            </tr>
          </thead>
          <tbody>
            {stats.variants.map((v, i) => (
              <tr key={v.key} className="border-b border-border last:border-0">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-3 h-3 rounded-full ${i === 0 ? "bg-muted-fg/40" : "bg-accent"}`}
                    />
                    <span className="font-medium">{v.name}</span>
                  </div>
                </td>
                <td className="p-4 text-right tabular-nums">{v.exposures.toLocaleString()}</td>
                <td className="p-4 text-right tabular-nums">{v.conversions.toLocaleString()}</td>
                <td className="p-4 text-right tabular-nums font-medium">
                  {(v.rate * 100).toFixed(2)}%
                </td>
                <td className="p-4 text-right tabular-nums">
                  {v.lift === null ? (
                    <span className="text-muted-fg">baseline</span>
                  ) : (
                    <span className={v.lift > 0 ? "text-success" : v.lift < 0 ? "text-danger" : ""}>
                      {v.lift > 0 ? "+" : ""}
                      {(v.lift * 100).toFixed(2)}pp
                      {v.liftPercent !== null && (
                        <span className="text-muted-fg ml-1">
                          ({v.liftPercent > 0 ? "+" : ""}
                          {v.liftPercent.toFixed(1)}%)
                        </span>
                      )}
                    </span>
                  )}
                </td>
                <td className="p-4 text-right tabular-nums">
                  {v.confidence === null ? (
                    <span className="text-muted-fg">-</span>
                  ) : (
                    <span>{v.confidence.toFixed(1)}%</span>
                  )}
                </td>
                <td className="p-4">
                  {i === 0 ? (
                    <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-fg">Control</span>
                  ) : v.significant ? (
                    <span className="text-xs px-2 py-1 rounded-full bg-success/20 text-success font-medium">
                      Significant
                    </span>
                  ) : (v.confidence ?? 0) >= 90 ? (
                    <span className="text-xs px-2 py-1 rounded-full bg-warning/20 text-warning font-medium">
                      Likely
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-fg">
                      Not yet
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {stats.totalExposures > 0 && (
        <div className="mt-6 border border-border rounded-lg p-4">
          <p className="text-sm font-medium mb-3">Conversion Rate</p>
          <div className="space-y-3">
            {stats.variants.map((v, i) => {
              const maxRate = Math.max(...stats.variants.map((x) => x.rate), 0.01);
              return (
                <div key={v.key} className="flex items-center gap-3">
                  <span className="text-xs text-muted-fg w-20 shrink-0">{v.name}</span>
                  <div className="flex-1 bg-muted rounded-full h-6 relative overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        i === 0 ? "bg-muted-fg/40" : "bg-accent"
                      }`}
                      style={{ width: `${(v.rate / maxRate) * 100}%` }}
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-mono">
                      {(v.rate * 100).toFixed(2)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
