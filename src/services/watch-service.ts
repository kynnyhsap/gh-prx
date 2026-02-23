import type { OutputFormat, RepoRef, RunSummary } from "../domain/types";
import { getRunSummary, resolveRunId } from "./ci-service";

interface WatchOptions {
  target?: string;
  intervalSec: number;
  timeoutSec: number;
  failFast: boolean;
  format: OutputFormat;
}

function summarizeRun(run: RunSummary) {
  const failedJobs = run.jobs.filter((job) => job.conclusion === "failure");
  const pendingJobs = run.jobs.filter((job) => !job.conclusion);
  return {
    runId: run.databaseId,
    status: run.status,
    conclusion: run.conclusion,
    failedJobs: failedJobs.map((job) => ({ id: job.databaseId, name: job.name })),
    pendingCount: pendingJobs.length,
    url: run.url,
  };
}

function printEvent(format: OutputFormat, event: Record<string, unknown>): void {
  if (format === "jsonl") {
    process.stdout.write(`${JSON.stringify(event)}\n`);
    return;
  }
  if (format === "json") {
    process.stdout.write(`${JSON.stringify(event, null, 2)}\n`);
    return;
  }
  const summary = event.summary as ReturnType<typeof summarizeRun>;
  process.stdout.write(
    `[${event.type}] run=${summary.runId} status=${summary.status} conclusion=${summary.conclusion ?? "-"} failed=${summary.failedJobs.length} pending=${summary.pendingCount}\n`,
  );
}

export async function watchCi(repo: RepoRef, options: WatchOptions): Promise<number> {
  const runId = resolveRunId(repo, options.target);
  const start = Date.now();
  let lastState = "";

  while (true) {
    if ((Date.now() - start) / 1000 > options.timeoutSec) {
      printEvent(options.format, {
        type: "timeout",
        summary: {
          runId,
          status: "timeout",
          conclusion: null,
          failedJobs: [],
          pendingCount: 0,
          url: "",
        },
      });
      return 124;
    }

    const run = getRunSummary(repo, runId);
    const summary = summarizeRun(run);
    const state = `${summary.status}:${summary.conclusion}:${summary.failedJobs.length}:${summary.pendingCount}`;
    if (state !== lastState) {
      printEvent(options.format, { type: "update", summary });
      lastState = state;
    }

    const hasFailure = summary.failedJobs.length > 0;
    const isComplete =
      ["completed", "success", "failure", "cancelled"].includes(summary.status) ||
      summary.conclusion !== null;

    if (options.failFast && hasFailure) {
      printEvent(options.format, { type: "fail_fast", summary });
      return 1;
    }

    if (isComplete) {
      if (summary.conclusion === "success") {
        printEvent(options.format, { type: "finished", summary });
        return 0;
      }
      printEvent(options.format, { type: "finished", summary });
      return 1;
    }

    await Bun.sleep(options.intervalSec * 1000);
  }
}
