"use client";

import { useState } from "react";
import { Plus, Copy, Trash2, Check } from "lucide-react";

interface ApiKeyData {
  id: string;
  name: string;
  key: string;
  createdAt: Date;
  lastUsed: Date | null;
}

export function ApiKeyManager({ initialKeys }: { initialKeys: ApiKeyData[] }) {
  const [keys, setKeys] = useState(initialKeys);
  const [copied, setCopied] = useState<string | null>(null);
  const [newName, setNewName] = useState("");

  async function createKey() {
    const res = await fetch("/api/internal/api-keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName || "Default" }),
    });
    if (res.ok) {
      const key = await res.json();
      setKeys((prev) => [key, ...prev]);
      setNewName("");
    }
  }

  async function deleteKey(id: string) {
    await fetch("/api/internal/api-keys", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setKeys((prev) => prev.filter((k) => k.id !== id));
  }

  function copyKey(key: string) {
    navigator.clipboard.writeText(key);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  function maskKey(key: string) {
    return key.slice(0, 14) + "..." + key.slice(-6);
  }

  return (
    <div>
      <div className="flex gap-3 mb-4">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Key name"
          className="bg-muted border border-border rounded px-3 py-2 text-sm flex-1"
        />
        <button
          onClick={createKey}
          className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-fg rounded-md text-sm font-medium hover:bg-accent/90"
        >
          <Plus size={14} />
          Generate Key
        </button>
      </div>

      <div className="border border-border rounded-lg divide-y divide-border">
        {keys.length === 0 && (
          <p className="p-6 text-muted-fg text-sm text-center">No API keys yet</p>
        )}
        {keys.map((k) => (
          <div key={k.id} className="flex items-center justify-between p-4">
            <div>
              <p className="font-medium text-sm">{k.name}</p>
              <p className="text-xs text-muted-fg font-mono mt-1">{maskKey(k.key)}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => copyKey(k.key)}
                className="p-2 hover:bg-muted rounded transition-colors"
              >
                {copied === k.key ? <Check size={14} className="text-success" /> : <Copy size={14} className="text-muted-fg" />}
              </button>
              <button
                onClick={() => deleteKey(k.id)}
                className="p-2 hover:bg-muted rounded transition-colors"
              >
                <Trash2 size={14} className="text-muted-fg hover:text-danger" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
