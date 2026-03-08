"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, FlaskConical } from "lucide-react";

interface ExperimentWithMeta {
  id: string;
  key: string;
  name: string;
  status: string;
  goalEvent: string;
  variants: { key: string; name: string; weight: number }[];
  _count: { events: number };
}

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-fg",
  running: "bg-success/20 text-success",
  paused: "bg-warning/20 text-warning",
  completed: "bg-accent/20 text-accent",
};

export function ExperimentList({
  initialExperiments,
}: {
  initialExperiments: ExperimentWithMeta[];
}) {
  const [experiments, setExperiments] = useState(initialExperiments);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    key: "",
    name: "",
    goalEvent: "",
  });

  async function createExperiment(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/internal/experiments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        variants: [
          { key: "control", name: "Control", weight: 50 },
          { key: "variant-a", name: "Variant A", weight: 50 },
        ],
      }),
    });
    if (res.ok) {
      const exp = await res.json();
      setExperiments((prev) => [{ ...exp, _count: { events: 0 } }, ...prev]);
      setForm({ key: "", name: "", goalEvent: "" });
      setShowForm(false);
    }
  }

  return (
    <div>
      <button
        onClick={() => setShowForm(!showForm)}
        className="mb-4 flex items-center gap-2 px-4 py-2 bg-accent text-accent-fg rounded-md text-sm font-medium hover:bg-accent/90 transition-colors"
      >
        <Plus size={14} />
        New Experiment
      </button>

      {showForm && (
        <form onSubmit={createExperiment} className="mb-6 p-4 border border-border rounded-lg flex gap-3">
          <input
            value={form.key}
            onChange={(e) => setForm((f) => ({ ...f, key: e.target.value }))}
            placeholder="experiment-key"
            className="bg-muted border border-border rounded px-3 py-2 text-sm flex-1"
          />
          <input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Display name"
            className="bg-muted border border-border rounded px-3 py-2 text-sm flex-1"
          />
          <input
            value={form.goalEvent}
            onChange={(e) => setForm((f) => ({ ...f, goalEvent: e.target.value }))}
            placeholder="Goal event (e.g. signup)"
            className="bg-muted border border-border rounded px-3 py-2 text-sm flex-1"
          />
          <button type="submit" className="px-4 py-2 bg-accent text-accent-fg rounded text-sm font-medium">
            Create
          </button>
        </form>
      )}

      <div className="grid gap-4">
        {experiments.length === 0 && (
          <p className="text-muted-fg text-sm text-center py-8">No experiments yet</p>
        )}
        {experiments.map((exp) => (
          <Link
            key={exp.id}
            href={`/dashboard/experiments/${exp.id}`}
            className="border border-border rounded-lg p-5 hover:border-accent/50 transition-colors block"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <FlaskConical size={16} className="text-muted-fg" />
                <h3 className="font-medium">{exp.name}</h3>
                <span className="font-mono text-xs text-muted-fg">{exp.key}</span>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[exp.status] || ""}`}>
                {exp.status}
              </span>
            </div>
            <div className="flex gap-6 text-sm text-muted-fg">
              <span>{exp.variants.length} variants</span>
              <span>{exp._count.events} events</span>
              <span>Goal: {exp.goalEvent}</span>
            </div>
            <div className="mt-3 flex gap-0.5 h-2 rounded-full overflow-hidden">
              {exp.variants.map((v, i) => (
                <div
                  key={v.key}
                  className={`${i === 0 ? "bg-muted-fg/30" : "bg-accent"}`}
                  style={{ width: `${v.weight}%` }}
                />
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
