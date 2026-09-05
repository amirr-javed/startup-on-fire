import { readEnsWriteConfiguration } from "./config";

const configurationResult = readEnsWriteConfiguration(process.env);
if (!configurationResult.success) {
  throw new Error(
    `Missing local ENS spike configuration: ${configurationResult.missing.join(", ")}`,
  );
}

const [viem, accounts, chains, ens] = await Promise.all([
  import("viem"),
  import("viem/accounts"),
  import("viem/chains"),
  import("viem/ens"),
]);
const { createPublicClient, createWalletClient, http, parseAbi } = viem;
const { generatePrivateKey, privateKeyToAccount } = accounts;
const { sepolia } = chains;
const { namehash, normalize } = ens;

const { name, privateKey, rpcUrl } = configurationResult.configuration;
const normalizedName = normalize(name);
const transport = http(rpcUrl);
const owner = privateKeyToAccount(privateKey);
const outsider = privateKeyToAccount(generatePrivateKey());
const publicClient = createPublicClient({ chain: sepolia, transport });
const ownerWallet = createWalletClient({ account: owner, chain: sepolia, transport });
const resolverAbi = parseAbi(["function setText(bytes32 node, string key, string value)"]);
const node = namehash(normalizedName);
const recordKey = "com.startuponfire.phase1";
const recordValue = `verified-${new Date().toISOString()}`;

// The configured resolver is deliberately discovered immediately before the write.
const authorizedResolver = await publicClient.getEnsResolver({ name: normalizedName });
const transactionHash = await ownerWallet.writeContract({
  address: authorizedResolver,
  abi: resolverAbi,
  functionName: "setText",
  args: [node, recordKey, recordValue],
});
const receipt = await publicClient.waitForTransactionReceipt({ hash: transactionHash });
if (receipt.status !== "success") {
  throw new Error("The authorized ENS text-record transaction reverted.");
}

const resolvedValue = await publicClient.getEnsText({ name: normalizedName, key: recordKey });
if (resolvedValue !== recordValue) {
  throw new Error("The authorized ENS record did not resolve to the written value.");
}

// Look the resolver up again so the negative test never relies on a cached implementation address.
const unauthorizedResolver = await publicClient.getEnsResolver({ name: normalizedName });
let unauthorizedReverted = false;
try {
  await publicClient.simulateContract({
    account: outsider,
    address: unauthorizedResolver,
    abi: resolverAbi,
    functionName: "setText",
    args: [node, recordKey, "unauthorized-value"],
  });
} catch {
  unauthorizedReverted = true;
}

if (!unauthorizedReverted) {
  throw new Error("The unauthorized ENS write unexpectedly simulated successfully.");
}

console.log("ENSv2 Sepolia permission experiment passed.");
console.log(`Name: ${normalizedName}`);
console.log(`Resolver (fresh lookup): ${unauthorizedResolver}`);
console.log(`Authorized transaction: ${transactionHash}`);
console.log(`Resolved ${recordKey}: ${resolvedValue}`);
console.log("Unauthorized outsider write: reverted as expected");
