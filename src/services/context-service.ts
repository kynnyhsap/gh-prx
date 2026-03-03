import type { PrxContext, RepoRef, SuggestedNextAction } from "../domain/types";
import { getRunSummary, resolveRunId } from "./ci-service";
import { listChecks, resolvePr } from "./pr-service";
import { getThreads } from "./thread-service";

function commandForAction(
  action: SuggestedNextAction,
  repo: RepoRef,
  prNumber: number,
  runId?: number,
): string {
  if (action === "fix_ci") {
    if (runId) return `gh prx ci logs ${runId} --failed --repo ${repo.fullName}`;
    return `gh prx ci status ${prNumber} --repo ${repo.fullName}`;
  }
  if (action === "wait_for_ci") {
    if (runId) return `gh prx ci watch ${runId} --fail-fast --format jsonl --repo ${repo.fullName}`;
    return `gh prx ci status ${prNumber} --repo ${repo.fullName}`;
  }
  if (action === "address_review" || action === "address_changes_requested") {
    return `gh prx threads list ${prNumber} --unresolved --repo ${repo.fullName}`;
  }
  if (action === "wait_for_review") {
    return `gh prx context ${prNumber} --repo ${repo.fullName}`;
  }
  if (action === "mark_ready") {
    return `gh pr view ${prNumber} --repo ${repo.fullName}`;
  }
  return `gh prx context ${prNumber} --repo ${repo.fullName}`;
}

export function buildContext(repo: RepoRef, target?: string): PrxContext {
  const pr = resolvePr(target, repo);
  const checks = listChecks(pr.number, repo);
  const threads = getThreads(repo, pr.number, true);
  let run: ReturnType<typeof getRunSummary> | null = null;
  try {
    const runId = resolveRunId(repo, String(pr.number), "pr");
    run = getRunSummary(repo, runId);
  } catch {
    run = null;
  }

  const failingChecks = checks.filter(
    (check) => check.bucket === "fail" || check.state === "FAILURE",
  );
  const pendingChecks = checks.filter(
    (check) =>
      check.bucket === "pending" || ["PENDING", "IN_PROGRESS", "QUEUED"].includes(check.state),
  );
  const failedJobs = run ? run.jobs.filter((job) => job.conclusion === "failure") : [];

  let suggestedNextAction: SuggestedNextAction = "ready_to_merge";
  if (failedJobs.length > 0 || failingChecks.length > 0) suggestedNextAction = "fix_ci";
  else if (pendingChecks.length > 0) suggestedNextAction = "wait_for_ci";
  else if (pr.reviewDecision === "CHANGES_REQUESTED")
    suggestedNextAction = "address_changes_requested";
  else if (threads.length > 0) suggestedNextAction = "address_review";
  else if (pr.reviewDecision === "REVIEW_REQUIRED" || (pr.reviewRequestsCount || 0) > 0)
    suggestedNextAction = "wait_for_review";
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
    pendingChecks,
    suggestedNextAction,
    suggestedNextCommand: commandForAction(suggestedNextAction, repo, pr.number, run?.databaseId),
  };
}
