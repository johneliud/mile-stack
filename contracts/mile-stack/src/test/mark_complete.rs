use super::helpers::*;
use crate::{MileStackContract, MileStackContractClient, MilestoneStatus};
use soroban_sdk::{testutils::Address as _, Address};

#[test]
fn test_mark_complete_updates_status_to_completed() {
    let env = make_env();
    env.mock_all_auths();

    let contract = register(&env);
    let client_addr = Address::generate(&env);
    let freelancer = Address::generate(&env);
    let token_admin = Address::generate(&env);

    let token_address = setup_token(&env, &token_admin, &client_addr, 500_0000000);
    let project_id = create_demo_project(&env, &contract, &client_addr, &freelancer);

    contract.fund_milestone(&project_id, &0, &token_address);
    assert!(matches!(
        contract.get_milestone(&project_id, &0).status,
        MilestoneStatus::Funded
    ));

    contract.mark_complete(&freelancer, &project_id, &0);
    assert!(matches!(
        contract.get_milestone(&project_id, &0).status,
        MilestoneStatus::Completed
    ));
}

#[test]
fn test_mark_complete_does_not_affect_other_milestones() {
    let env = make_env();
    env.mock_all_auths();

    let contract = register(&env);
    let client_addr = Address::generate(&env);
    let freelancer = Address::generate(&env);
    let token_admin = Address::generate(&env);

    let token_address = setup_token(&env, &token_admin, &client_addr, 500_0000000);
    let project_id = create_demo_project(&env, &contract, &client_addr, &freelancer);

    contract.fund_milestone(&project_id, &0, &token_address);
    contract.mark_complete(&freelancer, &project_id, &0);

    assert!(matches!(
        contract.get_milestone(&project_id, &1).status,
        MilestoneStatus::Pending
    ));
}

#[test]
fn test_mark_complete_records_freelancer_auth() {
    let env = make_env();
    env.mock_all_auths();

    let contract = register(&env);
    let client_addr = Address::generate(&env);
    let freelancer = Address::generate(&env);
    let token_admin = Address::generate(&env);

    let token_address = setup_token(&env, &token_admin, &client_addr, 500_0000000);
    let project_id = create_demo_project(&env, &contract, &client_addr, &freelancer);

    contract.fund_milestone(&project_id, &0, &token_address);
    contract.mark_complete(&freelancer, &project_id, &0);

    let auths = env.auths();
    let freelancer_auth_found = auths.iter().any(|(addr, _)| *addr == freelancer);
    assert!(freelancer_auth_found, "freelancer address was not recorded as an auth requirement");
}

#[test]
#[should_panic(expected = "milestone must be Funded to mark complete")]
fn test_mark_complete_rejects_pending_milestone() {
    let env = make_env();
    env.mock_all_auths();

    let contract = register(&env);
    let client_addr = Address::generate(&env);
    let freelancer = Address::generate(&env);

    create_demo_project(&env, &contract, &client_addr, &freelancer);

    contract.mark_complete(&freelancer, &1, &0);
}

#[test]
#[should_panic(expected = "only the milestone freelancer can mark it complete")]
fn test_mark_complete_rejects_non_freelancer_caller() {
    let env = make_env();
    env.mock_all_auths();

    let contract = register(&env);
    let client_addr = Address::generate(&env);
    let freelancer = Address::generate(&env);
    let impostor = Address::generate(&env);
    let token_admin = Address::generate(&env);

    let token_address = setup_token(&env, &token_admin, &client_addr, 500_0000000);
    let project_id = create_demo_project(&env, &contract, &client_addr, &freelancer);
    contract.fund_milestone(&project_id, &0, &token_address);

    contract.mark_complete(&impostor, &project_id, &0);
}

#[test]
fn test_only_freelancer_auth_required_for_mark_complete() {
    let env = make_env();
    let contract_id = env.register(MileStackContract, ());
    let contract = MileStackContractClient::new(&env, &contract_id);

    let client_addr = Address::generate(&env);
    let freelancer = Address::generate(&env);

    seed_project_in_storage(&env, &contract_id, &client_addr, &freelancer, MilestoneStatus::Funded);

    let result = contract.try_mark_complete(&freelancer, &1u64, &0u32);
    assert!(result.is_err(), "mark_complete must fail when freelancer auth is not provided");
}
