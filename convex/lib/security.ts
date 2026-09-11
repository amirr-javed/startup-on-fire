const encoder = new TextEncoder();
const WORLD_SIGNAL_NAMESPACE = "startup-on-fire:world-selfie:v1:";

export function randomOpaqueToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/u, "");
}

export async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function worldSignalForSession(tokenHash: string): Promise<string> {
  return `sof-world-v1:${await sha256(`${WORLD_SIGNAL_NAMESPACE}${tokenHash}`)}`;
}
