import { describe, expect, it } from "vitest";

import { connectToBackend } from "../src/services/convex/client";
import type { BackendStatus } from "../src/types/backend";
import { isHealthResponse } from "../src/types/backend";

describe("isHealthResponse", () => {
  it("accepts the expected health response", () => {
    expect(isHealthResponse({ service: "convex", status: "ok" })).toBe(true);
  });

  it.each([null, {}, { service: "convex", status: "down" }, "ok"])(
    "rejects an invalid health response",
    (value) => {
      expect(isHealthResponse(value)).toBe(false);
    },
  );

  it("reports missing configuration without opening a connection", () => {
    const statuses: BackendStatus[] = [];
    const connection = connectToBackend(null, (status) => statuses.push(status));

    expect(statuses).toEqual([{ state: "not-configured" }]);
    expect(connection.client).toBeNull();
    expect(connection.disconnect()).toBeUndefined();
  });
});
