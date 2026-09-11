import { v } from "convex/values";

import type { Doc } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { internalMutation } from "./_generated/server";
import {
  boothForSlug,
  boothSlug,
  type BoothSlug,
  fireTier,
  isHitKey,
  isIdempotencyKey,
  MAX_DAILY_FUELS,
  MINIMUM_HIT_INTERVAL_MS,
  QUEST_ATTEMPT_LIFETIME_MS,
  tierForScore,
  utcDateKey,
} from "./lib/game";

const rejectedSession = v.object({
  status: v.literal("rejected"),
  reason: v.literal("invalid_session"),
});
const rejectedBooth = v.object({
  status: v.literal("rejected"),
  reason: v.union(v.literal("unknown_booth"), v.literal("inactive_booth")),
});

const questStartResult = v.union(
  v.object({
    status: v.literal("started"),
    attemptId: v.id("questAttempts"),
    questId: v.string(),
    requiredBugs: v.number(),
    minimumElapsedMs: v.number(),
    maximumElapsedMs: v.number(),
    expiresAt: v.number(),
  }),
  rejectedSession,
  rejectedBooth,
);

const questCompletionResult = v.union(
  v.object({
    status: v.literal("completed"),
    replay: v.boolean(),
    boothSlug,
    questId: v.string(),
    completedAt: v.number(),
  }),
  rejectedSession,
  rejectedBooth,
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
);

const questHitResult = v.union(
  v.object({
    status: v.literal("recorded"),
    replay: v.boolean(),
    hitCount: v.number(),
    requiredBugs: v.number(),
  }),
  rejectedSession,
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
);

const fuelResult = v.union(
  v.object({
    status: v.literal("accepted"),
    replay: v.boolean(),
    dateKey: v.string(),
    fuelsRemaining: v.number(),
    booth: v.object({ slug: boothSlug, fireScore: v.number(), fireTier }),
  }),
  rejectedSession,
  rejectedBooth,
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
);

async function sessionForHash(
  context: MutationCtx,
  tokenHash: string,
  now: number,
): Promise<Doc<"guestSessions"> | null> {
  const session = await context.db
    .query("guestSessions")
    .withIndex("by_token_hash", (query) => query.eq("tokenHash", tokenHash))
    .unique();
  return session !== null && session.expiresAt > now ? session : null;
}

async function boothIsInactive(context: MutationCtx, slug: string): Promise<boolean> {
  const state = await context.db
    .query("boothStates")
    .withIndex("by_slug", (query) => query.eq("slug", slug))
    .unique();
  return state?.active === false;
}

export const createGuestSession = internalMutation({
  args: { tokenHash: v.string(), issuedAt: v.number(), expiresAt: v.number() },
  returns: v.id("guestSessions"),
  handler: async (context, args) => {
    const existing = await context.db
      .query("guestSessions")
      .withIndex("by_token_hash", (query) => query.eq("tokenHash", args.tokenHash))
      .unique();
    if (existing !== null) return existing._id;
    return await context.db.insert("guestSessions", args);
  },
});

export const startQuest = internalMutation({
  args: { tokenHash: v.string(), boothSlug: v.string(), now: v.number() },
  returns: questStartResult,
  handler: async (context, args) => {
    const session = await sessionForHash(context, args.tokenHash, args.now);
    if (session === null)
      return { status: "rejected" as const, reason: "invalid_session" as const };

    const booth = boothForSlug(args.boothSlug);
    if (booth === null) return { status: "rejected" as const, reason: "unknown_booth" as const };
    if (await boothIsInactive(context, booth.slug)) {
      return { status: "rejected" as const, reason: "inactive_booth" as const };
    }

    const expiresAt = args.now + QUEST_ATTEMPT_LIFETIME_MS;
    const attemptId = await context.db.insert("questAttempts", {
      sessionId: session._id,
      boothSlug: booth.slug,
      questId: booth.questId,
      requiredBugs: booth.requiredBugs,
      minimumElapsedMs: booth.minimumElapsedMs,
      maximumElapsedMs: booth.maximumElapsedMs,
      startedAt: args.now,
      expiresAt,
      hitCount: 0,
    });
    return {
      status: "started" as const,
      attemptId,
      questId: booth.questId,
      requiredBugs: booth.requiredBugs,
      minimumElapsedMs: booth.minimumElapsedMs,
      maximumElapsedMs: booth.maximumElapsedMs,
      expiresAt,
    };
  },
});

