/// <reference types="vite/client" />
// @vitest-environment edge-runtime

import { convexTest, type TestConvex } from "convex-test";
import { describe, expect, it } from "vitest";

import { api, internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { MINIMUM_HIT_INTERVAL_MS } from "./lib/game";
import { worldSignalForSession } from "./lib/security";
import schema from "./schema";

const modules = import.meta.glob("./**/*.*s");
const NOW = Date.UTC(2026, 8, 11, 12, 0, 0);
type Backend = TestConvex<typeof schema>;

async function createSession(t: Backend, tokenHash: string, now = NOW) {
  const sessionId = await t.mutation(internal.gameStore.createGuestSession, {
    tokenHash,
    issuedAt: now,
    expiresAt: now + 60_000,
  });
  return { sessionId, tokenHash };
}

async function bindWorldIdentity(t: Backend, tokenHash: string, nullifier: string, now = NOW) {
  return await t.mutation(internal.worldStore.consumeNullifier, {
    action: "public-fuel-v1",
    nullifier,
    sessionTokenHash: tokenHash,
    now,
  });
}

async function completeQuest(
  t: Backend,
  tokenHash: string,
  boothSlug: string,
  now = NOW,
): Promise<Id<"questAttempts">> {
  const started = await t.mutation(internal.gameStore.startQuest, {
    tokenHash,
    boothSlug,
    now,
  });
  if (started.status !== "started") throw new Error(`Quest did not start: ${started.reason}`);

  for (let index = 0; index < started.requiredBugs; index += 1) {
    const hit = await t.mutation(internal.gameStore.recordQuestHit, {
      tokenHash,
      attemptId: started.attemptId,
      hitKey: `target-${index.toString().padStart(2, "0")}`,
      now: now + index * MINIMUM_HIT_INTERVAL_MS,
    });
    expect(hit.status).toBe("recorded");
  }
  const completed = await t.mutation(internal.gameStore.completeQuest, {
    tokenHash,
    attemptId: started.attemptId,
    now: now + started.minimumElapsedMs,
  });
  expect(completed).toMatchObject({ status: "completed", replay: false, boothSlug });
  return started.attemptId;
}

describe("server-authoritative game backend", () => {
  it("derives stable, namespace-separated World signals without exposing session hashes", async () => {
    const firstHash = "a".repeat(64);
    const first = await worldSignalForSession(firstHash);
    expect(first).toMatch(/^sof-world-v1:[0-9a-f]{64}$/u);
    expect(first).not.toContain(firstHash);
    expect(await worldSignalForSession(firstHash)).toBe(first);
    expect(await worldSignalForSession("b".repeat(64))).not.toBe(first);
  });

  it("rejects an unknown session before creating a World request context", async () => {
    const t = convexTest(schema, modules);
    expect(
      await t.action(api.worldActions.createRequestContext, {
        sessionToken: "A".repeat(43),
      }),
    ).toEqual({
      success: false,
      code: "invalid_session",
      message: "The guest session is invalid or expired.",
    });
  });

  it("issues an opaque guest credential and rejects invented credentials", async () => {
    const t = convexTest(schema, modules);
    const created = await t.action(api.gameActions.createGuestSession, {});
    expect(created).toMatchObject({ status: "created" });
    expect(created.sessionToken).toMatch(/^[A-Za-z0-9_-]{43}$/u);
    const stored = await t.run(
      async (context) =>
        await context.db.query("guestSessions").withIndex("by_token_hash").unique(),
    );
    expect(stored?.tokenHash).not.toBe(created.sessionToken);
    expect(
      await t.action(api.gameActions.startQuest, {
        sessionToken: "A".repeat(43),
        boothSlug: "kindred-labs",
      }),
    ).toEqual({ status: "rejected", reason: "invalid_session" });
  });

  it("lists exactly three fixed realtime booth states and updates score from accepted fuel", async () => {
    const t = convexTest(schema, modules);
    const initial = await t.query(api.booths.list, {});
    expect(initial).toHaveLength(3);
    expect(initial.map((booth) => booth.slug)).toEqual([
      "kindred-labs",
      "signal-garden",
      "ember-studio",
    ]);
    expect(initial.every((booth) => booth.fireScore === 0 && booth.fireTier === "cold")).toBe(true);

    const { tokenHash } = await createSession(t, "1".repeat(64));
    await completeQuest(t, tokenHash, "kindred-labs");
    await bindWorldIdentity(t, tokenHash, "101");
    const accepted = await t.mutation(internal.gameStore.fuelBooth, {
      tokenHash,
      boothSlug: "kindred-labs",
      idempotencyKey: "fuel-accept-0001",
      now: NOW + 2_000,
    });
    expect(accepted).toMatchObject({
      status: "accepted",
      replay: false,
      fuelsRemaining: 2,
      booth: { slug: "kindred-labs", fireScore: 1, fireTier: "cold" },
    });
    expect((await t.query(api.booths.list, {}))[0]).toMatchObject({
      fireScore: 1,
      fireTier: "cold",
    });
  });

  it("records hit events idempotently and derives completion without client score or time", async () => {
    const t = convexTest(schema, modules);
    const { tokenHash } = await createSession(t, "2".repeat(64));
    const started = await t.mutation(internal.gameStore.startQuest, {
      tokenHash,
      boothSlug: "kindred-labs",
      now: NOW,
    });
    if (started.status !== "started") throw new Error("Quest did not start");
    const first = await t.mutation(internal.gameStore.recordQuestHit, {
      tokenHash,
      attemptId: started.attemptId,
      hitKey: "target-00",
      now: NOW,
    });
    const replay = await t.mutation(internal.gameStore.recordQuestHit, {
      tokenHash,
      attemptId: started.attemptId,
      hitKey: "target-00",
      now: NOW,
    });
    expect(first).toMatchObject({ status: "recorded", replay: false, hitCount: 1 });
    expect(replay).toMatchObject({ status: "recorded", replay: true, hitCount: 1 });
    expect(
      await t.mutation(internal.gameStore.completeQuest, {
        tokenHash,
        attemptId: started.attemptId,
        now: NOW + 2_000,
      }),
    ).toEqual({ status: "rejected", reason: "quest_not_satisfied" });
  });

  it("returns the original accepted fuel for an idempotent replay", async () => {
    const t = convexTest(schema, modules);
    const { tokenHash } = await createSession(t, "3".repeat(64));
    await completeQuest(t, tokenHash, "kindred-labs");
    await bindWorldIdentity(t, tokenHash, "103");
    const request = {
      tokenHash,
      boothSlug: "kindred-labs",
      idempotencyKey: "fuel-replay-0001",
      now: NOW + 2_000,
    };
    expect(await t.mutation(internal.gameStore.fuelBooth, request)).toMatchObject({
      status: "accepted",
      replay: false,
    });
    expect(await t.mutation(internal.gameStore.fuelBooth, request)).toMatchObject({
      status: "accepted",
      replay: true,
      booth: { fireScore: 1 },
    });
    expect((await t.query(api.booths.list, {}))[0]?.fireScore).toBe(1);
  });

  it("rejects a second fuel for the same booth on the same UTC day", async () => {
    const t = convexTest(schema, modules);
    const { tokenHash } = await createSession(t, "4".repeat(64));
    await completeQuest(t, tokenHash, "kindred-labs");
    await bindWorldIdentity(t, tokenHash, "104");
    await t.mutation(internal.gameStore.fuelBooth, {
      tokenHash,
      boothSlug: "kindred-labs",
      idempotencyKey: "fuel-same-0001",
      now: NOW + 2_000,
    });
    expect(
      await t.mutation(internal.gameStore.fuelBooth, {
        tokenHash,
        boothSlug: "kindred-labs",
        idempotencyKey: "fuel-same-0002",
        now: NOW + 3_000,
      }),
    ).toEqual({ status: "rejected", reason: "booth_daily_limit" });
  });

  it("rejects a fourth daily fuel using a server-derived UTC key", async () => {
    const t = convexTest(schema, modules);
    const { tokenHash } = await createSession(t, "5".repeat(64));
    await bindWorldIdentity(t, tokenHash, "105");
    for (const slug of ["kindred-labs", "signal-garden", "ember-studio"] as const) {
      await completeQuest(t, tokenHash, slug);
      expect(
        await t.mutation(internal.gameStore.fuelBooth, {
          tokenHash,
          boothSlug: slug,
          idempotencyKey: `fuel-daily-${slug}`,
          now: NOW + 2_000,
        }),
      ).toMatchObject({ status: "accepted" });
    }
    expect(
      await t.mutation(internal.gameStore.fuelBooth, {
        tokenHash,
        boothSlug: "kindred-labs",
        idempotencyKey: "fuel-daily-fourth",
        now: NOW + 3_000,
      }),
    ).toEqual({ status: "rejected", reason: "daily_limit" });
  });

  it("rejects unknown and inactive booths", async () => {
    const t = convexTest(schema, modules);
    const { tokenHash } = await createSession(t, "6".repeat(64));
    expect(
      await t.mutation(internal.gameStore.startQuest, {
        tokenHash,
        boothSlug: "missing-booth",
        now: NOW,
      }),
    ).toEqual({ status: "rejected", reason: "unknown_booth" });
    expect(
      await t.mutation(internal.gameStore.fuelBooth, {
        tokenHash,
        boothSlug: "missing-booth",
        idempotencyKey: "fuel-missing-001",
        now: NOW,
      }),
    ).toEqual({ status: "rejected", reason: "unknown_booth" });
    await t.run(async (context) => {
      await context.db.insert("boothStates", {
        slug: "kindred-labs",
        active: false,
        fireScore: 0,
        fireTier: "cold",
        updatedAt: NOW,
      });
    });
    expect(
      await t.mutation(internal.gameStore.startQuest, {
        tokenHash,
        boothSlug: "kindred-labs",
        now: NOW,
      }),
    ).toEqual({ status: "rejected", reason: "inactive_booth" });
    expect(
      await t.mutation(internal.gameStore.fuelBooth, {
        tokenHash,
        boothSlug: "kindred-labs",
        idempotencyKey: "fuel-inactive-001",
        now: NOW,
      }),
    ).toEqual({ status: "rejected", reason: "inactive_booth" });
  });

  it("rejects public fuel from an unverified session", async () => {
    const t = convexTest(schema, modules);
    const { tokenHash } = await createSession(t, "7".repeat(64));
    await completeQuest(t, tokenHash, "kindred-labs");
    expect(
      await t.mutation(internal.gameStore.fuelBooth, {
        tokenHash,
        boothSlug: "kindred-labs",
        idempotencyKey: "fuel-unverified-01",
        now: NOW + 2_000,
      }),
    ).toEqual({ status: "rejected", reason: "unverified" });
  });

  it("atomically accepts only one of two concurrent same-booth fuels", async () => {
    const t = convexTest(schema, modules);
    const { tokenHash } = await createSession(t, "8".repeat(64));
    await completeQuest(t, tokenHash, "kindred-labs");
    await bindWorldIdentity(t, tokenHash, "108");
    const results = await Promise.all(
      ["fuel-race-000001", "fuel-race-000002"].map(
        async (idempotencyKey) =>
          await t.mutation(internal.gameStore.fuelBooth, {
            tokenHash,
            boothSlug: "kindred-labs",
            idempotencyKey,
            now: NOW + 2_000,
          }),
      ),
    );
    expect(results.filter((result) => result.status === "accepted")).toHaveLength(1);
    expect(results.filter((result) => result.status === "rejected")).toEqual([
      { status: "rejected", reason: "booth_daily_limit" },
    ]);
    expect((await t.query(api.booths.list, {}))[0]?.fireScore).toBe(1);
  });
});
