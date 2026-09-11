import { describe, expect, it, vi } from "vitest";

import { createBoothDirectory } from "../src/services/ens/boothDirectory";
import {
  createEnsBoothResolver,
  type EnsRuntime,
  type EnsRuntimeLoader,
} from "../src/services/ens/boothResolver";
import type { EnsBoothResolver } from "../src/types/ens";
import type { RealtimeBooth } from "../src/types/gameplay";

const BOOTH: RealtimeBooth = {
  slug: "kindred-labs",
  name: "Kindred Labs",
  founder: "Maya",
  ensName: "kindred.firecity.eth",
  active: true,
  fireScore: 4,
  fireTier: "cold",
};

function runtimeWith(records: Readonly<Record<string, string | null>>): EnsRuntime {
  return {
    normalize: (name) => name.trim().toLowerCase(),
    getText: async (_name, key) => records[key] ?? null,
    getAddress: async () => records.address ?? null,
  };
}

describe("ENS booth resolver", () => {
  it("normalizes a name and validates dynamic startup records", async () => {
    const load = vi.fn<EnsRuntimeLoader>(async () =>
      runtimeWith({
        "com.startuponfire.name": "  Kindred   Protocol  ",
        "com.startuponfire.founder": " Maya Chen ",
        description: " Release intelligence for remote teams. ",
        url: "https://kindred.example/path",
        address: "0x1111111111111111111111111111111111111111",
      }),
    );
    const resolver = createEnsBoothResolver({ rpcUrl: "https://rpc.example" }, load);

    await expect(resolver.resolve(" Kindred.FireCity.eth ")).resolves.toEqual({
      ensName: "kindred.firecity.eth",
      status: "resolved",
      name: "Kindred Protocol",
      founder: "Maya Chen",
      description: "Release intelligence for remote teams.",
      url: "https://kindred.example/path",
      founderAddress: "0x1111111111111111111111111111111111111111",
    });
    expect(load).toHaveBeenCalledWith("https://rpc.example");
  });

  it("drops unsafe or malformed optional records", async () => {
    const resolver = createEnsBoothResolver({ rpcUrl: null }, async () =>
      runtimeWith({
        "com.startuponfire.name": "x".repeat(81),
        url: "javascript:alert(1)",
        address: "not-an-address",
      }),
    );

    await expect(resolver.resolve("kindred.firecity.eth")).resolves.toEqual({
      ensName: "kindred.firecity.eth",
      status: "missing",
    });
  });

  it("deduplicates concurrent reads and caches the result", async () => {
    const runtime = runtimeWith({ description: "A trusted profile." });
    const getText = vi.spyOn(runtime, "getText");
    const load = vi.fn<EnsRuntimeLoader>(async () => runtime);
    const resolver = createEnsBoothResolver({ rpcUrl: null }, load);

    const [first, second] = await Promise.all([
      resolver.resolve("kindred.firecity.eth"),
      resolver.resolve("kindred.firecity.eth"),
    ]);
    const third = await resolver.resolve("kindred.firecity.eth");

    expect(first).toBe(second);
    expect(second).toBe(third);
    expect(load).toHaveBeenCalledOnce();
    expect(getText).toHaveBeenCalledTimes(4);
  });

  it("separates invalid names from provider failures", async () => {
    const invalid = createEnsBoothResolver({ rpcUrl: null }, async () => ({
      ...runtimeWith({}),
      normalize: () => {
        throw new Error("invalid name");
      },
    }));
    const unavailable = createEnsBoothResolver({ rpcUrl: null }, async () => ({
      ...runtimeWith({}),
      getText: async () => {
        throw new Error("provider unavailable");
      },
    }));
    const unavailableLoader = createEnsBoothResolver({ rpcUrl: null }, async () => {
      throw new Error("runtime unavailable");
    });

    await expect(invalid.resolve("not a name")).resolves.toMatchObject({ status: "invalid" });
    await expect(unavailable.resolve("kindred.firecity.eth")).resolves.toMatchObject({
      status: "unavailable",
    });
    await expect(unavailableLoader.resolve("kindred.firecity.eth")).resolves.toMatchObject({
      status: "unavailable",
    });
  });
});

describe("ENS booth directory", () => {
  it("publishes local data immediately, then merges resolved ENS identity", async () => {
    const emissions: (readonly RealtimeBooth[])[] = [];
    const resolver: EnsBoothResolver = {
      resolve: async () => ({
        ensName: "kindred.firecity.eth",
        status: "resolved",
        name: "Kindred Protocol",
        founder: "Maya Chen",
        description: "Release intelligence.",
        url: "https://kindred.example/",
      }),
    };
    const directory = createBoothDirectory(
      {
        subscribeBooths: (listener) => {
          listener([BOOTH]);
          return () => undefined;
        },
      },
      resolver,
    );

    const unsubscribe = directory.subscribe((booths) => emissions.push(booths), vi.fn());
    await vi.waitFor(() => expect(emissions).toHaveLength(2));
    expect(emissions[0]?.[0]).toMatchObject({ name: "Kindred Labs", identityStatus: "loading" });
    expect(emissions[1]?.[0]).toMatchObject({
      name: "Kindred Protocol",
      founder: "Maya Chen",
      description: "Release intelligence.",
      identityStatus: "resolved",
    });
    unsubscribe();
  });

  it("ignores late provider results after unsubscribe", async () => {
    const deferred: {
      finish?: (value: Awaited<ReturnType<EnsBoothResolver["resolve"]>>) => void;
    } = {};
    const resolver: EnsBoothResolver = {
      resolve: async () =>
        await new Promise((resolve) => {
          deferred.finish = resolve;
        }),
    };
    const listener = vi.fn();
    const directory = createBoothDirectory(
      {
        subscribeBooths: (publish) => {
          publish([BOOTH]);
          return () => undefined;
        },
      },
      resolver,
    );

    const unsubscribe = directory.subscribe(listener, vi.fn());
    unsubscribe();
    deferred.finish?.({ ensName: BOOTH.ensName, status: "missing" });
    await Promise.resolve();
    expect(listener).toHaveBeenCalledOnce();
  });
});
