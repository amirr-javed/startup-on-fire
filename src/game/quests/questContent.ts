import type { BoothSummary } from "../events/GameUiBridge";

export type DialoguePage = Readonly<{
  eyebrow: string;
  title: string;
  body: string;
  primaryLabel: string;
  identityText?: string;
  externalUrl?: string;
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
  const identity = identityDetails(booth);
  if (booth.id === "kindred-labs") {
    return [
      {
        ...KINDRED_PAGES[0]!,
        eyebrow: `${booth.founder.toUpperCase()} // FOUNDER`,
        title: booth.name,
        body: booth.description ?? KINDRED_PAGES[0]!.body,
        ...identity,
      },
      KINDRED_PAGES[1]!,
    ];
  }
  const intro = BOOTH_INTROS[booth.id];
  return [
    {
      ...(intro ?? {
        eyebrow: `${booth.founder.toUpperCase()} // FOUNDER`,
        title: booth.name,
        body: "This founder is preparing a new discovery quest.",
        primaryLabel: "Back to the plaza",
      }),
      eyebrow: `${booth.founder.toUpperCase()} // FOUNDER`,
      title: booth.name,
      body: booth.description ?? intro?.body ?? "This founder is preparing a new discovery quest.",
      ...identity,
    },
  ];
}

function identityDetails(booth: BoothSummary): Pick<DialoguePage, "identityText" | "externalUrl"> {
  if (booth.ensName === undefined) return {};
  const identityText =
    booth.identityStatus === "loading"
      ? `ENSv2 Sepolia · resolving ${booth.ensName}…`
      : booth.identityStatus === "resolved"
        ? `ENSv2 Sepolia · ${booth.ensName}`
        : booth.identityStatus === "missing"
          ? `ENSv2 records pending · ${booth.ensName}`
          : booth.identityStatus === "unavailable"
            ? `ENS temporarily unavailable · ${booth.ensName}`
            : booth.identityStatus === "invalid"
              ? "ENS identity unavailable"
              : `ENSv2 Sepolia · ${booth.ensName}`;
  return { identityText, externalUrl: booth.url };
}
