import { describe, expect, it } from "vitest";

import { QuestSession } from "../src/game/quests/QuestSession";
import { dialoguePagesFor } from "../src/game/quests/questContent";

describe("first quest progression", () => {
  it("moves through the quest and practice-spark states in order", () => {
    const session = new QuestSession();

    expect(session.introCompleted).toBe(false);
    expect(session.kindredQuest).toBe("available");
    session.completeIntro();
    session.startKindredQuest();
    expect(session.introCompleted).toBe(true);
    expect(session.kindredQuest).toBe("active");

    session.completeKindredQuest();
    expect(session.kindredQuest).toBe("completed");
    session.throwPracticeSpark();
    expect(session.kindredQuest).toBe("sparked");
  });

  it("does not skip required quest states", () => {
    const session = new QuestSession();

    session.completeKindredQuest();
    session.throwPracticeSpark();
    expect(session.kindredQuest).toBe("available");

    session.startKindredQuest();
    session.resetKindredQuest();
    expect(session.kindredQuest).toBe("available");
  });

  it("retains unique booth discoveries across scene transitions", () => {
    const session = new QuestSession();
    session.discoverBooth("kindred-labs");
    session.discoverBooth("kindred-labs");
    session.discoverBooth("signal-garden");
    expect(session.discoveredCount).toBe(2);
  });
});

describe("founder stories", () => {
  it("gives Kindred Labs a two-step, product-shaped quest introduction", () => {
    const pages = dialoguePagesFor({
      id: "kindred-labs",
      name: "Kindred Labs",
      founder: "Maya",
    });
    expect(pages).toHaveLength(2);
    expect(pages[0]?.body).toContain("release flows");
    expect(pages[1]?.body).toContain("Squash 8 bugs");
    expect(pages[1]?.primaryLabel).toBe("Start Bug Squash");
  });

  it("gives the remaining founders distinct product descriptions", () => {
    const signal = dialoguePagesFor({
      id: "signal-garden",
      name: "Signal Garden",
      founder: "Ilyas",
    });
    const ember = dialoguePagesFor({
      id: "ember-studio",
      name: "Ember Studio",
      founder: "Noor",
    });
    expect(signal[0]?.body).not.toBe(ember[0]?.body);
    expect(signal[0]?.body).toContain("community feedback");
    expect(ember[0]?.body).toContain("creative tools");
  });
});
