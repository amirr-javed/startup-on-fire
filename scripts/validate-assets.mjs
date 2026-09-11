import { createHash } from "node:crypto";
import { Buffer } from "node:buffer";
import process from "node:process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const manifest = JSON.parse(readFileSync(resolve(root, "public/assets/manifest.json"), "utf8"));
const failures = [];

function frameCountForLength(length, frameLength, margin = 0, spacing = 0) {
  return (length - margin * 2 + spacing) / (frameLength + spacing);
}

for (const asset of manifest.assets) {
  const file = readFileSync(resolve(root, `public${asset.url}`));
  const width = file.readUInt32BE(16);
  const height = file.readUInt32BE(20);
  const colorType = file[25];
  const hash = createHash("sha256").update(file).digest("hex");
  if (width !== asset.width || height !== asset.height)
    failures.push(`${asset.id}: expected ${asset.width}x${asset.height}, got ${width}x${height}`);
  const expectedColorType = asset.colorType ?? 6;
  if (colorType !== expectedColorType)
    failures.push(`${asset.id}: expected color type ${expectedColorType}, got ${colorType}`);
  if (asset.hasTransparency && !file.includes(Buffer.from("tRNS")))
    failures.push(`${asset.id}: expected a transparent palette entry`);
  if (hash !== asset.sha256) failures.push(`${asset.id}: SHA-256 mismatch`);
  if (
    asset.frameWidth &&
    !Number.isInteger(frameCountForLength(width, asset.frameWidth, asset.margin, asset.spacing))
  )
    failures.push(`${asset.id}: frame width and spacing do not fit sheet`);
  if (
    asset.frameHeight &&
    !Number.isInteger(frameCountForLength(height, asset.frameHeight, asset.margin, asset.spacing))
  )
    failures.push(`${asset.id}: frame height and spacing do not fit sheet`);
}

if (failures.length > 0) {
  throw new Error(`Asset validation failed:\n${failures.join("\n")}`);
}

process.stdout.write(`Validated ${manifest.assets.length} PNG assets and manifest hashes.\n`);
