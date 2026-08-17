import { getSupabaseClient } from "./supabase";

export interface FreelancerProfile {
  wallet_address: string;
  name: string | null;
  bio: string | null;
  skills: string[];
  github_url: string | null;
  portfolio_url: string | null;
  updated_at: string;
}

export async function getProfile(walletAddress: string): Promise<FreelancerProfile | null> {
  const sb = getSupabaseClient();
  const { data, error } = await sb
    .from("freelancer_profiles")
    .select("*")
    .eq("wallet_address", walletAddress.toLowerCase())
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as FreelancerProfile | null;
}

export async function upsertProfile(profile: Omit<FreelancerProfile, "updated_at">): Promise<void> {
  const sb = getSupabaseClient();
  const { error } = await sb.from("freelancer_profiles").upsert({
    ...profile,
    wallet_address: profile.wallet_address.toLowerCase(),
    updated_at: new Date().toISOString(),
  });
  if (error) throw new Error(error.message);
}

export async function getAllProfiles(): Promise<FreelancerProfile[]> {
  const sb = getSupabaseClient();
  const { data, error } = await sb
    .from("freelancer_profiles")
    .select("*")
    .not("name", "is", null)
    .order("updated_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as FreelancerProfile[];
}
