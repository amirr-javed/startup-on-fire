import { defineApp } from "convex/server";
import { v } from "convex/values";

export default defineApp({
  env: {
    WORLD_SPIKE_ENABLED: v.optional(v.string()),
    WORLD_APP_ID: v.optional(v.string()),
    WORLD_RP_ID: v.optional(v.string()),
    WORLD_ACTION: v.optional(v.string()),
    WORLD_RP_SIGNING_KEY: v.optional(v.string()),
    WORLD_ENVIRONMENT: v.optional(v.string()),
  },
});
