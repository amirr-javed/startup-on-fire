import "./styles/main.css";

import { readRuntimeConfig } from "./config/runtime";
import { createGame } from "./game/createGame";
import { GameUiBridge } from "./game/events/GameUiBridge";
import { DigitalInput } from "./game/input/DigitalInput";
import { connectToBackend } from "./services/convex/client";
import { createWorldSelfieVerifier } from "./services/world/selfieVerifier";
import { createAppShell } from "./ui/appShell";
import { mountPublicFuelPanel } from "./ui/publicFuelPanel";

const uiRoot = document.getElementById("ui-root");
if (uiRoot === null) {
  throw new Error("Missing UI root element.");
}

const input = new DigitalInput();
const uiBridge = new GameUiBridge();
const shell = createAppShell(uiRoot, input, uiBridge);
const runtimeConfig = readRuntimeConfig(import.meta.env);
const backend = connectToBackend(runtimeConfig.convexUrl, shell.updateBackendStatus);
const game = createGame("game-root", input, uiBridge, backend.gameplay);
const unmountPublicFuelPanel =
  backend.client === null || backend.gameplay === null
    ? () => undefined
    : mountPublicFuelPanel(
        uiRoot,
        backend.gameplay,
        createWorldSelfieVerifier(backend.client),
        uiBridge,
      );

window.addEventListener(
  "beforeunload",
  () => {
    unmountPublicFuelPanel();
    backend.disconnect();
    shell.destroy();
    game.destroy(true);
  },
  { once: true },
);
