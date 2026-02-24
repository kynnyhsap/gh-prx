import { expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";

const E2E_REPO = process.env.GH_PRX_E2E_REPO;
const E2E_CWD = process.env.GH_PRX_E2E_CWD;

function hasE2EConfig(): boolean {
  return Boolean(E2E_REPO && E2E_CWD);
}

function runGh(args: string[], cwd: string) {
  return spawnSync("gh", args, {
    cwd,
    encoding: "utf8",
  });
}

function runGhJson<T>(args: string[], cwd: string): T {
  const proc = runGh(args, cwd);
  if (proc.status !== 0) {
    throw new Error((proc.stderr || proc.stdout || "gh command failed").trim());
  }
  return JSON.parse(proc.stdout) as T;
}

interface PullRequestCheckSnapshot {
  number: number;
  statusCheckRollup: Array<{ conclusion: string | null }>;
}

function discoverTargets(): {
  healthyPr: number | null;
  failingPr: number | null;
} {
  if (!E2E_REPO || !E2E_CWD) return { healthyPr: null, failingPr: null };
  const prs = runGhJson<PullRequestCheckSnapshot[]>(
    [
      "pr",
      "list",
      "--repo",
      E2E_REPO,
      "--state",
      "open",
      "--limit",
      "30",
      "--json",
      "number,statusCheckRollup",
    ],
    E2E_CWD,
  );

  let healthyPr: number | null = null;
  let failingPr: number | null = null;

  for (const pr of prs) {
    const checks = pr.statusCheckRollup || [];
    const hasChecks = checks.length > 0;
    const hasFailure = checks.some((check) => check.conclusion === "FAILURE");
    if (!healthyPr && hasChecks && !hasFailure) healthyPr = pr.number;
    if (!failingPr && hasChecks && hasFailure) failingPr = pr.number;
  }

  return { healthyPr, failingPr };
}

test("e2e preflight: readonly target and auth are available", () => {
  if (!hasE2EConfig()) {
    expect(true).toBeTrue();
    return;
  }

  expect(existsSync(E2E_CWD!)).toBeTrue();
  const auth = runGh(["auth", "status"], E2E_CWD!);
  expect(auth.status).toBe(0);
});

test("e2e readonly: prx context works", () => {
  if (!hasE2EConfig()) {
    expect(true).toBeTrue();
    return;
  }

  const { healthyPr } = discoverTargets();
  expect(healthyPr !== null).toBeTrue();

  const proc = runGh(
    ["prx", "context", String(healthyPr), "--repo", E2E_REPO!, "--no-color"],
    E2E_CWD!,
  );

  expect(proc.status).toBe(0);
  expect(proc.stdout.includes(`PR #${healthyPr}`)).toBeTrue();
  expect(proc.stdout.includes("Suggested next action:")).toBeTrue();
}, 30000);

test("e2e readonly: prx ci status works", () => {
  if (!hasE2EConfig()) {
    expect(true).toBeTrue();
    return;
  }

  const { healthyPr } = discoverTargets();
  expect(healthyPr !== null).toBeTrue();

  const proc = runGh(
    ["prx", "ci", "status", String(healthyPr), "--repo", E2E_REPO!, "--no-color"],
    E2E_CWD!,
  );

  expect(proc.status).toBe(0);
  expect(proc.stdout.includes("Run #") || proc.stdout.includes("No workflow run")).toBeTrue();
}, 30000);

test("e2e readonly: prx ci logs and annotations work for failing PR", () => {
  if (!hasE2EConfig()) {
    expect(true).toBeTrue();
    return;
  }

  const { failingPr } = discoverTargets();
  if (failingPr === null) {
    expect(true).toBeTrue();
    return;
  }

  const logs = runGh(
    [
      "prx",
      "ci",
      "logs",
      String(failingPr),
      "--failed",
      "--tail",
      "80",
      "--repo",
      E2E_REPO!,
      "--no-color",
    ],
    E2E_CWD!,
  );

  expect(logs.status).toBe(0);
  expect(logs.stdout.length > 0).toBeTrue();

  const annotations = runGh(
    ["prx", "ci", "annotations", String(failingPr), "--failed", "--repo", E2E_REPO!, "--no-color"],
    E2E_CWD!,
  );

  expect(annotations.status).toBe(0);
  expect(
    annotations.stdout.includes("Annotations (") ||
      annotations.stdout.includes("No annotations found."),
  ).toBeTrue();
}, 30000);

test("e2e readonly: prx threads list works", () => {
  if (!hasE2EConfig()) {
    expect(true).toBeTrue();
    return;
  }

  const { healthyPr } = discoverTargets();
  expect(healthyPr !== null).toBeTrue();

  const proc = runGh(
    [
      "prx",
      "threads",
      "list",
      String(healthyPr),
      "--unresolved",
      "--repo",
      E2E_REPO!,
      "--no-color",
    ],
    E2E_CWD!,
  );

  expect(proc.status).toBe(0);
  expect(
    proc.stdout.includes("Threads (") || proc.stdout.includes("No review threads found."),
  ).toBeTrue();
}, 30000);
