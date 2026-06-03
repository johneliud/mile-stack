use super::helpers::*;
use crate::MilestoneStatus;
use soroban_sdk::{testutils::Address as _, token::Client as TokenClient, Address};

#[test]
fn test_approve_milestone_releases_xlm_to_freelancer() {
    let env = make_env();
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

    contract.fund_milestone(&project_id, &0, &token_address);

    assert_eq!(token_client.balance(&contract_id), milestone_amount);
    assert_eq!(token_client.balance(&freelancer), 0);

    contract.approve_milestone(&project_id, &0, &token_address);

    assert_eq!(token_client.balance(&contract_id), 0);
    assert_eq!(token_client.balance(&freelancer), milestone_amount);
}

#[test]
fn test_approve_milestone_updates_status_to_released() {
    let env = make_env();
    env.mock_all_auths();

    let contract = register(&env);
    let client_addr = Address::generate(&env);
    let freelancer = Address::generate(&env);
    let token_admin = Address::generate(&env);

    let token_address = setup_token(&env, &token_admin, &client_addr, 500_0000000);
    let project_id = create_demo_project(&env, &contract, &client_addr, &freelancer);

    contract.fund_milestone(&project_id, &0, &token_address);
    contract.approve_milestone(&project_id, &0, &token_address);

    assert!(matches!(
        contract.get_milestone(&project_id, &0).status,
        MilestoneStatus::Released
    ));
    assert!(matches!(
        contract.get_milestone(&project_id, &1).status,
        MilestoneStatus::Pending
    ));
}

#[test]
fn test_approve_milestone_records_client_auth() {
    let env = make_env();
    env.mock_all_auths();

    let contract = register(&env);
    let client_addr = Address::generate(&env);
    let freelancer = Address::generate(&env);
    let token_admin = Address::generate(&env);

    let token_address = setup_token(&env, &token_admin, &client_addr, 500_0000000);
    let project_id = create_demo_project(&env, &contract, &client_addr, &freelancer);

    contract.fund_milestone(&project_id, &0, &token_address);
    contract.approve_milestone(&project_id, &0, &token_address);

    let auths = env.auths();
    let client_auth_found = auths.iter().any(|(addr, _)| *addr == client_addr);
    assert!(client_auth_found, "client address was not recorded as an auth requirement");
}

#[test]
#[should_panic(expected = "milestone must be Funded to approve")]
fn test_approve_milestone_rejects_pending_milestone() {
    let env = make_env();
    env.mock_all_auths();

    let contract = register(&env);
    let client_addr = Address::generate(&env);
    let freelancer = Address::generate(&env);
    let token_admin = Address::generate(&env);

    let token_address = setup_token(&env, &token_admin, &client_addr, 500_0000000);
    let project_id = create_demo_project(&env, &contract, &client_addr, &freelancer);

    contract.approve_milestone(&project_id, &0, &token_address);
}

#[test]
#[should_panic(expected = "milestone must be Funded to approve")]
fn test_approve_milestone_rejects_already_released_milestone() {
    let env = make_env();
    env.mock_all_auths();

    let contract = register(&env);
    let client_addr = Address::generate(&env);
    let freelancer = Address::generate(&env);
    let token_admin = Address::generate(&env);

    let token_address = setup_token(&env, &token_admin, &client_addr, 500_0000000);
    let project_id = create_demo_project(&env, &contract, &client_addr, &freelancer);

    contract.fund_milestone(&project_id, &0, &token_address);
    contract.approve_milestone(&project_id, &0, &token_address);
    contract.approve_milestone(&project_id, &0, &token_address);
}
