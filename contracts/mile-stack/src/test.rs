#![cfg(test)]

use super::*;
use soroban_sdk::{
    testutils::Address as _,
    token::{Client as TokenClient, StellarAssetClient},
    Address, Env, String, Vec,
};

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

fn make_env() -> Env {
    Env::default()
}

fn register(env: &Env) -> MileStackContractClient<'_> {
    let id = env.register(MileStackContract, ());
    MileStackContractClient::new(env, &id)
}

fn make_titles(env: &Env, names: &[&str]) -> Vec<String> {
    let mut v = Vec::new(env);
    for name in names {
        v.push_back(String::from_str(env, name));
    }
    v
}

fn make_amounts(env: &Env, amounts: &[i128]) -> Vec<i128> {
    let mut v = Vec::new(env);
    for a in amounts {
        v.push_back(*a);
    }
    v
}

/// Deploy a test XLM token, mint `amount` to `recipient`, and return the token address.
fn setup_token(env: &Env, admin: &Address, recipient: &Address, amount: i128) -> Address {
    let token_address = env.register_stellar_asset_contract_v2(admin.clone()).address();
    StellarAssetClient::new(env, &token_address).mint(recipient, &amount);
    token_address
}

// ---------------------------------------------------------------------------
// Issue #1 — data structure tests
// ---------------------------------------------------------------------------

#[test]
fn test_initial_project_count_is_zero() {
    let env = make_env();
    let client = register(&env);
    assert_eq!(client.get_project_count(), 0u64);
}

#[test]
fn test_project_and_milestone_structs_are_well_formed() {
    let env = make_env();
    let freelancer = Address::generate(&env);
    let client_addr = Address::generate(&env);

    let milestone = Milestone {
        title: String::from_str(&env, "UI Design"),
        amount: 500_000_000i128,
        status: MilestoneStatus::Pending,
        freelancer: freelancer.clone(),
    };

    let mut milestones = Vec::new(&env);
    milestones.push_back(milestone.clone());

    let project = Project {
        id: 1,
        client: client_addr.clone(),
        milestones: milestones.clone(),
        created_at: 0,
    };

    assert_eq!(project.id, 1);
    assert_eq!(project.client, client_addr);
    assert_eq!(project.milestones.len(), 1);

    let m = project.milestones.get(0).unwrap();
    assert_eq!(m.title, String::from_str(&env, "UI Design"));
    assert_eq!(m.amount, 500_000_000i128);
    assert!(matches!(m.status, MilestoneStatus::Pending));
    assert_eq!(m.freelancer, freelancer);
}

#[test]
fn test_milestone_status_variants() {
    assert!(matches!(MilestoneStatus::Pending, MilestoneStatus::Pending));
    assert!(!matches!(MilestoneStatus::Pending, MilestoneStatus::Funded));
    assert!(!matches!(MilestoneStatus::Funded, MilestoneStatus::Released));
    assert!(matches!(MilestoneStatus::Disputed, MilestoneStatus::Disputed));
}

// ---------------------------------------------------------------------------
// Issue #2 — create_project tests
// ---------------------------------------------------------------------------

#[test]
fn test_create_project_returns_incrementing_ids() {
    let env = make_env();
    let contract = register(&env);
    let client_addr = Address::generate(&env);
    let freelancer = Address::generate(&env);

    env.mock_all_auths();

    let id1 = contract.create_project(
        &client_addr,
        &freelancer,
        &make_titles(&env, &["Design"]),
        &make_amounts(&env, &[500_0000000]),
    );
    let id2 = contract.create_project(
        &client_addr,
        &freelancer,
        &make_titles(&env, &["Dev"]),
        &make_amounts(&env, &[1000_0000000]),
    );

    assert_eq!(id1, 1);
    assert_eq!(id2, 2);
    assert_eq!(contract.get_project_count(), 2);
}

#[test]
fn test_create_project_persists_correctly() {
    let env = make_env();
    let contract = register(&env);
    let client_addr = Address::generate(&env);
    let freelancer = Address::generate(&env);

    env.mock_all_auths();

    let titles = make_titles(&env, &["UI Design", "Frontend Dev", "Backend Integration"]);
    let amounts = make_amounts(&env, &[500_0000000, 1000_0000000, 1500_0000000]);

    let project_id = contract.create_project(&client_addr, &freelancer, &titles, &amounts);
    let project = contract.get_project(&project_id);

    assert_eq!(project.id, project_id);
    assert_eq!(project.client, client_addr);
    assert_eq!(project.milestones.len(), 3);

    let m0 = contract.get_milestone(&project_id, &0);
    assert_eq!(m0.title, String::from_str(&env, "UI Design"));
    assert_eq!(m0.amount, 500_0000000);
    assert!(matches!(m0.status, MilestoneStatus::Pending));
    assert_eq!(m0.freelancer, freelancer);

    let m2 = contract.get_milestone(&project_id, &2);
    assert_eq!(m2.title, String::from_str(&env, "Backend Integration"));
    assert_eq!(m2.amount, 1500_0000000);
}

#[test]
fn test_create_project_requires_client_auth() {
    let env = make_env();
    let contract = register(&env);
    let client_addr = Address::generate(&env);
    let freelancer = Address::generate(&env);

    let result = contract.try_create_project(
        &client_addr,
        &freelancer,
        &make_titles(&env, &["Task"]),
        &make_amounts(&env, &[100_0000000]),
    );

    assert!(result.is_err());
}

