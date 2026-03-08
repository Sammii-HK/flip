"use client";

import { useState } from "react";
import { Flag } from "@prisma/client";
import { Plus } from "lucide-react";

export function FlagList({ initialFlags }: { initialFlags: Flag[] }) {
  const [flags, setFlags] = useState(initialFlags);
  const [showForm, setShowForm] = useState(false);
  const [key, setKey] = useState("");
  const [name, setName] = useState("");

  async function toggleFlag(id: string, enabled: boolean) {
    setFlags((prev) => prev.map((f) => (f.id === id ? { ...f, enabled } : f)));
    await fetch("/api/internal/flags", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, enabled }),
    });
  }

  async function createFlag(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/internal/flags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, name }),
    });
    if (res.ok) {
      const flag = await res.json();
      setFlags((prev) => [flag, ...prev]);
      setKey("");
      setName("");
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
        New Flag
      </button>

      {showForm && (
        <form onSubmit={createFlag} className="mb-6 p-4 border border-border rounded-lg flex gap-3">
          <input
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="flag-key"
            className="bg-muted border border-border rounded px-3 py-2 text-sm flex-1"
          />
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Display name"
            className="bg-muted border border-border rounded px-3 py-2 text-sm flex-1"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-accent text-accent-fg rounded text-sm font-medium"
          >
            Create
          </button>
        </form>
      )}

      <div className="border border-border rounded-lg divide-y divide-border">
        {flags.length === 0 && (
          <p className="p-6 text-muted-fg text-sm text-center">No flags yet</p>
        )}
        {flags.map((flag) => (
          <div key={flag.id} className="flex items-center justify-between p-4">
            <div>
              <p className="font-medium text-sm">{flag.name}</p>
              <p className="text-xs text-muted-fg font-mono">{flag.key}</p>
            </div>
            <button
              onClick={() => toggleFlag(flag.id, !flag.enabled)}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                flag.enabled ? "bg-success" : "bg-muted"
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  flag.enabled ? "translate-x-5" : ""
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
