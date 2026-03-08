"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

const snippet = `<script src="https://your-flip-url.vercel.app/sdk/flip.min.js"></script>
<script>
  const flip = Flip.init({ apiKey: "flip_live_your_key_here" });

  // Feature flags
  const enabled = await flip.isEnabled("dark-mode");

  // A/B tests — get the assigned variant
  const variant = await flip.getVariant("checkout-flow");
  if (variant === "variant-a") {
    showNewCheckout();
  }

  // Track conversions
  flip.track("purchase", { value: 49.99 });
</script>`;

const npmSnippet = `import { Flip } from "@anthropic/flip-sdk";

const flip = new Flip({ apiKey: process.env.FLIP_API_KEY });

// Server-side flag check
const enabled = await flip.isEnabled("dark-mode");

// A/B test assignment
const variant = await flip.getVariant("checkout-flow", { visitorId: userId });`;

export function SdkSnippet() {
  const [tab, setTab] = useState<"script" | "npm">("script");
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(tab === "script" ? snippet : npmSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-4 py-2 bg-muted/50">
        <div className="flex gap-2">
          <button
            onClick={() => setTab("script")}
            className={`text-xs px-3 py-1 rounded-full ${tab === "script" ? "bg-accent text-accent-fg" : "text-muted-fg"}`}
          >
            Script tag
          </button>
          <button
            onClick={() => setTab("npm")}
            className={`text-xs px-3 py-1 rounded-full ${tab === "npm" ? "bg-accent text-accent-fg" : "text-muted-fg"}`}
          >
            npm
          </button>
        </div>
        <button onClick={copy} className="flex items-center gap-1 text-xs text-muted-fg hover:text-foreground">
          {copied ? <Check size={12} className="text-success" /> : <Copy size={12} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="p-4 text-xs overflow-x-auto font-mono leading-relaxed">
        {tab === "script" ? snippet : npmSnippet}
      </pre>
    </div>
  );
}
