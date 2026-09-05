export type EnsWriteConfiguration = Readonly<{
  name: string;
  privateKey: `0x${string}`;
  rpcUrl?: string;
}>;

export type EnsWriteConfigurationResult =
  { success: true; configuration: EnsWriteConfiguration } | { success: false; missing: string[] };

export function readEnsWriteConfiguration(
  environment: Readonly<Record<string, string | undefined>>,
): EnsWriteConfigurationResult {
  const name = environment.ENS_TEST_NAME?.trim();
  const rawKey = environment.ENS_TEST_OWNER_PRIVATE_KEY?.trim();
  const missing = [
    ...(name ? [] : ["ENS_TEST_NAME"]),
    ...(rawKey ? [] : ["ENS_TEST_OWNER_PRIVATE_KEY"]),
  ];

  if (missing.length > 0) {
    return { success: false, missing };
  }

  const normalizedKey = rawKey!.startsWith("0x") ? rawKey! : `0x${rawKey!}`;
  if (!/^0x[0-9a-fA-F]{64}$/.test(normalizedKey)) {
    return { success: false, missing: ["ENS_TEST_OWNER_PRIVATE_KEY (invalid format)"] };
  }

  return {
    success: true,
    configuration: {
      name: name!,
      privateKey: normalizedKey as `0x${string}`,
      ...(environment.SEPOLIA_RPC_URL?.trim()
        ? { rpcUrl: environment.SEPOLIA_RPC_URL.trim() }
        : {}),
    },
  };
}
