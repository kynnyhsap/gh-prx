import type { Diagnostic, RepoRef } from "../domain/types";
import { buildContext } from "./context-service";

export function runDoctor(
  repo: RepoRef,
  target?: string,
): { diagnostics: Diagnostic[]; context: ReturnType<typeof buildContext> } {
  const context = buildContext(repo, target);
  const diagnostics: Diagnostic[] = [];

  if (context.failedJobs.length > 0 || context.failingChecks.length > 0) {
    diagnostics.push({
      severity: "error",
      code: "REQUIRED_CHECK_FAILED",
      message: "One or more CI checks failed.",
      nextAction: "Run `gh prx ci logs --failed` and fix the first failing job.",
      command: `gh prx ci logs ${context.latestRun?.databaseId ?? context.pr.number} --failed --repo ${repo.fullName}`,
    });
  }

  if (context.pendingChecks.length > 0) {
    diagnostics.push({
      severity: "warn",
      code: "REQUIRED_CHECK_PENDING",
      message: `${context.pendingChecks.length} check(s) are still pending.`,
      nextAction: "Watch CI until completion.",
      command: `gh prx ci watch ${context.latestRun?.databaseId ?? context.pr.number} --fail-fast --repo ${repo.fullName}`,
    });
  }

  if (context.unresolvedThreads.length > 0) {
    diagnostics.push({
      severity: "error",
      code: "UNRESOLVED_THREADS",
      message: `${context.unresolvedThreads.length} unresolved review thread(s).`,
      nextAction: "Run `gh prx threads list --unresolved` and address each thread.",
      command: `gh prx threads list ${context.pr.number} --unresolved --repo ${repo.fullName}`,
    });
  }

  if (context.pr.reviewDecision === "CHANGES_REQUESTED") {
    diagnostics.push({
      severity: "error",
      code: "CHANGES_REQUESTED",
      message: "Reviewers requested changes.",
      nextAction: "Address the requested changes and push updates.",
      command: `gh prx threads list ${context.pr.number} --unresolved --repo ${repo.fullName}`,
    });
  }

  if (context.pr.reviewDecision === "REVIEW_REQUIRED") {
    diagnostics.push({
      severity: "warn",
      code: "REVIEW_REQUIRED",
      message: "PR still needs reviewer approval.",
      nextAction: "Request review or wait for approvals.",
      command: `gh prx context ${context.pr.number} --repo ${repo.fullName}`,
    });
  }

  if ((context.pr.reviewRequestsCount || 0) > 0) {
    diagnostics.push({
      severity: "warn",
      code: "REVIEW_REQUESTS_PENDING",
      message: `${context.pr.reviewRequestsCount} review request(s) are still open.`,
      nextAction: "Wait for reviewers or re-request review when ready.",
      command: `gh prx context ${context.pr.number} --repo ${repo.fullName}`,
    });
  }

  if (context.pr.isDraft) {
    diagnostics.push({
      severity: "warn",
      code: "PR_DRAFT",
      message: "Pull request is still in draft state.",
      nextAction: "Mark PR ready when CI and review comments are clean.",
      command: `gh pr view ${context.pr.number} --repo ${repo.fullName}`,
    });
  }

  if (context.pr.mergeStateStatus && ["DIRTY", "BEHIND"].includes(context.pr.mergeStateStatus)) {
    diagnostics.push({
      severity: "warn",
      code: "NEEDS_REBASE",
      message: `Merge state is ${context.pr.mergeStateStatus}.`,
      nextAction: "Rebase or update your branch from base branch.",
      command: `gh prx context ${context.pr.number} --repo ${repo.fullName}`,
    });
  }

  if (diagnostics.length === 0) {
    diagnostics.push({
      severity: "info",
      code: "ALL_CLEAR",
      message: "No blockers detected.",
      nextAction: "Proceed to merge or request final review.",
      command: `gh prx context ${context.pr.number} --repo ${repo.fullName}`,
    });
  }

  return { diagnostics, context };
}
