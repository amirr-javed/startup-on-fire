export type KindredQuestStatus = "available" | "active" | "completed" | "sparked";

export class QuestSession {
  #introCompleted = false;
  #kindredQuest: KindredQuestStatus = "available";
  readonly #discoveredBooths = new Set<string>();

  public get introCompleted(): boolean {
    return this.#introCompleted;
  }

  public get kindredQuest(): KindredQuestStatus {
    return this.#kindredQuest;
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
    if (this.#kindredQuest === "active") this.#kindredQuest = "available";
  }

  public completeKindredQuest(): void {
    if (this.#kindredQuest === "active") this.#kindredQuest = "completed";
  }

  public throwPracticeSpark(): void {
    if (this.#kindredQuest === "completed") this.#kindredQuest = "sparked";
  }
}
