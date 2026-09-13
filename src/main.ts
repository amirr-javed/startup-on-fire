import "./styles/main.css";

import { readRuntimeConfig } from "./config/runtime";
import { createGame } from "./game/createGame";
import { GameUiBridge } from "./game/events/GameUiBridge";
import { DigitalInput } from "./game/input/DigitalInput";
import { GameLoadBridge } from "./game/loading/GameLoadBridge";
import { connectToBackend } from "./services/convex/client";
import { createWorldSelfieVerifier } from "./services/world/selfieVerifier";
import { createBoothDirectory } from "./services/ens/boothDirectory";
import { createEnsBoothResolver } from "./services/ens/boothResolver";
import { createAppShell } from "./ui/appShell";
import { mountPublicFuelPanel } from "./ui/publicFuelPanel";
import { mountLaunchScreen } from "./ui/launchScreen";

const uiRoot = document.getElementById("ui-root");
const launchRoot = document.getElementById("launch-root");
const gameRoot = document.getElementById("game-root");
if (uiRoot === null || launchRoot === null || gameRoot === null) {
  throw new Error("Missing application UI root element.");
}

const input = new DigitalInput();
const uiBridge = new GameUiBridge();
const loadBridge = new GameLoadBridge();
const shell = createAppShell(uiRoot, input, uiBridge);
const launchScreen = mountLaunchScreen(launchRoot, loadBridge, {
  onEnter: () => shell.focusGameAction(),
  backgroundRoots: [gameRoot, uiRoot],
});
const runtimeConfig = readRuntimeConfig(import.meta.env);
const backend = connectToBackend(runtimeConfig.convexUrl, shell.updateBackendStatus);
const boothDirectory =
  backend.gameplay === null
    ? null
    : createBoothDirectory(
        backend.gameplay,
        createEnsBoothResolver({ rpcUrl: runtimeConfig.ensRpcUrl }),
      );
const game = createGame("game-root", input, uiBridge, backend.gameplay, boothDirectory, loadBridge);
const e2eDriverCleanup =
  import.meta.env.MODE === "e2e"
    ? import("./testing/e2eDriver").then(({ installE2eDriver }) => installE2eDriver(game))
    : Promise.resolve(() => undefined);
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
    void e2eDriverCleanup.then((cleanup) => cleanup());
    unmountPublicFuelPanel();
    launchScreen.destroy();
    backend.disconnect();
    shell.destroy();
    game.destroy(true);
  },
  { once: true },
);
