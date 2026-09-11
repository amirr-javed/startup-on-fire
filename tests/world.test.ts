import { describe, expect, it } from "vitest";

import {
  canonicalizeNullifier,
  parseWorldVerifierResponse,
  readWorldConfiguration,
} from "../convex/lib/world";
import { isWorldRequestContextResult, isWorldVerificationResult } from "../src/types/world";

const validEnvironment = {
  WORLD_SPIKE_ENABLED: "true",
  WORLD_APP_ID: "app_test",
  WORLD_RP_ID: "rp_test",
  WORLD_ACTION: "phase-1-selfie",
  WORLD_RP_SIGNING_KEY: "11".repeat(32),
};

describe("World configuration", () => {
  it("accepts complete server-only configuration", () => {
    expect(readWorldConfiguration(validEnvironment)).toMatchObject({
      success: true,
      configuration: { environment: "production" },
    });
  });

  it("reports missing and malformed configuration without revealing values", () => {
    expect(readWorldConfiguration({})).toEqual({ success: false, code: "not_configured" });
    expect(readWorldConfiguration({ ...validEnvironment, WORLD_SPIKE_ENABLED: "false" })).toEqual({
      success: false,
      code: "not_configured",
    });
    expect(
      readWorldConfiguration({ ...validEnvironment, WORLD_RP_SIGNING_KEY: "not-a-key" }),
    ).toEqual({ success: false, code: "invalid_configuration" });
  });
});

describe("World verifier handling", () => {
  it("canonicalizes a 256-bit hex nullifier for storage", () => {
    expect(canonicalizeNullifier("0x000A")).toBe("10");
    expect(canonicalizeNullifier("not-hex")).toBeNull();
  });

  it("keeps only a validated nullifier from a successful response", () => {
    expect(
      parseWorldVerifierResponse({ success: true, nullifier: "0x2a", proof: "ignored" }),
    ).toEqual({ success: true, nullifier: "42" });
    expect(parseWorldVerifierResponse({ success: false, nullifier: "0x2a" })).toEqual({
      success: false,
    });
  });

  it("recognizes small typed public results", () => {
    expect(isWorldRequestContextResult({ success: false, code: "not_configured" })).toBe(true);
    expect(isWorldRequestContextResult({ success: false, code: "invalid_session" })).toBe(true);
    expect(isWorldVerificationResult({ success: true, replay: false })).toBe(true);
    expect(isWorldVerificationResult({ code: "provider_rejected" })).toBe(false);
  });
});
