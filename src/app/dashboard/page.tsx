import { db } from "@/lib/db";
import { Flag, FlaskConical, Activity } from "lucide-react";
import Link from "next/link";

const DEMO_KEY_ID = process.env.DEMO_API_KEY_ID || "";

export default async function DashboardPage() {
  const [flagCount, experimentCount, eventCount] = await Promise.all([
    db.flag.count({ where: { apiKeyId: DEMO_KEY_ID } }),
    db.experiment.count({ where: { apiKeyId: DEMO_KEY_ID } }),
    db.event.count({ where: { apiKeyId: DEMO_KEY_ID } }),
  ]);

  const stats = [
    { label: "Flags", value: flagCount, icon: Flag, href: "/dashboard/flags" },
    { label: "Experiments", value: experimentCount, icon: FlaskConical, href: "/dashboard/experiments" },
    { label: "Events", value: eventCount, icon: Activity, href: "#" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Dashboard</h1>
      <div className="grid grid-cols-3 gap-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="border border-border rounded-lg p-6 hover:border-accent/50 transition-colors"
          >
            <div className="flex items-center gap-3 text-muted-fg mb-2">
              <s.icon size={16} />
              <span className="text-sm">{s.label}</span>
            </div>
            <p className="text-3xl font-bold">{s.value}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
