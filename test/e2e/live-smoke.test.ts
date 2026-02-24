import { expect, test } from "bun:test";
import { spawnSync } from "node:child_process";

const E2E_REPO = process.env.GH_PRX_E2E_REPO || "oven-sh/bun";
const E2E_CWD = process.env.GH_PRX_E2E_CWD || `${import.meta.dir}/../..`;

interface PrSummary {
  number: number;
  title: string;
  statusCheckRollup: Array<{ conclusion: string | null }>;
}

interface RunSummary {
  databaseId: number;
  conclusion: string | null;
  status: string;
}

interface Discovery {
  openPrWithChecks: number;
  closedPrWithChecks: number;
  unresolvedThreadPr: number;
  failingRunId: number;
}

let cachedDiscovery: Discovery | null = null;

function runGh(args: string[], options?: { timeoutMs?: number }) {
  return spawnSync("gh", args, {
    cwd: E2E_CWD,
    encoding: "utf8",
    timeout: options?.timeoutMs ?? 120000,
  });
}

function runGhOk(args: string[], options?: { timeoutMs?: number }): string {
  const proc = runGh(args, options);
  if (proc.status !== 0) {
    throw new Error((proc.stderr || proc.stdout || "gh command failed").trim());
  }
  return proc.stdout;
}

function runGhJson<T>(args: string[], options?: { timeoutMs?: number }): T {
  const stdout = runGhOk(args, options);
  return JSON.parse(stdout) as T;
}

function listPrs(state: "open" | "closed", limit: number): PrSummary[] {
  return runGhJson<PrSummary[]>([
    "pr",
    "list",
    "--repo",
    E2E_REPO,
    "--state",
    state,
    "--limit",
    String(limit),
    "--json",
    "number,title,statusCheckRollup",
  ]);
}

function getUnresolvedThreadCount(prNumber: number): number {
  const result = runGhJson<{ pr: number; threads: unknown[] }>([
    "prx",
    "threads",
    "list",
    String(prNumber),
    "--unresolved",
    "--repo",
    E2E_REPO,
    "--format",
    "json",
    "--no-color",
  ]);
  return result.threads.length;
}

function discoverTargets(): Discovery {
  if (cachedDiscovery) return cachedDiscovery;

  const openPrs = listPrs("open", 40);
  const closedPrs = listPrs("closed", 25);

  const openPrWithChecks = openPrs.find((pr) => pr.statusCheckRollup.length > 0)?.number;
  const closedPrWithChecks = closedPrs.find((pr) => pr.statusCheckRollup.length > 0)?.number;

  if (!openPrWithChecks)
    throw new Error("Could not find open PR with checks in target repository.");
  if (!closedPrWithChecks)
    throw new Error("Could not find closed PR with checks in target repository.");

  const unresolvedScanPool = [
    ...openPrs.map((pr) => pr.number),
    ...closedPrs.map((pr) => pr.number),
  ].slice(0, 45);

  let unresolvedThreadPr: number | null = null;
  for (const prNumber of unresolvedScanPool) {
    const count = getUnresolvedThreadCount(prNumber);
    if (count > 0) {
      unresolvedThreadPr = prNumber;
      break;
    }
  }
  if (!unresolvedThreadPr) {
    throw new Error("Could not find PR with unresolved review threads.");
  }

  const runs = runGhJson<RunSummary[]>([
    "run",
    "list",
    "--repo",
    E2E_REPO,
    "--limit",
    "100",
    "--json",
    "databaseId,conclusion,status",
  ]);

  const failingRunId = runs.find(
    (run) => run.status === "completed" && run.conclusion === "failure",
  )?.databaseId;
  if (!failingRunId) {
    throw new Error("Could not find completed failing workflow run.");
  }

  cachedDiscovery = {
    openPrWithChecks,
    closedPrWithChecks,
    unresolvedThreadPr,
    failingRunId,
  };
  return cachedDiscovery;
}

test("e2e preflight: auth and target repository are reachable", () => {
  const auth = runGh(["auth", "status"]);
  expect(auth.status).toBe(0);

  const repo = runGh(["repo", "view", E2E_REPO, "--json", "nameWithOwner"]);
  expect(repo.status).toBe(0);
});

test("e2e discovery: find open, closed, unresolved-thread, and failing-run targets", () => {
  const targets = discoverTargets();
  expect(targets.openPrWithChecks > 0).toBeTrue();
  expect(targets.closedPrWithChecks > 0).toBeTrue();
  expect(targets.unresolvedThreadPr > 0).toBeTrue();
  expect(targets.failingRunId > 0).toBeTrue();
}, 120000);

test("e2e readonly: context works for open PR", () => {
  const targets = discoverTargets();
  const proc = runGh([
    "prx",
    "context",
    String(targets.openPrWithChecks),
    "--repo",
    E2E_REPO,
    "--no-color",
  ]);
  expect(proc.status).toBe(0);
  expect(proc.stdout.includes(`PR #${targets.openPrWithChecks}`)).toBeTrue();
  expect(proc.stdout.includes("Suggested next action:")).toBeTrue();
}, 120000);

