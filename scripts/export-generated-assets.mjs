import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import process from "node:process";

const ROOT = resolve(import.meta.dirname, "..");
const RAW = resolve(ROOT, "art/revisions/SOF-013-v001/raw");
const OUT = resolve(ROOT, "public/assets/original");
const work = mkdtempSync(join(tmpdir(), "sof-013-assets-"));

function run(binary, args, capture = false) {
  const result = spawnSync(binary, args, {
    cwd: ROOT,
    encoding: "utf8",
    stdio: capture ? "pipe" : "inherit",
  });
  if (result.status !== 0) {
    throw new Error(`${binary} failed: ${result.stderr ?? ""}`);
  }
  return result;
}

function probe(path) {
  const result = run(
    "ffprobe",
    ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "json", path],
    true,
  );
  return JSON.parse(result.stdout).streams[0];
}

function detectCrop(path) {
  const result = run(
    "ffmpeg",
    [
      "-hide_banner",
      "-loop",
      "1",
      "-i",
      path,
      "-vf",
      "cropdetect=limit=1:round=2:reset=0",
      "-t",
      "0.24",
      "-f",
      "null",
      "-",
    ],
    true,
  );
  const matches = [...result.stderr.matchAll(/crop=(\d+):(\d+):(\d+):(\d+)/g)];
  if (matches.length === 0) throw new Error(`Could not detect alpha bounds for ${path}`);
  const [, width, height, x, y] = matches.at(-1);
  return { width: Number(width), height: Number(height), x: Number(x), y: Number(y) };
}

function exportFitted(source, target, width, height, margin = 2) {
  mkdirSync(dirname(target), { recursive: true });
  const crop = detectCrop(source);
  const scale = Math.min((width - margin * 2) / crop.width, (height - margin * 2) / crop.height);
  const scaledWidth = Math.max(1, Math.floor(crop.width * scale));
  const scaledHeight = Math.max(1, Math.floor(crop.height * scale));
  const filter = [
    `crop=${crop.width}:${crop.height}:${crop.x}:${crop.y}`,
    `scale=${scaledWidth}:${scaledHeight}:flags=neighbor`,
    `pad=${width}:${height}:(ow-iw)/2:${height}-ih-${margin}:color=black@0`,
    "format=rgba",
  ].join(",");
  run("ffmpeg", ["-y", "-hide_banner", "-loglevel", "error", "-i", source, "-vf", filter, "-frames:v", "1", target]);
}

function extractCell(source, target, columns, rows, column, row, inset = 0) {
  const { width, height } = probe(source);
  const left = Math.round((column * width) / columns) + inset;
  const right = Math.round(((column + 1) * width) / columns) - inset;
  const top = Math.round((row * height) / rows) + inset;
  const bottom = Math.round(((row + 1) * height) / rows) - inset;
  run("ffmpeg", [
    "-y",
    "-hide_banner",
    "-loglevel",
    "error",
    "-i",
    source,
    "-vf",
    `crop=${right - left}:${bottom - top}:${left}:${top},format=rgba`,
    "-frames:v",
    "1",
    target,
  ]);
}

function assembleGrid(frames, target, columns, rows) {
  mkdirSync(dirname(target), { recursive: true });
  const args = ["-y", "-hide_banner", "-loglevel", "error"];
  for (const frame of frames) args.push("-i", frame);
  const filters = [];
  for (let row = 0; row < rows; row += 1) {
    const inputs = Array.from({ length: columns }, (_, column) => `[${row * columns + column}:v]`).join("");
    filters.push(`${inputs}hstack=inputs=${columns}[row${row}]`);
  }
  if (rows === 1) {
    filters.push("[row0]format=rgba[out]");
  } else {
    const rowInputs = Array.from({ length: rows }, (_, row) => `[row${row}]`).join("");
    filters.push(`${rowInputs}vstack=inputs=${rows},format=rgba[out]`);
  }
  args.push("-filter_complex", filters.join(";"), "-map", "[out]", "-frames:v", "1", target);
  run("ffmpeg", args);
}

