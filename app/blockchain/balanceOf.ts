import { Contract, formatUnits, JsonRpcProvider } from "ethers";
const abi = [
  {
    constant: true,
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
];

export async function balanceOf(
  userAddress: string,
  tokenAddress: string
): Promise<number> {
  try {
    const nodeUrl = process.env.NEXT_PUBLIC_LINEA_NODE_RPC_URL as string;

    const provider = new JsonRpcProvider(nodeUrl);
    const contract = new Contract(tokenAddress, abi, provider);
    const balance = Number(
      formatUnits(await contract?.balanceOf(userAddress), 6)
    );
    return balance;
  } catch (error) {
    console.error("Error fetching balance:", error);
    return 0;
  }
}
