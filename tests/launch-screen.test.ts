// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";

import { GameLoadBridge, type GameLoadState } from "../src/game/loading/GameLoadBridge";
import { isAssetManifest } from "../src/game/loading/assetManifest";
import { mountLaunchScreen } from "../src/ui/launchScreen";

afterEach(() => {
  document.body.replaceChildren();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("game load bridge", () => {
  it("publishes bounded progress and allows only one terminal state", () => {
    const states: GameLoadState[] = [];
    const bridge = new GameLoadBridge();
    const unsubscribe = bridge.subscribe((state) => states.push(state));

    bridge.loading(1.5, "Almost there…");
    bridge.ready();
    bridge.fail("too late");
    bridge.loading(0.2);

    expect(states).toEqual([
      { status: "loading", progress: 0, message: "Lighting the plaza…" },
      { status: "loading", progress: 1, message: "Almost there…" },
      { status: "ready" },
    ]);
    unsubscribe();
  });
});

describe("asset manifest boundary", () => {
  it("accepts unique local assets with complete sprite dimensions", () => {
    expect(
      isAssetManifest({
        assets: [
          { id: "terrain", url: "/assets/original/terrain.png" },
          {
            id: "scout",
            url: "/assets/original/scout.png",
            frameWidth: 16,
            frameHeight: 32,
          },
        ],
      }),
    ).toBe(true);
  });

  it.each([
    null,
    { assets: [] },
    { assets: [{ id: "", url: "/assets/a.png" }] },
    { assets: [{ id: "remote", url: "https://example.test/a.png" }] },
    { assets: [{ id: "sheet", url: "/assets/a.png", frameWidth: 16 }] },
    {
      assets: [
        { id: "duplicate", url: "/assets/a.png" },
        { id: "duplicate", url: "/assets/b.png" },
      ],
    },
  ])("rejects malformed manifest value %#", (value) => {
    expect(isAssetManifest(value)).toBe(false);
  });
});

describe("launch screen", () => {
  it("renders stable progress, then enters with keyboard-ready focus", () => {
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      callback(0);
      return 1;
    });
    const root = document.createElement("div");
    const background = document.createElement("div");
    const app = document.createElement("main");
    app.append(root, background);
    document.body.append(app);
    const bridge = new GameLoadBridge();
    const onEnter = vi.fn();
    const screen = mountLaunchScreen(root, bridge, {
      onEnter,
      backgroundRoots: [background],
    });
    expect(background.inert).toBe(true);
    expect(app.dataset.launch).toBe("active");

    bridge.loading(0.42, "Building the plaza…");
    const section = root.querySelector<HTMLElement>(".launch-screen");
    const progress = root.querySelector<HTMLProgressElement>("progress");
    const action = root.querySelector<HTMLButtonElement>(".launch-screen__action");
    expect(section?.getAttribute("aria-busy")).toBe("true");
    expect(progress?.value).toBe(42);
    expect(root.textContent).toContain("Building the plaza…");
    expect(action?.hidden).toBe(true);

    bridge.ready();
    expect(section?.dataset.state).toBe("ready");
    expect(section?.getAttribute("aria-busy")).toBe("false");
    expect(action?.hidden).toBe(false);
    expect(action?.textContent).toBe("Enter Fire City");
    expect(document.activeElement).toBe(action);
    action?.click();
    expect(root.hidden).toBe(true);
    expect(background.inert).toBe(false);
    expect(app.dataset.launch).toBeUndefined();
    expect(onEnter).toHaveBeenCalledOnce();
    screen.destroy();
  });

  it("offers an inline retry when asset loading fails", () => {
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      callback(0);
      return 1;
    });
    const root = document.createElement("div");
    document.body.append(root);
    const bridge = new GameLoadBridge();
    const reload = vi.fn();
    const screen = mountLaunchScreen(root, bridge, { onEnter: vi.fn(), reload });

    bridge.fail("The city map is unavailable.");
    const action = root.querySelector<HTMLButtonElement>(".launch-screen__action");
    expect(root.textContent).toContain("Check your connection");
    expect(action?.textContent).toBe("Try again");
    action?.click();
    expect(reload).toHaveBeenCalledOnce();
    screen.destroy();
  });
});
