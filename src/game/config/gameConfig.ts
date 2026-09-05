import Phaser from "phaser";

import { BootScene } from "../scenes/BootScene";
import { GAME_BACKGROUND, GAME_HEIGHT, GAME_WIDTH, PIXEL_RENDER_SETTINGS } from "./display";

export function createGameConfig(parent: string): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: GAME_BACKGROUND,
    ...PIXEL_RENDER_SETTINGS,
    render: {
      ...PIXEL_RENDER_SETTINGS,
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: GAME_WIDTH,
      height: GAME_HEIGHT,
    },
    scene: [BootScene],
  };
}
