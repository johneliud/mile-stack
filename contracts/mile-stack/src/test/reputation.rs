use super::helpers::*;
use soroban_sdk::{testutils::Address as _, Address};

#[test]
fn test_reputation_starts_at_zero() {
    let env = make_env();
    env.mock_all_auths();

    let contract = register(&env);
    let freelancer = Address::generate(&env);

    assert_eq!(contract.get_reputation(&freelancer), 0);
}

#[test]
fn test_reputation_increments_on_approve_milestone() {
    let env = make_env();
    env.mock_all_auths();

    let contract = register(&env);
    let client_addr = Address::generate(&env);
    let freelancer = Address::generate(&env);
    let token_admin = Address::generate(&env);

    let token_address = setup_token(&env, &token_admin, &client_addr, 500_0000000);
    let project_id = create_demo_project(&env, &contract, &client_addr, &freelancer);

    assert_eq!(contract.get_reputation(&freelancer), 0);

    contract.fund_milestone(&project_id, &0, &token_address);
    contract.mark_complete(&freelancer, &project_id, &0);
    contract.approve_milestone(&project_id, &0, &token_address);

    assert_eq!(contract.get_reputation(&freelancer), 1);
}

#[test]
fn test_reputation_accumulates_across_milestones() {
    let env = make_env();
    env.mock_all_auths();

    let contract = register(&env);
    let client_addr = Address::generate(&env);
    let freelancer = Address::generate(&env);
    let token_admin = Address::generate(&env);

    // Mint enough for both milestones (500 + 1000 stroops-scaled)
    let token_address = setup_token(&env, &token_admin, &client_addr, 1500_0000000);
    let project_id = create_demo_project(&env, &contract, &client_addr, &freelancer);

    contract.fund_milestone(&project_id, &0, &token_address);
    contract.mark_complete(&freelancer, &project_id, &0);
    contract.approve_milestone(&project_id, &0, &token_address);

    assert_eq!(contract.get_reputation(&freelancer), 1);

    contract.fund_milestone(&project_id, &1, &token_address);
    contract.mark_complete(&freelancer, &project_id, &1);
    contract.approve_milestone(&project_id, &1, &token_address);

    assert_eq!(contract.get_reputation(&freelancer), 2);
}

#[test]
fn test_reputation_is_per_freelancer() {
    let env = make_env();
    env.mock_all_auths();

    let contract = register(&env);
    let client_addr = Address::generate(&env);
    let freelancer_a = Address::generate(&env);
    let freelancer_b = Address::generate(&env);
    let token_admin = Address::generate(&env);

    // 500 (project_a m0) + 500 (project_b m0) + 1000 (project_b m1) = 2000 XLM
    let token_address = setup_token(&env, &token_admin, &client_addr, 2000_0000000);

    // Project 1: freelancer_a
    let project_a = create_demo_project(&env, &contract, &client_addr, &freelancer_a);
    contract.fund_milestone(&project_a, &0, &token_address);
    contract.mark_complete(&freelancer_a, &project_a, &0);
    contract.approve_milestone(&project_a, &0, &token_address);

    // Project 2: freelancer_b
    let project_b = create_demo_project(&env, &contract, &client_addr, &freelancer_b);
    contract.fund_milestone(&project_b, &0, &token_address);
    contract.mark_complete(&freelancer_b, &project_b, &0);
    contract.approve_milestone(&project_b, &0, &token_address);
    contract.fund_milestone(&project_b, &1, &token_address);
    contract.mark_complete(&freelancer_b, &project_b, &1);
    contract.approve_milestone(&project_b, &1, &token_address);

    assert_eq!(contract.get_reputation(&freelancer_a), 1);
    assert_eq!(contract.get_reputation(&freelancer_b), 2);
}

