#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env, String, Vec};

fn make_env() -> Env {
    Env::default()
}

fn register(env: &Env) -> MileStackContractClient<'_> {
    let id = env.register(MileStackContract, ());
    MileStackContractClient::new(env, &id)
}

#[test]
fn test_initial_project_count_is_zero() {
    let env = make_env();
    let client = register(&env);
    assert_eq!(client.get_project_count(), 0u64);
}

#[test]
fn test_project_and_milestone_structs_are_well_formed() {
    let env = make_env();
    let freelancer = Address::generate(&env);
    let client_addr = Address::generate(&env);

    let milestone = Milestone {
        title: String::from_str(&env, "UI Design"),
        amount: 500_000_000i128,
        status: MilestoneStatus::Pending,
        freelancer: freelancer.clone(),
    };

    let mut milestones = Vec::new(&env);
    milestones.push_back(milestone.clone());

    let project = Project {
        id: 1,
        client: client_addr.clone(),
        milestones: milestones.clone(),
        created_at: 0,
    };

    assert_eq!(project.id, 1);
    assert_eq!(project.client, client_addr);
    assert_eq!(project.milestones.len(), 1);

    let m = project.milestones.get(0).unwrap();
    assert_eq!(m.title, String::from_str(&env, "UI Design"));
    assert_eq!(m.amount, 500_000_000i128);
    assert!(matches!(m.status, MilestoneStatus::Pending));
    assert_eq!(m.freelancer, freelancer);
}

#[test]
fn test_milestone_status_variants() {
    assert!(matches!(MilestoneStatus::Pending, MilestoneStatus::Pending));
    assert!(!matches!(MilestoneStatus::Pending, MilestoneStatus::Funded));
    assert!(!matches!(MilestoneStatus::Funded, MilestoneStatus::Released));
    assert!(matches!(MilestoneStatus::Disputed, MilestoneStatus::Disputed));
}
