import { query } from "./_generated/server";

export const status = query({
  args: {},
  handler: () => ({
    service: "convex" as const,
    status: "ok" as const,
  }),
});