export const recordQuestHit = internalMutation({
  args: {
    tokenHash: v.string(),
    attemptId: v.id("questAttempts"),
    hitKey: v.string(),
    now: v.number(),
  },
  returns: questHitResult,
  handler: async (context, args) => {
    const session = await sessionForHash(context, args.tokenHash, args.now);
    if (session === null)
      return { status: "rejected" as const, reason: "invalid_session" as const };
    if (!isHitKey(args.hitKey)) {
      return { status: "rejected" as const, reason: "invalid_hit_key" as const };
    }

    const attempt = await context.db.get("questAttempts", args.attemptId);
    if (attempt === null)
      return { status: "rejected" as const, reason: "attempt_not_found" as const };
    if (attempt.sessionId !== session._id) {
      return { status: "rejected" as const, reason: "attempt_mismatch" as const };
    }
    if (attempt.consumedAt !== undefined) {
      return { status: "rejected" as const, reason: "attempt_used" as const };
    }
    if (args.now > attempt.expiresAt) {
      return { status: "rejected" as const, reason: "attempt_expired" as const };
    }

    const duplicate = await context.db
      .query("questHits")
      .withIndex("by_attempt_and_key", (query) =>
        query.eq("attemptId", attempt._id).eq("hitKey", args.hitKey),
      )
      .unique();
    if (duplicate !== null) {
      return {
        status: "recorded" as const,
        replay: true,
        hitCount: attempt.hitCount,
        requiredBugs: attempt.requiredBugs,
      };
    }
    if (attempt.hitCount >= attempt.requiredBugs) {
      return { status: "rejected" as const, reason: "quest_already_satisfied" as const };
    }
    if (attempt.lastHitAt !== undefined && args.now - attempt.lastHitAt < MINIMUM_HIT_INTERVAL_MS) {
      return { status: "rejected" as const, reason: "hit_too_fast" as const };
    }

    const hitCount = attempt.hitCount + 1;
    await context.db.insert("questHits", {
      attemptId: attempt._id,
      hitKey: args.hitKey,
      ordinal: hitCount,
      recordedAt: args.now,
    });
    await context.db.patch(attempt._id, { hitCount, lastHitAt: args.now });
    return {
      status: "recorded" as const,
      replay: false,
      hitCount,
      requiredBugs: attempt.requiredBugs,
    };
  },
});

export const completeQuest = internalMutation({
  args: {
    tokenHash: v.string(),
    attemptId: v.id("questAttempts"),
    now: v.number(),
  },
  returns: questCompletionResult,
  handler: async (context, args) => {
    const session = await sessionForHash(context, args.tokenHash, args.now);
    if (session === null)
      return { status: "rejected" as const, reason: "invalid_session" as const };

    const attempt = await context.db.get("questAttempts", args.attemptId);
    if (attempt === null)
      return { status: "rejected" as const, reason: "attempt_not_found" as const };
    if (attempt.sessionId !== session._id) {
      return { status: "rejected" as const, reason: "attempt_mismatch" as const };
    }

    const booth = boothForSlug(attempt.boothSlug);
    if (booth === null) return { status: "rejected" as const, reason: "unknown_booth" as const };
    if (await boothIsInactive(context, booth.slug)) {
      return { status: "rejected" as const, reason: "inactive_booth" as const };
    }

    if (attempt.consumedAt !== undefined) {
      const completion = await context.db
        .query("questProgress")
        .withIndex("by_attempt", (query) => query.eq("attemptId", attempt._id))
        .unique();
      if (completion !== null) {
        return {
          status: "completed" as const,
          replay: true,
          boothSlug: booth.slug,
          questId: attempt.questId,
          completedAt: completion.completedAt,
        };
      }
      return { status: "rejected" as const, reason: "attempt_used" as const };
    }
    if (args.now > attempt.expiresAt) {
      return { status: "rejected" as const, reason: "attempt_expired" as const };
    }

    const serverElapsedMs = args.now - attempt.startedAt;
    const validClaim =
      attempt.hitCount === attempt.requiredBugs &&
      serverElapsedMs >= attempt.minimumElapsedMs &&
      serverElapsedMs <= attempt.maximumElapsedMs;
    if (!validClaim) return { status: "rejected" as const, reason: "quest_not_satisfied" as const };

    const existing = await context.db
      .query("questProgress")
      .withIndex("by_session_booth_and_quest", (query) =>
        query
          .eq("sessionId", session._id)
          .eq("boothSlug", booth.slug)
          .eq("questId", attempt.questId),
      )
      .unique();
    const completedAt = existing?.completedAt ?? args.now;
    if (existing === null) {
      await context.db.insert("questProgress", {
        sessionId: session._id,
        boothSlug: booth.slug,
        questId: attempt.questId,
        completedAt,
        bugsSquashed: attempt.hitCount,
        elapsedMs: serverElapsedMs,
        attemptId: attempt._id,
      });
    }
    await context.db.patch(attempt._id, { consumedAt: args.now });
    return {
      status: "completed" as const,
      replay: existing !== null,
      boothSlug: booth.slug,
      questId: attempt.questId,
      completedAt,
    };
  },
});

