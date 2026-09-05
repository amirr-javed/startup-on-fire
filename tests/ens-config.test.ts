import { describe, expect, it } from "vitest";

import { readEnsWriteConfiguration } from "../scripts/ensv2/config";

describe("ENS write-spike configuration", () => {
  it("requires a test name and local private key", () => {
    expect(readEnsWriteConfiguration({})).toEqual({
      success: false,
      missing: ["ENS_TEST_NAME", "ENS_TEST_OWNER_PRIVATE_KEY"],
    });
  });

  it("normalizes a valid low-value test key", () => {
    expect(
      readEnsWriteConfiguration({
        ENS_TEST_NAME: "example.eth",
        ENS_TEST_OWNER_PRIVATE_KEY: "11".repeat(32),
        SEPOLIA_RPC_URL: " https://rpc.example ",
      }),
    ).toEqual({
      success: true,
      configuration: {
        name: "example.eth",
        privateKey: `0x${"11".repeat(32)}`,
        rpcUrl: "https://rpc.example",
      },
    });
  });

  it("rejects a malformed key", () => {
    expect(
      readEnsWriteConfiguration({
        ENS_TEST_NAME: "example.eth",
        ENS_TEST_OWNER_PRIVATE_KEY: "secret",
      }),
    ).toEqual({
      success: false,
      missing: ["ENS_TEST_OWNER_PRIVATE_KEY (invalid format)"],
    });
  });
});
