import Phaser from "phaser";

import { createGameConfig } from "./config/gameConfig";
import type { GameUiBridge } from "./events/GameUiBridge";
import type { DigitalInput } from "./input/DigitalInput";

export function createGame(
  parentId: string,
  input: DigitalInput,
  uiBridge: GameUiBridge,
): Phaser.Game {
  const parent = document.getElementById(parentId);
  if (parent === null) {
    throw new Error(`Missing Phaser parent element: #${parentId}`);
  }

  return new Phaser.Game(createGameConfig(parentId, input, uiBridge));
}
