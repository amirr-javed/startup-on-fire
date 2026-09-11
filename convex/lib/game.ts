import { v } from "convex/values";

export const fireTier = v.union(v.literal("cold"), v.literal("hot"), v.literal("blazing"));
export type FireTier = "cold" | "hot" | "blazing";

export const boothSlug = v.union(
  v.literal("kindred-labs"),
  v.literal("signal-garden"),
  v.literal("ember-studio"),
);
export type BoothSlug = "kindred-labs" | "signal-garden" | "ember-studio";

export type BoothDefinition = Readonly<{
  slug: BoothSlug;
  name: string;
  founder: string;
  ensName: string;
  questId: string;
  requiredBugs: number;
  minimumElapsedMs: number;
  maximumElapsedMs: number;
}>;

export const BOOTHS: readonly BoothDefinition[] = [
  {
    slug: "kindred-labs",
    name: "Kindred Labs",
    founder: "Maya",
    ensName: "kindred.firecity.eth",
    questId: "kindred-bug-squash-v1",
    requiredBugs: 8,
    minimumElapsedMs: 1_500,
    maximumElapsedMs: 30_000,
  },
  {
    slug: "signal-garden",
    name: "Signal Garden",
    founder: "Ilyas",
    ensName: "signal-garden.firecity.eth",
    questId: "signal-bug-squash-v1",
    requiredBugs: 8,
    minimumElapsedMs: 1_500,
    maximumElapsedMs: 30_000,
  },
  {
    slug: "ember-studio",
    name: "Ember Studio",
    founder: "Noor",
    ensName: "ember-studio.firecity.eth",
    questId: "ember-bug-squash-v1",
    requiredBugs: 8,
    minimumElapsedMs: 1_500,
    maximumElapsedMs: 30_000,
  },
] as const;

export const SESSION_LIFETIME_MS = 7 * 24 * 60 * 60 * 1_000;
export const QUEST_ATTEMPT_LIFETIME_MS = 5 * 60 * 1_000;
export const MAX_DAILY_FUELS = 3;
export const MAX_CLOCK_SKEW_MS = 2_000;
export const MINIMUM_HIT_INTERVAL_MS = 150;

export function boothForSlug(slug: string): BoothDefinition | null {
  return BOOTHS.find((booth) => booth.slug === slug) ?? null;
}

export function tierForScore(score: number): FireTier {
  if (score >= 15) return "blazing";
  if (score >= 5) return "hot";
  return "cold";
}

export function utcDateKey(now: number): string {
  return new Date(now).toISOString().slice(0, 10);
}

const OPAQUE_TOKEN = /^[A-Za-z0-9_-]{43}$/;
const IDEMPOTENCY_KEY = /^[A-Za-z0-9][A-Za-z0-9._:-]{7,127}$/;
const HIT_KEY = /^[A-Za-z0-9][A-Za-z0-9_-]{7,63}$/;

export function isOpaqueToken(value: string): boolean {
  return OPAQUE_TOKEN.test(value);
}

export function isIdempotencyKey(value: string): boolean {
  return IDEMPOTENCY_KEY.test(value);
}

export function isHitKey(value: string): boolean {
  return HIT_KEY.test(value);
}
