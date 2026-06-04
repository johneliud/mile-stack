import { rpc, Contract } from "@stellar/stellar-sdk";

export const NETWORK_PASSPHRASE = "Test SDF Network ; September 2015";
export const RPC_URL =
  process.env.NEXT_PUBLIC_STELLAR_RPC_URL ?? "https://soroban-testnet.stellar.org";
export const CONTRACT_ID = process.env.NEXT_PUBLIC_CONTRACT_ID ?? "";

export function getRpcServer(): rpc.Server {
  return new rpc.Server(RPC_URL, { allowHttp: true });
}

export function getMileStackContract(): Contract {
  return new Contract(CONTRACT_ID);
}
