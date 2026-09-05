export type BoothSummary = Readonly<{
  id: string;
  name: string;
  founder: string;
}>;

export type GameUiState = Readonly<{
  nearbyBooth: BoothSummary | null;
  openBooth: BoothSummary | null;
  discoveredCount: number;
  totalBooths: number;
}>;

type Listener = (state: GameUiState) => void;

const INITIAL_STATE: GameUiState = {
  nearbyBooth: null,
  openBooth: null,
  discoveredCount: 0,
  totalBooths: 3,
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
