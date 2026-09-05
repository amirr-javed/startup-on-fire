import { createHash } from "node:crypto";
import { Buffer } from "node:buffer";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { deflateSync } from "node:zlib";

const ROOT = resolve(import.meta.dirname, "..");
const PALETTE = {
  transparent: [0, 0, 0, 0],
  grass: [70, 137, 72, 255],
  grassLight: [83, 154, 79, 255],
  grassDark: [52, 107, 62, 255],
  cream: [255, 241, 199, 255],
  creamDark: [220, 196, 143, 255],
  path: [222, 190, 126, 255],
  pathLight: [239, 212, 153, 255],
  wood: [132, 74, 38, 255],
  woodLight: [181, 103, 48, 255],
  woodDark: [75, 43, 31, 255],
  charcoal: [38, 43, 43, 255],
  charcoalLight: [73, 81, 78, 255],
  ember: [238, 92, 40, 255],
  yellow: [255, 194, 71, 255],
  blue: [54, 135, 190, 255],
  blueDark: [31, 83, 126, 255],
  water: [61, 174, 214, 255],
  skin1: [238, 174, 118, 255],
  skin2: [166, 101, 65, 255],
  skin3: [112, 70, 53, 255],
  hair: [64, 37, 29, 255],
  white: [255, 255, 255, 255],
};

const assets = [];

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const value of buffer) {
    crc ^= value;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const name = Buffer.from(type);
  const body = Buffer.concat([name, data]);
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(crc32(body));
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  return Buffer.concat([length, body, checksum]);
}

