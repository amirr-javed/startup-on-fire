import type { GameUiBridge } from "../game/events/GameUiBridge";
import type {
  WorldSelfieVerifier,
  WorldVerificationFailureReason,
} from "../services/world/selfieVerifier";
import type { FuelResult, GameplayBackend } from "../types/gameplay";

type FuelOffer = Readonly<{ boothSlug: "kindred-labs"; boothName: string }>;
type PanelState =
  "idle" | "checking" | "preparing" | "waiting" | "verifying" | "fueling" | "success" | "error";

function messageForWorldFailure(reason: WorldVerificationFailureReason): string {
  switch (reason) {
    case "cancelled":
      return "The Selfie Check was cancelled. No public fuel was sent.";
    case "credential_unavailable":
    case "feature_unavailable":
      return "Selfie Check is unavailable for this World account.";
    case "expired":
      return "The Selfie Check expired. Start a fresh attempt when you’re ready.";
    case "invalid_session":
      return "Your guest session expired. Replay the quest before verifying again.";
    case "not_configured":
      return "Public fuel is not configured on this Fire City deployment yet.";
    case "invalid_configuration":
    case "signing_failed":
      return "Fire City could not prepare a Selfie Check. Try again later.";
    case "replay_detected":
      return "This Selfie Check was already used. Start a fresh check for this session.";
    case "provider_unavailable":
    case "interrupted":
      return "World is temporarily unavailable. Check your connection and try again.";
    case "invalid_payload":
    case "provider_rejected":
    case "unsupported_proof":
      return "World could not validate this Selfie Check. Start a fresh attempt.";
  }
}

function messageForFuelRejection(result: Extract<FuelResult, { status: "rejected" }>): string {
  switch (result.reason) {
    case "booth_daily_limit":
      return "You already supported this booth today. Come back after the UTC reset.";
    case "daily_limit":
      return "You’ve used all 3 public fuels for today. Your limit resets at 00:00 UTC.";
    case "quest_incomplete":
      return "Fire City has not confirmed this booth’s quest for your guest session.";
    case "inactive_booth":
      return "This booth is not accepting public fuel right now.";
    case "unknown_booth":
      return "This booth is no longer available. Return to the plaza and try again.";
    case "invalid_idempotency_key":
      return "Fire City could not safely identify this attempt. Start a fresh attempt.";
    case "invalid_session":
      return "Your guest session expired. Replay the quest before verifying again.";
    case "unverified":
      return "A World Selfie Check is required before public fuel can be sent.";
  }
}

