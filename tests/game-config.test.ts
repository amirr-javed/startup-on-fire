import { describe, expect, it } from "vitest";

import { GAME_HEIGHT, GAME_WIDTH, PIXEL_RENDER_SETTINGS } from "../src/game/config/display";

describe("game display configuration", () => {
  it("uses the approved 16:9 foundation resolution", () => {
    expect({ width: GAME_WIDTH, height: GAME_HEIGHT }).toEqual({ width: 480, height: 270 });
  });

  it("keeps pixel-art rendering crisp", () => {
    expect(PIXEL_RENDER_SETTINGS).toEqual({
      pixelArt: true,
      antialias: false,
      roundPixels: true,
    });
  });
});
