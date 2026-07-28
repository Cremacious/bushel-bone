import { describe, it, expect } from "vitest";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const prototype2 = join(here, "..");

describe("gen-data drift guard", () => {
  it("src/generated/{names,script}.js are in sync with content/*.yaml (run `npm run gen:data`)", () => {
    // exits 0 when up to date, 1 when the generated files are stale
    expect(() =>
      execFileSync("node", ["tools/gen-data.mjs", "--check"], { cwd: prototype2, stdio: "pipe" })
    ).not.toThrow();
  });
});
