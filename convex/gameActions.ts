import { v } from "convex/values";

import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { action } from "./_generated/server";
import type { BoothSlug, FireTier } from "./lib/game";
import { boothSlug, fireTier, isOpaqueToken, SESSION_LIFETIME_MS } from "./lib/game";
import { randomOpaqueToken, sha256 } from "./lib/security";

type SessionRejection = { status: "rejected"; reason: "invalid_session" };
type BoothRejection = { status: "rejected"; reason: "unknown_booth" | "inactive_booth" };
type QuestStartResult =
  | {
      status: "started";
      attemptId: Id<"questAttempts">;
      questId: string;
      requiredBugs: number;
      minimumElapsedMs: number;
      maximumElapsedMs: number;
      expiresAt: number;
    }
  | SessionRejection
  | BoothRejection;
type QuestCompletionResult =
  | {
      status: "completed";
      replay: boolean;
      boothSlug: BoothSlug;
      questId: string;
      completedAt: number;
    }
  | SessionRejection
  | BoothRejection
  | {
      status: "rejected";
      reason:
        | "attempt_not_found"
        | "attempt_mismatch"
        | "attempt_expired"
        | "attempt_used"
        | "quest_not_satisfied";
    };
type QuestHitResult =
  | { status: "recorded"; replay: boolean; hitCount: number; requiredBugs: number }
  | SessionRejection
  | {
      status: "rejected";
      reason:
        | "attempt_not_found"
        | "attempt_mismatch"
        | "attempt_expired"
        | "attempt_used"
        | "invalid_hit_key"
        | "hit_too_fast"
        | "quest_already_satisfied";
    };
type FuelResult =
  | {
      status: "accepted";
      replay: boolean;
      dateKey: string;
      fuelsRemaining: number;
      booth: { slug: BoothSlug; fireScore: number; fireTier: FireTier };
    }
  | SessionRejection
  | BoothRejection
  | {
      status: "rejected";
      reason:
        | "invalid_idempotency_key"
        | "unverified"
        | "quest_incomplete"
        | "daily_limit"
        | "booth_daily_limit";
    };

const sessionRejection = v.object({
  status: v.literal("rejected"),
  reason: v.literal("invalid_session"),
});
const boothRejection = v.object({
  status: v.literal("rejected"),
  reason: v.union(v.literal("unknown_booth"), v.literal("inactive_booth")),
});

export const createGuestSession = action({
  args: {},
  returns: v.object({
    status: v.literal("created"),
    sessionToken: v.string(),
    expiresAt: v.number(),
  }),
  handler: async (context) => {
    const sessionToken = randomOpaqueToken();
    const tokenHash = await sha256(sessionToken);
    const issuedAt = Date.now();
    const expiresAt = issuedAt + SESSION_LIFETIME_MS;
    await context.runMutation(internal.gameStore.createGuestSession, {
      tokenHash,
      issuedAt,
      expiresAt,
    });
    return { status: "created" as const, sessionToken, expiresAt };
  },
});

export const startQuest = action({
  args: { sessionToken: v.string(), boothSlug: v.string() },
  returns: v.union(
    v.object({
      status: v.literal("started"),
      attemptId: v.id("questAttempts"),
      questId: v.string(),
      requiredBugs: v.number(),
      minimumElapsedMs: v.number(),
      maximumElapsedMs: v.number(),
      expiresAt: v.number(),
    }),
    sessionRejection,
    boothRejection,
  ),
  handler: async (context, args): Promise<QuestStartResult> => {
    if (!isOpaqueToken(args.sessionToken)) {
      return { status: "rejected" as const, reason: "invalid_session" as const };
    }
    const result: QuestStartResult = await context.runMutation(internal.gameStore.startQuest, {
      tokenHash: await sha256(args.sessionToken),
      boothSlug: args.boothSlug,
      now: Date.now(),
    });
    return result;
  },
});

export const completeQuest = action({
  args: {
    sessionToken: v.string(),
    attemptId: v.id("questAttempts"),
  },
  returns: v.union(
    v.object({
      status: v.literal("completed"),
      replay: v.boolean(),
      boothSlug,
      questId: v.string(),
      completedAt: v.number(),
    }),
    sessionRejection,
    boothRejection,
    v.object({
      status: v.literal("rejected"),
      reason: v.union(
        v.literal("attempt_not_found"),
        v.literal("attempt_mismatch"),
        v.literal("attempt_expired"),
        v.literal("attempt_used"),
        v.literal("quest_not_satisfied"),
      ),
    }),
  ),
  handler: async (context, args): Promise<QuestCompletionResult> => {
    if (!isOpaqueToken(args.sessionToken)) {
      return { status: "rejected" as const, reason: "invalid_session" as const };
    }
    const result: QuestCompletionResult = await context.runMutation(
      internal.gameStore.completeQuest,
      {
        tokenHash: await sha256(args.sessionToken),
        attemptId: args.attemptId,
        now: Date.now(),
      },
    );
    return result;
  },
});

export const recordQuestHit = action({
  args: {
    sessionToken: v.string(),
    attemptId: v.id("questAttempts"),
    hitKey: v.string(),
  },
  returns: v.union(
    v.object({
      status: v.literal("recorded"),
      replay: v.boolean(),
      hitCount: v.number(),
      requiredBugs: v.number(),
    }),
    sessionRejection,
    v.object({
      status: v.literal("rejected"),
      reason: v.union(
        v.literal("attempt_not_found"),
        v.literal("attempt_mismatch"),
        v.literal("attempt_expired"),
        v.literal("attempt_used"),
        v.literal("invalid_hit_key"),
        v.literal("hit_too_fast"),
        v.literal("quest_already_satisfied"),
      ),
    }),
  ),
  handler: async (context, args): Promise<QuestHitResult> => {
    if (!isOpaqueToken(args.sessionToken)) {
      return { status: "rejected" as const, reason: "invalid_session" as const };
    }
    const result: QuestHitResult = await context.runMutation(internal.gameStore.recordQuestHit, {
      tokenHash: await sha256(args.sessionToken),
      attemptId: args.attemptId,
      hitKey: args.hitKey,
      now: Date.now(),
    });
    return result;
  },
});

export const fuelBooth = action({
  args: { sessionToken: v.string(), boothSlug: v.string(), idempotencyKey: v.string() },
  returns: v.union(
    v.object({
      status: v.literal("accepted"),
      replay: v.boolean(),
      dateKey: v.string(),
      fuelsRemaining: v.number(),
      booth: v.object({ slug: boothSlug, fireScore: v.number(), fireTier }),
    }),
    sessionRejection,
    boothRejection,
    v.object({
      status: v.literal("rejected"),
      reason: v.union(
        v.literal("invalid_idempotency_key"),
        v.literal("unverified"),
        v.literal("quest_incomplete"),
        v.literal("daily_limit"),
        v.literal("booth_daily_limit"),
      ),
    }),
  ),
  handler: async (context, args): Promise<FuelResult> => {
    if (!isOpaqueToken(args.sessionToken)) {
      return { status: "rejected" as const, reason: "invalid_session" as const };
    }
    const result: FuelResult = await context.runMutation(internal.gameStore.fuelBooth, {
      tokenHash: await sha256(args.sessionToken),
      boothSlug: args.boothSlug,
      idempotencyKey: args.idempotencyKey,
      now: Date.now(),
    });
    return result;
  },
});
