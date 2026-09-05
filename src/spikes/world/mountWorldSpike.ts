import { IDKit, selfieCheckLegacy } from "@worldcoin/idkit-core";
import type { ConvexClient } from "convex/browser";
import QRCode from "qrcode";

import { api } from "../../../convex/_generated/api";
import type { WorldSelfieProof } from "../../types/world";

type SpikeState = "idle" | "preparing" | "waiting" | "verifying" | "success" | "error";

function messageForIdKitError(code: string): string {
  switch (code) {
    case "user_rejected":
    case "cancelled":
      return "The Selfie Check was cancelled.";
    case "credential_unavailable":
    case "feature_unavailable":
      return "Selfie Check is unavailable for this World account.";
    case "timeout":
      return "The Selfie Check request expired. Start a new attempt.";
    default:
      return "World could not complete the Selfie Check.";
  }
}

export function mountWorldSpike(root: HTMLElement, client: ConvexClient | null): () => void {
  const panel = document.createElement("section");
  panel.className = "world-spike";
  panel.setAttribute("aria-labelledby", "world-spike-title");

  const title = document.createElement("h1");
  title.id = "world-spike-title";
  title.textContent = "World Selfie Check spike";

  const explanation = document.createElement("p");
  explanation.textContent =
    "Development-only feasibility screen. This is a medium-assurance liveness check, not proof of one person per account.";

  const status = document.createElement("p");
  status.className = "world-spike__status";
  status.setAttribute("role", "status");

  const qr = document.createElement("img");
  qr.className = "world-spike__qr";
  qr.alt = "World verification QR code";
  qr.hidden = true;

  const openLink = document.createElement("a");
  openLink.className = "world-spike__link";
  openLink.textContent = "Open World verification";
  openLink.target = "_blank";
  openLink.rel = "noopener noreferrer";
  openLink.hidden = true;

  const controls = document.createElement("div");
  controls.className = "world-spike__controls";

  const startButton = document.createElement("button");
  startButton.type = "button";
  startButton.textContent = "Start Selfie Check";

  const cancelButton = document.createElement("button");
  cancelButton.type = "button";
  cancelButton.textContent = "Cancel";
  cancelButton.hidden = true;

  controls.append(startButton, cancelButton);
  panel.append(title, explanation, status, qr, openLink, controls);
  root.append(panel);

  let abortController: AbortController | null = null;

  const render = (state: SpikeState, message: string) => {
    panel.dataset.state = state;
    status.textContent = message;
    startButton.disabled = state === "preparing" || state === "waiting" || state === "verifying";
    cancelButton.hidden = state !== "waiting";
  };

  const clearRequest = () => {
    qr.hidden = true;
    qr.removeAttribute("src");
    openLink.hidden = true;
    openLink.removeAttribute("href");
  };

  if (client === null) {
    startButton.disabled = true;
    render("error", "Configure VITE_CONVEX_URL before running this spike.");
  } else {
    render("idle", "Ready to request a server-signed Sandbox challenge.");
  }

  const run = async () => {
    if (client === null) {
      return;
    }

    clearRequest();
    render("preparing", "Requesting a signed challenge from Convex…");
    const context = await client.action(api.worldActions.createRequestContext, {});
    if (!context.success) {
      render("error", context.message);
      return;
    }

    abortController = new AbortController();
    try {
      const request = await IDKit.requestWithInviteCode({
        app_id: context.appId,
        action: context.action,
        rp_context: context.rpContext,
        allow_legacy_proofs: true,
        environment: context.environment,
      }).preset(selfieCheckLegacy({ signal: context.signal }));

      qr.src = await QRCode.toDataURL(request.connectorURI, {
        errorCorrectionLevel: "M",
        margin: 1,
        width: 220,
      });
      qr.hidden = false;
      openLink.href = request.connectorURI;
      openLink.hidden = false;
      render("waiting", "Scan the code or open World verification, then complete the prompt.");

      const completion = await request.pollUntilCompletion({
        timeout: 5 * 60_000,
        signal: abortController.signal,
      });
      if (!completion.success) {
        clearRequest();
        render("error", messageForIdKitError(completion.error));
        return;
      }

      if (completion.result.protocol_version !== "3.0") {
        clearRequest();
        render(
          "error",
          "World returned a protocol version this Selfie Check spike does not accept.",
        );
        return;
      }

      render("verifying", "Verifying the proof server-side…");
      const result = await client.action(api.worldActions.verifyProof, {
        proof: completion.result as WorldSelfieProof,
      });
      clearRequest();
      render(
        result.success ? "success" : "error",
        result.success ? "Selfie Check verified." : result.message,
      );
    } catch {
      clearRequest();
      render(
        "error",
        abortController.signal.aborted
          ? "The Selfie Check was cancelled."
          : "The Selfie Check could not be started.",
      );
    } finally {
      abortController = null;
    }
  };

  const cancel = () => abortController?.abort();
  startButton.addEventListener("click", run);
  cancelButton.addEventListener("click", cancel);

  const cleanup = () => {
    abortController?.abort();
    startButton.removeEventListener("click", run);
    cancelButton.removeEventListener("click", cancel);
    panel.remove();
  };
  window.addEventListener("beforeunload", cleanup, { once: true });
  return cleanup;
}
