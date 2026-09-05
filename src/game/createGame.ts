import Phaser from "phaser";

import { createGameConfig } from "./config/gameConfig";

export function createGame(parentId: string): Phaser.Game {
  const parent = document.getElementById(parentId);
  if (parent === null) {
    throw new Error(`Missing Phaser parent element: #${parentId}`);
  }

  return new Phaser.Game(createGameConfig(parentId));
}
