import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";

function packageVersion(): string {
  const raw = readFileSync(new URL("../../package.json", import.meta.url), "utf8");
  const parsed = JSON.parse(raw) as { version: string };
  return parsed.version;
}

test("cli help prints usage", () => {
  const proc = Bun.spawnSync(["bun", "run", "src/cli/index.ts", "--help"], {
    cwd: import.meta.dir + "/../..",
    stdout: "pipe",
    stderr: "pipe",
  });

  const output = Buffer.from(proc.stdout).toString("utf8");
  expect(output.includes("Usage")).toBeTrue();
});

test("cli version matches package version", () => {
  const proc = Bun.spawnSync(["bun", "run", "src/cli/index.ts", "--version"], {
    cwd: import.meta.dir + "/../..",
    stdout: "pipe",
    stderr: "pipe",
  });

  const output = Buffer.from(proc.stdout).toString("utf8");
  expect(output.includes(`gh prx/${packageVersion()}`)).toBeTrue();
});
