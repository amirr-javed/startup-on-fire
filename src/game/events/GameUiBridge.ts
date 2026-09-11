import type { EnsIdentityStatus } from "../../types/ens";

export type BoothSummary = Readonly<{
  id: string;
  name: string;
  founder: string;
  fireScore?: number;
  fireTier?: "cold" | "hot" | "blazing";
  ensName?: string;
  identityStatus?: EnsIdentityStatus;
  description?: string;
  url?: string;
  founderAddress?: string;
}>;

export type GameOverlay =
  | Readonly<{ kind: "none" }>
  | Readonly<{
      kind: "intro" | "dialogue" | "quest-complete";
      eyebrow: string;
      title: string;
      body: string;
      primaryLabel: string;
      secondaryLabel?: string;
      identityText?: string;
      externalUrl?: string;
    }>
  | Readonly<{
      kind: "minigame";
      status: "preparing" | "playing" | "completing" | "success" | "failed" | "error";
      title: string;
      body: string;
      score: number;
      target: number;
      secondsRemaining: number;
      primaryLabel?: string;
      secondaryLabel: string;
    }>;

export type GameUiState = Readonly<{
  nearbyBooth: BoothSummary | null;
  openBooth: BoothSummary | null;
  discoveredCount: number;
  totalBooths: number;
  objective: string;
  overlay: GameOverlay;
  publicFuelOffer: Readonly<{ boothSlug: "kindred-labs"; boothName: string }> | null;
}>;

type Listener = (state: GameUiState) => void;

const INITIAL_STATE: GameUiState = {
  nearbyBooth: null,
  openBooth: null,
  discoveredCount: 0,
  totalBooths: 3,
  objective: "Meet Ember at the fountain",
  overlay: { kind: "none" },
  publicFuelOffer: null,
};

export class GameUiBridge {
  readonly #listeners = new Set<Listener>();
  #state = INITIAL_STATE;

  public publish(state: GameUiState): void {
    this.#state = state;
    for (const listener of this.#listeners) listener(state);
  }

  public subscribe(listener: Listener): () => void {
    this.#listeners.add(listener);
    listener(this.#state);
    return () => this.#listeners.delete(listener);
  }
}
