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

interface DemoListing {
  client_address: string;
  title: string;
  description: string;
  skills: string[];
  milestones: { title: string; amount_xlm: number }[];
  total_xlm: number;
  status: string;
}

const DEMO_LISTINGS: DemoListing[] = [
  {
    client_address: CLIENT_ADDRESS,
    title: "Website Redesign",
    description:
      "Complete redesign of our company website covering UI/UX design, frontend implementation in React/TypeScript, and backend API integration. The final deliverable should be responsive, performant, and deployed to production.",
    skills: ["React", "TypeScript", "Tailwind CSS", "REST APIs"],
    milestones: [
      { title: "UI Design", amount_xlm: 20 },
      { title: "Frontend Development", amount_xlm: 35 },
      { title: "Backend Integration", amount_xlm: 40 },
    ],
    total_xlm: 95,
    status: "open",
  },
  {
    client_address: CLIENT_ADDRESS,
    title: "Soroban Smart Contract Audit",
    description:
      "We need an experienced Soroban developer to audit our escrow contract before mainnet deployment. Review the contract logic, identify vulnerabilities, and provide a written report with recommendations.",
    skills: ["Rust", "Soroban", "Smart Contracts", "Security"],
    milestones: [
      { title: "Initial code review", amount_xlm: 25 },
      { title: "Vulnerability report", amount_xlm: 38 },
      { title: "Post-fix verification", amount_xlm: 27 },
    ],
    total_xlm: 90,
    status: "open",
  },
  {
    client_address: CLIENT_ADDRESS,
    title: "Mobile App UI Design",
    description:
      "Design a clean, modern UI for our fintech mobile application. We need Figma designs covering onboarding, dashboard, transaction history, and settings screens. Our brand uses a dark-blue and white palette.",
    skills: ["Figma", "UI Design", "Mobile", "Fintech"],
    milestones: [
      { title: "Wireframes & user flows", amount_xlm: 22 },
      { title: "High-fidelity screens", amount_xlm: 48 },
      { title: "Design handoff & assets", amount_xlm: 20 },
    ],
    total_xlm: 90,
    status: "open",
  },
  {
    client_address: CLIENT_ADDRESS,
    title: "REST API Development",
    description:
      "Build a RESTful API for our marketplace platform. The API must handle user authentication, product listings, orders, and payments. Node.js with PostgreSQL preferred. Full test coverage required.",
    skills: ["Node.js", "PostgreSQL", "REST APIs", "TypeScript"],
    milestones: [
      { title: "Auth & user endpoints", amount_xlm: 28 },
      { title: "Listings & orders API", amount_xlm: 42 },
      { title: "Tests & documentation", amount_xlm: 25 },
    ],
    total_xlm: 95,
    status: "open",
  },
  {
    client_address: CLIENT_ADDRESS,
    title: "Data Dashboard & Analytics",
    description:
      "Create an interactive analytics dashboard to visualise our sales and user data. Charts, filters, date ranges, and CSV export are required. The dashboard will be embedded in our existing Next.js admin panel.",
    skills: ["React", "Data Visualization", "Next.js", "SQL"],
    milestones: [
      { title: "Data pipeline & queries", amount_xlm: 30 },
      { title: "Dashboard UI & charts", amount_xlm: 38 },
      { title: "Export & polish", amount_xlm: 20 },
    ],
    total_xlm: 88,
    status: "open",
  },
];

const APPLICATION_MESSAGES = [
  "I have 4 years of experience building production React apps and have completed 12 similar projects. I can start immediately and deliver the first milestone within 5 days.",
  "Rust and Soroban are my primary stack. I have audited 3 contracts on testnet and can provide a detailed security report within a week.",
  "I am a product designer with 5 years of fintech experience. My Figma work is clean, component-based, and developer-friendly.",
  "Full-stack Node.js developer with 6 years of experience. I write clean, tested code and always deliver thorough API documentation.",
  "I specialise in data dashboards using React and D3. I have built analytics tools for e-commerce and SaaS companies across Africa.",
];

async function seedListing(listing: DemoListing, appMessage: string): Promise<string> {
  const { data: existing } = await sb
    .from("listings")
    .select("id, title")
    .eq("client_address", listing.client_address)
    .eq("title", listing.title)
    .maybeSingle();

  let listingId: string;

  if (existing) {
    console.log(`  Already exists: "${existing.title}" (${existing.id})`);
    listingId = existing.id;
  } else {
    const { data, error } = await sb.from("listings").insert(listing).select().single();
    if (error) {
      console.error(`  Failed to create "${listing.title}":`, error.message);
      process.exit(1);
    }
    listingId = data.id;
    console.log(`  Created: "${data.title}" (${listingId})`);
  }

  const { data: existingApp } = await sb
    .from("applications")
    .select("id")
    .eq("listing_id", listingId)
    .eq("freelancer_address", FREELANCER_ADDRESS!.toLowerCase())
    .maybeSingle();

  if (existingApp) {
    console.log(`  Application already exists--. Skipping.`);
  } else {
    const { error: appError } = await sb.from("applications").insert({
      listing_id: listingId,
      freelancer_address: FREELANCER_ADDRESS!,
      message: appMessage,
    });
    if (appError) {
      console.error(`  Failed to create application:`, appError.message);
      process.exit(1);
    }
    console.log(`  Application created.`);
  }

  return listingId;
}

async function seed() {
  console.log("Seeding demo data...\n");

  for (let i = 0; i < DEMO_LISTINGS.length; i++) {
    console.log(`[${i + 1}/${DEMO_LISTINGS.length}] ${DEMO_LISTINGS[i].title}`);
    await seedListing(DEMO_LISTINGS[i], APPLICATION_MESSAGES[i]);
  }

  console.log(`\nAll ${DEMO_LISTINGS.length} listings seeded.`);
  console.log("Browse at: /projects");
}

seed();
