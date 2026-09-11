import type { EnsBoothIdentity, EnsBoothResolver } from "../../types/ens";
import { sepolia } from "viem/chains";

const RESOLVED_CACHE_MS = 5 * 60_000;
const FAILURE_CACHE_MS = 30_000;

export type EnsRuntime = Readonly<{
  normalize: (name: string) => string;
  getText: (name: string, key: string) => Promise<string | null>;
  getAddress: (name: string) => Promise<string | null>;
}>;

export type EnsRuntimeLoader = (rpcUrl: string | null) => Promise<EnsRuntime>;

type CacheEntry = Readonly<{ identity: EnsBoothIdentity; expiresAt: number }>;

function cleanText(value: string | null, maximumLength: number): string | undefined {
  if (value === null) return undefined;
  const cleaned = value.replace(/\s+/g, " ").trim();
  return cleaned.length > 0 && cleaned.length <= maximumLength ? cleaned : undefined;
}

function cleanUrl(value: string | undefined): string | undefined {
  if (value === undefined) return undefined;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username.length > 0 || url.password.length > 0) {
      return undefined;
    }
    return url.toString();
  } catch {
    return undefined;
  }
}

function cleanAddress(value: string | null): string | undefined {
  return value !== null && /^0x[0-9a-fA-F]{40}$/.test(value) ? value : undefined;
}

async function loadViemRuntime(rpcUrl: string | null): Promise<EnsRuntime> {
  const [{ createPublicClient, http }, { normalize }] = await Promise.all([
    import("viem"),
    import("viem/ens"),
  ]);
  const client = createPublicClient({
    chain: sepolia,
    transport: http(rpcUrl ?? undefined, { retryCount: 1, timeout: 7_000 }),
  });
  return {
    normalize,
    getText: async (name, key) => await client.getEnsText({ name, key }),
    getAddress: async (name) => await client.getEnsAddress({ name }),
  };
}

export function createEnsBoothResolver(
  options: Readonly<{ rpcUrl: string | null; now?: () => number }>,
  loadRuntime: EnsRuntimeLoader = loadViemRuntime,
): EnsBoothResolver {
  const now = options.now ?? Date.now;
  const cache = new Map<string, CacheEntry>();
  const pending = new Map<string, Promise<EnsBoothIdentity>>();
  let runtimePromise: Promise<EnsRuntime> | null = null;

  const resolveFresh = async (ensName: string): Promise<EnsBoothIdentity> => {
    let runtime: EnsRuntime;
    try {
      runtimePromise ??= loadRuntime(options.rpcUrl);
      runtime = await runtimePromise;
    } catch {
      runtimePromise = null;
      return { ensName: ensName.trim(), status: "unavailable" };
    }

    let normalizedName: string;
    try {
      normalizedName = runtime.normalize(ensName);
    } catch {
      return { ensName: ensName.trim(), status: "invalid" };
    }

    try {
      const [name, founder, description, rawUrl, founderAddress] = await Promise.all([
        runtime.getText(normalizedName, "com.startuponfire.name"),
        runtime.getText(normalizedName, "com.startuponfire.founder"),
        runtime.getText(normalizedName, "description"),
        runtime.getText(normalizedName, "url"),
        runtime.getAddress(normalizedName),
      ]);
      const identity: EnsBoothIdentity = {
        ensName: normalizedName,
        status: "resolved",
        name: cleanText(name, 80),
        founder: cleanText(founder, 80),
        description: cleanText(description, 280),
        url: cleanUrl(cleanText(rawUrl, 2_048)),
        founderAddress: cleanAddress(founderAddress),
      };
      const hasRecords =
        identity.name !== undefined ||
        identity.founder !== undefined ||
        identity.description !== undefined ||
        identity.url !== undefined ||
        identity.founderAddress !== undefined;
      return hasRecords ? identity : { ensName: normalizedName, status: "missing" };
    } catch {
      return { ensName: normalizedName, status: "unavailable" };
    }
  };

  return {
    async resolve(ensName) {
      const cacheKey = ensName.trim().toLowerCase();
      const cached = cache.get(cacheKey);
      if (cached !== undefined && cached.expiresAt > now()) return cached.identity;
      const inFlight = pending.get(cacheKey);
      if (inFlight !== undefined) return await inFlight;

      const request = resolveFresh(ensName).then((identity) => {
        pending.delete(cacheKey);
        const cacheDuration =
          identity.status === "resolved" || identity.status === "missing"
            ? RESOLVED_CACHE_MS
            : FAILURE_CACHE_MS;
        cache.set(cacheKey, { identity, expiresAt: now() + cacheDuration });
        return identity;
      });
      pending.set(cacheKey, request);
      return await request;
    },
  };
}
