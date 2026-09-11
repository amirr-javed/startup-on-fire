import Phaser from "phaser";

import type { GameLoadBridge } from "../loading/GameLoadBridge";
import { isAssetManifest } from "../loading/assetManifest";

export class PreloadScene extends Phaser.Scene {
  readonly #loadBridge: GameLoadBridge;
  #loadFailed = false;

  public constructor(loadBridge: GameLoadBridge) {
    super("preload");
    this.#loadBridge = loadBridge;
  }

  public preload(): void {
    this.load.once(Phaser.Loader.Events.FILE_LOAD_ERROR, () => {
      this.#loadFailed = true;
      this.#loadBridge.fail("The city assets could not be loaded.");
    });
    this.#loadBridge.loading(0.05, "Finding the city map…");
    this.load.json("asset-manifest", "/assets/manifest.json");
  }

  public create(): void {
    const manifest: unknown = this.cache.json.get("asset-manifest");
    if (this.#loadFailed || !isAssetManifest(manifest)) {
      this.#loadBridge.fail("The city map is unavailable.");
      return;
    }

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

    this.load.on(Phaser.Loader.Events.PROGRESS, (progress: number) => {
      this.#loadBridge.loading(0.15 + progress * 0.85);
    });
    this.load.once(Phaser.Loader.Events.COMPLETE, () => {
      if (this.#loadFailed) return;
      this.#loadBridge.ready();
      this.scene.start("plaza");
    });
    this.load.start();
  }
}
