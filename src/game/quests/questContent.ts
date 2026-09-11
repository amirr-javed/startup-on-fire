import type { BoothSummary } from "../events/GameUiBridge";

export type DialoguePage = Readonly<{
  eyebrow: string;
  title: string;
  body: string;
  primaryLabel: string;
}>;

const KINDRED_PAGES: readonly DialoguePage[] = [
  {
    eyebrow: "MAYA // FOUNDER",
    title: "Kindred Labs",
    body: "We help remote teams catch broken release flows before customers ever see them.",
    primaryLabel: "Tell me more",
  },
  {
    eyebrow: "FIRST QUEST",
    title: "The launch board is crawling",
    body: "Squash 8 bugs before time runs out. Clear the board and you’ll earn a Practice Spark for our fire.",
    primaryLabel: "Start Bug Squash",
  },
];

const BOOTH_INTROS: Readonly<Record<string, DialoguePage>> = {
  "signal-garden": {
    eyebrow: "ILYAS // FOUNDER",
    title: "Signal Garden",
    body: "We turn noisy community feedback into clear product signals. Come back after helping Maya—the next trail starts here.",
    primaryLabel: "Back to the plaza",
  },
  "ember-studio": {
    eyebrow: "NOOR // FOUNDER",
    title: "Ember Studio",
    body: "We make collaborative creative tools that feel playful from the first click. Maya can show you how Fire City quests work.",
    primaryLabel: "Back to the plaza",
  },
};

export function dialoguePagesFor(booth: BoothSummary): readonly DialoguePage[] {
  if (booth.id === "kindred-labs") return KINDRED_PAGES;
  const intro = BOOTH_INTROS[booth.id];
  return intro === undefined
    ? [
        {
          eyebrow: `${booth.founder.toUpperCase()} // FOUNDER`,
          title: booth.name,
          body: "This founder is preparing a new discovery quest.",
          primaryLabel: "Back to the plaza",
        },
      ]
    : [intro];
}
