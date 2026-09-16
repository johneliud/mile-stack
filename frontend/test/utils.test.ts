import { afterEach, describe, expect, it, vi } from "vitest";
import { timeAgo, truncateAddress } from "@/lib/utils";

describe("timeAgo", () => {
  afterEach(() => vi.useRealTimers());

  it("formats minutes, hours, and days", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-10T12:00:00Z"));
    expect(timeAgo("2026-09-10T11:45:00Z")).toBe("15m ago");
    expect(timeAgo("2026-09-10T09:00:00Z")).toBe("3h ago");
    expect(timeAgo("2026-09-08T12:00:00Z")).toBe("2d ago");
  });
});

describe("truncateAddress", () => {
  it("uppercases and preserves the configured prefix and suffix", () => {
    expect(truncateAddress("gabc123456789xyz", 4)).toBe("GABC...9XYZ");
    expect(truncateAddress("gabc123456789xyz")).toBe("GABC12...789XYZ");
  });
});
