import { expect, test } from "bun:test";
import { spawnSync } from "node:child_process";

const ENABLE_MUTATE = process.env.GH_PRX_E2E_MUTATE === "1";
const E2E_REPO = process.env.GH_PRX_MUTATE_REPO || "oven-sh/bun";
const E2E_AUTHOR = process.env.GH_PRX_MUTATE_AUTHOR?.trim() || null;
const E2E_CWD = process.env.GH_PRX_E2E_CWD || `${import.meta.dir}/../..`;
const MAX_RUN_AGE_DAYS = Number(process.env.GH_PRX_MUTATE_MAX_RUN_AGE_DAYS || "28");

interface PrSummary {
  number: number;
  title: string;
  url: string;
  state: string;
  isDraft: boolean;
  headRefName: string;
  headRefOid: string;
}

interface RunSummary {
  databaseId: number;
  headSha: string;
  status: string;
  conclusion: string | null;
  workflowName: string;
  createdAt: string;
}

interface Candidate {
  pr?: PrSummary;
  run: RunSummary;
  hasFailingRun: boolean;
  source: "pr" | "repo";
}

interface RunViewAttempt {
  attempt: number;
  status: string;
  conclusion: string | null;
}

let cachedCandidate: Candidate | null = null;

const mutateTest = ENABLE_MUTATE ? test : test.skip;

function runGh(args: string[], timeout = 120000) {
  return spawnSync("gh", args, {
    cwd: E2E_CWD,
    encoding: "utf8",
    timeout,
  });
}

function runGhOk(args: string[], timeout = 120000): string {
  const proc = runGh(args, timeout);
  if (proc.status !== 0) {
    throw new Error((proc.stderr || proc.stdout || "gh command failed").trim());
  }
  return proc.stdout;
}

