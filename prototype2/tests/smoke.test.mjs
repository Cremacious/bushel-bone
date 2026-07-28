import { describe, it, expect } from "vitest";
import { boot } from "../src/main.js";

describe("boot", () => {
  it("renders the shell into a root and advances the week on click", () => {
    const root = document.createElement("div");
    const app = boot(root, { seed: 1, lineageName: "Mackall" });
    expect(root.querySelector(".masthead")).toBeTruthy();
    expect(app.getState().week).toBe(1);
    root.querySelector(".stage button").click();
    expect(app.getState().week).toBe(2);
  });
});
