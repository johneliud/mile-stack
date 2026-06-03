#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, log, Address, Env, String, Vec};

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
        // Only the declared client may create on their behalf.
        client.require_auth();

        let title_count = milestone_titles.len();
        let amount_count = milestone_amounts.len();
        assert!(
            title_count > 0 && title_count == amount_count,
            "milestone titles and amounts must be non-empty and equal in length"
        );

        // Assign a unique ID using a persistent counter.
        let project_id: u64 = env
            .storage()
            .instance()
            .get(&DataKey::ProjectCount)
            .unwrap_or(0u64)
            + 1;

        // Build milestone list.
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

        env.storage()
            .instance()
            .set(&DataKey::Project(project_id), &project);
        env.storage()
            .instance()
            .set(&DataKey::ProjectCount, &project_id);

        log!(&env, "ProjectCreated: id={}, client={}", project_id, client);

        project_id
    }

    pub fn get_project_count(env: Env) -> u64 {
        env.storage()
            .instance()
            .get(&DataKey::ProjectCount)
            .unwrap_or(0u64)
    }

    pub fn get_project(env: Env, project_id: u64) -> Project {
        env.storage()
            .instance()
            .get(&DataKey::Project(project_id))
            .expect("project not found")
    }

    pub fn get_milestone(env: Env, project_id: u64, milestone_index: u32) -> Milestone {
        let project = Self::get_project(env.clone(), project_id);
        project
            .milestones
            .get(milestone_index)
            .expect("milestone index out of range")
    }
}

mod test;
