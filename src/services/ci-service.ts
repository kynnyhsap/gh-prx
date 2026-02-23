import type { Annotation, RepoRef, RunSummary } from "../domain/types";
import { getJson } from "../github/rest";
import { ghExec, ghJson } from "../util/gh";
import { CliError } from "../util/errors";
import { resolvePr } from "./pr-service";

interface GhRunListItem {
  databaseId: number;
  headSha: string;
  workflowName: string;
  status: string;
  conclusion: string | null;
  url: string;
}

interface GhRunView {
  databaseId: number;
  workflowName: string;
  status: string;
  conclusion: string | null;
  url: string;
  jobs: Array<{
    databaseId: number;
    name: string;
    status: string;
    conclusion: string | null;
    startedAt?: string;
    completedAt?: string;
  }>;
}

function isNumeric(value: string | undefined): boolean {
  return Boolean(value && /^\d+$/.test(value));
}

export function resolveRunId(repo: RepoRef, target?: string): number {
  if (target && isNumeric(target)) {
    if (target.length >= 7) return Number(target);
  }

  const pr = resolvePr(target, repo);
  const runs = ghJson<GhRunListItem[]>(
    [
      "run",
      "list",
      "--json",
      "databaseId,headSha,workflowName,status,conclusion,url",
      "--limit",
      "30",
      "--branch",
      pr.headRefName,
    ],
    { repo: repo.fullName },
  );

  if (runs.length === 0) {
    throw new CliError("No workflow runs found for this target.");
  }

  const sameSha = runs.find((run) => run.headSha === pr.headRefOid);
  return (sameSha || runs[0]).databaseId;
}

export function getRunSummary(repo: RepoRef, runId: number): RunSummary {
  const run = ghJson<GhRunView>(
    ["run", "view", String(runId), "--json", "databaseId,workflowName,status,conclusion,url,jobs"],
    { repo: repo.fullName },
  );

  return {
    databaseId: run.databaseId,
    workflowName: run.workflowName,
    status: run.status,
    conclusion: run.conclusion,
    url: run.url,
    jobs: run.jobs,
  };
}

export function getRunLogs(
  repo: RepoRef,
  runId: number,
  failedOnly: boolean,
  jobId?: number,
  tail = 200,
): string {
  const args = ["run", "view", String(runId)];
  if (jobId) {
    args.push("--job", String(jobId), "--log");
  } else {
    args.push(failedOnly ? "--log-failed" : "--log");
  }
  const raw = ghExec(args, { repo: repo.fullName });
  const lines = raw.split("\n");
  return lines.slice(Math.max(0, lines.length - tail)).join("\n");
}

export function getAnnotations(repo: RepoRef, runId: number, failedOnly: boolean): Annotation[] {
  type JobsResponse = {
    jobs: Array<{
      id: number;
      name: string;
      conclusion: string | null;
      check_run_url: string;
    }>;
  };

  const jobs = getJson<JobsResponse>(
    `repos/${repo.fullName}/actions/runs/${runId}/jobs`,
    repo.fullName,
  ).jobs;
  const selected = failedOnly ? jobs.filter((j) => j.conclusion === "failure") : jobs;

  const annotations: Annotation[] = [];
  for (const job of selected) {
    const checkRunId = job.check_run_url.split("/").pop();
    if (!checkRunId) continue;
    type AnnotationResponse = { message: string } & Annotation;
    const jobAnnotations = getJson<AnnotationResponse[]>(
      `repos/${repo.fullName}/check-runs/${checkRunId}/annotations`,
      repo.fullName,
    );
    annotations.push(...jobAnnotations);
  }
  return annotations;
}
