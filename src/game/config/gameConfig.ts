import Phaser from "phaser";

import type { GameUiBridge } from "../events/GameUiBridge";
import type { DigitalInput } from "../input/DigitalInput";
import { QuestSession } from "../quests/QuestSession";
import { BugSquashScene } from "../scenes/BugSquashScene";
import { PlazaScene } from "../scenes/PlazaScene";
import { PreloadScene } from "../scenes/PreloadScene";
import { GAME_BACKGROUND, GAME_HEIGHT, GAME_WIDTH, PIXEL_RENDER_SETTINGS } from "./display";
import type { GameplayBackend } from "../../types/gameplay";

export function createGameConfig(
  parent: string,
  input: DigitalInput,
  uiBridge: GameUiBridge,
  gameplayBackend: GameplayBackend | null,
): Phaser.Types.Core.GameConfig {
  const questSession = new QuestSession();
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
    scene: [
      new PreloadScene(),
      new PlazaScene({ input, uiBridge, questSession, gameplayBackend }),
      new BugSquashScene({ input, uiBridge, questSession, gameplayBackend }),
    ],
  };
}
