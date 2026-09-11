import { v } from "convex/values";

import { query } from "./_generated/server";
import { BOOTHS, boothSlug, fireTier } from "./lib/game";

const boothState = v.object({
  slug: boothSlug,
  name: v.string(),
  founder: v.string(),
  ensName: v.string(),
  active: v.boolean(),
  fireScore: v.number(),
  fireTier,
});

export const list = query({
  args: {},
  returns: v.array(boothState),
  handler: async (context) => {
    return await Promise.all(
      BOOTHS.map(async (booth) => {
        const state = await context.db
          .query("boothStates")
          .withIndex("by_slug", (index) => index.eq("slug", booth.slug))
          .unique();
        return {
          slug: booth.slug,
          name: booth.name,
          founder: booth.founder,
          ensName: booth.ensName,
          active: state?.active ?? true,
          fireScore: state?.fireScore ?? 0,
          fireTier: state?.fireTier ?? ("cold" as const),
        };
      }),
    );
  },
});
