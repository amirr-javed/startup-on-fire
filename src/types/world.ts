import type { IDKitResult } from "@worldcoin/idkit-core";

export const WORLD_SPIKE_SIGNAL = "startup-on-fire-phase-1-selfie-check";

export type WorldEnvironment = "production" | "staging";

export type WorldRequestContextResult =
  | {
      success: true;
      appId: `app_${string}`;
      action: string;
      environment: WorldEnvironment;
      signal: string;
      rpContext: {
        rp_id: `rp_${string}`;
        nonce: string;
        created_at: number;
        expires_at: number;
        signature: string;
      };
    }
  | {
      success: false;
      code: "not_configured" | "invalid_configuration" | "signing_failed";
      message: string;
    };

export type WorldVerificationResult =
  | { success: true; replay: false }
  | {
      success: false;
      code:
        | "invalid_payload"
        | "provider_rejected"
        | "provider_unavailable"
        | "replay_detected"
        | "not_configured";
      message: string;
    };

export type WorldSelfieProof = Extract<IDKitResult, { protocol_version: "3.0" }>;

export function isWorldRequestContextResult(value: unknown): value is WorldRequestContextResult {
  if (typeof value !== "object" || value === null || !("success" in value)) {
    return false;
  }

  return typeof (value as Record<string, unknown>).success === "boolean";
}

export function isWorldVerificationResult(value: unknown): value is WorldVerificationResult {
  if (typeof value !== "object" || value === null || !("success" in value)) {
    return false;
  }

  return typeof (value as Record<string, unknown>).success === "boolean";
}
