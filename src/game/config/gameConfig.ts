import Phaser from "phaser";

import type { GameUiBridge } from "../events/GameUiBridge";
import type { DigitalInput } from "../input/DigitalInput";
import { PlazaScene } from "../scenes/PlazaScene";
import { PreloadScene } from "../scenes/PreloadScene";
import { GAME_BACKGROUND, GAME_HEIGHT, GAME_WIDTH, PIXEL_RENDER_SETTINGS } from "./display";

export function createGameConfig(
  parent: string,
  input: DigitalInput,
  uiBridge: GameUiBridge,
): Phaser.Types.Core.GameConfig {
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
    physics: {
      default: "arcade",
      arcade: { debug: false },
    },
    scene: [new PreloadScene(), new PlazaScene({ input, uiBridge })],
  };
}
