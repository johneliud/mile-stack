use super::helpers::*;
use crate::{MileStackContract, MileStackContractClient, MilestoneStatus};
use soroban_sdk::{testutils::Address as _, token::Client as TokenClient, Address};

#[test]
fn test_only_client_can_fund() {
    // No mock_all_auths - client auth is NOT provided.
    let env = make_env();
    let contract_id = env.register(MileStackContract, ());
    let contract = MileStackContractClient::new(&env, &contract_id);

    let client_addr = Address::generate(&env);
    let freelancer = Address::generate(&env);
    let dummy_token = Address::generate(&env);

    seed_project_in_storage(&env, &contract_id, &client_addr, &freelancer, MilestoneStatus::Pending);

    let result = contract.try_fund_milestone(&1u64, &0u32, &dummy_token);
    assert!(result.is_err(), "fund_milestone must fail when client auth is not provided");
}

#[test]
fn test_only_client_can_approve() {
    // No mock_all_auths - client auth is NOT provided.
    let env = make_env();
    let contract_id = env.register(MileStackContract, ());
    let contract = MileStackContractClient::new(&env, &contract_id);

    let client_addr = Address::generate(&env);
    let freelancer = Address::generate(&env);
    let dummy_token = Address::generate(&env);

    seed_project_in_storage(&env, &contract_id, &client_addr, &freelancer, MilestoneStatus::Completed);

    let result = contract.try_approve_milestone(&1u64, &0u32, &dummy_token);
    assert!(result.is_err(), "approve_milestone must fail when client auth is not provided");
}

#[test]
fn test_full_project_lifecycle() {
    // End-to-end: create → fund m0 → approve m0 → fund m1 → dispute m1.
    let env = make_env();
    env.mock_all_auths();

    let contract = register(&env);
    let client_addr = Address::generate(&env);
    let freelancer = Address::generate(&env);
    let token_admin = Address::generate(&env);

    let m0_amount = 500_0000000i128;
    let m1_amount = 1000_0000000i128;
    let token_address = setup_token(&env, &token_admin, &client_addr, m0_amount + m1_amount);
    let token_client = TokenClient::new(&env, &token_address);
    let contract_id = contract.address.clone();

    // Create
    let project_id = contract.create_project(
        &client_addr,
        &freelancer,
        &make_titles(&env, &["UI Design", "Frontend Dev"]),
        &make_amounts(&env, &[m0_amount, m1_amount]),
    );
    assert_eq!(contract.get_project_count(), 1);
    assert!(matches!(contract.get_milestone(&project_id, &0).status, MilestoneStatus::Pending));
    assert!(matches!(contract.get_milestone(&project_id, &1).status, MilestoneStatus::Pending));

    // Fund milestone 0
    contract.fund_milestone(&project_id, &0, &token_address);
    assert!(matches!(contract.get_milestone(&project_id, &0).status, MilestoneStatus::Funded));
    assert_eq!(token_client.balance(&contract_id), m0_amount);
    assert_eq!(token_client.balance(&client_addr), m1_amount);

    // Freelancer marks milestone 0 complete, then client approves → XLM released
    contract.mark_complete(&freelancer, &project_id, &0);
    assert!(matches!(contract.get_milestone(&project_id, &0).status, MilestoneStatus::Completed));
    contract.approve_milestone(&project_id, &0, &token_address);
    assert!(matches!(contract.get_milestone(&project_id, &0).status, MilestoneStatus::Released));
    assert_eq!(token_client.balance(&freelancer), m0_amount);
    assert_eq!(token_client.balance(&contract_id), 0);

    // Fund milestone 1
    contract.fund_milestone(&project_id, &1, &token_address);
    assert!(matches!(contract.get_milestone(&project_id, &1).status, MilestoneStatus::Funded));
    assert_eq!(token_client.balance(&contract_id), m1_amount);

    // Dispute milestone 1 → funds stay locked
    contract.dispute_milestone(&freelancer, &project_id, &1);
    assert!(matches!(contract.get_milestone(&project_id, &1).status, MilestoneStatus::Disputed));
    assert_eq!(token_client.balance(&contract_id), m1_amount);
    assert_eq!(token_client.balance(&freelancer), m0_amount);
}
