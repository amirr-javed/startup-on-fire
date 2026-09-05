import { v } from "convex/values";

import { internalMutation } from "./_generated/server";

export const consumeNullifier = internalMutation({
  args: {
    action: v.string(),
    nullifier: v.string(),
  },
  returns: v.union(v.object({ replay: v.literal(true) }), v.object({ replay: v.literal(false) })),
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

    await context.db.insert("worldNullifiers", args);
    return { replay: false } as const;
  },
});