export const fuelBooth = internalMutation({
  args: {
    tokenHash: v.string(),
    boothSlug: v.string(),
    idempotencyKey: v.string(),
    now: v.number(),
  },
  returns: fuelResult,
  handler: async (context, args) => {
    const session = await sessionForHash(context, args.tokenHash, args.now);
    if (session === null)
      return { status: "rejected" as const, reason: "invalid_session" as const };
    if (!isIdempotencyKey(args.idempotencyKey)) {
      return { status: "rejected" as const, reason: "invalid_idempotency_key" as const };
    }

    const replay = await context.db
      .query("fuels")
      .withIndex("by_session_and_idempotency", (query) =>
        query.eq("sessionId", session._id).eq("idempotencyKey", args.idempotencyKey),
      )
      .unique();
    if (replay !== null) {
      if (replay.boothSlug !== args.boothSlug) {
        return { status: "rejected" as const, reason: "invalid_idempotency_key" as const };
      }
      const replayDay = await context.db
        .query("fuels")
        .withIndex("by_identity_and_date", (query) =>
          query.eq("worldNullifierId", replay.worldNullifierId).eq("dateKey", replay.dateKey),
        )
        .take(MAX_DAILY_FUELS + 1);
      return {
        status: "accepted" as const,
        replay: true,
        dateKey: replay.dateKey,
        fuelsRemaining: Math.max(0, MAX_DAILY_FUELS - replayDay.length),
        booth: {
          slug: replay.boothSlug as BoothSlug,
          fireScore: replay.scoreAfter,
          fireTier: replay.tierAfter,
        },
      };
    }

    const booth = boothForSlug(args.boothSlug);
    if (booth === null) return { status: "rejected" as const, reason: "unknown_booth" as const };
    const boothState = await context.db
      .query("boothStates")
      .withIndex("by_slug", (query) => query.eq("slug", booth.slug))
      .unique();
    if (boothState?.active === false) {
      return { status: "rejected" as const, reason: "inactive_booth" as const };
    }

    if (session.worldNullifierId === undefined || session.worldAction === undefined) {
      return { status: "rejected" as const, reason: "unverified" as const };
    }
    const identity = await context.db.get("worldNullifiers", session.worldNullifierId);
    if (
      identity === null ||
      identity.sessionId !== session._id ||
      identity.action !== session.worldAction
    ) {
      return { status: "rejected" as const, reason: "unverified" as const };
    }

    const quest = await context.db
      .query("questProgress")
      .withIndex("by_session_booth_and_quest", (query) =>
        query.eq("sessionId", session._id).eq("boothSlug", booth.slug).eq("questId", booth.questId),
      )
      .unique();
    if (quest === null) return { status: "rejected" as const, reason: "quest_incomplete" as const };

    const dateKey = utcDateKey(args.now);
    const dailyFuels = await context.db
      .query("fuels")
      .withIndex("by_identity_and_date", (query) =>
        query.eq("worldNullifierId", identity._id).eq("dateKey", dateKey),
      )
      .take(MAX_DAILY_FUELS + 1);
    if (dailyFuels.length >= MAX_DAILY_FUELS) {
      return { status: "rejected" as const, reason: "daily_limit" as const };
    }

    const boothFuel = await context.db
      .query("fuels")
      .withIndex("by_identity_date_and_booth", (query) =>
        query
          .eq("worldNullifierId", identity._id)
          .eq("dateKey", dateKey)
          .eq("boothSlug", booth.slug),
      )
      .unique();
    if (boothFuel !== null) {
      return { status: "rejected" as const, reason: "booth_daily_limit" as const };
    }

    const fireScore = (boothState?.fireScore ?? 0) + 1;
    const nextTier = tierForScore(fireScore);
    if (boothState === null) {
      await context.db.insert("boothStates", {
        slug: booth.slug,
        active: true,
        fireScore,
        fireTier: nextTier,
        updatedAt: args.now,
      });
    } else {
      await context.db.patch(boothState._id, {
        fireScore,
        fireTier: nextTier,
        updatedAt: args.now,
      });
    }
    await context.db.insert("fuels", {
      boothSlug: booth.slug,
      sessionId: session._id,
      worldNullifierId: identity._id,
      dateKey,
      idempotencyKey: args.idempotencyKey,
      createdAt: args.now,
      scoreAfter: fireScore,
      tierAfter: nextTier,
    });

    return {
      status: "accepted" as const,
      replay: false,
      dateKey,
      fuelsRemaining: MAX_DAILY_FUELS - dailyFuels.length - 1,
      booth: { slug: booth.slug, fireScore, fireTier: nextTier },
    };
  },
});
