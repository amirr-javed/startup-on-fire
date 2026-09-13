import Phaser from "phaser";

import { BOOTHS } from "../game/world/plazaLayout";

export type E2eDriver = Readonly<{
  approachBooth: (boothSlug: string) => void;
  scoutPosition: () => Readonly<{ x: number; y: number }>;
  squashActiveBug: () => boolean;
}>;

declare global {
  interface Window {
    __SOF_E2E__?: E2eDriver;
  }
}

function scoutFor(game: Phaser.Game): Phaser.Physics.Arcade.Sprite {
  const plaza = game.scene.getScene("plaza");
  const scout = plaza.children
    .getAll()
    .find(
      (child): child is Phaser.Physics.Arcade.Sprite =>
        child instanceof Phaser.Physics.Arcade.Sprite && child.texture.key === "scout-walk",
    );
  if (scout === undefined) throw new Error("The plaza Scout is not ready.");
  return scout;
}

export function installE2eDriver(game: Phaser.Game): () => void {
  const driver: E2eDriver = Object.freeze({
    approachBooth(boothSlug) {
      const booth = BOOTHS.find(({ id }) => id === boothSlug);
      if (booth === undefined) throw new Error(`Unknown booth: ${boothSlug}`);
      const scout = scoutFor(game);
      scout.setPosition(booth.interactionX, booth.interactionY + 18);
      if (scout.body === null) throw new Error("The plaza Scout has no physics body.");
      scout.body.updateFromGameObject();
    },
    scoutPosition() {
      const scout = scoutFor(game);
      return { x: scout.x, y: scout.y };
    },
    squashActiveBug() {
      const scene = game.scene.getScene("bug-squash");
      const bug = scene.children
        .getAll()
        .find(
          (child): child is Phaser.GameObjects.Sprite =>
            child instanceof Phaser.GameObjects.Sprite &&
            child.texture.key === "bug" &&
            child.active,
        );
      if (bug === undefined) return false;
      bug.emit(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN);
      return true;
    },
  });
  Object.defineProperty(window, "__SOF_E2E__", {
    configurable: true,
    value: driver,
  });
  return () => {
    delete window.__SOF_E2E__;
  };
}