function runGhJson<T>(args: string[], timeout = 120000): T {
  return JSON.parse(runGhOk(args, timeout)) as T;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function listCandidatePrs(): PrSummary[] {
  const args = [
    "pr",
    "list",
    "--repo",
    E2E_REPO,
    "--state",
    "all",
    "--limit",
    "80",
    "--json",
    "number,title,url,state,isDraft,headRefName,headRefOid",
  ];

  if (E2E_AUTHOR) {
    args.splice(4, 0, "--author", E2E_AUTHOR);
  }

  return runGhJson<PrSummary[]>(args);
}

function listRunsForBranch(branch: string): RunSummary[] {
  return runGhJson<RunSummary[]>([
    "run",
    "list",
    "--repo",
    E2E_REPO,
    "--branch",
    branch,
    "--limit",
    "80",
    "--json",
    "databaseId,headSha,status,conclusion,workflowName,createdAt",
  ]);
}

function listRepoRuns(): RunSummary[] {
  return runGhJson<RunSummary[]>([
    "run",
    "list",
    "--repo",
    E2E_REPO,
    "--limit",
    "120",
    "--json",
    "databaseId,headSha,status,conclusion,workflowName,createdAt",
  ]);
}

function isRecentRun(run: RunSummary): boolean {
  const createdMs = new Date(run.createdAt).getTime();
  if (!Number.isFinite(createdMs)) return false;
  const ageMs = Date.now() - createdMs;
  return ageMs <= MAX_RUN_AGE_DAYS * 24 * 60 * 60 * 1000;
}

function discoverCandidate(): Candidate {
  if (cachedCandidate) return cachedCandidate;

  const prs = listCandidatePrs();
  const preferred = prs.filter((pr) => pr.isDraft || pr.state === "CLOSED");
  const pool = preferred.length > 0 ? preferred : prs;
  const rank = (pr: PrSummary): number => {
    if (pr.isDraft) return 0;
    if (pr.state === "CLOSED") return 1;
    return 2;
  };
  const prioritized = [...pool].sort((a, b) => rank(a) - rank(b));

  for (const pr of prioritized) {
    const runs = listRunsForBranch(pr.headRefName).filter(
      (run) => run.headSha === pr.headRefOid && run.status === "completed" && isRecentRun(run),
    );
    if (runs.length === 0) continue;

    const failingRun = runs.find(
      (run) => run.status === "completed" && run.conclusion === "failure",
    );
    if (failingRun) {
      cachedCandidate = { pr, run: failingRun, hasFailingRun: true, source: "pr" };
      return cachedCandidate;
    }

    const completedRun = runs.find((run) => run.status === "completed");
    if (completedRun) {
      cachedCandidate = { pr, run: completedRun, hasFailingRun: false, source: "pr" };
      return cachedCandidate;
    }
  }

  const repoRuns = listRepoRuns().filter((run) => run.status === "completed" && isRecentRun(run));
  const repoFailing = repoRuns.find((run) => run.conclusion === "failure");
  if (repoFailing) {
    cachedCandidate = { run: repoFailing, hasFailingRun: true, source: "repo" };
    return cachedCandidate;
  }

  const repoCompleted = repoRuns.find((run) => run.status === "completed");
  if (repoCompleted) {
    cachedCandidate = { run: repoCompleted, hasFailingRun: false, source: "repo" };
    return cachedCandidate;
  }

  throw new Error("No recent candidate run found for mutation test.");
}

mutateTest(
  "mutating preflight: auth and candidate discovery",
  () => {
    const auth = runGh(["auth", "status"]);
    expect(auth.status).toBe(0);

    const candidate = discoverCandidate();
    if (candidate.pr) expect(candidate.pr.number > 0).toBeTrue();
    expect(candidate.run.databaseId > 0).toBeTrue();
  },
  120000,
);

mutateTest(
  "mutating e2e: rerun then cancel one run on draft/closed PR",
  async () => {
    const candidate = discoverCandidate();
    const runId = candidate.run.databaseId;

    const before = runGhJson<RunViewAttempt>([
      "run",
      "view",
      String(runId),
      "--repo",
      E2E_REPO,
      "--json",
      "attempt,status,conclusion",
    ]);

    const rerunArgs = [
      "prx",
      "ci",
      "rerun",
      `run:${runId}`,
      "--repo",
      E2E_REPO,
      "--format",
      "json",
      "--no-color",
    ];
    if (candidate.hasFailingRun) rerunArgs.splice(4, 0, "--failed");

    const rerun = runGhJson<{
      action: string;
      runId: number;
      mode: string;
      requested: boolean;
    }>(rerunArgs);

    expect(rerun.action).toBe("rerun");
    expect(rerun.runId).toBe(runId);
    expect(rerun.requested).toBeTrue();
    if (candidate.hasFailingRun) {
      expect(rerun.mode).toBe("failed");
    }

    let rerunObserved = false;
    for (let i = 0; i < 20; i += 1) {
      const current = runGhJson<RunViewAttempt>([
        "run",
        "view",
        String(runId),
        "--repo",
        E2E_REPO,
        "--json",
        "attempt,status,conclusion",
      ]);
      if (
        current.attempt > before.attempt ||
        current.status !== before.status ||
        current.conclusion !== before.conclusion
      ) {
        rerunObserved = true;
        break;
      }
      await sleep(4000);
    }
    expect(rerunObserved).toBeTrue();

    const cancelProc = runGh([
      "prx",
      "ci",
      "cancel",
      `run:${runId}`,
      "--force",
      "--repo",
      E2E_REPO,
      "--format",
      "json",
      "--no-color",
    ]);

    if (cancelProc.status === 0) {
      const cancel = JSON.parse(cancelProc.stdout) as {
        action: string;
        runId: number;
        force?: boolean;
        requested: boolean;
      };
      expect(cancel.action).toBe("cancel");
      expect(cancel.runId).toBe(runId);
      expect(cancel.requested).toBeTrue();
    } else {
      const afterCancelAttempt = runGhJson<RunViewAttempt>([
        "run",
        "view",
        String(runId),
        "--repo",
        E2E_REPO,
        "--json",
        "attempt,status,conclusion",
      ]);

      expect(afterCancelAttempt.attempt >= before.attempt).toBeTrue();
    }
  },
  180000,
);
