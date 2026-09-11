import type { BoothSummary } from "../events/GameUiBridge";

export const TILE_SIZE = 16;
export const PLAZA_COLUMNS = 96;
export const PLAZA_ROWS = 72;
export const PLAZA_WIDTH = PLAZA_COLUMNS * TILE_SIZE;
export const PLAZA_HEIGHT = PLAZA_ROWS * TILE_SIZE;
export const PLAYER_SPEED = 108;
export const INTERACTION_RADIUS = 44;

export type Point = Readonly<{ x: number; y: number }>;

export type BoothPlacement = BoothSummary &
  Readonly<{
    texture: string;
    displayWidth: number;
    displayHeight: number;
    x: number;
    y: number;
    interactionX: number;
    interactionY: number;
    founderTexture: string;
    founderX: number;
    founderY: number;
  }>;

export type FirePlacement = Point & Readonly<{ tier: "cold" | "hot" | "blazing" }>;

export type DecorationPlacement = Point &
  Readonly<{
    texture: "bench" | "lamp" | "shrub" | "sign" | "tree";
    flipX?: boolean;
  }>;

export const CITY_CENTER: Point = { x: 768, y: 560 };
export const SCOUT_SPAWN: Point = { x: 768, y: 704 };
export const EMBER_GUIDE: Point = { x: 808, y: 688 };

export const BOOTHS: readonly BoothPlacement[] = [
  {
    id: "kindred-labs",
    name: "Kindred Labs",
    founder: "Maya",
    texture: "booth-01",
    displayWidth: 96,
    displayHeight: 96,
    x: 336,
    y: 312,
    interactionX: 336,
    interactionY: 360,
    founderTexture: "founder-01",
    founderX: 400,
    founderY: 344,
  },
  {
    id: "signal-garden",
    name: "Signal Garden",
    founder: "Ilyas",
    texture: "booth-02",
    displayWidth: 96,
    displayHeight: 96,
    x: 1200,
    y: 312,
    interactionX: 1200,
    interactionY: 360,
    founderTexture: "founder-02",
    founderX: 1136,
    founderY: 344,
  },
  {
    id: "ember-studio",
    name: "Ember Studio",
    founder: "Noor",
    texture: "booth-03",
    displayWidth: 96,
    displayHeight: 96,
    x: 768,
    y: 1016,
    interactionX: 768,
    interactionY: 936,
    founderTexture: "founder-03",
    founderX: 832,
    founderY: 984,
  },
];

export const FIRES: readonly FirePlacement[] = [
  { x: 432, y: 344, tier: "cold" },
  { x: 1104, y: 344, tier: "hot" },
  { x: 672, y: 984, tier: "blazing" },
];

export const DECORATIONS: readonly DecorationPlacement[] = [
  { texture: "tree", x: 112, y: 176 },
  { texture: "tree", x: 496, y: 160 },
  { texture: "tree", x: 1040, y: 160 },
  { texture: "tree", x: 1424, y: 176 },
  { texture: "tree", x: 112, y: 544 },
  { texture: "tree", x: 1424, y: 544 },
  { texture: "tree", x: 144, y: 944 },
  { texture: "tree", x: 1392, y: 944 },
  { texture: "tree", x: 496, y: 1088 },
  { texture: "tree", x: 1040, y: 1088 },
  { texture: "bench", x: 640, y: 488 },
  { texture: "bench", x: 896, y: 488, flipX: true },
  { texture: "bench", x: 640, y: 680, flipX: true },
  { texture: "bench", x: 896, y: 680 },
  { texture: "bench", x: 240, y: 440 },
  { texture: "bench", x: 1296, y: 440, flipX: true },
  { texture: "lamp", x: 568, y: 544 },
  { texture: "lamp", x: 968, y: 544 },
  { texture: "lamp", x: 568, y: 672 },
  { texture: "lamp", x: 968, y: 672 },
  { texture: "lamp", x: 352, y: 600 },
  { texture: "lamp", x: 1184, y: 600 },
  { texture: "lamp", x: 736, y: 832 },
  { texture: "lamp", x: 800, y: 832 },
  { texture: "sign", x: 720, y: 448 },
  { texture: "sign", x: 816, y: 448 },
  { texture: "sign", x: 720, y: 896 },
  { texture: "shrub", x: 608, y: 456 },
  { texture: "shrub", x: 624, y: 456 },
  { texture: "shrub", x: 912, y: 456 },
  { texture: "shrub", x: 928, y: 456 },
  { texture: "shrub", x: 272, y: 376 },
  { texture: "shrub", x: 1280, y: 376 },
  { texture: "shrub", x: 704, y: 1032 },
  { texture: "shrub", x: 848, y: 1032 },
];

function inside(
  column: number,
  row: number,
  left: number,
  top: number,
  right: number,
  bottom: number,
): boolean {
  return column >= left && column <= right && row >= top && row <= bottom;
}

export function isPathAt(column: number, row: number): boolean {
  const centralPlaza = inside(column, row, 38, 27, 57, 43);
  const eastWestAvenue = inside(column, row, 8, 34, 87, 37);
  const northSouthAvenue = inside(column, row, 46, 4, 49, 67);
  const westCourt = inside(column, row, 15, 19, 28, 23);
  const westConnector = inside(column, row, 20, 23, 23, 34);
  const eastCourt = inside(column, row, 67, 19, 80, 23);
  const eastConnector = inside(column, row, 72, 23, 75, 34);
  const southCourt = inside(column, row, 40, 58, 55, 63);
  return (
    centralPlaza ||
    eastWestAvenue ||
    northSouthAvenue ||
    westCourt ||
    westConnector ||
    eastCourt ||
    eastConnector ||
    southCourt
  );
}

export function tileFrameAt(column: number, row: number): number {
  if (isPathAt(column, row)) {
    const north = isPathAt(column, row - 1);
    const east = isPathAt(column + 1, row);
    const south = isPathAt(column, row + 1);
    const west = isPathAt(column - 1, row);
    if (!north && !west) return 12;
    if (!north && !east) return 13;
    if (!south && !east) return 14;
    if (!south && !west) return 15;
    if (!north) return 7;
    if (!east) return 8;
    if (!south) return 9;
    if (!west) return 10;
    return 6;
  }
  if (row === 0) return 4;
  if (row === PLAZA_ROWS - 1) return 5;
  if (column === 0) return 11;
  if (column === PLAZA_COLUMNS - 1) return 16;
  return (column * 7 + row * 3) % 4;
}
