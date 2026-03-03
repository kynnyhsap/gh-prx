import type { Annotation, AnnotationGroup, CiDiagnosis, RepoRef } from "../domain/types";
import { getAnnotations, getRunLogs, getRunSummary, resolveRunId } from "./ci-service";

interface DiagnoseOptions {
  target?: string;
  targetMode?: "auto" | "pr" | "run";
  tail: number;
  maxJobs: number;
}

function groupAnnotationsByPath(annotations: Annotation[]): AnnotationGroup[] {
  const byPath = new Map<string, AnnotationGroup>();

  for (const annotation of annotations) {
    const path = annotation.path || "<unknown>";
    const existing = byPath.get(path);
    if (existing) {
      existing.count += 1;
      existing.annotations.push(annotation);
      existing.levels[annotation.annotation_level] =
        (existing.levels[annotation.annotation_level] || 0) + 1;
      continue;
    }

    byPath.set(path, {
      path,
      count: 1,
      levels: {
        [annotation.annotation_level]: 1,
      },
      annotations: [annotation],
    });
  }

  return [...byPath.values()].sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    return a.path.localeCompare(b.path);
  });
}

export function diagnoseCi(repo: RepoRef, options: DiagnoseOptions): CiDiagnosis {
  const mode = options.targetMode || "auto";
  const runId = resolveRunId(repo, options.target, mode);
  const run = getRunSummary(repo, runId);
  const failingJobs = run.jobs.filter((job) => job.conclusion === "failure");
  const selectedJobs = failingJobs.slice(0, Math.max(1, options.maxJobs));

  const logsByJob = selectedJobs.map((job) => ({
    jobId: job.databaseId,
    jobName: job.name,
    tailLines: options.tail,
    logTail: getRunLogs(repo, runId, true, job.databaseId, options.tail),
  }));

  const annotations = getAnnotations(repo, runId, true);
  const annotationsByPath = groupAnnotationsByPath(annotations);

  const suggestedNextAction =
    failingJobs.length > 0
      ? "fix_first_failing_job"
      : run.conclusion === "success"
        ? "no_failures_detected"
        : "inspect_run_status";

  const suggestedNextCommand =
    failingJobs.length > 0
      ? `gh prx ci logs ${runId} --job ${failingJobs[0].databaseId} --failed --repo ${repo.fullName}`
      : `gh prx ci status ${runId} --repo ${repo.fullName}`;

  return {
    schemaVersion: 1,
    repo: repo.fullName,
    run,
    failingJobs,
    logsByJob,
    annotationsCount: annotations.length,
    annotationsByPath,
    suggestedNextAction,
    suggestedNextCommand,
  };
}
