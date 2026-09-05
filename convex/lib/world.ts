export type WorldConfiguration = Readonly<{
  appId: `app_${string}`;
  rpId: `rp_${string}`;
  action: string;
  signingKey: string;
  environment: "production" | "staging";
}>;

export type WorldConfigurationResult =
  | { success: true; configuration: WorldConfiguration }
  | { success: false; code: "not_configured" | "invalid_configuration" };

const HEX_256 = /^0x[0-9a-fA-F]{1,64}$/;
const SIGNING_KEY = /^(?:0x)?[0-9a-fA-F]{64}$/;

export function readWorldConfiguration(
  environment: Readonly<Record<string, string | undefined>>,
): WorldConfigurationResult {
  if (environment.WORLD_SPIKE_ENABLED !== "true") {
    return { success: false, code: "not_configured" };
  }

  const appId = environment.WORLD_APP_ID;
  const rpId = environment.WORLD_RP_ID;
  const action = environment.WORLD_ACTION;
  const signingKey = environment.WORLD_RP_SIGNING_KEY;

  if (!appId || !rpId || !action || !signingKey) {
    return { success: false, code: "not_configured" };
  }

  const worldEnvironment = environment.WORLD_ENVIRONMENT ?? "production";
  if (
    !appId.startsWith("app_") ||
    !rpId.startsWith("rp_") ||
    action.trim() !== action ||
    action.length === 0 ||
    action.length > 128 ||
    !SIGNING_KEY.test(signingKey) ||
    (worldEnvironment !== "production" && worldEnvironment !== "staging")
  ) {
    return { success: false, code: "invalid_configuration" };
  }

  return {
    success: true,
    configuration: {
      appId: appId as `app_${string}`,
      rpId: rpId as `rp_${string}`,
      action,
      signingKey,
      environment: worldEnvironment,
    },
  };
}

export function canonicalizeNullifier(value: string): string | null {
  if (!HEX_256.test(value)) {
    return null;
  }

  return BigInt(value).toString(10);
}

export type WorldVerifierResponse = { success: true; nullifier: string } | { success: false };

export function parseWorldVerifierResponse(value: unknown): WorldVerifierResponse {
  if (typeof value !== "object" || value === null) {
    return { success: false };
  }

  const candidate = value as Record<string, unknown>;
  if (candidate.success !== true || typeof candidate.nullifier !== "string") {
    return { success: false };
  }

  const nullifier = canonicalizeNullifier(candidate.nullifier);
  return nullifier === null ? { success: false } : { success: true, nullifier };
}
