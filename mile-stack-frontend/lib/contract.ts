import {
  Contract,
  TransactionBuilder,
  Account,
  rpc,
  nativeToScVal,
  scValToNative,
} from "@stellar/stellar-sdk";
import { NETWORK_PASSPHRASE, RPC_URL, CONTRACT_ID } from "./stellar";

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
