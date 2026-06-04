# MileStack

> A Soroban-powered talent marketplace enabling developers in the Global South to access global opportunities through milestone-based XLM escrow payments, transparent smart contracts, and borderless financial infrastructure.

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
- [Contributing](#contributing)

---

## Project Structure

```text
.
├── contracts/
│   └── mile-stack/
│       ├── src/
│       │   ├── lib.rs          # Contract entry point & function implementations
│       │   ├── types.rs        # Data types: MilestoneStatus, Milestone, Project, DataKey
│       │   ├── storage.rs      # Storage helpers: load_project, save_project, update_milestone
│       │   └── test/
│       │       ├── mod.rs              # Shared test helpers
│       │       ├── types.rs            # Data structure tests
│       │       ├── create_project.rs   # create_project tests
│       │       ├── fund_milestone.rs   # fund_milestone tests
│       │       ├── approve_milestone.rs
│       │       ├── dispute_milestone.rs
│       │       ├── view_functions.rs
│       │       └── lifecycle.rs        # Auth guards + end-to-end lifecycle test
│       └── Cargo.toml
├── mile-stack-frontend/        # Next.js 16 frontend
├── Cargo.toml
└── README.md
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Smart Contracts | Rust + Soroban SDK 25 |
| Blockchain | Stellar (Testnet) |
| Payments | XLM (native Stellar token) |
| Frontend | Next.js 16, Tailwind CSS v4, TypeScript |
| Wallet | Freighter browser extension |

---

## Prerequisites

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
running 35 tests
test test::approve_milestone::test_approve_milestone_records_client_auth ... ok
test test::approve_milestone::test_approve_milestone_rejects_already_released_milestone ... ok
test test::approve_milestone::test_approve_milestone_rejects_pending_milestone ... ok
test test::approve_milestone::test_approve_milestone_releases_xlm_to_freelancer ... ok
test test::approve_milestone::test_approve_milestone_updates_status_to_released ... ok
test test::create_project::test_create_project_persists_correctly ... ok
test test::create_project::test_create_project_rejects_empty_milestones ... ok
test test::create_project::test_create_project_rejects_mismatched_milestone_lengths ... ok
test test::create_project::test_create_project_requires_client_auth ... ok
test test::create_project::test_create_project_returns_incrementing_ids ... ok
test test::dispute_milestone::test_dispute_milestone_client_can_dispute ... ok
test test::dispute_milestone::test_dispute_milestone_does_not_affect_siblings ... ok
test test::dispute_milestone::test_dispute_milestone_freelancer_can_dispute ... ok
test test::dispute_milestone::test_dispute_milestone_locks_funds_in_contract ... ok
test test::dispute_milestone::test_dispute_milestone_records_caller_auth ... ok
test test::dispute_milestone::test_dispute_milestone_rejects_already_released_milestone ... ok
test test::dispute_milestone::test_dispute_milestone_rejects_pending_milestone ... ok
test test::dispute_milestone::test_dispute_milestone_rejects_unauthorized_caller ... ok
test test::fund_milestone::test_fund_milestone_records_client_auth ... ok
test test::fund_milestone::test_fund_milestone_rejects_already_funded_milestone ... ok
test test::fund_milestone::test_fund_milestone_transfers_xlm_to_contract ... ok
test test::fund_milestone::test_fund_milestone_updates_status_to_funded ... ok
test test::lifecycle::test_full_project_lifecycle ... ok
test test::lifecycle::test_only_client_can_approve ... ok
test test::lifecycle::test_only_client_can_fund ... ok
test test::types::test_initial_project_count_is_zero ... ok
test test::view_functions::test_get_milestone_panics_for_out_of_range_index ... ok
test test::view_functions::test_get_milestone_panics_for_unknown_project ... ok
test test::view_functions::test_get_milestone_returns_correct_fields ... ok
test test::view_functions::test_get_project_count_tracks_multiple_projects ... ok
test test::view_functions::test_get_project_panics_for_unknown_id ... ok
test test::view_functions::test_get_project_returns_correct_fields ... ok
test test::view_functions::test_view_functions_do_not_require_auth ... ok

test result: ok. 35 passed; 0 failed
```

### 4. Build the contract

```bash
cargo build --target wasm32-unknown-unknown --release
```

Output:

```
target/wasm32-unknown-unknown/release/mile_stack.wasm
```

### 5. Deploy to Stellar Testnet

Generate and fund a deployer account:

```bash
stellar keys generate deployer --network testnet
stellar keys fund deployer --network testnet
```

Deploy the contract:

```bash
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/mile_stack.wasm \
  --source deployer \
  --network testnet
```

Copy the contract ID from the output — set it as `NEXT_PUBLIC_CONTRACT_ID` in the frontend.

---

## Smart Contract

### Milestone Lifecycle

```
Pending → Funded → Released
                ↘ Disputed
```

### Data Types

| Type | Description |
|------|-------------|
| `MilestoneStatus` | `Pending` → `Funded` → `Released` or `Disputed` |
| `Milestone` | Title, XLM amount, status, freelancer address |
| `Project` | ID, client address, milestone list, creation timestamp |
| `DataKey` | Storage keys: `Project(id)`, `ProjectCount` |

### Contract Functions

| Function | Auth | Description |
|----------|------|-------------|
| `create_project(client, freelancer, titles, amounts)` | Client | Creates a new escrow project; returns project ID |
| `fund_milestone(project_id, milestone_index, token)` | Client | Locks milestone XLM in contract escrow (must be `Pending`) |
| `approve_milestone(project_id, milestone_index, token)` | Client | Releases escrowed XLM to the freelancer (must be `Funded`) |
| `dispute_milestone(caller, project_id, milestone_index)` | Client or Freelancer | Flags milestone as `Disputed`, funds stay locked |
| `get_project_count()` | None | Returns total number of projects |
| `get_project(project_id)` | None | Fetch a full project by ID |
| `get_milestone(project_id, milestone_index)` | None | Fetch a single milestone |

---

## Frontend Setup

```bash
cd mile-stack-frontend

# Install dependencies (also runs Prettier)
npm install

# Copy environment variables
cp .env.local.example .env.local
# Fill in NEXT_PUBLIC_CONTRACT_ID with the deployed contract address

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

Create `.env.local` inside `mile-stack-frontend/` using `.env.local.example` as a template:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_STELLAR_RPC_URL` | Soroban RPC endpoint (defaults to `https://soroban-testnet.stellar.org`) |
| `NEXT_PUBLIC_CONTRACT_ID` | Deployed MileStack contract ID on testnet |
| `NEXT_PUBLIC_NETWORK_PASSPHRASE` | `Test SDF Network ; September 2015` |

To get the native XLM token contract address on testnet:

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
3. Make your changes and ensure tests pass: `cargo test`
4. Open a PR referencing the issue with `Closes #<issue-number>`
