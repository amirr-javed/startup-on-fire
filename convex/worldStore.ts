import { v } from "convex/values";

import { internalMutation, internalQuery } from "./_generated/server";

export const validateGuestSession = internalQuery({
  args: { sessionTokenHash: v.string(), now: v.number() },
  returns: v.boolean(),
  handler: async (context, args) => {
    const session = await context.db
      .query("guestSessions")
      .withIndex("by_token_hash", (query) => query.eq("tokenHash", args.sessionTokenHash))
      .unique();
    return session !== null && session.expiresAt > args.now;
  },
});

export const consumeNullifier = internalMutation({
  args: {
    action: v.string(),
    nullifier: v.string(),
    sessionTokenHash: v.string(),
    now: v.number(),
  },
  returns: v.union(
    v.object({ replay: v.literal(true) }),
    v.object({ replay: v.literal(false) }),
    v.object({ replay: v.literal(false), invalidSession: v.literal(true) }),
  ),
  handler: async (context, args) => {
    const existing = await context.db
      .query("worldNullifiers")
      .withIndex("by_action_and_nullifier", (query) =>
        query.eq("action", args.action).eq("nullifier", args.nullifier),
      )
      .unique();

    if (existing !== null) {
      return { replay: true } as const;
    }

    const session = await context.db
      .query("guestSessions")
      .withIndex("by_token_hash", (query) => query.eq("tokenHash", args.sessionTokenHash))
      .unique();
    if (session === null || session.expiresAt <= args.now) {
      return { replay: false, invalidSession: true } as const;
    }
    const existingIdentity = await context.db
      .query("worldNullifiers")
      .withIndex("by_session_and_action", (query) =>
        query.eq("sessionId", session._id).eq("action", args.action),
      )
      .unique();
    if (existingIdentity !== null) {
      return { replay: true } as const;
    }

    const worldNullifierId = await context.db.insert("worldNullifiers", {
      action: args.action,
      nullifier: args.nullifier,
      sessionId: session._id,
      verifiedAt: args.now,
    });
    await context.db.patch(session._id, {
      worldNullifierId,
      worldAction: args.action,
    });
    return { replay: false } as const;
  },
});
