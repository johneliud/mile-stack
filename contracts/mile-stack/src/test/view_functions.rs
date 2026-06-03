use super::helpers::*;
use crate::MilestoneStatus;
use soroban_sdk::{testutils::Address as _, Address, String};

#[test]
fn test_get_project_count_tracks_multiple_projects() {
    let env = make_env();
    env.mock_all_auths();

    let contract = register(&env);
    let client_addr = Address::generate(&env);
    let freelancer = Address::generate(&env);

    assert_eq!(contract.get_project_count(), 0);

    contract.create_project(
        &client_addr,
        &freelancer,
        &make_titles(&env, &["Task A"]),
        &make_amounts(&env, &[100_0000000]),
    );
    assert_eq!(contract.get_project_count(), 1);

    contract.create_project(
        &client_addr,
        &freelancer,
        &make_titles(&env, &["Task B"]),
        &make_amounts(&env, &[200_0000000]),
    );
    assert_eq!(contract.get_project_count(), 2);
}

#[test]
fn test_get_project_returns_correct_fields() {
    let env = make_env();
    env.mock_all_auths();

    let contract = register(&env);
    let client_addr = Address::generate(&env);
    let freelancer = Address::generate(&env);

    let project_id = contract.create_project(
        &client_addr,
        &freelancer,
        &make_titles(&env, &["Design", "Development"]),
        &make_amounts(&env, &[300_0000000, 700_0000000]),
    );

    let project = contract.get_project(&project_id);

    assert_eq!(project.id, project_id);
    assert_eq!(project.client, client_addr);
    assert_eq!(project.milestones.len(), 2);
}

#[test]
fn test_get_milestone_returns_correct_fields() {
    let env = make_env();
    env.mock_all_auths();

    let contract = register(&env);
    let client_addr = Address::generate(&env);
    let freelancer = Address::generate(&env);

    let project_id = contract.create_project(
        &client_addr,
        &freelancer,
        &make_titles(&env, &["Design", "Development"]),
        &make_amounts(&env, &[300_0000000, 700_0000000]),
    );

    let m0 = contract.get_milestone(&project_id, &0);
    assert_eq!(m0.title, String::from_str(&env, "Design"));
    assert_eq!(m0.amount, 300_0000000);
    assert!(matches!(m0.status, MilestoneStatus::Pending));
    assert_eq!(m0.freelancer, freelancer);

    let m1 = contract.get_milestone(&project_id, &1);
    assert_eq!(m1.title, String::from_str(&env, "Development"));
    assert_eq!(m1.amount, 700_0000000);
}

#[test]
fn test_view_functions_do_not_require_auth() {
    let env = make_env();
    env.mock_all_auths();

    let contract = register(&env);
    let client_addr = Address::generate(&env);
    let freelancer = Address::generate(&env);

    let project_id = contract.create_project(
        &client_addr,
        &freelancer,
        &make_titles(&env, &["Task"]),
        &make_amounts(&env, &[100_0000000]),
    );

    contract.get_project_count();
    assert!(env.auths().is_empty(), "get_project_count should not require auth");

    contract.get_project(&project_id);
    assert!(env.auths().is_empty(), "get_project should not require auth");

    contract.get_milestone(&project_id, &0);
    assert!(env.auths().is_empty(), "get_milestone should not require auth");
}

#[test]
#[should_panic(expected = "project not found")]
fn test_get_project_panics_for_unknown_id() {
    let env = make_env();
    let contract = register(&env);
    contract.get_project(&999);
}

#[test]
#[should_panic(expected = "project not found")]
fn test_get_milestone_panics_for_unknown_project() {
    let env = make_env();
    let contract = register(&env);
    contract.get_milestone(&999, &0);
}

#[test]
#[should_panic(expected = "milestone index out of range")]
fn test_get_milestone_panics_for_out_of_range_index() {
    let env = make_env();
    env.mock_all_auths();

    let contract = register(&env);
    let client_addr = Address::generate(&env);
    let freelancer = Address::generate(&env);

    let project_id = contract.create_project(
        &client_addr,
        &freelancer,
        &make_titles(&env, &["Only Milestone"]),
        &make_amounts(&env, &[100_0000000]),
    );

    contract.get_milestone(&project_id, &1);
}
