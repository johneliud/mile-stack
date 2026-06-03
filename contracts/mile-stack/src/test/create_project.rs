use super::helpers::*;
use crate::MilestoneStatus;
use soroban_sdk::{testutils::Address as _, Address, String};

#[test]
fn test_create_project_returns_incrementing_ids() {
    let env = make_env();
    env.mock_all_auths();

    let contract = register(&env);
    let client_addr = Address::generate(&env);
    let freelancer = Address::generate(&env);

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
    env.mock_all_auths();

    let contract = register(&env);
    let client_addr = Address::generate(&env);
    let freelancer = Address::generate(&env);

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
    env.mock_all_auths();

    let contract = register(&env);
    let client_addr = Address::generate(&env);
    let freelancer = Address::generate(&env);

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
    env.mock_all_auths();

    let contract = register(&env);
    let client_addr = Address::generate(&env);
    let freelancer = Address::generate(&env);

    contract.create_project(
        &client_addr,
        &freelancer,
        &make_titles(&env, &[]),
        &make_amounts(&env, &[]),
    );
}