test("e2e readonly: context works for closed PR", () => {
  const targets = discoverTargets();
  const proc = runGh([
    "prx",
    "context",
    String(targets.closedPrWithChecks),
    "--repo",
    E2E_REPO,
    "--no-color",
  ]);
  expect(proc.status).toBe(0);
  expect(proc.stdout.includes(`PR #${targets.closedPrWithChecks}`)).toBeTrue();
}, 120000);

test("e2e readonly: threads list returns unresolved thread items", () => {
  const targets = discoverTargets();
  const result = runGhJson<{ pr: number; threads: Array<{ id: string; path: string }> }>([
    "prx",
    "threads",
    "list",
    String(targets.unresolvedThreadPr),
    "--unresolved",
    "--repo",
    E2E_REPO,
    "--format",
    "json",
    "--no-color",
  ]);

  expect(result.pr).toBe(targets.unresolvedThreadPr);
  expect(result.threads.length > 0).toBeTrue();
  expect(Boolean(result.threads[0].id)).toBeTrue();
  expect(Boolean(result.threads[0].path)).toBeTrue();
}, 120000);

test("e2e readonly: ci status works for open PR", () => {
  const targets = discoverTargets();
  const result = runGhJson<{ run: { databaseId: number }; checks: unknown[] }>([
    "prx",
    "ci",
    "status",
    String(targets.openPrWithChecks),
    "--repo",
    E2E_REPO,
    "--format",
    "json",
    "--no-color",
  ]);

  expect(result.run.databaseId > 0).toBeTrue();
  expect(Array.isArray(result.checks)).toBeTrue();
}, 120000);

test("e2e readonly: ci logs works for failing run", () => {
  const targets = discoverTargets();
  const proc = runGh([
    "prx",
    "ci",
    "logs",
    String(targets.failingRunId),
    "--failed",
    "--tail",
    "120",
    "--repo",
    E2E_REPO,
    "--no-color",
  ]);
  expect(proc.status).toBe(0);
  expect(proc.stdout.length > 0).toBeTrue();
}, 120000);

test("e2e readonly: ci annotations works for failing run", () => {
  const targets = discoverTargets();
  const result = runGhJson<{ runId: number; annotations: unknown[] }>([
    "prx",
    "ci",
    "annotations",
    String(targets.failingRunId),
    "--failed",
    "--repo",
    E2E_REPO,
    "--format",
    "json",
    "--no-color",
  ]);
  expect(result.runId).toBe(targets.failingRunId);
  expect(Array.isArray(result.annotations)).toBeTrue();
}, 120000);

test("e2e readonly: doctor works on unresolved-thread PR", () => {
  const targets = discoverTargets();
  const proc = runGh([
    "prx",
    "doctor",
    String(targets.unresolvedThreadPr),
    "--repo",
    E2E_REPO,
    "--no-color",
  ]);
  expect(proc.status).toBe(0);
  expect(proc.stdout.includes(`PR #${targets.unresolvedThreadPr}`)).toBeTrue();
}, 120000);

test("e2e readonly: ci watch emits jsonl fail-fast events on failing run", () => {
  const targets = discoverTargets();
  const proc = runGh(
    [
      "prx",
      "ci",
      "watch",
      String(targets.failingRunId),
      "--repo",
      E2E_REPO,
      "--fail-fast",
      "--interval",
      "3",
      "--timeout",
      "30",
      "--format",
      "jsonl",
      "--no-color",
    ],
    { timeoutMs: 120000 },
  );

  expect(proc.status).toBe(1);
  expect(proc.stdout.includes('"type":"update"')).toBeTrue();
  expect(
    proc.stdout.includes('"type":"fail_fast"') || proc.stdout.includes('"type":"finished"'),
  ).toBeTrue();
}, 120000);

test("e2e readonly: context json contract includes stable keys", () => {
  const targets = discoverTargets();
  const context = runGhJson<Record<string, unknown>>([
    "prx",
    "context",
    String(targets.openPrWithChecks),
    "--repo",
    E2E_REPO,
    "--format",
    "json",
    "--no-color",
  ]);

  const keys = Object.keys(context).sort();
  expect(keys.includes("schemaVersion")).toBeTrue();
  expect(keys.includes("repo")).toBeTrue();
  expect(keys.includes("pr")).toBeTrue();
  expect(keys.includes("unresolvedThreads")).toBeTrue();
  expect(keys.includes("checks")).toBeTrue();
  expect(keys.includes("latestRun")).toBeTrue();
  expect(keys.includes("failingChecks")).toBeTrue();
  expect(keys.includes("failedJobs")).toBeTrue();
  expect(keys.includes("suggestedNextAction")).toBeTrue();

  const pr = context.pr as Record<string, unknown>;
  const prKeys = Object.keys(pr).sort();
  expect(prKeys.includes("number")).toBeTrue();
  expect(prKeys.includes("title")).toBeTrue();
  expect(prKeys.includes("url")).toBeTrue();
  expect(prKeys.includes("baseRefName")).toBeTrue();
  expect(prKeys.includes("headRefName")).toBeTrue();
  expect(prKeys.includes("headRefOid")).toBeTrue();
  expect(prKeys.includes("isDraft")).toBeTrue();
}, 120000);
