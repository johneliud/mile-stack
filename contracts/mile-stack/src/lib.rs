#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String, Vec};

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