export function mountPublicFuelPanel(
  root: HTMLElement,
  gameplay: GameplayBackend,
  verifier: WorldSelfieVerifier,
  uiBridge: GameUiBridge,
): () => void {
  const panel = document.createElement("section");
  panel.className = "public-fuel-card";
  panel.hidden = true;
  panel.setAttribute("aria-labelledby", "public-fuel-title");
  panel.setAttribute(
    "aria-describedby",
    "public-fuel-explanation public-fuel-privacy public-fuel-status",
  );

  const eyebrow = document.createElement("span");
  eyebrow.className = "public-fuel-card__eyebrow";
  eyebrow.textContent = "PUBLIC FUEL // WORLD";
  const title = document.createElement("h2");
  title.id = "public-fuel-title";
  title.textContent = "Grow this community fire";
  const explanation = document.createElement("p");
  explanation.id = "public-fuel-explanation";
  explanation.textContent =
    "Optional: prove liveness with World Selfie Check, then send 1 earned fuel. No wallet or purchase is required.";
  const privacy = document.createElement("small");
  privacy.id = "public-fuel-privacy";
  privacy.textContent =
    "World handles the check. Fire City stores no selfie or raw proof—only a pseudonymous replay-prevention value.";
  const status = document.createElement("p");
  status.id = "public-fuel-status";
  status.className = "public-fuel-card__status";
  status.setAttribute("role", "status");
  status.setAttribute("aria-live", "polite");

  const qr = document.createElement("img");
  qr.className = "public-fuel-card__qr";
  qr.alt = "QR code to continue verification in World App";
  qr.width = 196;
  qr.height = 196;
  qr.hidden = true;
  const openLink = document.createElement("a");
  openLink.className = "button button--secondary";
  openLink.textContent = "Open World App";
  openLink.target = "_blank";
  openLink.rel = "noopener noreferrer";
  openLink.hidden = true;

  const actions = document.createElement("div");
  actions.className = "public-fuel-card__actions";
  const closeButton = document.createElement("button");
  closeButton.className = "button button--secondary";
  closeButton.type = "button";
  closeButton.textContent = "Not now";
  const startButton = document.createElement("button");
  startButton.className = "button button--primary";
  startButton.type = "button";
  startButton.textContent = "Verify & fuel";
  actions.append(closeButton, startButton);
  panel.append(eyebrow, title, explanation, privacy, status, qr, openLink, actions);
  root.append(panel);

  let offer: FuelOffer | null = null;
  let state: PanelState = "idle";
  let abortController: AbortController | null = null;
  let idempotencyKey: string | null = null;
  let dismissedOffer: string | null = null;
  let previousFocus: HTMLElement | null = null;
  let offerInRange = false;

  const isBusy = (candidate: PanelState): boolean =>
    ["checking", "preparing", "waiting", "verifying", "fueling"].includes(candidate);

  const render = (nextState: PanelState, message: string): void => {
    state = nextState;
    panel.dataset.state = state;
    status.textContent = message;
    const busy = isBusy(state);
    const cancellable = state === "preparing" || state === "waiting";
    panel.setAttribute("aria-busy", String(busy));
    status.setAttribute("aria-live", state === "error" ? "assertive" : "polite");
    startButton.disabled = busy;
    startButton.setAttribute("aria-busy", String(busy));
    startButton.hidden = state === "success";
    startButton.textContent = state === "error" ? "Try again" : "Verify & fuel";
    closeButton.disabled = busy && !cancellable;
    closeButton.textContent = cancellable
      ? "Cancel check"
      : state === "verifying"
        ? "Verifying…"
        : state === "fueling" || state === "checking"
          ? "Please wait…"
          : state === "success"
            ? "Done"
            : "Not now";
    if ((state === "success" || state === "error") && !offerInRange) panel.hidden = true;
  };

  const clearHandoff = (): void => {
    qr.hidden = true;
    qr.removeAttribute("src");
    openLink.hidden = true;
    openLink.removeAttribute("href");
  };

  const finishFuel = (result: FuelResult): boolean => {
    if (result.status === "accepted") {
      clearHandoff();
      render(
        "success",
        `${result.replay ? "Fuel already recorded" : "Fuel accepted"}. ${result.booth.fireScore} total fire · ${result.booth.fireTier}. ${result.fuelsRemaining} daily fuel${result.fuelsRemaining === 1 ? "" : "s"} remaining.`,
      );
      return true;
    }
    if (result.reason !== "unverified") {
      clearHandoff();
      render("error", messageForFuelRejection(result));
      return true;
    }
    return false;
  };

  const run = async (): Promise<void> => {
    if (offer === null || isBusy(state)) return;
    const currentOffer = offer;
    clearHandoff();
    idempotencyKey ??= `fuel-${crypto.randomUUID()}`;
    render("checking", "Checking your earned-fuel eligibility…");
    try {
      const existingFuel = await gameplay.fuelBooth(currentOffer.boothSlug, idempotencyKey);
      if (finishFuel(existingFuel)) return;

      const sessionToken = await gameplay.getSessionToken();
      abortController = new AbortController();
      render("preparing", "Requesting a short-lived, server-signed World challenge…");
      const verification = await verifier.verify(
        sessionToken,
        abortController.signal,
        async (progress) => {
          if (abortController?.signal.aborted) return;
          if (progress.kind === "verifying") {
            clearHandoff();
            render("verifying", "Verifying the proof server-side…");
            return;
          }
          if (progress.connectorUri !== null) {
            const { default: QRCode } = await import("qrcode");
            const qrData = await QRCode.toDataURL(progress.connectorUri, {
              errorCorrectionLevel: "M",
              margin: 1,
              width: 196,
            });
            if (abortController?.signal.aborted) return;
            qr.src = qrData;
            qr.hidden = false;
            openLink.href = progress.connectorUri;
            openLink.hidden = false;
          }
          render("waiting", "Continue in World App, approve the proof, then return here.");
        },
      );
      if (verification.status === "failed") {
        clearHandoff();
        render("error", messageForWorldFailure(verification.reason));
        return;
      }

      render("fueling", `Sending 1 earned fuel to ${currentOffer.boothName}…`);
      const fuel = await gameplay.fuelBooth(currentOffer.boothSlug, idempotencyKey);
      finishFuel(fuel);
    } catch {
      clearHandoff();
      render(
        "error",
        abortController?.signal.aborted
          ? "The Selfie Check was cancelled. No public fuel was sent."
          : "The public-fuel flow was interrupted. Your safe retry uses the same request key.",
      );
    } finally {
      abortController = null;
    }
  };

  const close = (): void => {
    if (closeButton.disabled) return;
    if (state === "preparing" || state === "waiting") abortController?.abort();
    if (offer !== null) dismissedOffer = offer.boothSlug;
    panel.hidden = true;
    clearHandoff();
    if (previousFocus?.isConnected) previousFocus.focus();
  };

  const handleKeydown = (event: KeyboardEvent): void => {
    if (event.key === "Escape" && !panel.hidden && !closeButton.disabled) close();
  };

  startButton.addEventListener("click", run);
  closeButton.addEventListener("click", close);
  const unsubscribe = uiBridge.subscribe((gameState) => {
    const nextOffer = gameState.publicFuelOffer;
    if (nextOffer === null) {
      offerInRange = false;
      offer = null;
      dismissedOffer = null;
      if (!isBusy(state)) panel.hidden = true;
      return;
    }
    offerInRange = true;
    offer = nextOffer;
    if (dismissedOffer === nextOffer.boothSlug || !panel.hidden) return;
    previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    idempotencyKey = null;
    render(
      "idle",
      "Your Practice Spark is ready. Verify only if you want to affect the public fire.",
    );
    panel.hidden = false;
  });
  document.addEventListener("keydown", handleKeydown);

  return () => {
    abortController?.abort();
    unsubscribe();
    startButton.removeEventListener("click", run);
    closeButton.removeEventListener("click", close);
    document.removeEventListener("keydown", handleKeydown);
    panel.remove();
  };
}
