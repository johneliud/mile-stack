import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const CLIENT_ADDRESS = process.env.DEMO_CLIENT_ADDRESS;
const FREELANCER_ADDRESS = process.env.DEMO_FREELANCER_ADDRESS;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local");
  process.exit(1);
}
if (!CLIENT_ADDRESS || !FREELANCER_ADDRESS) {
  console.error("Missing DEMO_CLIENT_ADDRESS or DEMO_FREELANCER_ADDRESS in .env.local");
  process.exit(1);
}

const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

const DEMO_LISTING = {
  client_address: CLIENT_ADDRESS.toLowerCase(),
  title: "Website Redesign",
  description:
    "We need a complete redesign of our company website. The project covers UI/UX design, full frontend implementation in React/TypeScript, and backend API integration. The final deliverable should be responsive, performant, and deployed to production.\n\nIdeal for a developer with a strong portfolio in modern web development. You will work directly with the founding team.",
  skills: ["React", "TypeScript", "Tailwind CSS", "REST APIs"],
  milestones: [
    { title: "UI Design", amount_xlm: 500 },
    { title: "Frontend Development", amount_xlm: 1000 },
    { title: "Backend Integration", amount_xlm: 1500 },
  ],
  total_xlm: 3000,
  status: "open",
};

const DEMO_APPLICATION_MESSAGE =
  "I have 4 years of experience building production React apps and have completed 12 similar projects on Stellar. I can start immediately and deliver the UI design within 5 days.";

async function seed() {
  console.log("Seeding demo data...\n");

  // Check if demo listing already exists
  const { data: existing } = await sb
    .from("listings")
    .select("id, title")
    .eq("client_address", CLIENT_ADDRESS!.toLowerCase())
    .eq("title", DEMO_LISTING.title)
    .maybeSingle();

  let listingId: string;

  if (existing) {
    console.log(`Demo listing already exists (id: ${existing.id}) — skipping insert.`);
    listingId = existing.id;
  } else {
    const { data: listing, error: listingError } = await sb
      .from("listings")
      .insert(DEMO_LISTING)
      .select()
      .single();

    if (listingError) {
      console.error("Failed to create listing:", listingError.message);
      process.exit(1);
    }

    listingId = listing.id;
    console.log(`Created listing: "${listing.title}" (id: ${listingId})`);
  }

  // Check if demo application already exists
  const { data: existingApp } = await sb
    .from("applications")
    .select("id")
    .eq("listing_id", listingId)
    .eq("freelancer_address", FREELANCER_ADDRESS!.toLowerCase())
    .maybeSingle();

  if (existingApp) {
    console.log(`Demo application already exists (id: ${existingApp.id}) — skipping insert.`);
  } else {
    const { data: application, error: appError } = await sb
      .from("applications")
      .insert({
        listing_id: listingId,
        freelancer_address: FREELANCER_ADDRESS!.toLowerCase(),
        message: DEMO_APPLICATION_MESSAGE,
      })
      .select()
      .single();

    if (appError) {
      console.error("Failed to create application:", appError.message);
      process.exit(1);
    }

    console.log(`Created application from freelancer (id: ${application.id})`);
  }

  console.log("\nDemo seed complete.");
  console.log(`\nListing URL: /projects/${listingId}`);
  console.log(`Review applications: /client/listings/${listingId}/applications`);
}

seed();
