import { ConvexClient } from "convex/browser";

import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import type { BackendStatus } from "../../types/backend";
import { isHealthResponse } from "../../types/backend";
import type {
  BoothSlug,
  FuelResult,
  GameplayBackend,
  QuestCompletionResult,
  QuestHitResult,
  QuestStartResult,
  RealtimeBooth,
} from "../../types/gameplay";

export type BackendStatusListener = (status: BackendStatus) => void;

export type BackendConnection = Readonly<{
  client: ConvexClient | null;
  gameplay: GameplayBackend | null;
  disconnect: () => void;
}>;

const SESSION_STORAGE_KEY = "startup-on-fire:guest-session:v1";
const SESSION_TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;

type StoredSession = Readonly<{ token: string; expiresAt: number }>;

function readStoredSession(): StoredSession | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (raw === null) return null;
    const value: unknown = JSON.parse(raw);
    if (typeof value !== "object" || value === null) return null;
    const candidate = value as Record<string, unknown>;
    if (
      typeof candidate.token !== "string" ||
      !SESSION_TOKEN_PATTERN.test(candidate.token) ||
      typeof candidate.expiresAt !== "number" ||
      candidate.expiresAt <= Date.now()
    ) {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      return null;
    }
    return { token: candidate.token, expiresAt: candidate.expiresAt };
  } catch {
    return null;
  }
}

function storeSession(session: StoredSession): void {
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch {
    // Storage can be unavailable in private browsing. The in-memory session still works.
  }
}

class ConvexGameplayBackend implements GameplayBackend {
  readonly #client: ConvexClient;
  #session: StoredSession | null = readStoredSession();
  #sessionRequest: Promise<StoredSession> | null = null;

  public constructor(client: ConvexClient) {
    this.#client = client;
  }

  public subscribeBooths(
    listener: (booths: readonly RealtimeBooth[]) => void,
    onError: () => void,
  ): () => void {
    return this.#client.onUpdate(api.booths.list, {}, listener, onError);
  }

  public async getSessionToken(): Promise<string> {
    return (await this.#ensureSession()).token;
  }

  public async startQuest(boothSlug: BoothSlug): Promise<QuestStartResult> {
    let sessionToken = await this.getSessionToken();
    let result = await this.#client.action(api.gameActions.startQuest, { sessionToken, boothSlug });
    if (result.status === "rejected" && result.reason === "invalid_session") {
      this.#clearSession();
      sessionToken = await this.getSessionToken();
      result = await this.#client.action(api.gameActions.startQuest, { sessionToken, boothSlug });
    }
    return result;
  }

  public async recordQuestHit(attemptId: string, hitKey: string): Promise<QuestHitResult> {
    const sessionToken = await this.getSessionToken();
    return await this.#client.action(api.gameActions.recordQuestHit, {
      sessionToken,
      attemptId: attemptId as Id<"questAttempts">,
      hitKey,
    });
  }

  public async completeQuest(attemptId: string): Promise<QuestCompletionResult> {
    const sessionToken = await this.getSessionToken();
    return await this.#client.action(api.gameActions.completeQuest, {
      sessionToken,
      attemptId: attemptId as Id<"questAttempts">,
    });
  }

  public async fuelBooth(boothSlug: BoothSlug, idempotencyKey: string): Promise<FuelResult> {
    const sessionToken = await this.getSessionToken();
    return await this.#client.action(api.gameActions.fuelBooth, {
      sessionToken,
      boothSlug,
      idempotencyKey,
    });
  }

  async #ensureSession(): Promise<StoredSession> {
    if (this.#session !== null && this.#session.expiresAt > Date.now()) return this.#session;
    if (this.#sessionRequest !== null) return await this.#sessionRequest;
    this.#sessionRequest = this.#client
      .action(api.gameActions.createGuestSession, {})
      .then((result) => {
        const session = { token: result.sessionToken, expiresAt: result.expiresAt };
        this.#session = session;
        storeSession(session);
        return session;
      })
      .finally(() => {
        this.#sessionRequest = null;
      });
    return await this.#sessionRequest;
  }

  #clearSession(): void {
    this.#session = null;
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch {
      // The in-memory token is already cleared.
    }
  }
}

export function connectToBackend(
  convexUrl: string | null,
  onStatus: BackendStatusListener,
): BackendConnection {
  if (convexUrl === null) {
    onStatus({ state: "not-configured" });
    return { client: null, gameplay: null, disconnect: () => undefined };
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
    gameplay: new ConvexGameplayBackend(client),
    disconnect: () => {
      unsubscribe();
      void client.close();
    },
  };
}
