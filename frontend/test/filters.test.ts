import { describe, expect, it } from "vitest";
import { filterFreelancers, filterListings } from "@/lib/filters";

const listings = [
  { title: "Smart contract audit", description: "Review Soroban code", skills: ["Rust", "Soroban"] },
  { title: "Landing page", description: "Build a marketing site", skills: ["React", "CSS"] },
];

const profiles = [
  { name: "Ada Lovelace", bio: "Rust and contracts", skills: ["Rust", "Soroban"] },
  { name: null, bio: "Frontend specialist", skills: ["React", "CSS"] },
];

describe("filterListings", () => {
  it("searches title, description, and skills case-insensitively", () => {
    expect(filterListings(listings, "SOROBAN", new Set()).map((item) => item.title)).toEqual([
      "Smart contract audit",
    ]);
  });

  it("requires every selected skill", () => {
    expect(filterListings(listings, "", new Set(["Rust", "React"]))).toEqual([]);
    expect(filterListings(listings, "", new Set(["Rust"])).map((item) => item.title)).toEqual([
      "Smart contract audit",
    ]);
  });
});

describe("filterFreelancers", () => {
  it("handles null names and searches profile fields", () => {
    expect(filterFreelancers(profiles, "frontend", new Set()).length).toBe(1);
  });
});
