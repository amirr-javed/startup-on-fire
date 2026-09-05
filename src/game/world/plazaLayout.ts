import type { BoothSummary } from "../events/GameUiBridge";

export const TILE_SIZE = 16;
export const PLAZA_COLUMNS = 36;
export const PLAZA_ROWS = 22;
export const PLAZA_WIDTH = PLAZA_COLUMNS * TILE_SIZE;
export const PLAZA_HEIGHT = PLAZA_ROWS * TILE_SIZE;
export const PLAYER_SPEED = 92;
export const INTERACTION_RADIUS = 42;

export type BoothPlacement = BoothSummary &
  Readonly<{
    texture: string;
    x: number;
    y: number;
    interactionX: number;
    interactionY: number;
    founderTexture: string;
    founderX: number;
    founderY: number;
  }>;

export const BOOTHS: readonly BoothPlacement[] = [
  {
    id: "kindred-labs",
    name: "Kindred Labs",
    founder: "Maya",
    texture: "booth-01",
    x: 104,
    y: 128,
    interactionX: 104,
    interactionY: 151,
    founderTexture: "founder-01",
    founderX: 158,
    founderY: 150,
  },
  {
    id: "signal-garden",
    name: "Signal Garden",
    founder: "Ilyas",
    texture: "booth-02",
    x: 472,
    y: 128,
    interactionX: 472,
    interactionY: 151,
    founderTexture: "founder-02",
    founderX: 418,
    founderY: 150,
  },
  {
    id: "ember-studio",
    name: "Ember Studio",
    founder: "Noor",
    texture: "booth-03",
    x: 288,
    y: 344,
    interactionX: 288,
    interactionY: 234,
    founderTexture: "founder-03",
    founderX: 344,
    founderY: 250,
  },
];

export function tileFrameAt(column: number, row: number): number {
  const horizontalPath = row >= 9 && row <= 12;
  const verticalPath = column >= 16 && column <= 19;
  const boothPath = row >= 6 && row <= 9 && (column <= 9 || column >= 26);
  const southPath = row >= 12 && column >= 16 && column <= 19;
  if (horizontalPath || verticalPath || boothPath || southPath) return 4 + ((column + row) % 2);
  return (column * 7 + row * 3) % 4;
}
