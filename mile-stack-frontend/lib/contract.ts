import {
  Address,
  Contract,
  TransactionBuilder,
  Account,
  rpc,
  xdr,
  nativeToScVal,
  scValToNative,
} from "@stellar/stellar-sdk";
import { NETWORK_PASSPHRASE, RPC_URL, CONTRACT_ID } from "./stellar";
import { signTx } from "./freighter";

export type MilestoneStatus = "Pending" | "Funded" | "Completed" | "Released" | "Disputed";

export interface ContractMilestone {
  title: string;
  amount: bigint; // stroops (1 XLM = 10_000_000 stroops)
  status: MilestoneStatus;
  freelancer: string; // Stellar public key
}

export interface ContractProject {
  id: bigint;
  client: string; // Stellar public key
  milestones: ContractMilestone[];
  created_at: bigint; // Unix timestamp (seconds)
}

export function stroopsToXlm(stroops: bigint): string {
  const xlm = Number(stroops) / 10_000_000;
  return xlm.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 });
}

export function totalProjectValue(project: ContractProject): bigint {
  return project.milestones.reduce((sum, m) => sum + m.amount, 0n);
}

export function projectOverallStatus(
  project: ContractProject,
): "Pending" | "Active" | "Disputed" | "Completed" {
  const statuses = project.milestones.map((m) => m.status);
  if (statuses.every((s) => s === "Released")) return "Completed";
  if (statuses.some((s) => s === "Disputed")) return "Disputed";
  if (statuses.some((s) => s === "Funded")) return "Active";
  return "Pending";
}

