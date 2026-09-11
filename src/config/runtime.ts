export type RuntimeConfig = Readonly<{
  convexUrl: string | null;
  ensRpcUrl: string | null;
}>;

type RuntimeEnvironment = Readonly<Record<string, string | boolean | undefined>>;

function parseHttpUrl(value: string | boolean | undefined): string | null {
  if (typeof value !== "string" || value.trim().length === 0) {
    return null;
  }

  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:" && url.protocol !== "http:") {
      return null;
    }
    return url.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

export function readRuntimeConfig(environment: RuntimeEnvironment): RuntimeConfig {
  return {
    convexUrl: parseHttpUrl(environment.VITE_CONVEX_URL),
    ensRpcUrl: parseHttpUrl(environment.VITE_SEPOLIA_RPC_URL),
  };
}
