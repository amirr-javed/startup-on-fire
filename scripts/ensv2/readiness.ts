import { createPublicClient, fallback, http } from "viem";
import { mainnet } from "viem/chains";
import { normalize } from "viem/ens";

const client = createPublicClient({
  chain: mainnet,
  transport: process.env.MAINNET_RPC_URL
    ? http(process.env.MAINNET_RPC_URL)
    : fallback([http(), http("https://ethereum-rpc.publicnode.com")]),
});

const universalResolverName = normalize("ur.integration-tests.eth");
const ccipReadName = normalize("test.offchaindemo.eth");

const [universalResolverResult, ccipReadResult] = await Promise.all([
  client.getEnsAddress({ name: universalResolverName }),
  client.getEnsAddress({ name: ccipReadName }),
]);

const expectedUniversalResolverResult = "0x2222222222222222222222222222222222222222";
const expectedCcipReadResult = "0x779981590E7Ccc0CFAe8040Ce7151324747cDb97";

if (universalResolverResult?.toLowerCase() !== expectedUniversalResolverResult.toLowerCase()) {
  throw new Error("The ENS Universal Resolver readiness name returned an unexpected address.");
}

if (ccipReadResult?.toLowerCase() !== expectedCcipReadResult.toLowerCase()) {
  throw new Error("The ENS CCIP-Read readiness name returned an unexpected address.");
}

console.log("ENS readiness checks passed.");
console.log(`${universalResolverName} -> ${universalResolverResult}`);
console.log(`${ccipReadName} -> ${ccipReadResult}`);
