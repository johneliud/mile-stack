use soroban_sdk::{contracttype, Address, String, Vec};

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

#[contracttype]
pub enum DataKey {
    Project(u64),
    ProjectCount,
    Resolver,
}
