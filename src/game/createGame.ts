import Phaser from "phaser";

import { createGameConfig } from "./config/gameConfig";
import type { GameUiBridge } from "./events/GameUiBridge";
import type { DigitalInput } from "./input/DigitalInput";
import type { GameplayBackend } from "../types/gameplay";
import type { BoothDirectory } from "../services/ens/boothDirectory";
import type { GameLoadBridge } from "./loading/GameLoadBridge";

export function createGame(
  parentId: string,
  input: DigitalInput,
  uiBridge: GameUiBridge,
  gameplayBackend: GameplayBackend | null,
  boothDirectory: BoothDirectory | null,
  loadBridge: GameLoadBridge,
): Phaser.Game {
  const parent = document.getElementById(parentId);
  if (parent === null) {
    throw new Error(`Missing Phaser parent element: #${parentId}`);
  }

  return new Phaser.Game(
    createGameConfig(parentId, input, uiBridge, gameplayBackend, boothDirectory, loadBridge),
  );
}
