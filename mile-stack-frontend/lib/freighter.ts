"use client";

import { isConnected, getAddress, signTransaction } from "@stellar/freighter-api";

export async function checkFreighterInstalled(): Promise<boolean> {
  const result = await isConnected();
  return result.isConnected;
}

export async function getWalletAddress(): Promise<string> {
  const result = await getAddress();
  if (result.error) throw new Error(result.error);
  return result.address;
}

export async function signTx(xdr: string, network: string): Promise<string> {
  const result = await signTransaction(xdr, { networkPassphrase: network });
  if (result.error) throw new Error(result.error);
  return result.signedTxXdr;
}
