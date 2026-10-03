import { test, expect, vi } from "vitest";
import { renderTree, example, type TreeNode } from "../solution";

test("выводит дерево в консоль", () => {
  const logs: string[] = [];
  const spy = vi.spyOn(console, "log").mockImplementation((...args) => {
    logs.push(args.join(" "));
  });

  renderTree(example);

  spy.mockRestore();

  expect(logs[0]).toBe("src");
  expect(logs).toContain("  index.html");
  expect(logs).toContain("  webpack.config.js");
  expect(logs).toContain("  assets");
  expect(logs).toContain("    image_1.jpg");
});

test("простое дерево", () => {
  const logs: string[] = [];
  const spy = vi.spyOn(console, "log").mockImplementation((...args) => {
    logs.push(args.join(" "));
  });

  renderTree({ name: "root" });

  spy.mockRestore();
  expect(logs).toEqual(["root"]);
});
