use super::helpers::*;
use crate::{MileStackContract, MileStackContractClient, MilestoneStatus};
use soroban_sdk::{testutils::Address as _, token::Client as TokenClient, Address};

fn setup_with_resolver<'a>(
    env: &'a soroban_sdk::Env,
) -> (MileStackContractClient<'a>, Address, Address, Address) {
    let contract = register(env);
    let resolver = Address::generate(env);
    contract.initialize(&resolver);
    let client_addr = Address::generate(env);
    let freelancer = Address::generate(env);
    (contract, resolver, client_addr, freelancer)
}

#[test]
fn test_initialize_sets_resolver() {
    let env = make_env();
    env.mock_all_auths();

    let contract = register(&env);
    let resolver = Address::generate(&env);
    contract.initialize(&resolver);

    // Verify resolver is stored - attempt to re-initialize should panic
    let result = contract.try_initialize(&resolver);
    assert!(result.is_err(), "double initialize must fail");
}

#[test]
#[should_panic(expected = "contract already initialized")]
fn test_initialize_rejects_double_call() {
    let env = make_env();
    env.mock_all_auths();

    let contract = register(&env);
    let resolver = Address::generate(&env);
    contract.initialize(&resolver);
    contract.initialize(&resolver);
}

#[test]
fn test_resolve_dispute_releases_to_freelancer() {
    let env = make_env();
    env.mock_all_auths();

    let (contract, resolver, client_addr, freelancer) = setup_with_resolver(&env);
    let token_admin = Address::generate(&env);

    let milestone_amount = 500_0000000i128;
    let token_address = setup_token(&env, &token_admin, &client_addr, milestone_amount);
    let token_client = TokenClient::new(&env, &token_address);
    let contract_id = contract.address.clone();

    let project_id = funded_project(&env, &contract, &client_addr, &freelancer, &token_address);

    contract.dispute_milestone(&client_addr, &project_id, &0);
    assert!(matches!(
        contract.get_milestone(&project_id, &0).status,
        MilestoneStatus::Disputed
    ));
    assert_eq!(token_client.balance(&contract_id), milestone_amount);

    contract.resolve_dispute(&resolver, &project_id, &0, &token_address, &true);

    assert!(matches!(
        contract.get_milestone(&project_id, &0).status,
        MilestoneStatus::Released
    ));
    assert_eq!(token_client.balance(&contract_id), 0);
    assert_eq!(token_client.balance(&freelancer), milestone_amount);
    assert_eq!(token_client.balance(&client_addr), 0);
}

#[test]
fn test_resolve_dispute_refunds_to_client() {
    let env = make_env();
    env.mock_all_auths();

    let (contract, resolver, client_addr, freelancer) = setup_with_resolver(&env);
    let token_admin = Address::generate(&env);

    let milestone_amount = 500_0000000i128;
    let token_address = setup_token(&env, &token_admin, &client_addr, milestone_amount);
    let token_client = TokenClient::new(&env, &token_address);
    let contract_id = contract.address.clone();

    let project_id = funded_project(&env, &contract, &client_addr, &freelancer, &token_address);

    contract.dispute_milestone(&client_addr, &project_id, &0);

    contract.resolve_dispute(&resolver, &project_id, &0, &token_address, &false);

    assert!(matches!(
        contract.get_milestone(&project_id, &0).status,
        MilestoneStatus::Released
    ));
    assert_eq!(token_client.balance(&contract_id), 0);
    assert_eq!(token_client.balance(&client_addr), milestone_amount);
    assert_eq!(token_client.balance(&freelancer), 0);
}

#[test]
fn test_resolve_dispute_records_resolver_auth() {
    let env = make_env();
    env.mock_all_auths();

    let (contract, resolver, client_addr, freelancer) = setup_with_resolver(&env);
    let token_admin = Address::generate(&env);

    let token_address = setup_token(&env, &token_admin, &client_addr, 500_0000000);
    let project_id = funded_project(&env, &contract, &client_addr, &freelancer, &token_address);
    contract.dispute_milestone(&client_addr, &project_id, &0);

    contract.resolve_dispute(&resolver, &project_id, &0, &token_address, &true);

    let auths = env.auths();
    let resolver_auth_found = auths.iter().any(|(addr, _)| *addr == resolver);
    assert!(resolver_auth_found, "resolver address was not recorded as an auth requirement");
}

#[test]
#[should_panic(expected = "only the resolver can resolve disputes")]
fn test_resolve_dispute_rejects_non_resolver_caller() {
    let env = make_env();
    env.mock_all_auths();

    let (contract, _, client_addr, freelancer) = setup_with_resolver(&env);
    let token_admin = Address::generate(&env);
    let impostor = Address::generate(&env);

    let token_address = setup_token(&env, &token_admin, &client_addr, 500_0000000);
    let project_id = funded_project(&env, &contract, &client_addr, &freelancer, &token_address);
    contract.dispute_milestone(&client_addr, &project_id, &0);

    contract.resolve_dispute(&impostor, &project_id, &0, &token_address, &true);
}

#[test]
#[should_panic(expected = "milestone must be Disputed to resolve")]
fn test_resolve_dispute_rejects_funded_milestone() {
    let env = make_env();
    env.mock_all_auths();

    let (contract, resolver, client_addr, freelancer) = setup_with_resolver(&env);
    let token_admin = Address::generate(&env);

    let token_address = setup_token(&env, &token_admin, &client_addr, 500_0000000);
    let project_id = funded_project(&env, &contract, &client_addr, &freelancer, &token_address);

    contract.resolve_dispute(&resolver, &project_id, &0, &token_address, &true);
}

#[test]
fn test_resolve_dispute_only_resolver_auth_required() {
    let env = make_env();
    let contract_id_addr = env.register(MileStackContract, ());
    let contract = MileStackContractClient::new(&env, &contract_id_addr);

    let client_addr = Address::generate(&env);
    let freelancer = Address::generate(&env);
    let resolver = Address::generate(&env);
    let dummy_token = Address::generate(&env);

    {
        env.mock_all_auths();
        contract.initialize(&resolver);
    }

    seed_project_in_storage(&env, &contract_id_addr, &client_addr, &freelancer, MilestoneStatus::Disputed);

    let result = contract.try_resolve_dispute(&resolver, &1u64, &0u32, &dummy_token, &true);
    assert!(result.is_err(), "resolve_dispute must fail when resolver auth is not provided");
}
