export type KindredQuestStatus = "available" | "active" | "completed" | "sparked";
export type QuestCompletionSource = "local" | "server";

export class QuestSession {
  #introCompleted = false;
  #kindredQuest: KindredQuestStatus = "available";
  #kindredCompletionSource: QuestCompletionSource | null = null;
  readonly #discoveredBooths = new Set<string>();

  public get introCompleted(): boolean {
    return this.#introCompleted;
  }

  public get kindredQuest(): KindredQuestStatus {
    return this.#kindredQuest;
  }

  public get kindredCompletionSource(): QuestCompletionSource | null {
    return this.#kindredCompletionSource;
  }

  public get canOfferPublicFuel(): boolean {
    return this.#kindredQuest === "sparked" && this.#kindredCompletionSource === "server";
  }

  public get discoveredCount(): number {
    return this.#discoveredBooths.size;
  }

  public discoverBooth(boothId: string): void {
    this.#discoveredBooths.add(boothId);
  }

  public completeIntro(): void {
    this.#introCompleted = true;
  }

  public startKindredQuest(): void {
    if (this.#kindredQuest === "available") this.#kindredQuest = "active";
  }

  public resetKindredQuest(): void {
    if (this.#kindredQuest === "active") {
      this.#kindredQuest = "available";
      this.#kindredCompletionSource = null;
    }
  }

  public completeKindredQuest(source: QuestCompletionSource): void {
    if (this.#kindredQuest === "active") {
      this.#kindredQuest = "completed";
      this.#kindredCompletionSource = source;
    }
  }

  public throwPracticeSpark(): void {
    if (this.#kindredQuest === "completed") this.#kindredQuest = "sparked";
  }
}
