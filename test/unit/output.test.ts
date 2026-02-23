import { describe, expect, test } from "bun:test";

describe("sanity", () => {
  test("project boots tests", () => {
    expect(1 + 1).toBe(2);
  });
});
