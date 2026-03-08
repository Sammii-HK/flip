// Flip SDK — drop-in feature flags and A/B testing
// Usage: const flip = Flip.init({ apiKey: "flip_live_..." });

(function () {
  const COOKIE = "flip_vid";

  function getCookie(name: string): string | null {
    const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
    return match ? decodeURIComponent(match[1]) : null;
  }

  function setCookie(name: string, value: string, days: number) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires};path=/;SameSite=Lax`;
  }

  function uuid(): string {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
    });
  }

  class FlipClient {
    private apiKey: string;
    private baseUrl: string;
    private visitorId: string;
    private cache: Record<string, string> = {};

    constructor(opts: { apiKey: string; baseUrl?: string }) {
      this.apiKey = opts.apiKey;
      this.baseUrl = (opts.baseUrl || "").replace(/\/$/, "");
      this.visitorId = getCookie(COOKIE) || uuid();
      setCookie(COOKIE, this.visitorId, 365);
    }

    async getVariant(experimentKey: string): Promise<string> {
      if (this.cache[experimentKey]) return this.cache[experimentKey];

      const res = await fetch(`${this.baseUrl}/api/v1/decide`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({ flagKey: experimentKey, visitorId: this.visitorId }),
      });

      const data = await res.json();
      const variant = data.variant || "control";
      this.cache[experimentKey] = variant;
      return variant;
    }

    async isEnabled(flagKey: string): Promise<boolean> {
      const res = await fetch(`${this.baseUrl}/api/v1/decide`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({ flagKey, visitorId: this.visitorId }),
      });

      const data = await res.json();
      return data.enabled === true;
    }

    track(eventName: string, metadata?: Record<string, unknown>) {
      const lastVariant = Object.entries(this.cache).pop();
      if (!lastVariant) return;

      const body = JSON.stringify({
        experimentKey: lastVariant[0],
        variantKey: lastVariant[1],
        visitorId: this.visitorId,
        eventName,
        metadata,
      });

      if (navigator.sendBeacon) {
        navigator.sendBeacon(
          `${this.baseUrl}/api/v1/track`,
          new Blob([body], { type: "application/json" })
        );
      } else {
        fetch(`${this.baseUrl}/api/v1/track`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
          body,
          keepalive: true,
        });
      }
    }
  }

  (window as any).Flip = {
    init: (opts: { apiKey: string; baseUrl?: string }) => new FlipClient(opts),
  };
})();
