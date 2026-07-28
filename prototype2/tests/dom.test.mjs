import { describe, it, expect, vi } from "vitest";
import { el, clear } from "../src/render/dom.js";

describe("el", () => {
  it("sets class and text", () => {
    const node = el("div", { class: "foo bar", text: "hello" });
    expect(node.tagName).toBe("DIV");
    expect(node.className).toBe("foo bar");
    expect(node.textContent).toBe("hello");
  });

  it("binds an on* handler that fires on the DOM event", () => {
    const onClick = vi.fn();
    const node = el("button", { onClick });
    node.click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("sets a normal string attribute", () => {
    const node = el("input", { "data-tab": "home" });
    expect(node.getAttribute("data-tab")).toBe("home");
  });

  it("sets a boolean attribute as present when true", () => {
    const node = el("button", { disabled: true });
    expect(node.hasAttribute("disabled")).toBe(true);
    expect(node.getAttribute("disabled")).toBe("");
  });

  it("leaves a boolean attribute absent when false", () => {
    const node = el("button", { disabled: false });
    expect(node.hasAttribute("disabled")).toBe(false);
  });

  it("skips null children and appends mixed children", () => {
    const child1 = el("span", { text: "a" });
    const child2 = el("span", { text: "b" });
    const node = el("div", {}, [child1, null, child2, undefined]);
    expect(node.children.length).toBe(2);
    expect(node.children[0]).toBe(child1);
    expect(node.children[1]).toBe(child2);
  });
});

describe("clear", () => {
  it("empties a node of all children", () => {
    const node = el("div", {}, [el("span"), el("span"), el("span")]);
    expect(node.childNodes.length).toBe(3);
    clear(node);
    expect(node.childNodes.length).toBe(0);
  });
});
