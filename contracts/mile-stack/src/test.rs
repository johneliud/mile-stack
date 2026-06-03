#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env, String, Vec};

fn make_env() -> Env {
    Env::default()
}

fn register(env: &Env) -> MileStackContractClient<'_> {
    let id = env.register(MileStackContract, ());
    MileStackContractClient::new(env, &id)
}

// Issue #1 — data structure tests
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

// Issue #2 — create_project tests
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

    // Verify each milestone was stored correctly.
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

    // No mock_all_auths — auth will not be satisfied.
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
