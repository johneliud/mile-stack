#![cfg(test)]

mod approve_milestone;
mod create_project;
mod dispute_milestone;
mod fund_milestone;
mod lifecycle;
mod mark_complete;
mod types;
mod view_functions;

// Shared test helpers — available to all submodules via `use super::helpers::*`
pub mod helpers {
    use crate::{MileStackContract, MileStackContractClient, MilestoneStatus, Milestone, Project, DataKey};
    use soroban_sdk::{
        token::StellarAssetClient,
        Address, Env, String, Vec,
    };

    pub fn make_env() -> Env {
        Env::default()
    }

    pub fn register(env: &Env) -> MileStackContractClient<'_> {
        let id = env.register(MileStackContract, ());
        MileStackContractClient::new(env, &id)
    }

    pub fn make_titles(env: &Env, names: &[&str]) -> Vec<String> {
        let mut v = Vec::new(env);
        for name in names {
            v.push_back(String::from_str(env, name));
        }
        v
    }

    pub fn make_amounts(env: &Env, amounts: &[i128]) -> Vec<i128> {
        let mut v = Vec::new(env);
        for a in amounts {
            v.push_back(*a);
        }
        v
    }

    /// Deploy a test XLM token, mint `amount` to `recipient`, and return the token address.
    pub fn setup_token(env: &Env, admin: &Address, recipient: &Address, amount: i128) -> Address {
        let token_address = env.register_stellar_asset_contract_v2(admin.clone()).address();
        StellarAssetClient::new(env, &token_address).mint(recipient, &amount);
        token_address
    }

    /// Create a two-milestone demo project (UI Design + Frontend Dev).
    pub fn create_demo_project(
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

    /// Create + fund milestone 0 of a demo project, returning the project ID.
    pub fn funded_project(
        env: &Env,
        contract: &MileStackContractClient,
        client_addr: &Address,
        freelancer: &Address,
        token_address: &Address,
    ) -> u64 {
        let project_id = create_demo_project(env, contract, client_addr, freelancer);
        contract.fund_milestone(&project_id, &0, token_address);
        project_id
    }

    /// Write a project directly into contract storage, bypassing `create_project`'s
    /// auth requirement. Used to test auth guards without `mock_all_auths`.
    pub fn seed_project_in_storage(
        env: &Env,
        contract_id: &Address,
        client_addr: &Address,
        freelancer: &Address,
        milestone_status: MilestoneStatus,
    ) {
        let mut milestones = Vec::new(env);
        milestones.push_back(Milestone {
            title: String::from_str(env, "Seeded Task"),
            amount: 100_0000000i128,
            status: milestone_status,
            freelancer: freelancer.clone(),
        });
        let project = Project {
            id: 1,
            client: client_addr.clone(),
            milestones,
            created_at: 0,
        };
        env.as_contract(contract_id, || {
            env.storage().instance().set(&DataKey::ProjectCount, &1u64);
            env.storage().instance().set(&DataKey::Project(1u64), &project);
        });
    }
}
