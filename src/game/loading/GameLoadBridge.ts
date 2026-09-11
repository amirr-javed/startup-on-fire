export type GameLoadState =
  | Readonly<{ status: "loading"; progress: number; message: string }>
  | Readonly<{ status: "ready" }>
  | Readonly<{ status: "error"; message: string }>;

type Listener = (state: GameLoadState) => void;

const INITIAL_STATE: GameLoadState = {
  status: "loading",
  progress: 0,
  message: "Lighting the plaza…",
};

export class GameLoadBridge {
  readonly #listeners = new Set<Listener>();
  #state: GameLoadState = INITIAL_STATE;

  public loading(progress: number, message = "Lighting the plaza…"): void {
    if (this.#state.status !== "loading") return;
    this.#publish({
      status: "loading",
      progress: Math.min(1, Math.max(0, progress)),
      message,
    });
  }

  public ready(): void {
    if (this.#state.status !== "loading") return;
    this.#publish({ status: "ready" });
  }

  public fail(message = "The city could not finish loading."): void {
    if (this.#state.status !== "loading") return;
    this.#publish({ status: "error", message });
  }

  public subscribe(listener: Listener): () => void {
    this.#listeners.add(listener);
    listener(this.#state);
    return () => this.#listeners.delete(listener);
  }

  #publish(state: GameLoadState): void {
    this.#state = state;
    for (const listener of this.#listeners) listener(state);
  }
}
