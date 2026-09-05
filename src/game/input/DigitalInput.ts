export type Direction = "up" | "down" | "left" | "right";

export class DigitalInput {
  readonly #directions: Record<Direction, boolean> = {
    up: false,
    down: false,
    left: false,
    right: false,
  };

  #interactRequested = false;
  #dismissRequested = false;

  public setDirection(direction: Direction, active: boolean): void {
    this.#directions[direction] = active;
  }

  public getDirection(direction: Direction): boolean {
    return this.#directions[direction];
  }

  public requestInteract(): void {
    this.#interactRequested = true;
  }

  public consumeInteract(): boolean {
    const requested = this.#interactRequested;
    this.#interactRequested = false;
    return requested;
  }

  public requestDismiss(): void {
    this.#dismissRequested = true;
  }

  public consumeDismiss(): boolean {
    const requested = this.#dismissRequested;
    this.#dismissRequested = false;
    return requested;
  }

  public reset(): void {
    for (const direction of Object.keys(this.#directions) as Direction[]) {
      this.#directions[direction] = false;
    }
    this.#interactRequested = false;
    this.#dismissRequested = false;
  }
}
