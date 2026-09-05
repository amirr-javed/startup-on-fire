import Phaser from "phaser";

type AssetDefinition = Readonly<{
  id: string;
  url: string;
  frameWidth?: number;
  frameHeight?: number;
}>;

type AssetManifest = Readonly<{ assets: readonly AssetDefinition[] }>;

function isManifest(value: unknown): value is AssetManifest {
  if (typeof value !== "object" || value === null || !("assets" in value)) return false;
  return Array.isArray(value.assets);
}

export class PreloadScene extends Phaser.Scene {
  public constructor() {
    super("preload");
  }

  public preload(): void {
    this.load.json("asset-manifest", "/assets/manifest.json");
  }

  public create(): void {
    const manifest: unknown = this.cache.json.get("asset-manifest");
    if (!isManifest(manifest)) throw new Error("The runtime asset manifest is invalid.");

    for (const asset of manifest.assets) {
      if (asset.frameWidth !== undefined && asset.frameHeight !== undefined) {
        this.load.spritesheet(asset.id, asset.url, {
          frameWidth: asset.frameWidth,
          frameHeight: asset.frameHeight,
        });
      } else {
        this.load.image(asset.id, asset.url);
      }
    }

    this.load.once(Phaser.Loader.Events.COMPLETE, () => this.scene.start("plaza"));
    this.load.start();
  }
}
