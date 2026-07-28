import { describe, it, expect } from "vitest";
import { boot } from "../src/main.js";

describe("boot", () => {
  it("renders the shell into a root and responds to a tab click", () => {
    const root = document.createElement("div");
    const app = boot(root, { seed: 1, lineageName: "Mackall" });
    expect(root.querySelector(".masthead")).toBeTruthy();
    expect(app.getState().screen).toBe("home");
    root.querySelector('.tab[data-tab="hands"]').click();
    expect(app.getState().screen).toBe("hands");
  });
});
