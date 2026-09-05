import { createHash } from "node:crypto";
import process from "node:process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const manifest = JSON.parse(readFileSync(resolve(root, "public/assets/manifest.json"), "utf8"));
const failures = [];

for (const asset of manifest.assets) {
  const file = readFileSync(resolve(root, `public${asset.url}`));
  const width = file.readUInt32BE(16);
  const height = file.readUInt32BE(20);
  const colorType = file[25];
  const hash = createHash("sha256").update(file).digest("hex");
  if (width !== asset.width || height !== asset.height)
    failures.push(`${asset.id}: expected ${asset.width}x${asset.height}, got ${width}x${height}`);
  if (colorType !== 6) failures.push(`${asset.id}: expected RGBA color type 6, got ${colorType}`);
  if (hash !== asset.sha256) failures.push(`${asset.id}: SHA-256 mismatch`);
  if (asset.frameWidth && width % asset.frameWidth !== 0)
    failures.push(`${asset.id}: frame width does not divide sheet`);
  if (asset.frameHeight && height % asset.frameHeight !== 0)
    failures.push(`${asset.id}: frame height does not divide sheet`);
}

if (failures.length > 0) {
  throw new Error(`Asset validation failed:\n${failures.join("\n")}`);
}

process.stdout.write(`Validated ${manifest.assets.length} RGBA PNG assets and manifest hashes.\n`);
