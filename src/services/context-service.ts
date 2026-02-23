import type { RepoRef } from "../domain/types";
import { getRunSummary, resolveRunId } from "./ci-service";
import { listChecks, resolvePr } from "./pr-service";
import { getThreads } from "./thread-service";

export function buildContext(repo: RepoRef, target?: string) {
  const pr = resolvePr(target, repo);
  const checks = listChecks(pr.number, repo);
  const threads = getThreads(repo, pr.number, true);
  let run: ReturnType<typeof getRunSummary> | null = null;
  try {
    const runId = resolveRunId(repo, String(pr.number));
    run = getRunSummary(repo, runId);
  } catch {
    run = null;
  }

  const failingChecks = checks.filter(
    (check) => check.bucket === "fail" || check.state === "FAILURE",
  );
  const failedJobs = run ? run.jobs.filter((job) => job.conclusion === "failure") : [];

  let suggestedNextAction = "ready_to_merge";
  if (failedJobs.length > 0 || failingChecks.length > 0) suggestedNextAction = "fix_ci";
  else if (threads.length > 0) suggestedNextAction = "address_review";
  else if (pr.isDraft) suggestedNextAction = "mark_ready";

  return {
    schemaVersion: 1,
    repo: repo.fullName,
    pr,
    unresolvedThreads: threads,
    checks,
    latestRun: run,
    failingChecks,
    failedJobs,
    suggestedNextAction,
  };
}
