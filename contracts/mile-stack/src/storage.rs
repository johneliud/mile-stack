use soroban_sdk::{Env, Vec};

use crate::types::{DataKey, Milestone, Project};

pub fn load_project(env: &Env, project_id: u64) -> Project {
    env.storage()
        .instance()
        .get(&DataKey::Project(project_id))
        .expect("project not found")
}

pub fn save_project(env: &Env, project: &Project) {
    env.storage()
        .instance()
        .set(&DataKey::Project(project.id), project);
}

/// Rebuild the milestones vec with `updated` swapped in at `index`.
pub fn update_milestone(env: &Env, mut project: Project, index: u32, updated: Milestone) -> Project {
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
