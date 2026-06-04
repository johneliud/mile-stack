import { getSupabaseClient } from "./supabase";
import { createProject } from "./contract";

export interface MilestoneInput {
  title: string;
  amount_xlm: number;
}

export interface Listing {
  id: string;
  client_address: string;
  title: string;
  description: string;
  skills: string[];
  milestones: MilestoneInput[];
  total_xlm: number;
  status: "open" | "filled" | "cancelled";
  on_chain_project_id: number | null;
  created_at: string;
}

export interface Application {
  id: string;
  listing_id: string;
  freelancer_address: string;
  message: string | null;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
}

export async function getOpenListings(): Promise<Listing[]> {
  const sb = getSupabaseClient();
  const { data, error } = await sb
    .from("listings")
    .select("*")
    .eq("status", "open")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Listing[];
}

export async function getListing(id: string): Promise<Listing> {
  const sb = getSupabaseClient();
  const { data, error } = await sb.from("listings").select("*").eq("id", id).single();

  if (error) throw new Error(error.message);
  return data as Listing;
}

export async function getClientListings(clientAddress: string): Promise<Listing[]> {
  const sb = getSupabaseClient();
  const { data, error } = await sb
    .from("listings")
    .select("*")
    .eq("client_address", clientAddress.toLowerCase())
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Listing[];
}

export async function createListing(payload: {
  clientAddress: string;
  title: string;
  description: string;
  skills: string[];
  milestones: MilestoneInput[];
}): Promise<Listing> {
  const sb = getSupabaseClient();
  const totalXlm = payload.milestones.reduce((sum, m) => sum + m.amount_xlm, 0);

  const { data, error } = await sb
    .from("listings")
    .insert({
      client_address: payload.clientAddress.toLowerCase(),
      title: payload.title,
      description: payload.description,
      skills: payload.skills,
      milestones: payload.milestones,
      total_xlm: totalXlm,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Listing;
}

export async function getApplications(listingId: string): Promise<Application[]> {
  const sb = getSupabaseClient();
  const { data, error } = await sb
    .from("applications")
    .select("*")
    .eq("listing_id", listingId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as Application[];
}

export async function getApplicationCount(listingId: string): Promise<number> {
  const sb = getSupabaseClient();
  const { count, error } = await sb
    .from("applications")
    .select("*", { count: "exact", head: true })
    .eq("listing_id", listingId);

  if (error) throw new Error(error.message);
  return count ?? 0;
}

export async function hasApplied(listingId: string, freelancerAddress: string): Promise<boolean> {
  const sb = getSupabaseClient();
  const { count, error } = await sb
    .from("applications")
    .select("*", { count: "exact", head: true })
    .eq("listing_id", listingId)
    .eq("freelancer_address", freelancerAddress.toLowerCase());

  if (error) throw new Error(error.message);
  return (count ?? 0) > 0;
}

export async function applyToListing(
  listingId: string,
  freelancerAddress: string,
  message: string,
): Promise<void> {
  const sb = getSupabaseClient();
  const { error } = await sb.from("applications").insert({
    listing_id: listingId,
    freelancer_address: freelancerAddress.toLowerCase(),
    message: message.trim() || null,
  });

  if (error) throw new Error(error.message);
}

export async function rejectApplication(applicationId: string): Promise<void> {
  const sb = getSupabaseClient();
  const { error } = await sb
    .from("applications")
    .update({ status: "rejected" })
    .eq("id", applicationId);

  if (error) throw new Error(error.message);
}

export async function saveProjectName(
  onChainProjectId: number,
  name: string,
  clientAddress: string,
): Promise<void> {
  const sb = getSupabaseClient();
  const { error } = await sb.from("project_metadata").upsert({
    on_chain_project_id: onChainProjectId,
    name,
    client_address: clientAddress.toLowerCase(),
  });
  if (error) throw new Error(error.message);
}

export async function getProjectNames(clientAddress: string): Promise<Record<number, string>> {
  const sb = getSupabaseClient();
  const { data, error } = await sb
    .from("project_metadata")
    .select("on_chain_project_id, name")
    .eq("client_address", clientAddress.toLowerCase());
  if (error) throw new Error(error.message);
  return Object.fromEntries(
    (data ?? []).map((r) => [r.on_chain_project_id as number, r.name as string]),
  );
}

// Accepts an application: creates the on-chain project, marks the listing as filled,
// marks the accepted application as accepted, and rejects all others.
export async function acceptApplication(
  listingId: string,
  applicationId: string,
  freelancerAddress: string,
  milestones: MilestoneInput[],
  clientAddress: string,
  projectName?: string,
): Promise<number> {
  const contractMilestones = milestones.map((m) => ({
    title: m.title,
    amount: BigInt(Math.round(m.amount_xlm * 10_000_000)),
  }));

  const projectId = await createProject(clientAddress, freelancerAddress, contractMilestones);

  const sb = getSupabaseClient();

  const updates: Promise<unknown>[] = [
    sb
      .from("listings")
      .update({ status: "filled", on_chain_project_id: projectId })
      .eq("id", listingId),
    sb.from("applications").update({ status: "accepted" }).eq("id", applicationId),
    sb
      .from("applications")
      .update({ status: "rejected" })
      .eq("listing_id", listingId)
      .neq("id", applicationId),
  ];

  if (projectName) {
    updates.push(saveProjectName(projectId, projectName, clientAddress));
  }

  await Promise.all(updates);

  return projectId;
}
