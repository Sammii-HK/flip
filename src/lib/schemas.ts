import { z } from "zod";

export const createFlagSchema = z.object({
  key: z.string().min(1).regex(/^[a-z0-9-]+$/, "Lowercase alphanumeric and hyphens only"),
  name: z.string().min(1),
  description: z.string().optional(),
});

export const createExperimentSchema = z.object({
  key: z.string().min(1).regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  description: z.string().optional(),
  goalEvent: z.string().min(1),
  variants: z
    .array(
      z.object({
        key: z.string().min(1),
        name: z.string().min(1),
        weight: z.number().int().min(1).max(100),
      })
    )
    .min(2),
});

export const decideSchema = z.object({
  flagKey: z.string().min(1),
  visitorId: z.string().optional(),
});

export const trackSchema = z.object({
  experimentKey: z.string().min(1),
  visitorId: z.string().min(1),
  variantKey: z.string().min(1),
  eventName: z.string().min(1),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
