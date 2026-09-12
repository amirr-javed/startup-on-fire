import { v } from "convex/values";

import { query } from "./_generated/server";

export const status = query({
  args: {},
  returns: v.object({
    service: v.literal("convex"),
    status: v.literal("ok"),
    gameApiVersion: v.literal(1),
  }),
  handler: () => ({
    service: "convex" as const,
    status: "ok" as const,
    gameApiVersion: 1 as const,
  }),
});
