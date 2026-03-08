"use client";

import { useRouter } from "next/navigation";
import { Play, Pause, CheckCircle } from "lucide-react";

export function ExperimentControls({ id, status }: { id: string; status: string }) {
  const router = useRouter();

  async function updateStatus(newStatus: string) {
    await fetch("/api/internal/experiments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: newStatus }),
    });
    router.refresh();
  }

  return (
    <div className="flex gap-2">
      {status === "draft" && (
        <button
          onClick={() => updateStatus("running")}
          className="flex items-center gap-2 px-4 py-2 bg-success text-white rounded-md text-sm font-medium hover:bg-success/90"
        >
          <Play size={14} />
          Start
        </button>
      )}
      {status === "running" && (
        <>
          <button
            onClick={() => updateStatus("paused")}
            className="flex items-center gap-2 px-4 py-2 bg-warning text-black rounded-md text-sm font-medium hover:bg-warning/90"
          >
            <Pause size={14} />
            Pause
          </button>
          <button
            onClick={() => updateStatus("completed")}
            className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-md text-sm font-medium hover:bg-accent/90"
          >
            <CheckCircle size={14} />
            Complete
          </button>
        </>
      )}
      {status === "paused" && (
        <button
          onClick={() => updateStatus("running")}
          className="flex items-center gap-2 px-4 py-2 bg-success text-white rounded-md text-sm font-medium hover:bg-success/90"
        >
          <Play size={14} />
          Resume
        </button>
      )}
      {status === "completed" && (
        <span className="text-sm text-muted-fg px-4 py-2">Completed</span>
      )}
    </div>
  );
}
