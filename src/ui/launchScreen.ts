import type { GameLoadBridge, GameLoadState } from "../game/loading/GameLoadBridge";

export type LaunchScreen = Readonly<{ destroy: () => void }>;

type LaunchScreenOptions = Readonly<{
  onEnter: () => void;
  reload?: () => void;
  backgroundRoots?: readonly HTMLElement[];
}>;

type LaunchElements = Readonly<{
  screen: HTMLElement;
  status: HTMLElement;
  detail: HTMLElement;
  progress: HTMLProgressElement;
  progressValue: HTMLElement;
  action: HTMLButtonElement;
}>;

function render(elements: LaunchElements, state: GameLoadState): void {
  elements.screen.dataset.state = state.status;
  elements.screen.setAttribute("aria-busy", String(state.status === "loading"));

  if (state.status === "loading") {
    const percentage = Math.round(state.progress * 100);
    elements.status.textContent = state.message;
    elements.detail.textContent = "Packing paths, founders, and fire.";
    elements.progress.hidden = false;
    elements.progress.value = percentage;
    elements.progressValue.hidden = false;
    elements.progressValue.textContent = `${percentage}%`;
    elements.action.hidden = true;
    return;
  }

  elements.progress.hidden = true;
  elements.progressValue.hidden = true;
  elements.action.hidden = false;
  if (state.status === "ready") {
    elements.status.textContent = "The city gates are open.";
    elements.detail.textContent = "Explore as a guest. No wallet required.";
    elements.action.textContent = "Enter Fire City";
  } else {
    elements.status.textContent = state.message;
    elements.detail.textContent = "Check your connection, then try again.";
    elements.action.textContent = "Try again";
  }
  requestAnimationFrame(() => elements.action.focus({ preventScroll: true }));
}

export function mountLaunchScreen(
  root: HTMLElement,
  loadBridge: GameLoadBridge,
  options: LaunchScreenOptions,
): LaunchScreen {
  const backgroundRoots = options.backgroundRoots ?? [];
  const appRoot = root.parentElement;
  const releaseBackground = (): void => {
    for (const backgroundRoot of backgroundRoots) backgroundRoot.inert = false;
    if (appRoot !== null) delete appRoot.dataset.launch;
  };
  if (appRoot !== null) appRoot.dataset.launch = "active";
  for (const backgroundRoot of backgroundRoots) backgroundRoot.inert = true;

  const screen = document.createElement("section");
  screen.className = "launch-screen";
  screen.setAttribute("aria-label", "Startup on Fire launch screen");

  const glow = document.createElement("span");
  glow.className = "launch-screen__glow";
  glow.setAttribute("aria-hidden", "true");
  const emblem = document.createElement("span");
  emblem.className = "launch-screen__emblem";
  emblem.setAttribute("aria-hidden", "true");
  emblem.textContent = "◆";

  const content = document.createElement("div");
  content.className = "launch-screen__content";
  const eyebrow = document.createElement("span");
  eyebrow.className = "launch-screen__eyebrow";
  eyebrow.textContent = "ETHONLINE 2026 // FIRE CITY";
  const title = document.createElement("h1");
  title.textContent = "Startup on Fire";
  const tagline = document.createElement("p");
  tagline.className = "launch-screen__tagline";
  tagline.textContent = "Walk the plaza. Help founders. Earn the fire.";

  const statusPanel = document.createElement("div");
  statusPanel.className = "launch-screen__status";
  statusPanel.setAttribute("aria-live", "polite");
  const status = document.createElement("strong");
  const detail = document.createElement("span");
  const meter = document.createElement("div");
  meter.className = "launch-screen__meter";
  const progress = document.createElement("progress");
  progress.max = 100;
  progress.setAttribute("aria-label", "Fire City loading progress");
  const progressValue = document.createElement("span");
  progressValue.className = "launch-screen__progress-value";
  meter.append(progress, progressValue);
  statusPanel.append(status, detail, meter);

  const action = document.createElement("button");
  action.className = "button button--primary launch-screen__action";
  action.type = "button";
  action.hidden = true;
  action.addEventListener("click", () => {
    if (screen.dataset.state === "error") {
      (options.reload ?? (() => window.location.reload()))();
      return;
    }
    if (screen.dataset.state !== "ready") return;
    root.hidden = true;
    releaseBackground();
    options.onEnter();
  });

  const rule = document.createElement("small");
  rule.className = "launch-screen__rule";
  rule.textContent = "Fire is earned, never bought.";

  content.append(eyebrow, title, tagline, statusPanel, action, rule);
  screen.append(glow, emblem, content);
  root.replaceChildren(screen);

  const unsubscribe = loadBridge.subscribe((state) =>
    render({ screen, status, detail, progress, progressValue, action }, state),
  );

  return {
    destroy() {
      unsubscribe();
      releaseBackground();
      root.replaceChildren();
    },
  };
}
