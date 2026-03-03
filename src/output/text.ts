import type {
  Annotation,
  CheckSummary,
  CiDiagnosis,
  NextStep,
  ReviewThread,
  RunSummary,
} from "../domain/types";
import { c } from "../util/colors";

function bucketColor(bucket: string): string {
  const colors = c();
  if (bucket === "pass") return colors.green(bucket);
  if (bucket === "fail") return colors.red(bucket);
  if (bucket === "pending") return colors.yellow(bucket);
  return colors.dim(bucket);
}

export function renderThreads(threads: ReviewThread[]): string {
  const colors = c();
  if (threads.length === 0) return "No review threads found.";
  return [
    colors.bold(`Threads (${threads.length})`),
    ...threads.map((thread) => {
      const line = thread.line ?? "-";
      const status = thread.isResolved ? colors.green("resolved") : colors.yellow("open");
      return `- ${thread.id} ${thread.path}:${line} by ${thread.latestAuthor} [${status}]`;
    }),
  ].join("\n");
}

export function renderChecks(checks: CheckSummary[]): string {
  const colors = c();
  if (checks.length === 0) return "No checks found.";
  return [
    colors.bold("Checks"),
    ...checks.map((check) => `- [${bucketColor(check.bucket)}] ${check.name} (${check.state})`),
  ].join("\n");
}

export function renderRun(run: RunSummary): string {
  const colors = c();
  const statusColor =
    run.conclusion === "success"
      ? colors.green
      : run.conclusion === "failure"
        ? colors.red
        : colors.yellow;
  return [
    colors.bold(`Run #${run.databaseId} ${run.workflowName}`),
    `Status: ${statusColor(run.status)} ${run.conclusion ? `(${statusColor(run.conclusion)})` : ""}`,
    ...run.jobs.map(
      (job) => `- ${job.name}: ${job.status}${job.conclusion ? ` (${job.conclusion})` : ""}`,
    ),
  ].join("\n");
}

export function renderAnnotations(annotations: Annotation[]): string {
  const colors = c();
  if (annotations.length === 0) return "No annotations found.";
  return [
    colors.bold(`Annotations (${annotations.length})`),
    ...annotations.map((a) => `- ${a.path}:${a.start_line} [${a.annotation_level}] ${a.message}`),
  ].join("\n");
}

export function renderNextStep(step: NextStep): string {
  const colors = c();
  return [
    colors.bold(`Next: PR #${step.pr} (${step.kind})`),
    `Reason: ${step.reason}`,
    `Command: ${colors.cyan(step.command)}`,
  ].join("\n");
}

export function renderCiDiagnosis(result: CiDiagnosis): string {
  const colors = c();
  const filesPreview = result.annotationsByPath.slice(0, 10);
  const logBlocks = result.logsByJob.map((log) =>
    [
      colors.bold(`Log tail job ${log.jobId} (${log.jobName}) lines=${log.tailLines}`),
      log.logTail || "<no log output>",
    ].join("\n"),
  );
  return [
    colors.bold(`Run #${result.run.databaseId} ${result.run.workflowName}`),
    `Status: ${result.run.status}${result.run.conclusion ? ` (${result.run.conclusion})` : ""}`,
    `Failing jobs: ${result.failingJobs.length}`,
    ...logBlocks,
    filesPreview.length > 0
      ? [
          colors.bold(`Annotations by file (${result.annotationsCount})`),
          ...filesPreview.map((group) => `- ${group.path}: ${group.count}`),
        ].join("\n")
      : "No annotations found.",
    `${colors.bold("Suggested next action:")} ${result.suggestedNextAction}`,
    `${colors.bold("Suggested command:")} ${colors.cyan(result.suggestedNextCommand)}`,
  ].join("\n\n");
}
