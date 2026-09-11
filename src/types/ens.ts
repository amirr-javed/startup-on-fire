export type EnsIdentityStatus = "loading" | "resolved" | "missing" | "invalid" | "unavailable";

export type EnsBoothIdentity = Readonly<{
  ensName: string;
  status: Exclude<EnsIdentityStatus, "loading">;
  name?: string;
  founder?: string;
  description?: string;
  url?: string;
  founderAddress?: string;
}>;

export interface EnsBoothResolver {
  resolve(ensName: string): Promise<EnsBoothIdentity>;
}
