import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  worldNullifiers: defineTable({
    action: v.string(),
    nullifier: v.string(),
    sessionId: v.optional(v.id("guestSessions")),
    verifiedAt: v.optional(v.number()),
  })
    .index("by_action_and_nullifier", ["action", "nullifier"])
    .index("by_session", ["sessionId"])
    .index("by_session_and_action", ["sessionId", "action"]),

  guestSessions: defineTable({
    tokenHash: v.string(),
    issuedAt: v.number(),
    expiresAt: v.number(),
    worldNullifierId: v.optional(v.id("worldNullifiers")),
    worldAction: v.optional(v.string()),
  }).index("by_token_hash", ["tokenHash"]),

  boothStates: defineTable({
    slug: v.string(),
    active: v.boolean(),
    fireScore: v.number(),
    fireTier: v.union(v.literal("cold"), v.literal("hot"), v.literal("blazing")),
    updatedAt: v.number(),
  }).index("by_slug", ["slug"]),

  questAttempts: defineTable({
    sessionId: v.id("guestSessions"),
    boothSlug: v.string(),
    questId: v.string(),
    requiredBugs: v.number(),
    minimumElapsedMs: v.number(),
    maximumElapsedMs: v.number(),
    startedAt: v.number(),
    expiresAt: v.number(),
    hitCount: v.number(),
    lastHitAt: v.optional(v.number()),
    consumedAt: v.optional(v.number()),
  }).index("by_session_and_booth", ["sessionId", "boothSlug"]),

  questHits: defineTable({
    attemptId: v.id("questAttempts"),
    hitKey: v.string(),
    ordinal: v.number(),
    recordedAt: v.number(),
  })
    .index("by_attempt_and_key", ["attemptId", "hitKey"])
    .index("by_attempt_and_ordinal", ["attemptId", "ordinal"]),

  questProgress: defineTable({
    sessionId: v.id("guestSessions"),
    boothSlug: v.string(),
    questId: v.string(),
    completedAt: v.number(),
    bugsSquashed: v.number(),
    elapsedMs: v.number(),
    attemptId: v.id("questAttempts"),
  })
    .index("by_session_booth_and_quest", ["sessionId", "boothSlug", "questId"])
    .index("by_attempt", ["attemptId"]),

  fuels: defineTable({
    boothSlug: v.string(),
    sessionId: v.id("guestSessions"),
    worldNullifierId: v.id("worldNullifiers"),
    dateKey: v.string(),
    idempotencyKey: v.string(),
    createdAt: v.number(),
    scoreAfter: v.number(),
    tierAfter: v.union(v.literal("cold"), v.literal("hot"), v.literal("blazing")),
  })
    .index("by_session_and_idempotency", ["sessionId", "idempotencyKey"])
    .index("by_identity_and_date", ["worldNullifierId", "dateKey"])
    .index("by_identity_date_and_booth", ["worldNullifierId", "dateKey", "boothSlug"])
    .index("by_booth", ["boothSlug"]),
});
