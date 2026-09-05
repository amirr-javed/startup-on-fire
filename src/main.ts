import "./styles/main.css";

import { readRuntimeConfig } from "./config/runtime";
import { createGame } from "./game/createGame";
import { connectToBackend } from "./services/convex/client";
import { createAppShell } from "./ui/appShell";

const uiRoot = document.getElementById("ui-root");
if (uiRoot === null) {
  throw new Error("Missing UI root element.");
}

const shell = createAppShell(uiRoot);
const game = createGame("game-root");
const runtimeConfig = readRuntimeConfig(import.meta.env);
const disconnectBackend = connectToBackend(runtimeConfig.convexUrl, shell.updateBackendStatus);

window.addEventListener(
  "beforeunload",
  () => {
    disconnectBackend();
    game.destroy(true);
  },
  { once: true },
);
