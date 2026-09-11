import { describe, expect, it } from "vitest";

import { readRuntimeConfig } from "../src/config/runtime";

describe("readRuntimeConfig", () => {
  it("normalizes a configured Convex URL", () => {
    expect(readRuntimeConfig({ VITE_CONVEX_URL: " https://example.convex.cloud/ " })).toEqual({
      convexUrl: "https://example.convex.cloud",
      ensRpcUrl: null,
    });
  });

  it.each([undefined, "", "not-a-url", "ws://example.test"])(
    "treats %s as missing configuration",
    (value) => {
      expect(readRuntimeConfig({ VITE_CONVEX_URL: value })).toEqual({
        convexUrl: null,
        ensRpcUrl: null,
      });
    },
  );

  it("normalizes an optional public Sepolia RPC URL", () => {
    expect(readRuntimeConfig({ VITE_SEPOLIA_RPC_URL: " https://rpc.example/ " })).toEqual({
      convexUrl: null,
      ensRpcUrl: "https://rpc.example",
    });
  });
});
