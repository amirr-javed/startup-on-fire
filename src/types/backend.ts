export type BackendStatus =
  | { state: "not-configured" }
  | { state: "connecting" }
  | { state: "connected"; service: "convex"; status: "ok"; gameApiVersion: 1 }
  | { state: "error"; message: string };

export function isHealthResponse(value: unknown): value is {
  service: "convex";
  status: "ok";
  gameApiVersion: 1;
} {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    candidate.service === "convex" && candidate.status === "ok" && candidate.gameApiVersion === 1
  );
}
