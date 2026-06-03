# MileStack

> A Soroban-powered talent marketplace enabling developers in the Global South to access global opportunities through milestone-based escrow payments, transparent smart contracts, and borderless financial infrastructure.

Built on **Stellar** + **Soroban** for the hackathon.

---

## Table of Contents

- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Smart Contract](#smart-contract)
- [Frontend Setup](#frontend-setup)
- [Environment Variables](#environment-variables)
- [Deployed Contract](#deployed-contract)

---

## Project Structure

```text
.
├── contracts/
│   └── mile-stack/
│       ├── src/
│       │   ├── lib.rs      # Contract entry point & function implementations
│       │   ├── types.rs    # Data types: MilestoneStatus, Milestone, Project, DataKey
│       │   ├── storage.rs  # Storage helpers: load_project, save_project, update_milestone
│       │   └── test.rs     # Unit tests
│       └── Cargo.toml
├── frontend/               # Next.js app (coming soon)
├── Cargo.toml
└── README.md
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Smart Contracts | Rust + Soroban SDK |
| Blockchain | Stellar (Testnet) |
| Payments | XLM (native Stellar token) |
| Frontend | Next.js 14, Tailwind CSS |
| Wallet | Freighter browser extension |

---

## Prerequisites

Before you begin, ensure you have the following installed:

- [Git](https://git-scm.com/)
- [Rust](https://www.rust-lang.org/tools/install) (stable toolchain)
- [Stellar CLI](https://developers.stellar.org/docs/tools/developer-tools/stellar-cli)
- [Node.js](https://nodejs.org/) 18+
- [Freighter Wallet](https://www.freighter.app/) browser extension (for the demo)

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/johneliud/mile-stack.git
cd mile-stack
```

### 2. Install the Rust WASM target

```bash
rustup target add wasm32-unknown-unknown
```

### 3. Run the contract tests

```bash
cargo test
```

Expected output:

```
running 17 tests
test test::test_approve_milestone_records_client_auth ... ok
test test::test_approve_milestone_rejects_already_released_milestone ... ok
test test::test_approve_milestone_rejects_pending_milestone ... ok
test test::test_approve_milestone_releases_xlm_to_freelancer ... ok
test test::test_approve_milestone_updates_status_to_released ... ok
test test::test_create_project_persists_correctly ... ok
test test::test_create_project_rejects_empty_milestones ... ok
test test::test_create_project_rejects_mismatched_milestone_lengths ... ok
test test::test_create_project_requires_client_auth ... ok
test test::test_create_project_returns_incrementing_ids ... ok
test test::test_fund_milestone_records_client_auth ... ok
test test::test_fund_milestone_rejects_already_funded_milestone ... ok
test test::test_fund_milestone_transfers_xlm_to_contract ... ok
test test::test_fund_milestone_updates_status_to_funded ... ok
test test::test_initial_project_count_is_zero ... ok
test test::test_milestone_status_variants ... ok
test test::test_project_and_milestone_structs_are_well_formed ... ok

test result: ok. 17 passed; 0 failed
```

### 4. Build the contract

```bash
cargo build --target wasm32-unknown-unknown --release
```

The compiled WASM binary is output to:

```
target/wasm32-unknown-unknown/release/mile_stack.wasm
```

### 5. Deploy to Stellar Testnet

First, generate and fund a deployer account using Friendbot:

```bash
stellar keys generate deployer --network testnet
stellar keys fund deployer --network testnet
```

Then deploy the contract:

```bash
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/mile_stack.wasm \
  --source deployer \
  --network testnet
```

Copy the contract ID printed in the output — you'll need it as `NEXT_PUBLIC_CONTRACT_ID` in the frontend.

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
| `approve_milestone(env, project_id, milestone_index, token)` | Releases escrowed XLM to the freelancer (client only, milestone must be Funded) |
| `dispute_milestone(env, caller, project_id, milestone_index)` | Flags a milestone as disputed, locking funds until resolved (client or freelancer) |
| `get_project_count(env)` | Returns total number of projects created |
| `get_project(env, project_id)` | Fetch a full project by ID |
| `get_milestone(env, project_id, milestone_index)` | Fetch a single milestone |

---

## Frontend Setup

> The frontend is under active development. Once the `frontend/` directory is scaffolded (issue #9), follow these steps:

```bash
cd frontend

# Install dependencies
npm install

# Copy and fill in environment variables
cp .env.example .env.local

# Start the development server
npm run dev
```

The app will be available at `http://localhost:3000`.

---

## Environment Variables

Create a `.env.local` file inside the `frontend/` directory using the values below:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_CONTRACT_ID` | Deployed Soroban contract address on testnet |
| `NEXT_PUBLIC_NETWORK` | Set to `TESTNET` |
| `NEXT_PUBLIC_XLM_TOKEN_ADDRESS` | Native XLM token contract address on testnet |

To get the native XLM token contract address:

```bash
stellar contract id asset --asset native --network testnet
```

---

## Deployed Contract

| Network | Contract ID |
|---------|-------------|
| Testnet | _TBD — see issue #8_ |

---

## Contributing

1. Pick an open issue from the [issue tracker](https://github.com/johneliud/mile-stack/issues)
2. Create a branch: `git checkout -b feat/<issue-number>-short-description`
3. Make your changes and ensure `cargo test` passes
4. Open a PR referencing the issue with `Closes #<issue-number>`
