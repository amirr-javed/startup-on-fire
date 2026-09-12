// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";

import { GameUiBridge, type GameUiState } from "../src/game/events/GameUiBridge";
import { DigitalInput } from "../src/game/input/DigitalInput";
import { createAppShell } from "../src/ui/appShell";

function dialogueState(
  overrides: Readonly<{ identityText?: string; externalUrl?: string }> = {},
): GameUiState {
  return {
    nearbyBooth: null,
    openBooth: { id: "kindred-labs", name: "Kindred Protocol", founder: "Maya Chen" },
    discoveredCount: 1,
    totalBooths: 3,
    objective: "Explore",
    publicFuelOffer: null,
    overlay: {
      kind: "dialogue",
      eyebrow: "MAYA CHEN // FOUNDER",
      title: "Kindred Protocol",
      body: "Release intelligence.",
      primaryLabel: "Tell me more",
      secondaryLabel: "Maybe later",
      ...overrides,
    },
  };
}

afterEach(() => {
  document.body.replaceChildren();
  vi.restoreAllMocks();
});

describe("app shell booth identity", () => {
  it("describes a successful health subscription without promising every game action", () => {
    const root = document.createElement("main");
    document.body.append(root);
    const shell = createAppShell(root, new DigitalInput(), new GameUiBridge());

    shell.updateBackendStatus({
      service: "convex",
      status: "ok",
      gameApiVersion: 1,
      state: "connected",
    });

    expect(root.querySelector(".scout-panel__status")?.textContent).toBe(
      "Live booth feed connected",
    );
    shell.destroy();
  });

  it("shows a safe external startup link and ENS status in founder dialogue", () => {
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      callback(0);
      return 1;
    });
    const root = document.createElement("main");
    document.body.append(root);
    const bridge = new GameUiBridge();
    const shell = createAppShell(root, new DigitalInput(), bridge);

    bridge.publish(
      dialogueState({
        identityText: "ENSv2 Sepolia · kindred.firecity.eth",
        externalUrl: "https://kindred.example/",
      }),
    );

    const identity = root.querySelector(".story-card__identity");
    const link = root.querySelector(".story-card__link");
    expect(identity).toHaveProperty("hidden", false);
    expect(identity?.textContent).toContain("kindred.firecity.eth");
    expect(link).toBeInstanceOf(HTMLAnchorElement);
    expect(link).toHaveProperty("hidden", false);
    expect(link?.getAttribute("href")).toBe("https://kindred.example/");
    expect(link?.getAttribute("target")).toBe("_blank");
    expect(link?.getAttribute("rel")).toBe("noopener noreferrer");
    shell.destroy();
  });

  it("removes stale identity copy and href when the next overlay has no ENS metadata", () => {
    vi.stubGlobal("requestAnimationFrame", () => 1);
    const root = document.createElement("main");
    document.body.append(root);
    const bridge = new GameUiBridge();
    const shell = createAppShell(root, new DigitalInput(), bridge);
    bridge.publish(
      dialogueState({
        identityText: "ENSv2 Sepolia · kindred.firecity.eth",
        externalUrl: "https://kindred.example/",
      }),
    );
    bridge.publish(dialogueState());

    const identity = root.querySelector<HTMLElement>(".story-card__identity");
    const link = root.querySelector<HTMLAnchorElement>(".story-card__link");
    expect(identity?.hidden).toBe(true);
    expect(link?.hidden).toBe(true);
    expect(link?.hasAttribute("href")).toBe(false);
    shell.destroy();
  });
});
