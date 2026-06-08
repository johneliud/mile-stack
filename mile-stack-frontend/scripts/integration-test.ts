/**
 * End-to-end integration test: full client → freelancer payment flow on Stellar testnet.
 *
 * Usage:
 *   npm run test:e2e
 *
 * Required env vars (add to .env.local):
 *   INTEGRATION_CLIENT_SECRET - secret key for the client test account
 *   INTEGRATION_FREELANCER_SECRET - secret key for the freelancer test account
 *
 * Both accounts are auto-funded via Friendbot if their XLM balance is below 10 XLM.
 */

import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import {
  Keypair,
  TransactionBuilder,
  Account,
  Contract,
  Address,
  rpc,
  xdr,
  nativeToScVal,
  scValToNative,
} from "@stellar/stellar-sdk";

// Config

const RPC_URL = process.env.NEXT_PUBLIC_STELLAR_RPC_URL ?? "https://soroban-testnet.stellar.org";
const NETWORK = process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE ?? "Test SDF Network ; September 2015";
const CONTRACT_ID = process.env.NEXT_PUBLIC_CONTRACT_ID ?? "";
const XLM_TOKEN = process.env.NEXT_PUBLIC_XLM_TOKEN_ID ?? "";
const FRIENDBOT = "https://friendbot.stellar.org";

const CLIENT_SECRET = process.env.INTEGRATION_CLIENT_SECRET ?? "";
const FREELANCER_SECRET = process.env.INTEGRATION_FREELANCER_SECRET ?? "";

// Helpers

const server = new rpc.Server(RPC_URL, { allowHttp: true });
const contract = new Contract(CONTRACT_ID);

let passed = 0;
let failed = 0;

function ok(label: string) {
  console.log(`${label}`);
  passed++;
}

function fail(label: string, err?: unknown) {
  console.error(`${label}`);
  if (err) console.error(`${err instanceof Error ? err.message : String(err)}`);
  failed++;
}

async function friendbot(address: string): Promise<void> {
  const res = await fetch(`${FRIENDBOT}?addr=${address}`);
  if (!res.ok && res.status !== 400) throw new Error(`Friendbot failed: ${res.status}`);
}

async function xlmBalance(address: string): Promise<number> {
  try {
    const res = await fetch(`https://horizon-testnet.stellar.org/accounts/${address}`);
    if (!res.ok) return 0;
    const data = (await res.json()) as {
      balances: Array<{ asset_type: string; balance: string }>;
    };
    const native = data.balances.find((b) => b.asset_type === "native");
    return parseFloat(native?.balance ?? "0");
  } catch {
    return 0;
  }
}

async function ensureFunded(label: string, address: string): Promise<void> {
  const bal = await xlmBalance(address);
  if (bal < 10) {
    process.stdout.write(`  Funding ${label} via Friendbot... `);
    await friendbot(address);
    // Wait for account to appear on-chain
    for (let i = 0; i < 10; i++) {
      await new Promise((r) => setTimeout(r, 2000));
      if ((await xlmBalance(address)) > 0) break;
    }
    console.log("done");
  }
}

async function sendTx(
  keypair: Keypair,
  operation: xdr.Operation,
): Promise<rpc.Api.GetSuccessfulTransactionResponse> {
  const account = await server.getAccount(keypair.publicKey());

  const tx = new TransactionBuilder(new Account(keypair.publicKey(), account.sequenceNumber()), {
    fee: "300000",
    networkPassphrase: NETWORK,
  })
    .addOperation(operation)
    .setTimeout(30)
    .build();

  const simResult = await server.simulateTransaction(tx);
  if (rpc.Api.isSimulationError(simResult)) throw new Error(simResult.error);

  const assembled = rpc.assembleTransaction(tx, simResult).build();
  assembled.sign(keypair);

  const submitResult = await server.sendTransaction(assembled);
  if (submitResult.status === "ERROR") {
    throw new Error(`Submit failed: ${JSON.stringify(submitResult.errorResult ?? "")}`);
  }

  for (let i = 0; i < 15; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    const status = await server.getTransaction(submitResult.hash);
    if (status.status === rpc.Api.GetTransactionStatus.SUCCESS)
      return status as rpc.Api.GetSuccessfulTransactionResponse;
    if (status.status === rpc.Api.GetTransactionStatus.FAILED)
      throw new Error("Transaction failed on-chain");
  }
  throw new Error("Transaction timed out after 30 s");
}

