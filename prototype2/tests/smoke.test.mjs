import { describe, it, expect } from "vitest";

describe("scaffold", () => {
  it("loads the entry module", async () => {
    const mod = await import("../src/main.js");
    expect(mod.__BOOTED__).toBe(true);
  });
});
