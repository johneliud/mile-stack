use super::helpers::*;
use crate::MilestoneStatus;
use soroban_sdk::{testutils::Address as _, token::Client as TokenClient, Address};

#[test]
fn test_dispute_milestone_client_can_dispute() {
    let env = make_env();
    env.mock_all_auths();

    let contract = register(&env);
    let client_addr = Address::generate(&env);
    let freelancer = Address::generate(&env);
    let token_admin = Address::generate(&env);

    let token_address = setup_token(&env, &token_admin, &client_addr, 500_0000000);
    let project_id = funded_project(&env, &contract, &client_addr, &freelancer, &token_address);

    contract.dispute_milestone(&client_addr, &project_id, &0);

    assert!(matches!(
        contract.get_milestone(&project_id, &0).status,
        MilestoneStatus::Disputed
    ));
}

#[test]
fn test_dispute_milestone_freelancer_can_dispute() {
    let env = make_env();
    env.mock_all_auths();

    let contract = register(&env);
    let client_addr = Address::generate(&env);
    let freelancer = Address::generate(&env);
    let token_admin = Address::generate(&env);

    let token_address = setup_token(&env, &token_admin, &client_addr, 500_0000000);
    let project_id = funded_project(&env, &contract, &client_addr, &freelancer, &token_address);

    contract.dispute_milestone(&freelancer, &project_id, &0);

    assert!(matches!(
        contract.get_milestone(&project_id, &0).status,
        MilestoneStatus::Disputed
    ));
}

#[test]
fn test_dispute_milestone_locks_funds_in_contract() {
    let env = make_env();
    env.mock_all_auths();

    let contract = register(&env);
    let client_addr = Address::generate(&env);
    let freelancer = Address::generate(&env);
    let token_admin = Address::generate(&env);

    let milestone_amount = 500_0000000i128;
    let token_address = setup_token(&env, &token_admin, &client_addr, milestone_amount);
    let project_id = funded_project(&env, &contract, &client_addr, &freelancer, &token_address);

    let token_client = TokenClient::new(&env, &token_address);
    let contract_id = contract.address.clone();

    assert_eq!(token_client.balance(&contract_id), milestone_amount);

    contract.dispute_milestone(&client_addr, &project_id, &0);

    assert_eq!(token_client.balance(&contract_id), milestone_amount);
    assert_eq!(token_client.balance(&freelancer), 0);
    assert_eq!(token_client.balance(&client_addr), 0);
}

#[test]
fn test_dispute_milestone_does_not_affect_siblings() {
    let env = make_env();
    env.mock_all_auths();

    let contract = register(&env);
    let client_addr = Address::generate(&env);
    let freelancer = Address::generate(&env);
    let token_admin = Address::generate(&env);

    let token_address = setup_token(&env, &token_admin, &client_addr, 500_0000000);
    let project_id = funded_project(&env, &contract, &client_addr, &freelancer, &token_address);

    contract.dispute_milestone(&client_addr, &project_id, &0);

    assert!(matches!(
        contract.get_milestone(&project_id, &0).status,
        MilestoneStatus::Disputed
    ));
    assert!(matches!(
        contract.get_milestone(&project_id, &1).status,
        MilestoneStatus::Pending
    ));
}

#[test]
fn test_dispute_milestone_records_caller_auth() {
    let env = make_env();
    env.mock_all_auths();

    let contract = register(&env);
    let client_addr = Address::generate(&env);
    let freelancer = Address::generate(&env);
    let token_admin = Address::generate(&env);

    let token_address = setup_token(&env, &token_admin, &client_addr, 500_0000000);
    let project_id = funded_project(&env, &contract, &client_addr, &freelancer, &token_address);

    contract.dispute_milestone(&client_addr, &project_id, &0);

    let auths = env.auths();
    let caller_auth_found = auths.iter().any(|(addr, _)| *addr == client_addr);
    assert!(caller_auth_found, "caller auth was not recorded");
}

#[test]
#[should_panic(expected = "only the client or freelancer can dispute a milestone")]
fn test_dispute_milestone_rejects_unauthorized_caller() {
    let env = make_env();
    env.mock_all_auths();

    let contract = register(&env);
    let client_addr = Address::generate(&env);
    let freelancer = Address::generate(&env);
    let token_admin = Address::generate(&env);
    let stranger = Address::generate(&env);

    let token_address = setup_token(&env, &token_admin, &client_addr, 500_0000000);
    let project_id = funded_project(&env, &contract, &client_addr, &freelancer, &token_address);

    contract.dispute_milestone(&stranger, &project_id, &0);
}

#[test]
#[should_panic(expected = "milestone must be Funded to dispute")]
fn test_dispute_milestone_rejects_pending_milestone() {
    let env = make_env();
    env.mock_all_auths();

    let contract = register(&env);
    let client_addr = Address::generate(&env);
    let freelancer = Address::generate(&env);

    let project_id = create_demo_project(&env, &contract, &client_addr, &freelancer);
    contract.dispute_milestone(&client_addr, &project_id, &0);
}

#[test]
#[should_panic(expected = "milestone must be Funded to dispute")]
fn test_dispute_milestone_rejects_already_released_milestone() {
    let env = make_env();
    env.mock_all_auths();

    let contract = register(&env);
    let client_addr = Address::generate(&env);
    let freelancer = Address::generate(&env);
    let token_admin = Address::generate(&env);

    let token_address = setup_token(&env, &token_admin, &client_addr, 500_0000000);
    let project_id = funded_project(&env, &contract, &client_addr, &freelancer, &token_address);

    contract.approve_milestone(&project_id, &0, &token_address);
    contract.dispute_milestone(&client_addr, &project_id, &0);
}
