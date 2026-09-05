"use node";

import { hashSignal } from "@worldcoin/idkit-core/hashing";
import { signRequest } from "@worldcoin/idkit-core/signing";
import { v } from "convex/values";

import { internal } from "./_generated/api";
import { action, env } from "./_generated/server";
import {
  canonicalizeNullifier,
  parseWorldVerifierResponse,
  readWorldConfiguration,
} from "./lib/world";

const SPIKE_SIGNAL = "startup-on-fire-phase-1-selfie-check";

const worldEnvironment = () =>
  readWorldConfiguration({
    WORLD_SPIKE_ENABLED: env.WORLD_SPIKE_ENABLED,
    WORLD_APP_ID: env.WORLD_APP_ID,
    WORLD_RP_ID: env.WORLD_RP_ID,
    WORLD_ACTION: env.WORLD_ACTION,
    WORLD_RP_SIGNING_KEY: env.WORLD_RP_SIGNING_KEY,
    WORLD_ENVIRONMENT: env.WORLD_ENVIRONMENT,
  });

const integrityBundle = v.object({
  version: v.number(),
  signature_format: v.union(v.literal("apple_app_attest"), v.literal("android_keystore")),
  timestamp: v.number(),
  signature: v.string(),
  jwt: v.string(),
});

const selfieProof = v.object({
  protocol_version: v.literal("3.0"),
  nonce: v.string(),
  action: v.optional(v.string()),
  action_description: v.optional(v.string()),
  responses: v.array(
    v.object({
      identifier: v.string(),
      signal_hash: v.optional(v.string()),
      proof: v.string(),
      merkle_root: v.string(),
      nullifier: v.string(),
    }),
  ),
  user_presence_completed: v.optional(v.boolean()),
  environment: v.string(),
  integrity_bundle: v.optional(integrityBundle),
});

const configurationError = v.object({
  success: v.literal(false),
  code: v.union(v.literal("not_configured"), v.literal("invalid_configuration")),
  message: v.string(),
});

const requestContextResult = v.union(
  v.object({
    success: v.literal(true),
    appId: v.string(),
    action: v.string(),
    environment: v.union(v.literal("production"), v.literal("staging")),
    signal: v.string(),
    rpContext: v.object({
      rp_id: v.string(),
      nonce: v.string(),
      created_at: v.number(),
      expires_at: v.number(),
      signature: v.string(),
    }),
  }),
  configurationError,
  v.object({
    success: v.literal(false),
    code: v.literal("signing_failed"),
    message: v.string(),
  }),
);

const verificationResult = v.union(
  v.object({ success: v.literal(true), replay: v.literal(false) }),
  configurationError,
  v.object({
    success: v.literal(false),
    code: v.union(
      v.literal("invalid_payload"),
      v.literal("provider_rejected"),
      v.literal("provider_unavailable"),
      v.literal("replay_detected"),
    ),
    message: v.string(),
  }),
);

const publicConfigurationError = (code: "not_configured" | "invalid_configuration") => ({
  success: false as const,
  code,
  message:
    code === "not_configured"
      ? "World Sandbox configuration is not installed on this Convex deployment."
      : "World Sandbox configuration is invalid.",
});

export const createRequestContext = action({
  args: {},
  returns: requestContextResult,
  handler: () => {
    const configurationResult = worldEnvironment();
    if (!configurationResult.success) {
      return publicConfigurationError(configurationResult.code);
    }

    const {
      appId,
      rpId,
      action: actionName,
      signingKey,
      environment,
    } = configurationResult.configuration;

    try {
      const signature = signRequest({
        signingKeyHex: signingKey,
        action: actionName,
        ttl: 300,
      });

      return {
        success: true as const,
        appId,
        action: actionName,
        environment,
        signal: SPIKE_SIGNAL,
        rpContext: {
          rp_id: rpId,
          nonce: signature.nonce,
          created_at: signature.createdAt,
          expires_at: signature.expiresAt,
          signature: signature.sig,
        },
      };
    } catch {
      return {
        success: false as const,
        code: "signing_failed" as const,
        message: "The World request could not be signed.",
      };
    }
  },
});

export const verifyProof = action({
  args: { proof: selfieProof },
  returns: verificationResult,
  handler: async (context, args) => {
    const configurationResult = worldEnvironment();
    if (!configurationResult.success) {
      return publicConfigurationError(configurationResult.code);
    }

    const configuration = configurationResult.configuration;
    const response = args.proof.responses[0];
    const expectedSignalHash = hashSignal(SPIKE_SIGNAL).toLowerCase();
    const submittedNullifier = response ? canonicalizeNullifier(response.nullifier) : null;

    if (
      args.proof.action !== configuration.action ||
      args.proof.environment !== configuration.environment ||
      args.proof.responses.length !== 1 ||
      response?.identifier !== "selfie" ||
      response.signal_hash?.toLowerCase() !== expectedSignalHash ||
      submittedNullifier === null
    ) {
      return {
        success: false as const,
        code: "invalid_payload" as const,
        message: "The Selfie Check response did not match this request.",
      };
    }

    let providerResponse: Response;
    try {
      providerResponse = await fetch(
        `https://developer.world.org/api/v4/verify/${encodeURIComponent(configuration.rpId)}`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(args.proof),
          signal: AbortSignal.timeout(15_000),
        },
      );
    } catch {
      return {
        success: false as const,
        code: "provider_unavailable" as const,
        message: "World verification is temporarily unavailable.",
      };
    }

    const providerPayload: unknown = await providerResponse.json().catch(() => null);
    const verification = parseWorldVerifierResponse(providerPayload);
    if (!providerResponse.ok || !verification.success) {
      return {
        success: false as const,
        code: "provider_rejected" as const,
        message: "World rejected this Selfie Check proof.",
      };
    }

    if (verification.nullifier !== submittedNullifier) {
      return {
        success: false as const,
        code: "invalid_payload" as const,
        message: "World returned an unexpected verification result.",
      };
    }

    const stored = await context.runMutation(internal.worldStore.consumeNullifier, {
      action: configuration.action,
      nullifier: verification.nullifier,
    });
    if (stored.replay) {
      return {
        success: false as const,
        code: "replay_detected" as const,
        message: "This action-scoped Selfie Check was already used.",
      };
    }

    return { success: true as const, replay: false as const };
  },
});
