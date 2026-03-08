import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  // Create demo API key
  const apiKey = await db.apiKey.upsert({
    where: { key: "flip_live_demo_key_for_testing_purposes_only" },
    update: {},
    create: {
      name: "Demo Key",
      key: "flip_live_demo_key_for_testing_purposes_only",
    },
  });

  console.log(`API Key ID: ${apiKey.id}`);
  console.log(`Set DEMO_API_KEY_ID=${apiKey.id} in your .env`);

  // Create some flags
  const flags = [
    { key: "dark-mode", name: "Dark Mode", enabled: true },
    { key: "new-checkout", name: "New Checkout Flow", enabled: false },
    { key: "ai-recommendations", name: "AI Recommendations", enabled: true },
    { key: "beta-dashboard", name: "Beta Dashboard", enabled: false },
  ];

  for (const f of flags) {
    await db.flag.upsert({
      where: { apiKeyId_key: { apiKeyId: apiKey.id, key: f.key } },
      update: {},
      create: { ...f, apiKeyId: apiKey.id },
    });
  }

  // Create experiment with demo data
  const experiment = await db.experiment.upsert({
    where: { apiKeyId_key: { apiKeyId: apiKey.id, key: "checkout-flow" } },
    update: {},
    create: {
      key: "checkout-flow",
      name: "Checkout Flow Redesign",
      goalEvent: "purchase",
      status: "running",
      apiKeyId: apiKey.id,
      variants: {
        create: [
          { key: "control", name: "Control", weight: 50 },
          { key: "variant-a", name: "Single Page", weight: 50 },
        ],
      },
    },
    include: { variants: true },
  });

  // Seed events for the experiment
  const variants = experiment.variants;
  const control = variants.find((v) => v.key === "control")!;
  const variantA = variants.find((v) => v.key === "variant-a")!;

  // Control: 1000 exposures, 32 conversions (3.2%)
  // Variant A: 1000 exposures, 48 conversions (4.8%) — should show ~95% confidence
  const events = [];

  for (let i = 0; i < 1000; i++) {
    const vid = `visitor-control-${i}`;
    events.push({
      type: "exposure",
      visitorId: vid,
      experimentId: experiment.id,
      variantId: control.id,
      apiKeyId: apiKey.id,
    });
    if (i < 32) {
      events.push({
        type: "conversion",
        visitorId: vid,
        experimentId: experiment.id,
        variantId: control.id,
        apiKeyId: apiKey.id,
        eventName: "purchase",
      });
    }
  }

  for (let i = 0; i < 1000; i++) {
    const vid = `visitor-variant-${i}`;
    events.push({
      type: "exposure",
      visitorId: vid,
      experimentId: experiment.id,
      variantId: variantA.id,
      apiKeyId: apiKey.id,
    });
    if (i < 48) {
      events.push({
        type: "conversion",
        visitorId: vid,
        experimentId: experiment.id,
        variantId: variantA.id,
        apiKeyId: apiKey.id,
        eventName: "purchase",
      });
    }
  }

  await db.event.createMany({ data: events });

  // Second experiment
  const exp2 = await db.experiment.upsert({
    where: { apiKeyId_key: { apiKeyId: apiKey.id, key: "pricing-page" } },
    update: {},
    create: {
      key: "pricing-page",
      name: "Pricing Page Layout",
      goalEvent: "signup",
      status: "running",
      apiKeyId: apiKey.id,
      variants: {
        create: [
          { key: "control", name: "Control", weight: 34 },
          { key: "cards", name: "Card Layout", weight: 33 },
          { key: "comparison", name: "Comparison Table", weight: 33 },
        ],
      },
    },
    include: { variants: true },
  });

  const exp2Events = [];
  const v0 = exp2.variants.find((v) => v.key === "control")!;
  const v1 = exp2.variants.find((v) => v.key === "cards")!;
  const v2 = exp2.variants.find((v) => v.key === "comparison")!;

  // Control: 500 exp, 25 conv (5.0%)
  // Cards: 480 exp, 31 conv (6.5%)
  // Comparison: 510 exp, 20 conv (3.9%)
  for (let i = 0; i < 500; i++) {
    exp2Events.push({ type: "exposure", visitorId: `p-ctrl-${i}`, experimentId: exp2.id, variantId: v0.id, apiKeyId: apiKey.id });
    if (i < 25) exp2Events.push({ type: "conversion", visitorId: `p-ctrl-${i}`, experimentId: exp2.id, variantId: v0.id, apiKeyId: apiKey.id, eventName: "signup" });
  }
  for (let i = 0; i < 480; i++) {
    exp2Events.push({ type: "exposure", visitorId: `p-card-${i}`, experimentId: exp2.id, variantId: v1.id, apiKeyId: apiKey.id });
    if (i < 31) exp2Events.push({ type: "conversion", visitorId: `p-card-${i}`, experimentId: exp2.id, variantId: v1.id, apiKeyId: apiKey.id, eventName: "signup" });
  }
  for (let i = 0; i < 510; i++) {
    exp2Events.push({ type: "exposure", visitorId: `p-comp-${i}`, experimentId: exp2.id, variantId: v2.id, apiKeyId: apiKey.id });
    if (i < 20) exp2Events.push({ type: "conversion", visitorId: `p-comp-${i}`, experimentId: exp2.id, variantId: v2.id, apiKeyId: apiKey.id, eventName: "signup" });
  }

  await db.event.createMany({ data: exp2Events });

  console.log("Seeded: 4 flags, 2 experiments with event data");
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
