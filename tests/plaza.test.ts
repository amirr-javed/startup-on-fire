import { describe, expect, it } from "vitest";

import { DigitalInput } from "../src/game/input/DigitalInput";
import {
  BOOTHS,
  INTERACTION_RADIUS,
  PLAZA_HEIGHT,
  PLAZA_WIDTH,
  TILE_SIZE,
  tileFrameAt,
} from "../src/game/world/plazaLayout";

describe("plaza layout", () => {
  it("uses a compact tile-aligned world larger than the camera", () => {
    expect(PLAZA_WIDTH % TILE_SIZE).toBe(0);
    expect(PLAZA_HEIGHT % TILE_SIZE).toBe(0);
    expect(PLAZA_WIDTH).toBeGreaterThan(480);
    expect(PLAZA_HEIGHT).toBeGreaterThan(270);
  });

  it("defines exactly three unique, in-bounds interaction points", () => {
    expect(BOOTHS).toHaveLength(3);
    expect(new Set(BOOTHS.map((booth) => booth.id)).size).toBe(3);
    for (const booth of BOOTHS) {
      expect(booth.interactionX).toBeGreaterThan(INTERACTION_RADIUS);
      expect(booth.interactionX).toBeLessThan(PLAZA_WIDTH - INTERACTION_RADIUS);
      expect(booth.interactionY).toBeGreaterThan(INTERACTION_RADIUS);
      expect(booth.interactionY).toBeLessThan(PLAZA_HEIGHT - INTERACTION_RADIUS);
    }
  });

  it("selects only valid terrain frame indices", () => {
    for (let row = 0; row < PLAZA_HEIGHT / TILE_SIZE; row += 1) {
      for (let column = 0; column < PLAZA_WIDTH / TILE_SIZE; column += 1) {
        expect(tileFrameAt(column, row)).toBeGreaterThanOrEqual(0);
        expect(tileFrameAt(column, row)).toBeLessThan(17);
      }
    }
  });
});

describe("digital touch input", () => {
  it("tracks directions and consumes one-shot actions", () => {
    const input = new DigitalInput();
    input.setDirection("left", true);
    input.requestInteract();
    expect(input.getDirection("left")).toBe(true);
    expect(input.consumeInteract()).toBe(true);
    expect(input.consumeInteract()).toBe(false);
    input.reset();
    expect(input.getDirection("left")).toBe(false);
  });
});