async function simulateView(
  functionName: string,
  ...args: ReturnType<typeof nativeToScVal>[]
): Promise<unknown> {
  if (!CONTRACT_ID) throw new Error("CONTRACT_NOT_CONFIGURED");

  const simulationSource = process.env.NEXT_PUBLIC_SIMULATION_SOURCE;
  if (!simulationSource) throw new Error("SIMULATION_SOURCE_NOT_CONFIGURED");

  const server = new rpc.Server(RPC_URL, { allowHttp: true });
  const contract = new Contract(CONTRACT_ID);
  const account = new Account(simulationSource, "0");

  const tx = new TransactionBuilder(account, {
    fee: "100",
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(functionName, ...args))
    .setTimeout(30)
    .build();

  const result = await server.simulateTransaction(tx);

  if (rpc.Api.isSimulationError(result)) {
    throw new Error(result.error);
  }

  if (!result.result?.retval) {
    throw new Error("No return value from simulation");
  }

  return scValToNative(result.result.retval);
}

// Soroban unit enum variants are encoded as ScVec[ScSymbol], which scValToNative
// converts to a one-element string array. Handle both that and plain-string fallbacks.
function parseStatus(raw: unknown): MilestoneStatus {
  const VALID: MilestoneStatus[] = ["Pending", "Funded", "Completed", "Released", "Disputed"];
  const s = Array.isArray(raw) ? raw[0] : raw;
  if (typeof s === "string" && VALID.includes(s as MilestoneStatus)) return s as MilestoneStatus;
  if (typeof s === "object" && s !== null) {
    const key = Object.keys(s)[0];
    if (key && VALID.includes(key as MilestoneStatus)) return key as MilestoneStatus;
  }
  return "Pending";
}

function parseMilestone(raw: Record<string, unknown>): ContractMilestone {
  return {
    title: String(raw.title ?? ""),
    amount: BigInt(String(raw.amount ?? "0")),
    status: parseStatus(raw.status),
    freelancer: String(raw.freelancer ?? ""),
  };
}

function parseProject(raw: Record<string, unknown>): ContractProject {
  return {
    id: BigInt(String(raw.id ?? "0")),
    client: String(raw.client ?? ""),
    milestones: (Array.isArray(raw.milestones) ? raw.milestones : []).map((m) =>
      parseMilestone(m as Record<string, unknown>),
    ),
    created_at: BigInt(String(raw.created_at ?? "0")),
  };
}

export async function getProjectCount(): Promise<number> {
  const raw = await simulateView("get_project_count");
  return Number(raw);
}

export async function getProject(id: number): Promise<ContractProject> {
  const raw = await simulateView("get_project", nativeToScVal(BigInt(id), { type: "u64" }));
  return parseProject(raw as Record<string, unknown>);
}

// Raises a dispute on a Funded/Completed milestone. Triggers the Freighter popup,
// submits the signed transaction, and polls until confirmed or timed out.
export async function disputeMilestone(
  walletAddress: string,
  projectId: number,
  milestoneIndex: number,
): Promise<void> {
  if (!CONTRACT_ID) throw new Error("CONTRACT_NOT_CONFIGURED");

  const server = new rpc.Server(RPC_URL, { allowHttp: true });
  const contract = new Contract(CONTRACT_ID);

  const account = await server.getAccount(walletAddress);

  const tx = new TransactionBuilder(account, {
    fee: "300000",
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      contract.call(
        "dispute_milestone",
        new Address(walletAddress).toScVal(),
        nativeToScVal(BigInt(projectId), { type: "u64" }),
        nativeToScVal(milestoneIndex, { type: "u32" }),
      ),
    )
    .setTimeout(30)
    .build();

  const simResult = await server.simulateTransaction(tx);
  if (rpc.Api.isSimulationError(simResult)) throw new Error(simResult.error);

  const assembled = rpc.assembleTransaction(tx, simResult).build();
  const signedXdr = await signTx(assembled.toXDR(), NETWORK_PASSPHRASE);

  const signedTx = TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE);
  const submitResult = await server.sendTransaction(signedTx);

  if (submitResult.status === "ERROR") {
    throw new Error(
      `Transaction submission failed: ${JSON.stringify(submitResult.errorResult ?? "")}`,
    );
  }

  // Poll until the transaction is confirmed (max ~20 s)
  for (let i = 0; i < 10; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    const txResult = await server.getTransaction(submitResult.hash);
    if (txResult.status === rpc.Api.GetTransactionStatus.SUCCESS) return;
    if (txResult.status === rpc.Api.GetTransactionStatus.FAILED) {
      throw new Error("Transaction failed on-chain");
    }
  }
  throw new Error("Transaction timed out--. Check your wallet for status");
}

// Creates a new escrow project. Returns the assigned project ID.
export async function createProject(
  clientAddress: string,
  freelancerAddress: string,
  milestones: Array<{ title: string; amount: bigint }>,
): Promise<number> {
  if (!CONTRACT_ID) throw new Error("CONTRACT_NOT_CONFIGURED");

  const server = new rpc.Server(RPC_URL, { allowHttp: true });
  const contract = new Contract(CONTRACT_ID);
  const account = await server.getAccount(clientAddress);

  const titlesVec = xdr.ScVal.scvVec(
    milestones.map((m) => nativeToScVal(m.title, { type: "string" })),
  );
  const amountsVec = xdr.ScVal.scvVec(
    milestones.map((m) => nativeToScVal(m.amount, { type: "i128" })),
  );

  const tx = new TransactionBuilder(account, {
    fee: "300000",
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      contract.call(
        "create_project",
        new Address(clientAddress).toScVal(),
        new Address(freelancerAddress).toScVal(),
        titlesVec,
        amountsVec,
      ),
    )
    .setTimeout(30)
    .build();

  const simResult = await server.simulateTransaction(tx);
  if (rpc.Api.isSimulationError(simResult)) throw new Error(simResult.error);

  const assembled = rpc.assembleTransaction(tx, simResult).build();
  const signedXdr = await signTx(assembled.toXDR(), NETWORK_PASSPHRASE);

  const signedTx = TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE);
  const submitResult = await server.sendTransaction(signedTx);

  if (submitResult.status === "ERROR") {
    throw new Error(
      `Transaction submission failed: ${JSON.stringify(submitResult.errorResult ?? "")}`,
    );
  }

  for (let i = 0; i < 10; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    const txResult = await server.getTransaction(submitResult.hash);
    if (txResult.status === rpc.Api.GetTransactionStatus.SUCCESS) {
      // returnValue holds the u64 project ID returned by the contract
      if ("returnValue" in txResult && txResult.returnValue) {
        return Number(scValToNative(txResult.returnValue));
      }
      return await getProjectCount();
    }
    if (txResult.status === rpc.Api.GetTransactionStatus.FAILED) {
      throw new Error("Transaction failed on-chain");
    }
  }
  throw new Error("Transaction timed out--. Check your wallet for status");
}

export async function resolveDispute(
  resolverAddress: string,
  projectId: number,
  milestoneIndex: number,
  releaseToFreelancer: boolean,
): Promise<void> {
  const XLM_TOKEN = process.env.NEXT_PUBLIC_XLM_TOKEN_ID;
  if (!XLM_TOKEN) throw new Error("XLM_TOKEN_NOT_CONFIGURED");
  if (!CONTRACT_ID) throw new Error("CONTRACT_NOT_CONFIGURED");

  const server = new rpc.Server(RPC_URL, { allowHttp: true });
  const contract = new Contract(CONTRACT_ID);

  const account = await server.getAccount(resolverAddress);

  const tx = new TransactionBuilder(account, {
    fee: "300000",
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      contract.call(
        "resolve_dispute",
        new Address(resolverAddress).toScVal(),
        nativeToScVal(BigInt(projectId), { type: "u64" }),
        nativeToScVal(milestoneIndex, { type: "u32" }),
        new Address(XLM_TOKEN).toScVal(),
        nativeToScVal(releaseToFreelancer, { type: "bool" }),
      ),
    )
    .setTimeout(30)
    .build();

  const simResult = await server.simulateTransaction(tx);
  if (rpc.Api.isSimulationError(simResult)) throw new Error(simResult.error);

  const assembled = rpc.assembleTransaction(tx, simResult).build();
  const signedXdr = await signTx(assembled.toXDR(), NETWORK_PASSPHRASE);

  const signedTx = TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE);
  const submitResult = await server.sendTransaction(signedTx);

  if (submitResult.status === "ERROR") {
    throw new Error(
      `Transaction submission failed: ${JSON.stringify(submitResult.errorResult ?? "")}`,
    );
  }

  for (let i = 0; i < 10; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    const txResult = await server.getTransaction(submitResult.hash);
    if (txResult.status === rpc.Api.GetTransactionStatus.SUCCESS) return;
    if (txResult.status === rpc.Api.GetTransactionStatus.FAILED) {
      throw new Error("Transaction failed on-chain");
    }
  }
  throw new Error("Transaction timed out--. Check your wallet for status");
}

export async function markComplete(
  walletAddress: string,
  projectId: number,
  milestoneIndex: number,
): Promise<void> {
  if (!CONTRACT_ID) throw new Error("CONTRACT_NOT_CONFIGURED");

  const server = new rpc.Server(RPC_URL, { allowHttp: true });
  const contract = new Contract(CONTRACT_ID);

  const account = await server.getAccount(walletAddress);

  const tx = new TransactionBuilder(account, {
    fee: "300000",
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      contract.call(
        "mark_complete",
        new Address(walletAddress).toScVal(),
        nativeToScVal(BigInt(projectId), { type: "u64" }),
        nativeToScVal(milestoneIndex, { type: "u32" }),
      ),
    )
    .setTimeout(30)
    .build();

  const simResult = await server.simulateTransaction(tx);
  if (rpc.Api.isSimulationError(simResult)) throw new Error(simResult.error);

  const assembled = rpc.assembleTransaction(tx, simResult).build();
  const signedXdr = await signTx(assembled.toXDR(), NETWORK_PASSPHRASE);

  const signedTx = TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE);
  const submitResult = await server.sendTransaction(signedTx);

  if (submitResult.status === "ERROR") {
    throw new Error(
      `Transaction submission failed: ${JSON.stringify(submitResult.errorResult ?? "")}`,
    );
  }

  for (let i = 0; i < 10; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    const txResult = await server.getTransaction(submitResult.hash);
    if (txResult.status === rpc.Api.GetTransactionStatus.SUCCESS) return;
    if (txResult.status === rpc.Api.GetTransactionStatus.FAILED) {
      throw new Error("Transaction failed on-chain");
    }
  }
  throw new Error("Transaction timed out--. Check your wallet for status");
}

export async function fundMilestone(
  walletAddress: string,
  projectId: number,
  milestoneIndex: number,
): Promise<void> {
  const XLM_TOKEN = process.env.NEXT_PUBLIC_XLM_TOKEN_ID;
  if (!XLM_TOKEN) throw new Error("XLM_TOKEN_NOT_CONFIGURED");
  if (!CONTRACT_ID) throw new Error("CONTRACT_NOT_CONFIGURED");

  const server = new rpc.Server(RPC_URL, { allowHttp: true });
  const contract = new Contract(CONTRACT_ID);
  const account = await server.getAccount(walletAddress);

  const tx = new TransactionBuilder(account, {
    fee: "300000",
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      contract.call(
        "fund_milestone",
        nativeToScVal(BigInt(projectId), { type: "u64" }),
        nativeToScVal(milestoneIndex, { type: "u32" }),
        new Address(XLM_TOKEN).toScVal(),
      ),
    )
    .setTimeout(30)
    .build();

  const simResult = await server.simulateTransaction(tx);
  if (rpc.Api.isSimulationError(simResult)) throw new Error(simResult.error);

  const assembled = rpc.assembleTransaction(tx, simResult).build();
  const signedXdr = await signTx(assembled.toXDR(), NETWORK_PASSPHRASE);

  const signedTx = TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE);
  const submitResult = await server.sendTransaction(signedTx);

  if (submitResult.status === "ERROR") {
    throw new Error(
      `Transaction submission failed: ${JSON.stringify(submitResult.errorResult ?? "")}`,
    );
  }

  for (let i = 0; i < 10; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    const txResult = await server.getTransaction(submitResult.hash);
    if (txResult.status === rpc.Api.GetTransactionStatus.SUCCESS) return;
    if (txResult.status === rpc.Api.GetTransactionStatus.FAILED) {
      throw new Error("Transaction failed on-chain");
    }
  }
  throw new Error("Transaction timed out--. Check your wallet for status");
}

export async function approveMilestone(
  walletAddress: string,
  projectId: number,
  milestoneIndex: number,
): Promise<void> {
  const XLM_TOKEN = process.env.NEXT_PUBLIC_XLM_TOKEN_ID;
  if (!XLM_TOKEN) throw new Error("XLM_TOKEN_NOT_CONFIGURED");
  if (!CONTRACT_ID) throw new Error("CONTRACT_NOT_CONFIGURED");

  const server = new rpc.Server(RPC_URL, { allowHttp: true });
  const contract = new Contract(CONTRACT_ID);
  const account = await server.getAccount(walletAddress);

  const tx = new TransactionBuilder(account, {
    fee: "300000",
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      contract.call(
        "approve_milestone",
        nativeToScVal(BigInt(projectId), { type: "u64" }),
        nativeToScVal(milestoneIndex, { type: "u32" }),
        new Address(XLM_TOKEN).toScVal(),
      ),
    )
    .setTimeout(30)
    .build();

  const simResult = await server.simulateTransaction(tx);
  if (rpc.Api.isSimulationError(simResult)) throw new Error(simResult.error);

  const assembled = rpc.assembleTransaction(tx, simResult).build();
  const signedXdr = await signTx(assembled.toXDR(), NETWORK_PASSPHRASE);

  const signedTx = TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE);
  const submitResult = await server.sendTransaction(signedTx);

  if (submitResult.status === "ERROR") {
    throw new Error(
      `Transaction submission failed: ${JSON.stringify(submitResult.errorResult ?? "")}`,
    );
  }

  for (let i = 0; i < 10; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    const txResult = await server.getTransaction(submitResult.hash);
    if (txResult.status === rpc.Api.GetTransactionStatus.SUCCESS) return;
    if (txResult.status === rpc.Api.GetTransactionStatus.FAILED) {
      throw new Error("Transaction failed on-chain");
    }
  }
  throw new Error("Transaction timed out--. Check your wallet for status");
}

export async function getClientProjects(clientAddress: string): Promise<ContractProject[]> {
  const count = await getProjectCount();
  if (count === 0) return [];

  const results = await Promise.allSettled(
    Array.from({ length: count }, (_, i) => getProject(i + 1)),
  );

  return results
    .filter((r): r is PromiseFulfilledResult<ContractProject> => r.status === "fulfilled")
    .map((r) => r.value)
    .filter((project) => project.client.toLowerCase() === clientAddress.toLowerCase());
}

export async function getFreelancerProjects(freelancerAddress: string): Promise<ContractProject[]> {
  const count = await getProjectCount();
  if (count === 0) return [];

  const results = await Promise.allSettled(
    Array.from({ length: count }, (_, i) => getProject(i + 1)),
  );

  return results
    .filter((r): r is PromiseFulfilledResult<ContractProject> => r.status === "fulfilled")
    .map((r) => r.value)
    .filter((project) =>
      project.milestones.some(
        (m) => m.freelancer.toLowerCase() === freelancerAddress.toLowerCase(),
      ),
    );
}
