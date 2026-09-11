export type BoothSlug = "kindred-labs" | "signal-garden" | "ember-studio";
export type FireTier = "cold" | "hot" | "blazing";

export type RealtimeBooth = Readonly<{
  slug: BoothSlug;
  name: string;
  founder: string;
  ensName: string;
  active: boolean;
  fireScore: number;
  fireTier: FireTier;
}>;

export type QuestStartResult =
  | Readonly<{
      status: "started";
      attemptId: string;
      requiredBugs: number;
      minimumElapsedMs: number;
      maximumElapsedMs: number;
      expiresAt: number;
    }>
  | Readonly<{
      status: "rejected";
      reason: "invalid_session" | "unknown_booth" | "inactive_booth";
    }>;

export type QuestHitResult =
  | Readonly<{
      status: "recorded";
      replay: boolean;
      hitCount: number;
      requiredBugs: number;
    }>
  | Readonly<{
      status: "rejected";
      reason:
        | "invalid_session"
        | "attempt_not_found"
        | "attempt_mismatch"
        | "attempt_expired"
        | "attempt_used"
        | "invalid_hit_key"
        | "hit_too_fast"
        | "quest_already_satisfied";
    }>;

export type QuestCompletionResult =
  | Readonly<{ status: "completed"; replay: boolean; completedAt: number }>
  | Readonly<{
      status: "rejected";
      reason:
        | "invalid_session"
        | "unknown_booth"
        | "inactive_booth"
        | "attempt_not_found"
        | "attempt_mismatch"
        | "attempt_expired"
        | "attempt_used"
        | "quest_not_satisfied";
    }>;

export type FuelResult =
  | Readonly<{
      status: "accepted";
      replay: boolean;
      dateKey: string;
      fuelsRemaining: number;
      booth: Pick<RealtimeBooth, "slug" | "fireScore" | "fireTier">;
    }>
  | Readonly<{
      status: "rejected";
      reason:
        | "invalid_session"
        | "unknown_booth"
        | "inactive_booth"
        | "invalid_idempotency_key"
        | "unverified"
        | "quest_incomplete"
        | "daily_limit"
        | "booth_daily_limit";
    }>;

export interface GameplayBackend {
  subscribeBooths(
    listener: (booths: readonly RealtimeBooth[]) => void,
    onError: () => void,
  ): () => void;
  startQuest(boothSlug: BoothSlug): Promise<QuestStartResult>;
  recordQuestHit(attemptId: string, hitKey: string): Promise<QuestHitResult>;
  completeQuest(attemptId: string): Promise<QuestCompletionResult>;
  fuelBooth(boothSlug: BoothSlug, idempotencyKey: string): Promise<FuelResult>;
  getSessionToken(): Promise<string>;
}
