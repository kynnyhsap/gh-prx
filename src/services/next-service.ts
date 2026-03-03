import type { NextStep, RepoRef } from "../domain/types";
import { buildContext } from "./context-service";

function repoArg(repo: RepoRef): string {
  return `--repo ${repo.fullName}`;
}

export function getNextStep(repo: RepoRef, target?: string): NextStep {
  const context = buildContext(repo, target);
  const base: Omit<NextStep, "kind" | "reason" | "command" | "details"> = {
    schemaVersion: 1,
    repo: repo.fullName,
    pr: context.pr.number,
  };

  if (context.failedJobs.length > 0) {
    const job = context.failedJobs[0];
    const runId = context.latestRun?.databaseId || context.pr.number;
    return {
      ...base,
      kind: "ci_failure",
      reason: `Failing CI job: ${job.name}`,
      command: `gh prx ci logs ${runId} --job ${job.databaseId} --failed ${repoArg(repo)}`,
      details: {
        runId,
        jobId: job.databaseId,
        jobName: job.name,
      },
    };
  }

  if (context.pendingChecks.length > 0) {
    const runId = context.latestRun?.databaseId || context.pr.number;
    return {
      ...base,
      kind: "ci_pending",
      reason: `${context.pendingChecks.length} check(s) still pending`,
      command: `gh prx ci watch ${runId} --fail-fast --format jsonl ${repoArg(repo)}`,
      details: {
        runId,
        pendingChecks: context.pendingChecks.map((check) => check.name),
      },
    };
  }

  if (context.pr.reviewDecision === "CHANGES_REQUESTED") {
    return {
      ...base,
      kind: "changes_requested",
      reason: "Reviewers requested changes",
      command: `gh prx threads list ${context.pr.number} --unresolved ${repoArg(repo)} --format json`,
      details: {
        unresolvedCount: context.unresolvedThreads.length,
      },
    };
  }

  if (context.unresolvedThreads.length > 0) {
    const thread = context.unresolvedThreads[0];
    return {
      ...base,
      kind: "unresolved_thread",
      reason: `Open thread in ${thread.path}:${thread.line ?? "-"}`,
      command: `gh prx threads list ${context.pr.number} --unresolved ${repoArg(repo)} --format json`,
      details: {
        threadId: thread.id,
        path: thread.path,
        line: thread.line,
        url: thread.latestUrl,
      },
    };
  }

  if (
    context.pr.reviewDecision === "REVIEW_REQUIRED" ||
    (context.pr.reviewRequestsCount || 0) > 0
  ) {
    return {
      ...base,
      kind: "waiting_review",
      reason: "Waiting for reviewer approval",
      command: `gh prx context ${context.pr.number} ${repoArg(repo)} --format json`,
      details: {
        reviewDecision: context.pr.reviewDecision || null,
        reviewRequestsCount: context.pr.reviewRequestsCount || 0,
      },
    };
  }

  if (context.pr.isDraft) {
    return {
      ...base,
      kind: "draft",
      reason: "PR is draft",
      command: `gh pr view ${context.pr.number} ${repoArg(repo)}`,
      details: {
        draft: true,
      },
    };
  }

  return {
    ...base,
    kind: "ready_to_merge",
    reason: "No blockers detected",
    command: `gh prx context ${context.pr.number} ${repoArg(repo)} --format json`,
    details: {
      reviewDecision: context.pr.reviewDecision || null,
      mergeStateStatus: context.pr.mergeStateStatus || null,
    },
  };
}
