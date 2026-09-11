import { describe, expect, it } from "vitest";

import { DigitalInput } from "../src/game/input/DigitalInput";
import {
  BOOTHS,
  INTERACTION_RADIUS,
  PLAZA_COLUMNS,
  PLAZA_HEIGHT,
  PLAZA_ROWS,
  PLAZA_WIDTH,
  SCOUT_SPAWN,
  TILE_SIZE,
  isPathAt,
  tileFrameAt,
} from "../src/game/world/plazaLayout";

describe("plaza layout", () => {
  it("uses a compact tile-aligned world larger than the camera", () => {
    expect(PLAZA_WIDTH % TILE_SIZE).toBe(0);
    expect(PLAZA_HEIGHT % TILE_SIZE).toBe(0);
    expect(PLAZA_WIDTH).toBeGreaterThan(480);
    expect(PLAZA_HEIGHT).toBeGreaterThan(270);
  });

  it("provides a camera-sized city to explore rather than a single-screen plaza", () => {
    expect(PLAZA_WIDTH).toBe(1536);
    expect(PLAZA_HEIGHT).toBe(1152);
    expect(PLAZA_COLUMNS).toBe(96);
    expect(PLAZA_ROWS).toBe(72);
  });

  it("defines exactly three unique, in-bounds interaction points", () => {
    expect(BOOTHS).toHaveLength(3);
    expect(new Set(BOOTHS.map((booth) => booth.id)).size).toBe(3);
    for (const booth of BOOTHS) {
      expect(booth.texture).toMatch(/^booth-0[1-3]$/);
      expect(booth.founderTexture).toMatch(/^founder-0[1-3]$/);
      expect(booth.displayWidth).toBe(96);
      expect(booth.interactionX).toBeGreaterThan(INTERACTION_RADIUS);
      expect(booth.interactionX).toBeLessThan(PLAZA_WIDTH - INTERACTION_RADIUS);
      expect(booth.interactionY).toBeGreaterThan(INTERACTION_RADIUS);
      expect(booth.interactionY).toBeLessThan(PLAZA_HEIGHT - INTERACTION_RADIUS);
      expect(
        isPathAt(
          Math.floor(booth.interactionX / TILE_SIZE),
          Math.floor(booth.interactionY / TILE_SIZE),
        ),
      ).toBe(true);
    }
  });

  it("spaces the startup courts far enough apart to require exploration", () => {
    for (let index = 0; index < BOOTHS.length; index += 1) {
      for (let other = index + 1; other < BOOTHS.length; other += 1) {
        const first = BOOTHS[index]!;
        const second = BOOTHS[other]!;
        expect(Math.hypot(first.x - second.x, first.y - second.y)).toBeGreaterThan(700);
      }
    }
  });

  it("connects the spawn and every booth interaction point by walkable streets", () => {
    const start = {
      column: Math.floor(SCOUT_SPAWN.x / TILE_SIZE),
      row: Math.floor(SCOUT_SPAWN.y / TILE_SIZE),
    };
    const visited = new Set([`${start.column},${start.row}`]);
    const queue = [start];
    for (let cursor = 0; cursor < queue.length; cursor += 1) {
      const current = queue[cursor]!;
      for (const [column, row] of [
        [current.column - 1, current.row],
        [current.column + 1, current.row],
        [current.column, current.row - 1],
        [current.column, current.row + 1],
      ] as const) {
        const key = `${column},${row}`;
        if (
          column >= 0 &&
          column < PLAZA_COLUMNS &&
          row >= 0 &&
          row < PLAZA_ROWS &&
          isPathAt(column, row) &&
          !visited.has(key)
        ) {
          visited.add(key);
          queue.push({ column, row });
        }
      }
    }

    for (const booth of BOOTHS) {
      const key = `${Math.floor(booth.interactionX / TILE_SIZE)},${Math.floor(
        booth.interactionY / TILE_SIZE,
      )}`;
      expect(visited.has(key)).toBe(true);
    }
  });

  it("selects only valid terrain frame indices", () => {
    let pathTileCount = 0;
    for (let row = 0; row < PLAZA_HEIGHT / TILE_SIZE; row += 1) {
      for (let column = 0; column < PLAZA_WIDTH / TILE_SIZE; column += 1) {
        const frame = tileFrameAt(column, row);
        expect(frame).toBeGreaterThanOrEqual(0);
        expect(frame).toBeLessThan(17);
        if (frame >= 4) pathTileCount += 1;
      }
    }
    expect(pathTileCount).toBeGreaterThan(0);
  });
});

describe("digital touch input", () => {
  it("tracks directions and consumes one-shot actions", () => {
    const input = new DigitalInput();
    input.setDirection("left", true);
    input.requestInteract();
    input.requestUiAction("primary");
    expect(input.getDirection("left")).toBe(true);
    expect(input.consumeInteract()).toBe(true);
    expect(input.consumeInteract()).toBe(false);
    expect(input.consumeUiAction()).toBe("primary");
    expect(input.consumeUiAction()).toBeNull();
    input.reset();
    expect(input.getDirection("left")).toBe(false);
  });
});
