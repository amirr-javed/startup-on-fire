import type { BackendStatus } from "../types/backend";

export type AppShell = Readonly<{
  updateBackendStatus: (status: BackendStatus) => void;
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

export function createAppShell(root: HTMLElement): AppShell {
  const panel = document.createElement("section");
  panel.className = "scout-panel";
  panel.setAttribute("aria-label", "Scout status");

  const eyebrow = document.createElement("span");
  eyebrow.className = "scout-panel__eyebrow";
  eyebrow.textContent = "SCOUT // PHASE 1";

  const status = document.createElement("span");
  status.className = "scout-panel__status";

  panel.append(eyebrow, status);
  root.replaceChildren(panel);

  return {
    updateBackendStatus(nextStatus) {
      status.textContent = statusCopy(nextStatus);
      panel.dataset.state = nextStatus.state;
    },
  };
}
