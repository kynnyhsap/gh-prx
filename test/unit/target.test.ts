import { describe, expect, test } from "bun:test";
import { CliError } from "../../src/util/errors";
import {
  isRunLikeAutoTarget,
  parseTarget,
  requirePrTarget,
  targetToServiceInput,
  toStoredTarget,
} from "../../src/util/target";

describe("target parser", () => {
  test("parses empty target", () => {
    expect(parseTarget({}).kind).toBe("none");
  });

  test("parses --pr and --run", () => {
    expect(parseTarget({ pr: "123" })).toEqual({ kind: "pr", value: "123" });
    expect(parseTarget({ run: "22305316388" })).toEqual({ kind: "run", value: "22305316388" });
  });

  test("parses prefixed targets", () => {
    expect(parseTarget({ target: "pr:docs/branch" })).toEqual({
      kind: "pr",
      value: "docs/branch",
    });
    expect(parseTarget({ target: "run:22305316388" })).toEqual({
      kind: "run",
      value: "22305316388",
    });
  });

  test("identifies run-like auto targets", () => {
    expect(isRunLikeAutoTarget("22305316388")).toBeTrue();
    expect(isRunLikeAutoTarget("123")).toBeFalse();
  });

  test("maps parsed targets to service input", () => {
    expect(targetToServiceInput(parseTarget({ target: "pr:123" }))).toEqual({
      target: "123",
      mode: "pr",
    });
    expect(targetToServiceInput(parseTarget({ target: "run:22305316388" }))).toEqual({
      target: "22305316388",
      mode: "run",
    });
  });

  test("requires PR target for PR-only commands", () => {
    expect(() => requirePrTarget(parseTarget({ target: "run:22305316388" }), "context")).toThrow(
      CliError,
    );
  });

  test("stores auto targets as PR targets", () => {
    expect(toStoredTarget(parseTarget({ target: "123" }))).toBe("pr:123");
    expect(toStoredTarget(parseTarget({ target: "run:22305316388" }))).toBe("run:22305316388");
  });
});
