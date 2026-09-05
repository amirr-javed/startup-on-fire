import { ConvexClient } from "convex/browser";
import { makeFunctionReference } from "convex/server";

import type { BackendStatus } from "../../types/backend";
import { isHealthResponse } from "../../types/backend";

export type BackendStatusListener = (status: BackendStatus) => void;

const healthQuery = makeFunctionReference<
  "query",
  Record<string, never>,
  { service: "convex"; status: "ok" }
>("health:status");

export function connectToBackend(
  convexUrl: string | null,
  onStatus: BackendStatusListener,
): () => void {
  if (convexUrl === null) {
    onStatus({ state: "not-configured" });
    return () => undefined;
  }

  const client = new ConvexClient(convexUrl);
  onStatus({ state: "connecting" });

  const unsubscribe = client.onUpdate(
    healthQuery,
    {},
    (response: unknown) => {
      if (isHealthResponse(response)) {
        onStatus({ state: "connected", ...response });
        return;
      }
      onStatus({ state: "error", message: "The backend returned an unexpected response." });
    },
    () => {
      onStatus({ state: "error", message: "The backend is unavailable. Try again shortly." });
    },
  );

  return () => {
    unsubscribe();
    void client.close();
  };
}
