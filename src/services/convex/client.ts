import { ConvexClient } from "convex/browser";

import { api } from "../../../convex/_generated/api";
import type { BackendStatus } from "../../types/backend";
import { isHealthResponse } from "../../types/backend";

export type BackendStatusListener = (status: BackendStatus) => void;

export type BackendConnection = Readonly<{
  client: ConvexClient | null;
  disconnect: () => void;
}>;

export function connectToBackend(
  convexUrl: string | null,
  onStatus: BackendStatusListener,
): BackendConnection {
  if (convexUrl === null) {
    onStatus({ state: "not-configured" });
    return { client: null, disconnect: () => undefined };
  }

  const client = new ConvexClient(convexUrl);
  onStatus({ state: "connecting" });

  const unsubscribe = client.onUpdate(
    api.health.status,
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

  return {
    client,
    disconnect: () => {
      unsubscribe();
      void client.close();
    },
  };
}
