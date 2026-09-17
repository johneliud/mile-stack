import { describe, expect, it } from "vitest";
import { parseProject, parseStatus } from "@/lib/contract";

describe("parseStatus", () => {
  it("handles Soroban enum arrays and object variants", () => {
    expect(parseStatus(["Funded"])).toBe("Funded");
    expect(parseStatus({ Disputed: null })).toBe("Disputed");
  });

  it("handles plain values and falls back safely", () => {
    expect(parseStatus("Released")).toBe("Released");
    expect(parseStatus(["Unknown"])).toBe("Pending");
    expect(parseStatus(null)).toBe("Pending");
  });
});

describe("parseProject", () => {
  it("coerces a raw Soroban project into the frontend model", () => {
    const project = parseProject({
      id: "7",
      client: "GCLIENT",
      created_at: "1700000000",
      milestones: [
        { title: "Build", amount: "12500000", status: ["Completed"], freelancer: "GFREELANCER" },
      ],
    });

    expect(project).toEqual({
      id: 7n,
      client: "GCLIENT",
      created_at: 1700000000n,
      milestones: [
        { title: "Build", amount: 12500000n, status: "Completed", freelancer: "GFREELANCER" },
      ],
    });
  });
});
