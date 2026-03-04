#!/usr/bin/env bun

function run(command: string[], label: string): void {
  const proc = Bun.spawnSync(command, {
    stdout: "inherit",
    stderr: "inherit",
    env: process.env,
  });

  if (proc.exitCode !== 0) {
    throw new Error(`${label} failed with exit code ${proc.exitCode}`);
  }
}

const tag = Bun.argv[2];

if (!tag) {
  throw new Error("missing tag argument (expected vX.Y.Z)");
}

run(["bun", "install", "--frozen-lockfile"], "bun install");
run(["bun", "run", "typecheck"], "bun run typecheck");
run(["bun", "run", "lint"], "bun run lint");
run(["bun", "run", "build:release", "--", tag], "bun run build:release");