async function readProject(id: number) {
  const simulationSource = process.env.NEXT_PUBLIC_SIMULATION_SOURCE ?? CLIENT_KP.publicKey();
  const acc = new Account(simulationSource, "0");

  const tx = new TransactionBuilder(acc, {
    fee: "100",
    networkPassphrase: NETWORK,
  })
    .addOperation(contract.call("get_project", nativeToScVal(BigInt(id), { type: "u64" })))
    .setTimeout(30)
    .build();

  const sim = await server.simulateTransaction(tx);
  if (rpc.Api.isSimulationError(sim)) throw new Error(sim.error);
  if (!sim.result?.retval) throw new Error("No return value");

  return scValToNative(sim.result.retval) as Record<string, unknown>;
}

// Keypairs

const CLIENT_KP = CLIENT_SECRET ? Keypair.fromSecret(CLIENT_SECRET) : Keypair.random();
const FREELANCER_KP = FREELANCER_SECRET ? Keypair.fromSecret(FREELANCER_SECRET) : Keypair.random();

// Main

async function run() {
  console.log("\nMileStack E2E Integration Test\n");

  // Pre-flight checks
  console.log("Pre-flight checks\n");

  if (!CONTRACT_ID) {
    fail("CONTRACT_ID is configured");
    process.exit(1);
  }
  ok("CONTRACT_ID is configured");

  if (!XLM_TOKEN) {
    fail("XLM_TOKEN_ID is configured");
    process.exit(1);
  }
  ok("XLM_TOKEN_ID is configured");

  console.log(`  Client:     ${CLIENT_KP.publicKey()}`);
  console.log(`  Freelancer: ${FREELANCER_KP.publicKey()}\n`);

  // Fund accounts if needed
  await ensureFunded("client", CLIENT_KP.publicKey());
  await ensureFunded("freelancer", FREELANCER_KP.publicKey());

  const clientBefore = await xlmBalance(CLIENT_KP.publicKey());
  const freelancerBefore = await xlmBalance(FREELANCER_KP.publicKey());
  ok(`Client balance: ${clientBefore.toFixed(2)} XLM`);
  ok(`Freelancer balance: ${freelancerBefore.toFixed(2)} XLM`);

  // Step 1: Create project
  console.log("\ Step 1: Create project (client → contract)\n");

  const milestones = [
    { title: "Design phase", amount: BigInt(10 * 10_000_000) }, // 10 XLM
    { title: "Implementation", amount: BigInt(15 * 10_000_000) }, // 15 XLM
  ];

  let projectId: number;
  try {
    const titlesVec = xdr.ScVal.scvVec(
      milestones.map((m) => nativeToScVal(m.title, { type: "string" })),
    );
    const amountsVec = xdr.ScVal.scvVec(
      milestones.map((m) => nativeToScVal(m.amount, { type: "i128" })),
    );

    const result = await sendTx(
      CLIENT_KP,
      contract.call(
        "create_project",
        new Address(CLIENT_KP.publicKey()).toScVal(),
        new Address(FREELANCER_KP.publicKey()).toScVal(),
        titlesVec,
        amountsVec,
      ),
    );

    projectId = result.returnValue ? Number(scValToNative(result.returnValue)) : -1;
    ok(`Project created — ID: ${projectId}`);
  } catch (err) {
    fail("create_project succeeded", err);
    process.exit(1);
  }

  // Verify initial state
  try {
    const proj = await readProject(projectId);
    const ms = proj.milestones as Record<string, unknown>[];
    const allPending = ms.every((m) => {
      const s = Array.isArray(m.status) ? m.status[0] : m.status;
      return s === "Pending";
    });
    allPending ? ok("Both milestones start as Pending") : fail("Both milestones start as Pending");
    ok(`Total milestones: ${ms.length}`);
  } catch (err) {
    fail("Read initial project state", err);
  }

  // Step 2: Fund milestone 0
  console.log("\ Step 2: Client funds Milestone 1 (escrow)\n");

  try {
    await sendTx(
      CLIENT_KP,
      contract.call(
        "fund_milestone",
        nativeToScVal(BigInt(projectId), { type: "u64" }),
        nativeToScVal(0, { type: "u32" }),
        new Address(XLM_TOKEN).toScVal(),
      ),
    );
    ok("fund_milestone (index 0) submitted");

    const proj = await readProject(projectId);
    const m0 = (proj.milestones as Record<string, unknown>[])[0];
    const status = Array.isArray(m0.status) ? m0.status[0] : m0.status;
    status === "Funded"
      ? ok("Milestone 1 status → Funded")
      : fail(`Milestone 1 status → Funded (got ${status})`);

    const clientAfterFund = await xlmBalance(CLIENT_KP.publicKey());
    ok(
      `Client balance after funding: ${clientAfterFund.toFixed(2)} XLM (was ${clientBefore.toFixed(2)})`,
    );
  } catch (err) {
    fail("fund_milestone (index 0)", err);
  }

  // Step 3: Mark milestone 0 complete (freelancer)
  console.log("\ Step 3: Freelancer marks Milestone 1 complete\n");

  try {
    await sendTx(
      FREELANCER_KP,
      contract.call(
        "mark_complete",
        new Address(FREELANCER_KP.publicKey()).toScVal(),
        nativeToScVal(BigInt(projectId), { type: "u64" }),
        nativeToScVal(0, { type: "u32" }),
      ),
    );

    const proj = await readProject(projectId);
    const status = (() => {
      const s = (proj.milestones as Record<string, unknown>[])[0].status;
      return Array.isArray(s) ? s[0] : s;
    })();
    status === "Completed"
      ? ok("Milestone 1 status → Completed")
      : fail(`Milestone 1 status → Completed (got ${status})`);
  } catch (err) {
    fail("mark_complete (index 0)", err);
  }

  // Step 4: Approve milestone 0 (client releases XLM)
  console.log("\ Step 4: Client approves & releases Milestone 1\n");

  try {
    await sendTx(
      CLIENT_KP,
      contract.call(
        "approve_milestone",
        nativeToScVal(BigInt(projectId), { type: "u64" }),
        nativeToScVal(0, { type: "u32" }),
        new Address(XLM_TOKEN).toScVal(),
      ),
    );

    const proj = await readProject(projectId);
    const status = (() => {
      const s = (proj.milestones as Record<string, unknown>[])[0].status;
      return Array.isArray(s) ? s[0] : s;
    })();
    status === "Released"
      ? ok("Milestone 1 status → Released")
      : fail(`Milestone 1 status → Released (got ${status})`);

    const freelancerAfterRelease = await xlmBalance(FREELANCER_KP.publicKey());
    freelancerAfterRelease > freelancerBefore
      ? ok(
          `Freelancer received XLM: ${freelancerBefore.toFixed(2)} → ${freelancerAfterRelease.toFixed(2)}`,
        )
      : fail(
          `Freelancer XLM balance increased (before: ${freelancerBefore.toFixed(2)}, after: ${freelancerAfterRelease.toFixed(2)})`,
        );
  } catch (err) {
    fail("approve_milestone (index 0)", err);
  }

  // Step 5: Fund milestone 1, then dispute it
  console.log("\ Step 5: Client funds Milestone 2, freelancer disputes it\n");

  try {
    await sendTx(
      CLIENT_KP,
      contract.call(
        "fund_milestone",
        nativeToScVal(BigInt(projectId), { type: "u64" }),
        nativeToScVal(1, { type: "u32" }),
        new Address(XLM_TOKEN).toScVal(),
      ),
    );
    ok("Milestone 2 funded");

    await sendTx(
      FREELANCER_KP,
      contract.call(
        "dispute_milestone",
        new Address(FREELANCER_KP.publicKey()).toScVal(),
        nativeToScVal(BigInt(projectId), { type: "u64" }),
        nativeToScVal(1, { type: "u32" }),
      ),
    );

    const proj = await readProject(projectId);
    const status = (() => {
      const s = (proj.milestones as Record<string, unknown>[])[1].status;
      return Array.isArray(s) ? s[0] : s;
    })();
    status === "Disputed"
      ? ok("Milestone 2 status → Disputed")
      : fail(`Milestone 2 status → Disputed (got ${status})`);
  } catch (err) {
    fail("fund + dispute_milestone (index 1)", err);
  }

  // Summary
  console.log(`\n${"─".repeat(48)}`);
  console.log(`  Result: ${passed} passed, ${failed} failed`);
  console.log(`${"─".repeat(48)}\n`);

  process.exit(failed > 0 ? 1 : 0);
}

run().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
