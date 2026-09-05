import type { BackendStatus } from "../types/backend";
import type { GameUiBridge, GameUiState } from "../game/events/GameUiBridge";
import type { DigitalInput, Direction } from "../game/input/DigitalInput";

export type AppShell = Readonly<{
  updateBackendStatus: (status: BackendStatus) => void;
  destroy: () => void;
}>;

function statusCopy(status: BackendStatus): string {
  switch (status.state) {
    case "not-configured":
      return "Backend setup pending";
    case "connecting":
      return "Connecting to realtime backend…";
    case "connected":
      return "Realtime backend connected";
    case "error":
      return status.message;
  }
}

function createDirectionButton(
  direction: Direction,
  label: string,
  input: DigitalInput,
): HTMLButtonElement {
  const button = document.createElement("button");
  button.className = `move-button move-button--${direction}`;
  button.type = "button";
  button.textContent = label;
  button.setAttribute("aria-label", `Move ${direction}`);

  const release = (): void => input.setDirection(direction, false);
  button.addEventListener("pointerdown", (event) => {
    button.setPointerCapture(event.pointerId);
    input.setDirection(direction, true);
  });
  button.addEventListener("pointerup", release);
  button.addEventListener("pointercancel", release);
  button.addEventListener("lostpointercapture", release);
  return button;
}

function renderGameState(
  panel: HTMLElement,
  prompt: HTMLElement,
  dialogue: HTMLElement,
  discovery: HTMLElement,
  state: GameUiState,
): void {
  discovery.textContent = `Booths discovered ${state.discoveredCount}/${state.totalBooths}`;
  prompt.hidden = state.nearbyBooth === null || state.openBooth !== null;
  prompt.querySelector("span")!.textContent =
    state.nearbyBooth === null
      ? ""
      : `Meet ${state.nearbyBooth.founder} at ${state.nearbyBooth.name}`;
  dialogue.hidden = state.openBooth === null;
  if (state.openBooth !== null) {
    dialogue.querySelector("h2")!.textContent = state.openBooth.name;
    dialogue.querySelector("p")!.textContent =
      `${state.openBooth.founder}: Welcome, Scout. Our full startup story arrives with the discovery quest in the next slice.`;
  }
  panel.dataset.gameState = state.openBooth === null ? "exploring" : "dialogue";
}

export function createAppShell(
  root: HTMLElement,
  input: DigitalInput,
  uiBridge: GameUiBridge,
): AppShell {
  const panel = document.createElement("section");
  panel.className = "scout-panel";
  panel.setAttribute("aria-label", "Scout status");

  const eyebrow = document.createElement("span");
  eyebrow.className = "scout-panel__eyebrow";
  eyebrow.textContent = "SCOUT // PLAZA";

  const status = document.createElement("span");
  status.className = "scout-panel__status";

  const discovery = document.createElement("span");
  discovery.className = "scout-panel__discovery";

  const prompt = document.createElement("section");
  prompt.className = "interaction-prompt";
  prompt.hidden = true;
  const promptCopy = document.createElement("span");
  const interactButton = document.createElement("button");
  interactButton.type = "button";
  interactButton.textContent = "Interact · E";
  interactButton.addEventListener("click", () => input.requestInteract());
  prompt.append(promptCopy, interactButton);

  const dialogue = document.createElement("section");
  dialogue.className = "dialogue-card";
  dialogue.hidden = true;
  dialogue.setAttribute("aria-label", "Founder introduction");
  const dialogueTitle = document.createElement("h2");
  const dialogueCopy = document.createElement("p");
  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.textContent = "Continue";
  closeButton.addEventListener("click", () => input.requestDismiss());
  dialogue.append(dialogueTitle, dialogueCopy, closeButton);

  const controls = document.createElement("section");
  controls.className = "mobile-controls";
  controls.setAttribute("aria-label", "Movement controls");
  controls.append(
    createDirectionButton("up", "↑", input),
    createDirectionButton("left", "←", input),
    createDirectionButton("down", "↓", input),
    createDirectionButton("right", "→", input),
  );

  panel.append(eyebrow, status, discovery);
  root.replaceChildren(panel, prompt, dialogue, controls);
  const unsubscribe = uiBridge.subscribe((state) =>
    renderGameState(panel, prompt, dialogue, discovery, state),
  );

  return {
    updateBackendStatus(nextStatus) {
      status.textContent = statusCopy(nextStatus);
      panel.dataset.state = nextStatus.state;
    },
    destroy() {
      unsubscribe();
      input.reset();
      root.replaceChildren();
    },
  };
}
