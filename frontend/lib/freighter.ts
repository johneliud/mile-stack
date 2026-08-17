"use client";

import {
  isConnected,
  isAllowed,
  getAddress,
  requestAccess,
  signTransaction,
} from "@stellar/freighter-api";

function extractErrorMessage(err: unknown): string {
  if (!err) return "Unknown error";
  if (typeof err === "string") return err;
  if (typeof err === "object" && "message" in (err as Record<string, unknown>)) {
    return String((err as Record<string, unknown>).message);
  }
  return String(err);
}

export async function checkFreighterInstalled(): Promise<boolean> {
  const result = await isConnected();
  return result.isConnected;
}

export async function checkWalletAllowed(): Promise<boolean> {
  const result = await isAllowed();
  return result.isAllowed;
}

// Silent address fetch - only works if the site is already allowed by Freighter.
export async function getWalletAddress(): Promise<string> {
  const result = await getAddress();
  if (result.error) throw new Error(extractErrorMessage(result.error));
  return result.address;
}

// Triggers the Freighter permission popup and returns the address on approval.
export async function requestWalletAccess(): Promise<string> {
  const result = await requestAccess();
  if (result.error) throw new Error(extractErrorMessage(result.error));
  return result.address;
}

export async function signTx(xdr: string, network: string): Promise<string> {
  const result = await signTransaction(xdr, { networkPassphrase: network });
  if (result.error) throw new Error(extractErrorMessage(result.error));
  return result.signedTxXdr;
}
