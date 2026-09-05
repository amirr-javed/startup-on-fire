import { describe, expect, it } from "vitest";

import { readRuntimeConfig } from "../src/config/runtime";

describe("readRuntimeConfig", () => {
  it("normalizes a configured Convex URL", () => {
    expect(readRuntimeConfig({ VITE_CONVEX_URL: " https://example.convex.cloud/ " })).toEqual({
      convexUrl: "https://example.convex.cloud",
    });
  });

  it.each([undefined, "", "not-a-url", "ws://example.test"])(
    "treats %s as missing configuration",
    (value) => {
      expect(readRuntimeConfig({ VITE_CONVEX_URL: value })).toEqual({ convexUrl: null });
    },
  );
});
