// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";

import { GameUiBridge, type GameUiState } from "../src/game/events/GameUiBridge";
import type { WorldSelfieVerifier } from "../src/services/world/selfieVerifier";
import type { FuelResult, GameplayBackend } from "../src/types/gameplay";
import { mountPublicFuelPanel } from "../src/ui/publicFuelPanel";

const OFFER_STATE: GameUiState = {
  nearbyBooth: { id: "kindred-labs", name: "Kindred Labs", founder: "Maya" },
  openBooth: null,
  discoveredCount: 1,
  totalBooths: 3,
  objective: "Explore the remaining startup booths",
  overlay: { kind: "none" },
  publicFuelOffer: { boothSlug: "kindred-labs", boothName: "Kindred Labs" },
};

function acceptedFuel(replay = false): FuelResult {
  return {
    status: "accepted",
    replay,
    dateKey: "2026-09-11",
    fuelsRemaining: 2,
    booth: { slug: "kindred-labs", fireScore: 8, fireTier: "hot" },
  };
}

function createGameplay(results: FuelResult[]): GameplayBackend & {
  fuelKeys: string[];
} {
  const fuelKeys: string[] = [];
  return {
    fuelKeys,
    subscribeBooths: () => () => undefined,
    getSessionToken: async () => "session-token",
    startQuest: async () => ({ status: "rejected", reason: "invalid_session" }),
    recordQuestHit: async () => ({ status: "rejected", reason: "invalid_session" }),
    completeQuest: async () => ({ status: "rejected", reason: "invalid_session" }),
    fuelBooth: async (_boothSlug, idempotencyKey) => {
      fuelKeys.push(idempotencyKey);
      const result = results.shift();
      if (result === undefined) throw new Error("Unexpected fuel request");
      return result;
    },
  };
}

function button(label: string): HTMLButtonElement {
  const match = [...document.querySelectorAll("button")].find(
    (candidate) => candidate.textContent === label,
  );
  if (!(match instanceof HTMLButtonElement)) throw new Error(`Missing ${label} button`);
  return match;
}

function setup(gameplay: GameplayBackend, verifier: WorldSelfieVerifier) {
  const root = document.createElement("main");
  document.body.append(root);
  const bridge = new GameUiBridge();
  const cleanup = mountPublicFuelPanel(root, gameplay, verifier, bridge);
  return { bridge, cleanup, panel: root.querySelector("section")! };
}

afterEach(() => {
  document.body.replaceChildren();
  vi.restoreAllMocks();
});

describe("public fuel panel", () => {
  it("stays hidden until an earned fuel offer is published", () => {
    const gameplay = createGameplay([]);
    const verifier: WorldSelfieVerifier = { verify: vi.fn() };
    const { bridge, cleanup, panel } = setup(gameplay, verifier);

    expect(panel.hidden).toBe(true);
    bridge.publish(OFFER_STATE);
    expect(panel.hidden).toBe(false);
    expect(panel.textContent).toContain("Verify only if you want to affect the public fire");
    cleanup();
  });

  it("records fuel immediately for an already verified session", async () => {
    const gameplay = createGameplay([acceptedFuel()]);
    const verify = vi.fn<WorldSelfieVerifier["verify"]>();
    const { bridge, cleanup, panel } = setup(gameplay, { verify });
    bridge.publish(OFFER_STATE);

    button("Verify & fuel").click();
    await vi.waitFor(() => expect(panel.textContent).toContain("Fuel accepted"));
    expect(panel.textContent).toContain("8 total fire · hot");
    expect(verify).not.toHaveBeenCalled();
    cleanup();
  });

  it("verifies server-side before converting a Practice Spark into public fuel", async () => {
    const gameplay = createGameplay([{ status: "rejected", reason: "unverified" }, acceptedFuel()]);
    const verify = vi.fn<WorldSelfieVerifier["verify"]>(async (_token, _signal, onProgress) => {
      await onProgress({ kind: "verifying" });
      return { status: "verified" };
    });
    const { bridge, cleanup, panel } = setup(gameplay, { verify });
    bridge.publish(OFFER_STATE);

    button("Verify & fuel").click();
    await vi.waitFor(() => expect(panel.textContent).toContain("Fuel accepted"));
    expect(verify).toHaveBeenCalledOnce();
    expect(gameplay.fuelKeys).toHaveLength(2);
    expect(gameplay.fuelKeys[0]).toBe(gameplay.fuelKeys[1]);
    cleanup();
  });

  it("keeps the request key stable across a recoverable provider retry", async () => {
    const gameplay = createGameplay([
      { status: "rejected", reason: "unverified" },
      { status: "rejected", reason: "unverified" },
      acceptedFuel(),
    ]);
    const verify = vi
      .fn<WorldSelfieVerifier["verify"]>()
      .mockResolvedValueOnce({ status: "failed", reason: "provider_unavailable" })
      .mockResolvedValueOnce({ status: "verified" });
    const { bridge, cleanup, panel } = setup(gameplay, { verify });
    bridge.publish(OFFER_STATE);

    button("Verify & fuel").click();
    await vi.waitFor(() => expect(panel.textContent).toContain("temporarily unavailable"));
    button("Try again").click();
    await vi.waitFor(() => expect(panel.textContent).toContain("Fuel accepted"));
    expect(new Set(gameplay.fuelKeys).size).toBe(1);
    cleanup();
  });

  it("cancels an in-flight handoff and dismisses with Escape", async () => {
    const gameplay = createGameplay([{ status: "rejected", reason: "unverified" }]);
    const verificationSignal: { current: AbortSignal | null } = { current: null };
    const verify = vi.fn<WorldSelfieVerifier["verify"]>(async (_token, signal, onProgress) => {
      verificationSignal.current = signal;
      await onProgress({ kind: "waiting", connectorUri: null });
      return await new Promise((resolve) => {
        signal.addEventListener("abort", () => resolve({ status: "failed", reason: "cancelled" }), {
          once: true,
        });
      });
    });
    const { bridge, cleanup, panel } = setup(gameplay, { verify });
    bridge.publish(OFFER_STATE);

    button("Verify & fuel").click();
    await vi.waitFor(() => expect(button("Cancel check").disabled).toBe(false));
    bridge.publish({ ...OFFER_STATE, nearbyBooth: null, publicFuelOffer: null });
    expect(panel.hidden).toBe(false);
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(panel.hidden).toBe(true);
    expect(verificationSignal.current?.aborted).toBe(true);
    cleanup();
  });
});
