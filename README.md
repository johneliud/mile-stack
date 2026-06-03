# MileStack

> A Soroban-powered talent marketplace enabling developers in the Global South to access global opportunities through milestone-based escrow payments, transparent smart contracts, and borderless financial infrastructure.

Built on **Stellar** + **Soroban** for the hackathon.

---

## Project Structure

```text
.
├── contracts/
│   └── mile-stack/
│       ├── src/
│       │   ├── lib.rs      # Contract logic & data types
│       │   └── test.rs     # Unit tests
│       └── Cargo.toml
├── Cargo.toml
└── README.md
```

---

## Smart Contract

### Data Types

| Type | Description |
|------|-------------|
| `MilestoneStatus` | `Pending` → `Funded` → `Released` (or `Disputed`) |
| `Milestone` | Title, XLM amount, status, freelancer address |
| `Project` | ID, client address, milestone list, creation timestamp |
| `DataKey` | Storage keys: `Project(id)`, `ProjectCount` |

### Contract Functions

| Function | Description |
|----------|-------------|
| `create_project(env, client, freelancer, titles, amounts)` | Creates a new escrow project; returns the project ID |
| `fund_milestone(env, project_id, milestone_index, token)` | Locks milestone XLM in contract escrow (client only, milestone must be Pending) |
| `get_project_count(env)` | Returns total number of projects created |
| `get_project(env, project_id)` | Fetch a full project by ID |
| `get_milestone(env, project_id, milestone_index)` | Fetch a single milestone |

> Additional functions (`approve_milestone`, `dispute_milestone`) are implemented in subsequent issues.

---

## Prerequisites

- [Rust](https://www.rust-lang.org/tools/install) + `wasm32-unknown-unknown` target
- [Stellar CLI](https://developers.stellar.org/docs/tools/developer-tools/stellar-cli)
- [Node.js](https://nodejs.org/) 18+ (for frontend)
- [Freighter Wallet](https://www.freighter.app/) browser extension

---

## Backend Setup

```bash
# Install wasm target
rustup target add wasm32-unknown-unknown

# Run tests
cargo test

# Build contract
cargo build --target wasm32-unknown-unknown --release

# Deploy to testnet (requires funded account)
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/mile_stack.wasm \
  --network testnet
```

---

## Environment Variables

Copy `.env.example` to `.env.local` in the frontend directory:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_CONTRACT_ID` | Deployed Soroban contract address (testnet) |
| `NEXT_PUBLIC_NETWORK` | `TESTNET` |
| `NEXT_PUBLIC_XLM_TOKEN_ADDRESS` | Native XLM token contract address on testnet |

---

## Deployed Contract

| Network | Contract ID |
|---------|-------------|
| Testnet | _TBD — see issue #8_ |

---

## Tech Stack

- **Blockchain:** Stellar + Soroban smart contracts (Rust)
- **Frontend:** Next.js 14, Tailwind CSS, Freighter wallet
- **Payments:** XLM on Stellar testnet
- **Escrow:** Trustless milestone-based Soroban contract