#[test]
#[should_panic(expected = "milestone titles and amounts must be non-empty and equal in length")]
fn test_create_project_rejects_mismatched_milestone_lengths() {
    let env = make_env();
    let contract = register(&env);
    let client_addr = Address::generate(&env);
    let freelancer = Address::generate(&env);

    env.mock_all_auths();

    contract.create_project(
        &client_addr,
        &freelancer,
        &make_titles(&env, &["Only Title"]),
        &make_amounts(&env, &[]),
    );
}

#[test]
#[should_panic(expected = "milestone titles and amounts must be non-empty and equal in length")]
fn test_create_project_rejects_empty_milestones() {
    let env = make_env();
    let contract = register(&env);
    let client_addr = Address::generate(&env);
    let freelancer = Address::generate(&env);

    env.mock_all_auths();

    contract.create_project(
        &client_addr,
        &freelancer,
        &make_titles(&env, &[]),
        &make_amounts(&env, &[]),
    );
}

// ---------------------------------------------------------------------------
// Issue #3 — fund_milestone tests
// ---------------------------------------------------------------------------

fn create_demo_project(
    env: &Env,
    contract: &MileStackContractClient,
    client_addr: &Address,
    freelancer: &Address,
) -> u64 {
    contract.create_project(
        client_addr,
        freelancer,
        &make_titles(env, &["UI Design", "Frontend Dev"]),
        &make_amounts(env, &[500_0000000, 1000_0000000]),
    )
}

#[test]
fn test_fund_milestone_transfers_xlm_to_contract() {
    let env = make_env();
    // mock_all_auths must come before any auth-gated call, including token mint.
    env.mock_all_auths();

    let contract = register(&env);
    let client_addr = Address::generate(&env);
    let freelancer = Address::generate(&env);
    let token_admin = Address::generate(&env);

    let milestone_amount = 500_0000000i128;
    let token_address = setup_token(&env, &token_admin, &client_addr, milestone_amount);
    let project_id = create_demo_project(&env, &contract, &client_addr, &freelancer);

    let token_client = TokenClient::new(&env, &token_address);
    let contract_id = contract.address.clone();

    assert_eq!(token_client.balance(&client_addr), milestone_amount);
    assert_eq!(token_client.balance(&contract_id), 0);

    contract.fund_milestone(&project_id, &0, &token_address);

    assert_eq!(token_client.balance(&client_addr), 0);
    assert_eq!(token_client.balance(&contract_id), milestone_amount);
}

#[test]
fn test_fund_milestone_updates_status_to_funded() {
    let env = make_env();
    env.mock_all_auths();

    let contract = register(&env);
    let client_addr = Address::generate(&env);
    let freelancer = Address::generate(&env);
    let token_admin = Address::generate(&env);

    let token_address = setup_token(&env, &token_admin, &client_addr, 500_0000000);
    let project_id = create_demo_project(&env, &contract, &client_addr, &freelancer);

    assert!(matches!(
        contract.get_milestone(&project_id, &0).status,
        MilestoneStatus::Pending
    ));

    contract.fund_milestone(&project_id, &0, &token_address);

    assert!(matches!(
        contract.get_milestone(&project_id, &0).status,
        MilestoneStatus::Funded
    ));
    // Sibling milestone must remain untouched.
    assert!(matches!(
        contract.get_milestone(&project_id, &1).status,
        MilestoneStatus::Pending
    ));
}

#[test]
fn test_fund_milestone_records_client_auth() {
    // Verify that fund_milestone requires the project client's authorization
    // by inspecting the auth invocations recorded by mock_all_auths.
    let env = make_env();
    env.mock_all_auths();

    let contract = register(&env);
    let client_addr = Address::generate(&env);
    let freelancer = Address::generate(&env);
    let token_admin = Address::generate(&env);

    let token_address = setup_token(&env, &token_admin, &client_addr, 500_0000000);
    let project_id = create_demo_project(&env, &contract, &client_addr, &freelancer);

    contract.fund_milestone(&project_id, &0, &token_address);

    // env.auths() returns every (authorizer, invocation) pair that was checked.
    let auths = env.auths();
    let client_auth_found = auths.iter().any(|(addr, _)| *addr == client_addr);
    assert!(client_auth_found, "client address was not recorded as an auth requirement");
}

#[test]
#[should_panic(expected = "milestone must be Pending to fund")]
fn test_fund_milestone_rejects_already_funded_milestone() {
    let env = make_env();
    env.mock_all_auths();

    let contract = register(&env);
    let client_addr = Address::generate(&env);
    let freelancer = Address::generate(&env);
    let token_admin = Address::generate(&env);

    // Mint enough for two funding attempts so balance isn't the bottleneck.
    let token_address = setup_token(&env, &token_admin, &client_addr, 1000_0000000);
    let project_id = create_demo_project(&env, &contract, &client_addr, &freelancer);

    contract.fund_milestone(&project_id, &0, &token_address);
    // Second call on the same (now Funded) milestone must panic with our guard message.
    contract.fund_milestone(&project_id, &0, &token_address);
}