function encodePng(width, height, pixels) {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = 6;
  const scanlines = Buffer.alloc(height * (width * 4 + 1));
  for (let y = 0; y < height; y += 1) {
    pixels.copy(scanlines, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", header),
    chunk("IDAT", deflateSync(scanlines, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function canvas(width, height, background = PALETTE.transparent) {
  const pixels = Buffer.alloc(width * height * 4);
  for (let offset = 0; offset < pixels.length; offset += 4) {
    pixels.set(background, offset);
  }
  const rect = (x, y, w, h, color) => {
    for (let py = Math.max(0, y); py < Math.min(height, y + h); py += 1) {
      for (let px = Math.max(0, x); px < Math.min(width, x + w); px += 1) {
        pixels.set(color, (py * width + px) * 4);
      }
    }
  };
  return { width, height, pixels, rect };
}

function writeAsset(definition, draw) {
  const target = resolve(ROOT, `public${definition.url}`);
  const surface = canvas(
    definition.width,
    definition.height,
    definition.opaque ? PALETTE.grass : PALETTE.transparent,
  );
  draw(surface);
  const png = encodePng(surface.width, surface.height, surface.pixels);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, png);
  assets.push({
    ...definition,
    sha256: createHash("sha256").update(png).digest("hex"),
    sourceRevision: "SOF-005-v001",
    validation: "greybox-runtime-validated",
  });
}

function drawTerrain({ rect }) {
  for (let tile = 0; tile < 17; tile += 1) {
    const x = tile * 16;
    rect(x, 0, 16, 16, tile < 4 ? PALETTE.grass : PALETTE.path);
    if (tile < 4) {
      rect(x + 2 + tile * 2, 3 + tile, 2, 2, PALETTE.grassLight);
      rect(x + 11 - tile, 11, 1, 2, PALETTE.grassDark);
    } else {
      rect(x + 2, 2, 4, 2, PALETTE.pathLight);
      rect(x + 10, 10, 3, 2, PALETTE.creamDark);
    }
  }
  const edge = (tile, side) => {
    const x = tile * 16;
    if (side === "n") rect(x, 0, 16, 3, PALETTE.grass);
    if (side === "e") rect(x + 13, 0, 3, 16, PALETTE.grass);
    if (side === "s") rect(x, 13, 16, 3, PALETTE.grass);
    if (side === "w") rect(x, 0, 3, 16, PALETTE.grass);
  };
  edge(5, "n");
  edge(6, "e");
  edge(7, "s");
  edge(8, "w");
  rect(9 * 16, 0, 3, 3, PALETTE.grass);
  rect(10 * 16 + 13, 0, 3, 3, PALETTE.grass);
  rect(11 * 16 + 13, 13, 3, 3, PALETTE.grass);
  rect(12 * 16, 13, 3, 3, PALETTE.grass);
  rect(13 * 16, 0, 16, 5, PALETTE.grassDark);
  rect(14 * 16 + 11, 0, 5, 16, PALETTE.grassDark);
  rect(15 * 16, 11, 16, 5, PALETTE.grassDark);
  rect(16 * 16, 0, 5, 16, PALETTE.grassDark);
}

function drawBooth({ rect }, accent, variant) {
  rect(13, 19, 70, 70, PALETTE.woodDark);
  rect(17, 23, 62, 62, PALETTE.wood);
  rect(21, 49, 54, 31, PALETTE.woodLight);
  rect(12, 15, 72, 9, PALETTE.woodDark);
  rect(16, 11, 64, 10, accent);
  for (let x = 16; x < 80; x += 16) rect(x, 11, 8, 12, variant === 1 ? PALETTE.cream : accent);
  rect(25, 29, 46, 14, PALETTE.cream);
  rect(28, 32, 40, 8, PALETTE.creamDark);
  rect(23, 55, 50, 5, PALETTE.woodDark);
  rect(28, 62, 15, 14, variant === 2 ? PALETTE.blueDark : PALETTE.charcoal);
  rect(53, 62, 15, 14, variant === 3 ? PALETTE.ember : PALETTE.charcoalLight);
  rect(8, 83, 80, 7, PALETTE.woodDark);
  rect(15, 90, 66, 4, PALETTE.charcoal);
}

function drawFountain({ rect }) {
  rect(7, 35, 34, 19, PALETTE.creamDark);
  rect(4, 39, 40, 14, PALETTE.cream);
  rect(9, 38, 30, 10, PALETTE.water);
  rect(18, 17, 12, 25, PALETTE.creamDark);
  rect(20, 14, 8, 27, PALETTE.cream);
  rect(13, 10, 22, 8, PALETTE.creamDark);
  rect(16, 7, 16, 9, PALETTE.cream);
  rect(22, 17, 4, 18, PALETTE.water);
  rect(10, 53, 28, 7, PALETTE.creamDark);
}

function drawCharacter({ rect }, x, y, colors, direction, frame) {
  const bob = frame === 1 || frame === 3 ? 1 : 0;
  const step = frame === 1 ? -1 : frame === 3 ? 1 : 0;
  const skin = colors.skin;
  rect(x + 5, y + 3 + bob, 6, 7, colors.hair);
  rect(x + 4, y + 6 + bob, 8, 6, skin);
  if (direction === "left") rect(x + 4, y + 8 + bob, 2, 2, PALETTE.charcoal);
  else if (direction === "right") rect(x + 10, y + 8 + bob, 2, 2, PALETTE.charcoal);
  else if (direction === "down") {
    rect(x + 6, y + 8 + bob, 1, 1, PALETTE.charcoal);
    rect(x + 9, y + 8 + bob, 1, 1, PALETTE.charcoal);
  }
  rect(x + 3, y + 12 + bob, 10, 11, colors.shirt);
  rect(x + 2, y + 14 + bob, 2, 7, colors.accent);
  rect(x + 12, y + 14 + bob, 2, 7, colors.accent);
  rect(x + 4, y + 23, 4, 7 + step, colors.trousers);
  rect(x + 8, y + 23, 4, 7 - step, colors.trousers);
  rect(x + 3, y + 29, 5, 2, colors.shoes);
  rect(x + 8, y + 29, 5, 2, colors.shoes);
}

writeAsset(
  {
    id: "terrain",
    url: "/assets/terrain/terrain.png",
    width: 272,
    height: 16,
    frameWidth: 16,
    frameHeight: 16,
    frameCount: 17,
    opaque: true,
    origin: [0, 0],
    collision: null,
  },
  drawTerrain,
);
writeAsset(
  {
    id: "booth-01",
    url: "/assets/buildings/booth-01.png",
    width: 96,
    height: 96,
    origin: [0.5, 1],
    collision: { x: 16, y: 64, width: 64, height: 26 },
  },
  (surface) => drawBooth(surface, PALETTE.yellow, 1),
);
writeAsset(
  {
    id: "booth-02",
    url: "/assets/buildings/booth-02.png",
    width: 96,
    height: 96,
    origin: [0.5, 1],
    collision: { x: 16, y: 64, width: 64, height: 26 },
  },
  (surface) => drawBooth(surface, PALETTE.blue, 2),
);
writeAsset(
  {
    id: "booth-03",
    url: "/assets/buildings/booth-03.png",
    width: 96,
    height: 96,
    origin: [0.5, 1],
    collision: { x: 16, y: 64, width: 64, height: 26 },
  },
  (surface) => drawBooth(surface, PALETTE.ember, 3),
);
writeAsset(
  {
    id: "fountain",
    url: "/assets/props/fountain.png",
    width: 48,
    height: 64,
    origin: [0.5, 1],
    collision: { x: 8, y: 35, width: 32, height: 23 },
  },
  drawFountain,
);

const propDefinitions = [
  [
    "tree",
    48,
    64,
    (s) => {
      s.rect(21, 36, 7, 24, PALETTE.wood);
      s.rect(8, 8, 32, 34, PALETTE.grassDark);
      s.rect(12, 5, 24, 31, PALETTE.grassLight);
    },
  ],
  [
    "shrub",
    16,
    16,
    (s) => {
      s.rect(2, 7, 12, 7, PALETTE.grassDark);
      s.rect(4, 4, 8, 8, PALETTE.grassLight);
    },
  ],
  [
    "bench",
    32,
    32,
    (s) => {
      s.rect(4, 13, 24, 6, PALETTE.woodLight);
      s.rect(3, 20, 26, 5, PALETTE.wood);
      s.rect(6, 25, 4, 5, PALETTE.woodDark);
      s.rect(22, 25, 4, 5, PALETTE.woodDark);
    },
  ],
  [
    "lamp",
    16,
    48,
    (s) => {
      s.rect(6, 13, 4, 31, PALETTE.charcoal);
      s.rect(3, 5, 10, 11, PALETTE.charcoal);
      s.rect(5, 7, 6, 6, PALETTE.yellow);
      s.rect(3, 43, 10, 3, PALETTE.charcoal);
    },
  ],
  [
    "sign",
    32,
    32,
    (s) => {
      s.rect(14, 16, 4, 14, PALETTE.woodDark);
      s.rect(4, 5, 24, 14, PALETTE.wood);
      s.rect(7, 8, 18, 8, PALETTE.cream);
    },
  ],
];
for (const [id, width, height, draw] of propDefinitions) {
  writeAsset(
    { id, url: `/assets/props/${id}.png`, width, height, origin: [0.5, 1], collision: null },
    draw,
  );
}

writeAsset(
  {
    id: "scout-walk",
    url: "/assets/characters/scout-walk.png",
    width: 64,
    height: 128,
    frameWidth: 16,
    frameHeight: 32,
    frameCount: 16,
    rows: ["down", "left", "right", "up"],
    origin: [0.5, 1],
    collision: { x: 4, y: 23, width: 8, height: 8 },
    animations: { fps: 8, idleFrames: [0, 4, 8, 12] },
  },
  (surface) => {
    const directions = ["down", "left", "right", "up"];
    for (let row = 0; row < directions.length; row += 1) {
      for (let frame = 0; frame < 4; frame += 1) {
        drawCharacter(
          surface,
          frame * 16,
          row * 32,
          {
            skin: PALETTE.skin1,
            hair: PALETTE.hair,
            shirt: PALETTE.cream,
            accent: PALETTE.charcoal,
            trousers: PALETTE.charcoal,
            shoes: PALETTE.white,
          },
          directions[row],
          frame,
        );
      }
    }
  },
);

const founders = [
  [
    "founder-01",
    {
      skin: PALETTE.skin1,
      hair: PALETTE.hair,
      shirt: PALETTE.blue,
      accent: PALETTE.cream,
      trousers: PALETTE.charcoal,
      shoes: PALETTE.white,
    },
  ],
  [
    "founder-02",
    {
      skin: PALETTE.skin2,
      hair: PALETTE.charcoal,
      shirt: PALETTE.ember,
      accent: PALETTE.yellow,
      trousers: PALETTE.blueDark,
      shoes: PALETTE.cream,
    },
  ],
  [
    "founder-03",
    {
      skin: PALETTE.skin3,
      hair: PALETTE.hair,
      shirt: PALETTE.grassDark,
      accent: PALETTE.cream,
      trousers: PALETTE.charcoal,
      shoes: PALETTE.woodLight,
    },
  ],
];
for (const [id, colors] of founders) {
  writeAsset(
    {
      id,
      url: `/assets/characters/${id}.png`,
      width: 16,
      height: 32,
      origin: [0.5, 1],
      collision: null,
    },
    (surface) => drawCharacter(surface, 0, 0, colors, "down", 0),
  );
}

const manifest = {
  version: 1,
  tileSize: 16,
  generatedAt: "2026-09-05",
  generator: "Codex deterministic PNG generator informed by the retained SOF-005 image reference",
  palette: Object.fromEntries(
    Object.entries(PALETTE)
      .filter(([name]) => name !== "transparent")
      .map(([name, rgba]) => [
        name,
        `#${rgba
          .slice(0, 3)
          .map((value) => value.toString(16).padStart(2, "0"))
          .join("")}`,
      ]),
  ),
  assets,
};
const manifestPath = resolve(ROOT, "public/assets/manifest.json");
mkdirSync(dirname(manifestPath), { recursive: true });
writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
