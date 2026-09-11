export type AssetDefinition = Readonly<{
  id: string;
  url: string;
  frameWidth?: number;
  frameHeight?: number;
}>;

export type AssetManifest = Readonly<{ assets: readonly AssetDefinition[] }>;

function isPositiveInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value > 0;
}

export function isAssetManifest(value: unknown): value is AssetManifest {
  if (typeof value !== "object" || value === null || !("assets" in value)) return false;
  if (!Array.isArray(value.assets) || value.assets.length === 0) return false;
  const ids = new Set<string>();
  return value.assets.every((asset: unknown) => {
    if (typeof asset !== "object" || asset === null) return false;
    if (!("id" in asset) || typeof asset.id !== "string" || asset.id.trim().length === 0) {
      return false;
    }
    if (ids.has(asset.id)) return false;
    ids.add(asset.id);
    if (!("url" in asset) || typeof asset.url !== "string" || !asset.url.startsWith("/assets/")) {
      return false;
    }
    const frameWidth = "frameWidth" in asset ? asset.frameWidth : undefined;
    const frameHeight = "frameHeight" in asset ? asset.frameHeight : undefined;
    const hasFrameWidth = frameWidth !== undefined;
    const hasFrameHeight = frameHeight !== undefined;
    return (
      hasFrameWidth === hasFrameHeight &&
      (!hasFrameWidth || (isPositiveInteger(frameWidth) && isPositiveInteger(frameHeight)))
    );
  });
}
