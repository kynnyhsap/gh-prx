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
      nextAction: "Run `gh agent ci logs --failed` and fix the first failing job.",
    });
  }

  if (context.unresolvedThreads.length > 0) {
    diagnostics.push({
      severity: "error",
      code: "UNRESOLVED_THREADS",
      message: `${context.unresolvedThreads.length} unresolved review thread(s).`,
      nextAction: "Run `gh agent threads list --unresolved` and address each thread.",
    });
  }

  if (context.pr.isDraft) {
    diagnostics.push({
      severity: "warn",
      code: "PR_DRAFT",
      message: "Pull request is still in draft state.",
      nextAction: "Mark PR ready when CI and review comments are clean.",
    });
  }

  if (context.pr.mergeStateStatus && ["DIRTY", "BEHIND"].includes(context.pr.mergeStateStatus)) {
    diagnostics.push({
      severity: "warn",
      code: "NEEDS_REBASE",
      message: `Merge state is ${context.pr.mergeStateStatus}.`,
      nextAction: "Rebase or update your branch from base branch.",
    });
  }

  if (diagnostics.length === 0) {
    diagnostics.push({
      severity: "info",
      code: "ALL_CLEAR",
      message: "No blockers detected.",
      nextAction: "Proceed to merge or request final review.",
    });
  }

  return { diagnostics, context };
}
