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
}

interface GhJob {
  id: number;
  name: string;
  status: string;
  conclusion: string | null;
  started_at?: string;
  completed_at?: string;
  check_run_url: string;
}

interface JobsResponse {
  jobs: GhJob[];
}

function isNumeric(value: string | undefined): boolean {
  return Boolean(value && /^\d+$/.test(value));
}

function parseCheckRunId(checkRunUrl: string): number | null {
  const raw = checkRunUrl.split("/").pop();
  if (!raw || !isNumeric(raw)) return null;
  return Number(raw);
}

function listRunJobs(repo: RepoRef, runId: number): GhJob[] {
  const jobs: GhJob[] = [];
  let page = 1;

  while (true) {
    const response = getJson<JobsResponse>(
      `repos/${repo.fullName}/actions/runs/${runId}/jobs?per_page=100&page=${page}`,
      repo.fullName,
    );
    jobs.push(...response.jobs);

    if (response.jobs.length < 100) break;
    page += 1;
  }

  return jobs;
}

function listAnnotationsForCheckRun(repo: RepoRef, checkRunId: number): Annotation[] {
  type AnnotationResponse = { message: string } & Annotation;
  const annotations: Annotation[] = [];
  let page = 1;

  while (true) {
    const pageResult = getJson<AnnotationResponse[]>(
      `repos/${repo.fullName}/check-runs/${checkRunId}/annotations?per_page=100&page=${page}`,
      repo.fullName,
    );
    annotations.push(...pageResult);

    if (pageResult.length < 100) break;
    page += 1;
  }

  return annotations;
}

export function resolveRunId(
  repo: RepoRef,
  target?: string,
  targetMode: "auto" | "pr" | "run" = "auto",
): number {
  if (targetMode === "run") {
    if (!target || !isNumeric(target)) {
      throw new CliError("Run target must be a numeric workflow run id.");
    }
    return Number(target);
  }

  if (target && targetMode === "auto" && isNumeric(target)) {
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
    ["run", "view", String(runId), "--json", "databaseId,workflowName,status,conclusion,url"],
    { repo: repo.fullName },
  );

  const jobs = listRunJobs(repo, runId);

  return {
    databaseId: run.databaseId,
    workflowName: run.workflowName,
    status: run.status,
    conclusion: run.conclusion,
    url: run.url,
    jobs: jobs.map((job) => ({
      databaseId: job.id,
      name: job.name,
      status: job.status,
      conclusion: job.conclusion,
      startedAt: job.started_at,
      completedAt: job.completed_at,
    })),
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
  const jobs = listRunJobs(repo, runId);
  const selected = failedOnly ? jobs.filter((j) => j.conclusion === "failure") : jobs;

  const annotations: Annotation[] = [];
  for (const job of selected) {
    const checkRunId = parseCheckRunId(job.check_run_url);
    if (!checkRunId) continue;
    const jobAnnotations = listAnnotationsForCheckRun(repo, checkRunId);
    annotations.push(...jobAnnotations);
  }
  return annotations;
}
