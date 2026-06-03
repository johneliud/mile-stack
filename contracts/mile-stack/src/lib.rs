#![no_std]

mod storage;
mod types;

use soroban_sdk::{contract, contractimpl, log, token, Address, Env, String, Vec};

use storage::{load_project, save_project, update_milestone};
use types::{DataKey, Milestone, MilestoneStatus, Project};

#[contract]
pub struct MileStackContract;

#[contractimpl]
impl MileStackContract {
    /// Initialise a new escrow project with a list of milestones.
    /// Returns the newly assigned project ID.
    pub fn create_project(
        env: Env,
        client: Address,
        freelancer: Address,
        milestone_titles: Vec<String>,
        milestone_amounts: Vec<i128>,
    ) -> u64 {
        client.require_auth();

        let title_count = milestone_titles.len();
        let amount_count = milestone_amounts.len();
        assert!(
            title_count > 0 && title_count == amount_count,
            "milestone titles and amounts must be non-empty and equal in length"
        );

        let project_id: u64 = env
            .storage()
            .instance()
            .get(&DataKey::ProjectCount)
            .unwrap_or(0u64)
            + 1;

        let mut milestones: Vec<Milestone> = Vec::new(&env);
        for i in 0..title_count {
            milestones.push_back(Milestone {
                title: milestone_titles.get(i).unwrap(),
                amount: milestone_amounts.get(i).unwrap(),
                status: MilestoneStatus::Pending,
                freelancer: freelancer.clone(),
            });
        }

        let project = Project {
            id: project_id,
            client: client.clone(),
            milestones,
            created_at: env.ledger().timestamp(),
        };

        save_project(&env, &project);
        env.storage()
            .instance()
            .set(&DataKey::ProjectCount, &project_id);

        log!(&env, "ProjectCreated: id={}, client={}", project_id, client);

        project_id
    }

    /// Lock the milestone's XLM amount in the contract escrow.
    /// Only the project client may call this. Milestone must be Pending.
    pub fn fund_milestone(
        env: Env,
        project_id: u64,
        milestone_index: u32,
        token_address: Address,
    ) -> bool {
        let project = load_project(&env, project_id);

        project.client.require_auth();

        let milestone = project
            .milestones
            .get(milestone_index)
            .expect("milestone index out of range");

        assert!(
            matches!(milestone.status, MilestoneStatus::Pending),
            "milestone must be Pending to fund"
        );

        token::Client::new(&env, &token_address).transfer(
            &project.client,
            &env.current_contract_address(),
            &milestone.amount,
        );

        let updated = Milestone {
            status: MilestoneStatus::Funded,
            ..milestone
        };
        let project = update_milestone(&env, project, milestone_index, updated);
        save_project(&env, &project);

        log!(
            &env,
            "MilestoneFunded: project_id={}, milestone_index={}",
            project_id,
            milestone_index
        );

        true
    }

    /// Release escrowed XLM to the freelancer.
    /// Only the project client may call this. Milestone must be Funded.
    pub fn approve_milestone(
        env: Env,
        project_id: u64,
        milestone_index: u32,
        token_address: Address,
    ) -> bool {
        let project = load_project(&env, project_id);

        project.client.require_auth();

        let milestone = project
            .milestones
            .get(milestone_index)
            .expect("milestone index out of range");

        assert!(
            matches!(milestone.status, MilestoneStatus::Funded),
            "milestone must be Funded to approve"
        );

        // Release escrowed XLM from the contract to the freelancer.
        token::Client::new(&env, &token_address).transfer(
            &env.current_contract_address(),
            &milestone.freelancer,
            &milestone.amount,
        );

        let updated = Milestone {
            status: MilestoneStatus::Released,
            ..milestone
        };
        let project = update_milestone(&env, project, milestone_index, updated);
        save_project(&env, &project);

        log!(
            &env,
            "MilestoneReleased: project_id={}, milestone_index={}",
            project_id,
            milestone_index
        );

        true
    }

    pub fn get_project_count(env: Env) -> u64 {
        env.storage()
            .instance()
            .get(&DataKey::ProjectCount)
            .unwrap_or(0u64)
    }

    pub fn get_project(env: Env, project_id: u64) -> Project {
        load_project(&env, project_id)
    }

    pub fn get_milestone(env: Env, project_id: u64, milestone_index: u32) -> Milestone {
        load_project(&env, project_id)
            .milestones
            .get(milestone_index)
            .expect("milestone index out of range")
    }
}

mod test;
