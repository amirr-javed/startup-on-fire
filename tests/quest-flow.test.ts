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

    session.completeKindredQuest("server");
    expect(session.kindredQuest).toBe("completed");
    expect(session.kindredCompletionSource).toBe("server");
    session.throwPracticeSpark();
    expect(session.kindredQuest).toBe("sparked");
    expect(session.canOfferPublicFuel).toBe(true);
  });

  it("does not skip required quest states", () => {
    const session = new QuestSession();

    session.completeKindredQuest("server");
    session.throwPracticeSpark();
    expect(session.kindredQuest).toBe("available");

    session.startKindredQuest();
    session.resetKindredQuest();
    expect(session.kindredQuest).toBe("available");
    expect(session.kindredCompletionSource).toBeNull();
  });

  it("keeps an offline practice completion out of the public-fuel path", () => {
    const session = new QuestSession();

    session.startKindredQuest();
    session.completeKindredQuest("local");
    expect(session.kindredCompletionSource).toBe("local");
    session.throwPracticeSpark();

    expect(session.kindredQuest).toBe("sparked");
    expect(session.canOfferPublicFuel).toBe(false);
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

  it("uses resolved ENS metadata while preserving the quest-specific next step", () => {
    const pages = dialoguePagesFor({
      id: "kindred-labs",
      name: "Kindred Protocol",
      founder: "Maya Chen",
      ensName: "kindred.firecity.eth",
      identityStatus: "resolved",
      description: "Verified release intelligence for distributed teams.",
      url: "https://kindred.example/",
    });

    expect(pages[0]).toMatchObject({
      eyebrow: "MAYA CHEN // FOUNDER",
      title: "Kindred Protocol",
      body: "Verified release intelligence for distributed teams.",
      identityText: "ENSv2 Sepolia · kindred.firecity.eth",
      externalUrl: "https://kindred.example/",
    });
    expect(pages[1]?.primaryLabel).toBe("Start Bug Squash");
  });
});
