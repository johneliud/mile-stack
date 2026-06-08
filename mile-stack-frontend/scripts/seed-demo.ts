import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const CLIENT_ADDRESS = process.env.DEMO_CLIENT_ADDRESS;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local");
  process.exit(1);
}
if (!CLIENT_ADDRESS) {
  console.error("Missing DEMO_CLIENT_ADDRESS in .env.local");
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
  {
    client_address: CLIENT_ADDRESS,
    title: "E-commerce Store Development",
    description:
      "Build a full-featured e-commerce storefront using Next.js and Stripe. Requirements include product listing, cart, checkout, order management, and an admin panel for inventory. The design will be provided as Figma files.",
    skills: ["Next.js", "TypeScript", "Stripe", "PostgreSQL"],
    milestones: [
      { title: "Product catalogue & cart", amount_xlm: 35 },
      { title: "Checkout & payments", amount_xlm: 40 },
      { title: "Admin panel & order management", amount_xlm: 30 },
    ],
    total_xlm: 105,
    status: "open",
  },
  {
    client_address: CLIENT_ADDRESS,
    title: "DevOps & CI/CD Pipeline Setup",
    description:
      "Set up a production-ready CI/CD pipeline for our monorepo. We need GitHub Actions workflows for testing, building, and deploying to AWS ECS. Include infrastructure-as-code using Terraform and a staging environment.",
    skills: ["GitHub Actions", "Terraform", "AWS", "Docker"],
    milestones: [
      { title: "Terraform infra & ECS setup", amount_xlm: 40 },
      { title: "CI/CD workflows & staging env", amount_xlm: 35 },
      { title: "Monitoring & alerting", amount_xlm: 25 },
    ],
    total_xlm: 100,
    status: "open",
  },
  {
    client_address: CLIENT_ADDRESS,
    title: "Technical Content Writing",
    description:
      "Write 8 in-depth technical blog posts covering Web3, Stellar, and smart contract development. Each post should be 1,500–2,500 words, developer-focused, and include code examples. SEO optimisation required.",
    skills: ["Technical Writing", "Web3", "Stellar", "SEO"],
    milestones: [
      { title: "Posts 1–4 with code examples", amount_xlm: 28 },
      { title: "Posts 5–8 with code examples", amount_xlm: 28 },
      { title: "SEO review & final edits", amount_xlm: 14 },
    ],
    total_xlm: 70,
    status: "open",
  },
  {
    client_address: CLIENT_ADDRESS,
    title: "Python Web Scraper & Data Pipeline",
    description:
      "Build a robust web scraper to extract product pricing data from 15 e-commerce websites daily. Data should be cleaned, normalised, and stored in a PostgreSQL database. Include a scheduler and alerting for failures.",
    skills: ["Python", "Scrapy", "PostgreSQL", "Celery"],
    milestones: [
      { title: "Scraper for 15 sites", amount_xlm: 32 },
      { title: "Data pipeline & normalisation", amount_xlm: 28 },
      { title: "Scheduler, alerts & docs", amount_xlm: 20 },
    ],
    total_xlm: 80,
    status: "open",
  },
];

async function seedListing(listing: DemoListing): Promise<void> {
  const { data: existing } = await sb
    .from("listings")
    .select("id, title")
    .eq("client_address", listing.client_address)
    .eq("title", listing.title)
    .maybeSingle();

  if (existing) {
    console.log(`  Already exists: "${existing.title}" (${existing.id})`);
    return;
  }

  const { data, error } = await sb.from("listings").insert(listing).select().single();
  if (error) {
    console.error(`  Failed to create "${listing.title}":`, error.message);
    process.exit(1);
  }
  console.log(`  Created: "${data.title}" (${data.id})`);
}

async function seed() {
  console.log("Seeding demo data...\n");

  for (let i = 0; i < DEMO_LISTINGS.length; i++) {
    console.log(`[${i + 1}/${DEMO_LISTINGS.length}] ${DEMO_LISTINGS[i].title}`);
    await seedListing(DEMO_LISTINGS[i]);
  }

  console.log(`\nAll ${DEMO_LISTINGS.length} listings seeded.`);
  console.log("Browse at: /projects");
}

seed();
