import "./styles/main.css";

import { readRuntimeConfig } from "./config/runtime";
import { createGame } from "./game/createGame";
import { GameUiBridge } from "./game/events/GameUiBridge";
import { DigitalInput } from "./game/input/DigitalInput";
import { connectToBackend } from "./services/convex/client";
import { createAppShell } from "./ui/appShell";

const uiRoot = document.getElementById("ui-root");
if (uiRoot === null) {
  throw new Error("Missing UI root element.");
}

const input = new DigitalInput();
const uiBridge = new GameUiBridge();
const shell = createAppShell(uiRoot, input, uiBridge);
const game = createGame("game-root", input, uiBridge);
const runtimeConfig = readRuntimeConfig(import.meta.env);
const backend = connectToBackend(runtimeConfig.convexUrl, shell.updateBackendStatus);

window.addEventListener(
  "beforeunload",
  () => {
    backend.disconnect();
    shell.destroy();
    game.destroy(true);
  },
  { once: true },
);
