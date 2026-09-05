import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  worldNullifiers: defineTable({
    action: v.string(),
    nullifier: v.string(),
  }).index("by_action_and_nullifier", ["action", "nullifier"]),
});
