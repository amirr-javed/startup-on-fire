import type { GameUiBridge, GameUiState } from "../game/events/GameUiBridge";
import type { DigitalInput, Direction } from "../game/input/DigitalInput";
import type { BackendStatus } from "../types/backend";

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

type StoryElements = Readonly<{
  card: HTMLElement;
  eyebrow: HTMLElement;
  title: HTMLElement;
  body: HTMLElement;
  score: HTMLElement;
  progress: HTMLProgressElement;
  primary: HTMLButtonElement;
  secondary: HTMLButtonElement;
}>;

function renderGameState(
  panel: HTMLElement,
  prompt: HTMLElement,
  discovery: HTMLElement,
  objective: HTMLElement,
  story: StoryElements,
  state: GameUiState,
): void {
  discovery.textContent = `Booths discovered ${state.discoveredCount}/${state.totalBooths}`;
  objective.textContent = state.objective;
  prompt.hidden =
    state.nearbyBooth === null || state.openBooth !== null || state.overlay.kind !== "none";
  prompt.querySelector("span")!.textContent =
    state.nearbyBooth === null
      ? ""
      : `Meet ${state.nearbyBooth.founder} at ${state.nearbyBooth.name}${
          state.nearbyBooth.fireScore === undefined
            ? ""
            : ` · ${state.nearbyBooth.fireScore} fire · ${state.nearbyBooth.fireTier}`
        }`;

  const { overlay } = state;
  story.card.hidden = overlay.kind === "none";
  story.card.dataset.kind = overlay.kind;
  panel.dataset.gameState = overlay.kind === "none" ? "exploring" : overlay.kind;
  if (overlay.kind === "none") return;

  story.title.textContent = overlay.title;
  story.body.textContent = overlay.body;
  story.eyebrow.textContent = overlay.kind === "minigame" ? "KINDRED QUEST" : overlay.eyebrow;
  const isMinigame = overlay.kind === "minigame";
  story.score.hidden = !isMinigame;
  story.progress.hidden = !isMinigame;
  if (isMinigame) {
    story.card.dataset.status = overlay.status;
    story.score.textContent = `${overlay.score}/${overlay.target} bugs · ${overlay.secondsRemaining}s`;
    story.progress.max = overlay.target;
    story.progress.value = overlay.score;
    story.progress.setAttribute(
      "aria-label",
      `${overlay.score} of ${overlay.target} bugs squashed`,
    );
  } else {
    delete story.card.dataset.status;
  }

  story.primary.hidden = overlay.primaryLabel === undefined;
  story.primary.textContent = overlay.primaryLabel ?? "";
  story.secondary.hidden = overlay.secondaryLabel === undefined;
  story.secondary.textContent = overlay.secondaryLabel ?? "";

  const overlayKey = `${overlay.kind}:${overlay.title}`;
  if (story.card.dataset.focusKey !== overlayKey) {
    story.card.dataset.focusKey = overlayKey;
    const focusTarget = story.primary.hidden ? story.secondary : story.primary;
    if (!focusTarget.hidden) {
      requestAnimationFrame(() => focusTarget.focus({ preventScroll: true }));
    }
  }
}

export function createAppShell(
  root: HTMLElement,
  input: DigitalInput,
  uiBridge: GameUiBridge,
): AppShell {
  const panel = document.createElement("section");
  panel.className = "scout-panel";
  panel.setAttribute("aria-label", "Scout status");

  const avatar = document.createElement("img");
  avatar.className = "scout-panel__avatar";
  avatar.src = "/assets/polished/characters/scout-polished.png";
  avatar.width = 40;
  avatar.height = 48;
  avatar.alt = "";

  const eyebrow = document.createElement("span");
  eyebrow.className = "scout-panel__eyebrow";
  eyebrow.textContent = "SCOUT // PLAZA";

  const status = document.createElement("span");
  status.className = "scout-panel__status";

  const discovery = document.createElement("span");
  discovery.className = "scout-panel__discovery";

  const objective = document.createElement("span");
  objective.className = "scout-panel__objective";

  const prompt = document.createElement("section");
  prompt.className = "interaction-prompt";
  prompt.hidden = true;
  const promptCopy = document.createElement("span");
  const interactButton = document.createElement("button");
  interactButton.type = "button";
  interactButton.textContent = "Interact · E";
  interactButton.addEventListener("click", () => input.requestInteract());
  prompt.append(promptCopy, interactButton);

  const card = document.createElement("section");
  card.className = "story-card";
  card.hidden = true;
  card.setAttribute("aria-label", "Fire City story");
  const storyEyebrow = document.createElement("span");
  storyEyebrow.className = "story-card__eyebrow";
  const storyTitle = document.createElement("h2");
  const storyBody = document.createElement("p");
  const storyScore = document.createElement("strong");
  storyScore.className = "story-card__score";
  const progress = document.createElement("progress");
  progress.className = "story-card__progress";
  const actions = document.createElement("div");
  actions.className = "story-card__actions";
  const secondaryButton = document.createElement("button");
  secondaryButton.className = "button button--secondary";
  secondaryButton.type = "button";
  secondaryButton.addEventListener("click", () => input.requestUiAction("secondary"));
  const primaryButton = document.createElement("button");
  primaryButton.className = "button button--primary";
  primaryButton.type = "button";
  primaryButton.addEventListener("click", () => input.requestUiAction("primary"));
  actions.append(secondaryButton, primaryButton);
  card.append(storyEyebrow, storyTitle, storyBody, storyScore, progress, actions);

  const controls = document.createElement("section");
  controls.className = "mobile-controls";
  controls.setAttribute("aria-label", "Movement controls");
  controls.append(
    createDirectionButton("up", "↑", input),
    createDirectionButton("left", "←", input),
    createDirectionButton("down", "↓", input),
    createDirectionButton("right", "→", input),
  );

  panel.append(avatar, eyebrow, status, discovery, objective);
  root.replaceChildren(panel, prompt, card, controls);
  const story: StoryElements = {
    card,
    eyebrow: storyEyebrow,
    title: storyTitle,
    body: storyBody,
    score: storyScore,
    progress,
    primary: primaryButton,
    secondary: secondaryButton,
  };
  const unsubscribe = uiBridge.subscribe((state) =>
    renderGameState(panel, prompt, discovery, objective, story, state),
  );
  const handleKeydown = (event: KeyboardEvent): void => {
    if (event.key === "Escape" && !card.hidden) input.requestUiAction("secondary");
  };
  root.addEventListener("keydown", handleKeydown);

  return {
    updateBackendStatus(nextStatus) {
      status.textContent = statusCopy(nextStatus);
      panel.dataset.state = nextStatus.state;
    },
    destroy() {
      unsubscribe();
      root.removeEventListener("keydown", handleKeydown);
      input.reset();
      root.replaceChildren();
    },
  };
}
