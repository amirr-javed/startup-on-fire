export type RuntimeConfig = Readonly<{
  convexUrl: string | null;
}>;

type RuntimeEnvironment = Readonly<Record<string, string | boolean | undefined>>;

function parseConvexUrl(value: string | boolean | undefined): string | null {
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
    convexUrl: parseConvexUrl(environment.VITE_CONVEX_URL),
  };
}
