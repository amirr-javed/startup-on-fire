import type { EnsBoothResolver } from "../../types/ens";
import type { GameplayBackend, RealtimeBooth } from "../../types/gameplay";

export interface BoothDirectory {
  subscribe(listener: (booths: readonly RealtimeBooth[]) => void, onError: () => void): () => void;
}

function mergeIdentity(
  booth: RealtimeBooth,
  identity: Awaited<ReturnType<EnsBoothResolver["resolve"]>>,
): RealtimeBooth {
  return {
    ...booth,
    ensName: identity.ensName,
    identityStatus: identity.status,
    name: identity.name ?? booth.name,
    founder: identity.founder ?? booth.founder,
    description: identity.description,
    url: identity.url,
    founderAddress: identity.founderAddress,
  };
}

export function createBoothDirectory(
  gameplay: Pick<GameplayBackend, "subscribeBooths">,
  resolver: EnsBoothResolver,
): BoothDirectory {
  return {
    subscribe(listener, onError) {
      let disposed = false;
      let generation = 0;
      const unsubscribe = gameplay.subscribeBooths((booths) => {
        generation += 1;
        const activeGeneration = generation;
        let current: RealtimeBooth[] = booths.map((booth) => ({
          ...booth,
          identityStatus: "loading",
        }));
        listener(current);

        for (const booth of booths) {
          void resolver.resolve(booth.ensName).then(
            (identity) => {
              if (disposed || activeGeneration !== generation) return;
              current = current.map((candidate) =>
                candidate.slug === booth.slug ? mergeIdentity(booth, identity) : candidate,
              );
              listener(current);
            },
            () => {
              if (disposed || activeGeneration !== generation) return;
              current = current.map((candidate) =>
                candidate.slug === booth.slug
                  ? { ...booth, identityStatus: "unavailable" }
                  : candidate,
              );
              listener(current);
            },
          );
        }
      }, onError);

      return () => {
        disposed = true;
        generation += 1;
        unsubscribe();
      };
    },
  };
}
