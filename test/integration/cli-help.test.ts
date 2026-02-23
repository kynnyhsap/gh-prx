import { expect, test } from "bun:test";

test("cli help prints usage", () => {
  const proc = Bun.spawnSync(["bun", "run", "src/cli/index.ts", "--help"], {
    cwd: import.meta.dir + "/../..",
    stdout: "pipe",
    stderr: "pipe",
  });

  const output = Buffer.from(proc.stdout).toString("utf8");
  expect(output.includes("Usage")).toBeTrue();
});
