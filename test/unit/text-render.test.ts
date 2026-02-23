import { describe, expect, test } from "bun:test";
import { renderAnnotations, renderChecks, renderRun, renderThreads } from "../../src/output/text";
import { setColorEnabled } from "../../src/util/colors";

describe("text renderers", () => {
  setColorEnabled(false);

  test("renderThreads includes file line", () => {
    const text = renderThreads([
      {
        id: "t1",
        isResolved: false,
        isOutdated: false,
        path: "src/a.ts",
        line: 42,
        latestAuthor: "andrew",
        latestBody: "fix this",
        latestUpdatedAt: "",
        latestUrl: "",
      },
    ]);
    expect(text.includes("src/a.ts:42")).toBeTrue();
  });

  test("renderChecks includes bucket", () => {
    const text = renderChecks([
      {
        name: "lint",
        state: "COMPLETED",
        bucket: "fail",
      },
    ]);
    expect(text.includes("[fail] lint")).toBeTrue();
  });

  test("renderRun includes workflow", () => {
    const text = renderRun({
      databaseId: 123,
      workflowName: "CI",
      status: "completed",
      conclusion: "success",
      url: "x",
      jobs: [],
    });
    expect(text.includes("Run #123 CI")).toBeTrue();
  });

  test("renderAnnotations includes severity", () => {
    const text = renderAnnotations([
      {
        path: "src/a.ts",
        start_line: 1,
        end_line: 1,
        annotation_level: "failure",
        message: "boom",
        title: null,
      },
    ]);
    expect(text.includes("[failure] boom")).toBeTrue();
  });
});
