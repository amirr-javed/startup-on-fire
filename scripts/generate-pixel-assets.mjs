import "./export-generated-assets.mjs";

import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const assets = [];

function registerAsset(definition) {
  const target = resolve(ROOT, `public${definition.url}`);
  const png = readFileSync(target);
  if (png[25] !== 6) throw new Error(`${definition.id} must be an RGBA PNG.`);
  assets.push({
    ...definition,
    width: png.readUInt32BE(16),
    height: png.readUInt32BE(20),
    sha256: createHash("sha256").update(png).digest("hex"),
    sourceRevision: "SOF-013-v001",
    validation: "dimensions-alpha-frame-grid-browser-validated",
  });
}

for (const definition of [
  {
    id: "terrain",
    url: "/assets/original/terrain/terrain.png",
    frameWidth: 16,
    frameHeight: 16,
    origin: [0, 0],
    collision: null,
  },
  ...[1, 2, 3].map((index) => ({
    id: `booth-0${index}`,
    url: `/assets/original/buildings/booth-0${index}.png`,
    origin: [0.5, 1],
    collision: { width: 72, height: 24 },
  })),
  {
    id: "scout-walk",
    url: "/assets/original/characters/scout-walk.png",
    frameWidth: 16,
    frameHeight: 32,
    origin: [0.5, 1],
    collision: { x: 3, y: 19, width: 10, height: 12 },
  },
  ...[1, 2, 3].map((index) => ({
    id: `founder-0${index}`,
    url: `/assets/original/characters/founder-0${index}.png`,
    origin: [0.5, 1],
    collision: null,
  })),
  {
    id: "ember-guide",
    url: "/assets/original/characters/ember-guide.png",
    origin: [0.5, 1],
    collision: null,
  },
  ...[
    ["fountain", 48, 24],
    ["tree", 28, 16],
    ["shrub", 12, 8],
    ["bench", 28, 10],
    ["sign", 12, 8],
    ["lamp", 8, 8],
  ].map(([id, width, height]) => ({
    id,
    url: `/assets/original/props/${id}.png`,
    origin: [0.5, 1],
    collision: { width, height },
  })),
  {
    id: "fire-pit",
    url: "/assets/original/fire/fire-pit.png",
    origin: [0.5, 1],
    collision: { width: 48, height: 18 },
  },
  ...["cold", "hot", "blazing"].map((tier) => ({
    id: `fire-${tier}`,
    url: `/assets/original/fire/fire-${tier}.png`,
    frameWidth: 64,
    frameHeight: 96,
    origin: [0.5, 1],
    collision: null,
  })),
  {
    id: "bug",
    url: "/assets/original/minigame/bug.png",
    frameWidth: 16,
    frameHeight: 16,
    origin: [0.5, 0.5],
    collision: null,
  },
  {
    id: "hit",
    url: "/assets/original/minigame/hit.png",
    frameWidth: 32,
    frameHeight: 32,
    origin: [0.5, 0.5],
    collision: null,
  },
]) {
  registerAsset(definition);
}

const manifestPath = resolve(ROOT, "public/assets/manifest.json");
mkdirSync(dirname(manifestPath), { recursive: true });
writeFileSync(
  manifestPath,
  `${JSON.stringify(
    {
      version: 2,
      tileSize: 16,
      generatedAt: "2026-09-11",
      generator: "SOF-013 OpenAI image generation with exact runtime export",
      assets,
    },
    null,
    2,
  )}\n`,
);
