import type { ConvexClient } from "convex/browser";

import { api } from "../../../convex/_generated/api";
import type { WorldSelfieProof } from "../../types/world";

export type WorldVerificationFailureReason =
  | "cancelled"
  | "credential_unavailable"
  | "feature_unavailable"
  | "expired"
  | "invalid_configuration"
  | "invalid_payload"
  | "invalid_session"
  | "not_configured"
  | "provider_rejected"
  | "provider_unavailable"
  | "replay_detected"
  | "signing_failed"
  | "unsupported_proof"
  | "interrupted";

export type WorldVerificationProgress =
  Readonly<{ kind: "waiting"; connectorUri: string | null }> | Readonly<{ kind: "verifying" }>;

export type WorldVerificationOutcome =
  | Readonly<{ status: "verified" }>
  | Readonly<{ status: "failed"; reason: WorldVerificationFailureReason }>;

export interface WorldSelfieVerifier {
  verify(
    sessionToken: string,
    signal: AbortSignal,
    onProgress: (progress: WorldVerificationProgress) => void | Promise<void>,
  ): Promise<WorldVerificationOutcome>;
}

function completionFailure(error: string): WorldVerificationFailureReason {
  switch (error) {
    case "user_rejected":
    case "cancelled":
      return "cancelled";
    case "credential_unavailable":
      return "credential_unavailable";
    case "feature_unavailable":
      return "feature_unavailable";
    case "timeout":
      return "expired";
    default:
      return "provider_rejected";
  }
}

export function createWorldSelfieVerifier(client: ConvexClient): WorldSelfieVerifier {
  return {
    async verify(sessionToken, signal, onProgress) {
      try {
        const context = await client.action(api.worldActions.createRequestContext, {
          sessionToken,
        });
        if (!context.success) {
          return { status: "failed", reason: context.code };
        }
        if (signal.aborted) return { status: "failed", reason: "cancelled" };

        const { IDKit, selfieCheckLegacy } = await import("@worldcoin/idkit-core");
        if (signal.aborted) return { status: "failed", reason: "cancelled" };
        const request = await IDKit.requestWithInviteCode({
          app_id: context.appId,
          action: context.action,
          rp_context: context.rpContext,
          allow_legacy_proofs: true,
          environment: context.environment,
        }).preset(selfieCheckLegacy({ signal: context.signal }));
        if (signal.aborted) return { status: "failed", reason: "cancelled" };

        await onProgress({
          kind: "waiting",
          connectorUri: request.connectorURI.length > 0 ? request.connectorURI : null,
        });
        if (signal.aborted) return { status: "failed", reason: "cancelled" };

        const completion = await request.pollUntilCompletion({
          timeout: 5 * 60_000,
          signal,
        });
        if (!completion.success) {
          return { status: "failed", reason: completionFailure(String(completion.error)) };
        }
        if (completion.result.protocol_version !== "3.0") {
          return { status: "failed", reason: "unsupported_proof" };
        }

        await onProgress({ kind: "verifying" });
        const verification = await client.action(api.worldActions.verifyProof, {
          proof: completion.result as WorldSelfieProof,
          sessionToken,
        });
        return verification.success
          ? { status: "verified" }
          : { status: "failed", reason: verification.code };
      } catch {
        return {
          status: "failed",
          reason: signal.aborted ? "cancelled" : "interrupted",
        };
      }
    },
  };
}
