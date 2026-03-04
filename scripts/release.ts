import { readFileSync, writeFileSync } from "node:fs";

type BumpKind = "major" | "minor" | "patch";

interface PackageJson {
  version?: string;
}

function run(command: string[], label: string): string {
  console.log(`==> ${label}`);
  console.log(`$ ${command.join(" ")}`);
  const proc = Bun.spawnSync(command, {
    stdout: "pipe",
    stderr: "pipe",
    env: process.env,
  });

  if (proc.exitCode !== 0) {
    const stderr = Buffer.from(proc.stderr).toString("utf8").trim();
    const stdout = Buffer.from(proc.stdout).toString("utf8").trim();
    const output = stderr || stdout || "unknown error";
    throw new Error(`${label} failed: ${output}`);
  }

  const output = Buffer.from(proc.stdout).toString("utf8").trim();
  if (output) {
    console.log(output);
  }
  return output;
}

function readPackageJson(): { path: URL; json: PackageJson } {
  const path = new URL("../package.json", import.meta.url);
  const raw = readFileSync(path, "utf8");
  return { path, json: JSON.parse(raw) as PackageJson };
}

function parseSemver(version: string): [number, number, number] {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)$/);
  if (!match) throw new Error(`Invalid semver version: ${version}`);
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

function bumpVersion(current: string, kind: BumpKind): string {
  const [major, minor, patch] = parseSemver(current);
  if (kind === "major") return `${major + 1}.0.0`;
  if (kind === "minor") return `${major}.${minor + 1}.0`;
  return `${major}.${minor}.${patch + 1}`;
}

function normalizeExplicitVersion(input: string): string {
  const value = input.startsWith("v") ? input.slice(1) : input;
  parseSemver(value);
  return value;
}

function parseArgs(args: string[]): { target: string | BumpKind; push: boolean } {
  let push = true;
  const rest: string[] = [];

  for (const arg of args) {
    if (arg === "--no-push") {
      push = false;
      continue;
    }
    rest.push(arg);
  }

  const target = (rest[0] as string | undefined) ?? "patch";
  if (!["major", "minor", "patch"].includes(target) && !/^v?\d+\.\d+\.\d+$/.test(target)) {
    throw new Error("Usage: bun run release -- [patch|minor|major|vX.Y.Z|X.Y.Z] [--no-push]");
  }

  return {
    target: target as string | BumpKind,
    push,
  };
}

function ensureCleanTree(): void {
  const status = run(["git", "status", "--porcelain"], "git status");
  if (status) {
    throw new Error("Working tree is not clean. Commit or stash changes before cutting a release.");
  }
}

function ensureMainIsSynced(): void {
  const branch = run(["git", "branch", "--show-current"], "git branch --show-current");
  if (branch !== "main") {
    throw new Error(`Release must be cut from main. Current branch: ${branch}`);
  }

  run(["git", "fetch", "origin"], "git fetch origin");
  const counts = run(
    ["git", "rev-list", "--left-right", "--count", "origin/main...HEAD"],
    "git rev-list",
  );
  const [behind, ahead] = counts.split("\t").map((v) => Number(v));
  if ((behind || 0) !== 0 || (ahead || 0) !== 0) {
    throw new Error(
      `main is not synced with origin/main (behind=${behind || 0}, ahead=${ahead || 0}).`,
    );
  }
}

function main(): void {
  const { target, push } = parseArgs(Bun.argv.slice(2));
  ensureCleanTree();
  ensureMainIsSynced();

  const { path, json } = readPackageJson();
  if (!json.version || typeof json.version !== "string") {
    throw new Error("package.json version is missing");
  }

  const nextVersion = ["major", "minor", "patch"].includes(target)
    ? bumpVersion(json.version, target as BumpKind)
    : normalizeExplicitVersion(target as string);

  if (nextVersion === json.version) {
    throw new Error(`Version is already ${nextVersion}`);
  }

  const tag = `v${nextVersion}`;
  const tagExists = run(["git", "tag", "-l", tag], "git tag -l");
  if (tagExists === tag) {
    throw new Error(`Tag already exists: ${tag}`);
  }

  const updated = { ...json, version: nextVersion };
  writeFileSync(path, `${JSON.stringify(updated, null, 2)}\n`, "utf8");

  run(["bun", "run", "build"], "bun run build");
  run(["bun", "run", "typecheck"], "bun run typecheck");
  run(["bun", "run", "lint"], "bun run lint");
  run(["bun", "test"], "bun test");

  run(["git", "add", "package.json", "dist"], "git add");
  run(["git", "commit", "-m", `chore(release): cut ${tag}`], "git commit");
  run(["git", "tag", "-a", tag, "-m", `Release ${tag}`], "git tag");

  if (push) {
    run(["git", "push", "origin", "main"], "git push origin main");
    run(["git", "push", "origin", tag], "git push origin tag");
  }

  console.log(`Release prepared: ${tag}`);
  if (push) {
    console.log("Tag pushed. GitHub release workflow will publish binaries automatically.");
  } else {
    console.log("Tag not pushed (--no-push). Push main and tag manually when ready.");
  }
}

main();
