#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, log, token, Address, Env, String, Vec};

// Data types
#[contracttype]
#[derive(Clone, PartialEq)]
pub enum MilestoneStatus {
    Pending,
    Funded,
    Completed,
    Disputed,
    Released,
}

#[contracttype]
#[derive(Clone)]
pub struct Milestone {
    pub title: String,
    pub amount: i128,
    pub status: MilestoneStatus,
    pub freelancer: Address,
}

#[contracttype]
#[derive(Clone)]
pub struct Project {
    pub id: u64,
    pub client: Address,
    pub milestones: Vec<Milestone>,
    pub created_at: u64,
}

// Storage keys
#[contracttype]
pub enum DataKey {
    Project(u64),
    ProjectCount,
}

// Internal helpers
fn load_project(env: &Env, project_id: u64) -> Project {
    env.storage()
        .instance()
        .get(&DataKey::Project(project_id))
        .expect("project not found")
}

fn save_project(env: &Env, project: &Project) {
    env.storage()
        .instance()
        .set(&DataKey::Project(project.id), project);
}

/// Replace the milestone at `index` inside a project and return the updated project.
fn update_milestone(env: &Env, mut project: Project, index: u32, updated: Milestone) -> Project {
    let mut milestones: Vec<Milestone> = Vec::new(env);
    for i in 0..project.milestones.len() {
        if i == index {
            milestones.push_back(updated.clone());
        } else {
            milestones.push_back(project.milestones.get(i).unwrap());
        }
    }
    project.milestones = milestones;
    project
}

// Contract
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

        // Pull funds from the client into this contract.
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