function exportSheet(source, target, columns, rows, frameWidth, frameHeight, margin) {
  const frames = [];
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const cell = resolve(work, `cell-${frames.length}.png`);
      const fitted = resolve(work, `fitted-${frames.length}.png`);
      extractCell(source, cell, columns, rows, column, row);
      exportFitted(cell, fitted, frameWidth, frameHeight, margin);
      frames.push(fitted);
    }
  }
  assembleGrid(frames, target, columns, rows);
}

function exportTerrain(source, target) {
  const frames = [];
  for (let row = 0; row < 3; row += 1) {
    for (let column = 0; column < 6; column += 1) {
      const cell = resolve(work, `terrain-${frames.length}.png`);
      const scaled = resolve(work, `terrain-scaled-${frames.length}.png`);
      extractCell(source, cell, 6, 3, column, row, 2);
      run("ffmpeg", [
        "-y",
        "-hide_banner",
        "-loglevel",
        "error",
        "-i",
        cell,
        "-vf",
        "scale=16:16:flags=neighbor,format=rgba",
        "-frames:v",
        "1",
        scaled,
      ]);
      frames.push(scaled);
    }
  }
  assembleGrid(frames, target, 6, 3);
}

const isolated = [
  ["booth-01-source.png", "buildings/booth-01.png", 96, 96, 2],
  ["booth-02-source.png", "buildings/booth-02.png", 96, 96, 2],
  ["booth-03-source.png", "buildings/booth-03.png", 96, 96, 2],
  ["founder-01-source.png", "characters/founder-01.png", 16, 32, 1],
  ["founder-02-source.png", "characters/founder-02.png", 16, 32, 1],
  ["founder-03-source.png", "characters/founder-03.png", 16, 32, 1],
  ["ember-guide-source.png", "characters/ember-guide.png", 16, 32, 1],
  ["fountain-source.png", "props/fountain.png", 48, 64, 2],
  ["tree-source.png", "props/tree.png", 48, 64, 2],
  ["shrub-source.png", "props/shrub.png", 16, 16, 1],
  ["bench-source.png", "props/bench.png", 32, 32, 1],
  ["sign-source.png", "props/sign.png", 32, 32, 1],
  ["lamp-source.png", "props/lamp.png", 16, 48, 1],
  ["fire-pit-source.png", "fire/fire-pit.png", 64, 32, 2],
];

try {
  for (const [source, target, width, height, margin] of isolated) {
    exportFitted(resolve(RAW, source), resolve(OUT, target), width, height, margin);
  }
  exportSheet(resolve(RAW, "scout-walk-source.png"), resolve(OUT, "characters/scout-walk.png"), 4, 4, 16, 32, 1);
  exportSheet(resolve(RAW, "fire-cold-source.png"), resolve(OUT, "fire/fire-cold.png"), 6, 1, 64, 96, 2);
  exportSheet(resolve(RAW, "fire-hot-source.png"), resolve(OUT, "fire/fire-hot.png"), 6, 1, 64, 96, 2);
  exportSheet(resolve(RAW, "fire-blazing-source.png"), resolve(OUT, "fire/fire-blazing.png"), 6, 1, 64, 96, 2);
  exportSheet(resolve(RAW, "bug-source.png"), resolve(OUT, "minigame/bug.png"), 4, 1, 16, 16, 1);
  exportSheet(resolve(RAW, "hit-source.png"), resolve(OUT, "minigame/hit.png"), 4, 1, 32, 32, 1);
  exportTerrain(resolve(RAW, "terrain-source-r01.png"), resolve(OUT, "terrain/terrain.png"));
  process.stdout.write("Exported 21 SOF-013 runtime PNG assets.\n");
} finally {
  rmSync(work, { recursive: true, force: true });
}
