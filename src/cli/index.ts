#!/usr/bin/env node

import goke from "goke";
import type { OutputFormat } from "../domain/types";
import { renderAnnotations, renderChecks, renderRun, renderThreads } from "../output/text";
import { getAnnotations, getRunLogs, getRunSummary, resolveRunId } from "../services/ci-service";
import { buildContext } from "../services/context-service";
import { runDoctor } from "../services/doctor-service";
import { listChecks, resolvePr } from "../services/pr-service";
import { getThreads, resolveThread, unresolveThread } from "../services/thread-service";
import { watchCi } from "../services/watch-service";
import { c, isColorEnabled, setColorEnabled } from "../util/colors";
import { CliError } from "../util/errors";
import { printResult } from "../util/output";
import { inferRepo } from "../util/repo";

interface CommonOptions {
  format?: OutputFormat;
  repo?: string;
  noColor?: boolean;
}

if (process.argv.includes("--no-color") || process.argv.includes("--noColor")) {
  setColorEnabled(false);
}

function parseFormat(value?: string): OutputFormat {
  if (!value) return "text";
  if (value === "text" || value === "json" || value === "jsonl") return value;
  throw new CliError("--format must be text|json|jsonl");
}

function applyColorOption(options: CommonOptions): void {
  setColorEnabled(isColorEnabled(Boolean(options.noColor)));
}

function addCommonOptions<T extends { option: (raw: string, description?: string) => T }>(
  cmd: T,
): T {
  return cmd
    .option("--format [format]", "Output format: text|json|jsonl (default: text)")
    .option("--repo [repo]", "Target repository in owner/name format")
    .option("--no-color", "Disable colored output (also honors NO_COLOR env)");
}

function withErrorHandling<T extends unknown[]>(
  fn: (...args: T) => Promise<void> | void,
): (...args: T) => Promise<void> {
  return async (...args: T) => {
    try {
      await fn(...args);
    } catch (error: unknown) {
      if (error instanceof CliError) {
        process.stderr.write(`${c().red("error:")} ${error.message}\n`);
        process.exit(error.exitCode);
      }
      const message = error instanceof Error ? error.message : String(error);
      process.stderr.write(`${c().red("error:")} ${message}\n`);
      process.exit(1);
    }
  };
}

const cli = goke("gh prx")
  .usage("<command> [options]")
  .version("0.1.0")
  .example("gh prx context")
  .example("gh prx threads list --unresolved")
  .example("gh prx ci watch --fail-fast --format jsonl")
  .example("gh prx doctor")
  .help((sections) => {
    const colors = c();
    return sections.map((section) => {
      if (!section.title) return section;
      return {
        ...section,
        title: colors.bold(colors.cyan(section.title)),
      };
    });
  });

addCommonOptions(
  cli
    .command("context [target]", "Unified PR + CI snapshot")
    .example("gh prx context")
    .example("gh prx context 123")
    .example("gh prx context docs/my-branch --repo cli/cli")
    .action(
      withErrorHandling((target: string | undefined, options: CommonOptions) => {
        applyColorOption(options);
        const format = parseFormat(options.format);
        const repo = inferRepo(options.repo);
        const context = buildContext(repo, target);

        printResult(format, context, () => {
          const colors = c();
          return [
            `${colors.bold(context.repo)} PR #${context.pr.number}: ${context.pr.title}`,
            `${colors.bold("Suggested next action:")} ${colors.cyan(context.suggestedNextAction)}`,
            `${colors.bold("Unresolved threads:")} ${context.unresolvedThreads.length}`,
            renderChecks(context.checks),
            context.latestRun ? renderRun(context.latestRun) : "No workflow run found for this PR.",
          ].join("\n\n");
        });
      }),
    ),
);

addCommonOptions(
  cli
    .command("threads list [target]", "List review threads")
    .option("--unresolved", "Show unresolved threads only")
    .example("gh prx threads list")
    .example("gh prx threads list 123 --unresolved")
    .action(
      withErrorHandling(
        (target: string | undefined, options: CommonOptions & { unresolved?: boolean }) => {
          applyColorOption(options);
          const format = parseFormat(options.format);
          const repo = inferRepo(options.repo);
          const pr = resolvePr(target, repo);
          const threads = getThreads(repo, pr.number, Boolean(options.unresolved));
          printResult(format, { pr: pr.number, threads }, () => renderThreads(threads));
        },
      ),
    ),
);

addCommonOptions(
  cli
    .command("threads resolve <threadId>", "Resolve a review thread")
    .example("gh prx threads resolve PRRT_kwDOabc")
    .action(
      withErrorHandling((threadId: string, options: CommonOptions) => {
        applyColorOption(options);
        const format = parseFormat(options.format);
        const repo = inferRepo(options.repo);
        const result = resolveThread(repo, threadId);
        printResult(format, result, () => `Thread ${result.id} resolved=${result.isResolved}`);
      }),
    ),
);

addCommonOptions(
  cli
    .command("threads unresolve <threadId>", "Unresolve a review thread")
    .example("gh prx threads unresolve PRRT_kwDOabc")
    .action(
      withErrorHandling((threadId: string, options: CommonOptions) => {
        applyColorOption(options);
        const format = parseFormat(options.format);
        const repo = inferRepo(options.repo);
        const result = unresolveThread(repo, threadId);
        printResult(format, result, () => `Thread ${result.id} resolved=${result.isResolved}`);
      }),
    ),
);

addCommonOptions(
  cli
    .command("ci status [target]", "Show CI status and latest run jobs")
    .example("gh prx ci status")
    .example("gh prx ci status 123")
    .example("gh prx ci status 22305316388")
    .action(
      withErrorHandling((target: string | undefined, options: CommonOptions) => {
        applyColorOption(options);
        const format = parseFormat(options.format);
        const repo = inferRepo(options.repo);
        const runId = resolveRunId(repo, target);
        const run = getRunSummary(repo, runId);

        let checks: ReturnType<typeof listChecks> = [];
        if (!target || !/^\d+$/.test(target)) {
          const pr = resolvePr(target, repo);
          checks = listChecks(pr.number, repo);
        }

        printResult(format, { run, checks }, () => {
          const checksBlock = checks.length > 0 ? renderChecks(checks) : "";
          return [renderRun(run), checksBlock].filter(Boolean).join("\n\n");
        });
      }),
    ),
);

addCommonOptions(
  cli
    .command("ci logs [target]", "Show workflow logs")
    .option("--failed", "Show only failed log sections")
    .option("--job [id]", "Specific job ID")
    .option("--tail [n]", "Tail size in lines (default: 200)")
    .example("gh prx ci logs --failed")
    .example("gh prx ci logs 22305316388 --job 61631229417 --tail 300")
    .action(
      withErrorHandling(
        (
          target: string | undefined,
          options: CommonOptions & { failed?: boolean; job?: string; tail?: string },
        ) => {
          applyColorOption(options);
          const format = parseFormat(options.format);
          const repo = inferRepo(options.repo);
          const runId = resolveRunId(repo, target);
          const tailSize = Number(options.tail || "200");
          const jobId = options.job ? Number(options.job) : undefined;
          const logs = getRunLogs(repo, runId, Boolean(options.failed), jobId, tailSize);
          printResult(
            format,
            { runId, failedOnly: Boolean(options.failed), jobId, logs },
            () => logs,
          );
        },
      ),
    ),
);

addCommonOptions(
  cli
    .command("ci annotations [target]", "Show check-run annotations")
    .option("--failed", "Only annotations from failed jobs")
    .example("gh prx ci annotations --failed")
    .action(
      withErrorHandling(
        (target: string | undefined, options: CommonOptions & { failed?: boolean }) => {
          applyColorOption(options);
          const format = parseFormat(options.format);
          const repo = inferRepo(options.repo);
          const runId = resolveRunId(repo, target);
          const annotations = getAnnotations(repo, runId, Boolean(options.failed));
          printResult(format, { runId, annotations }, () => renderAnnotations(annotations));
        },
      ),
    ),
);

addCommonOptions(
  cli
    .command("ci watch [target]", "Watch CI run progress")
    .option("--fail-fast", "Exit immediately on first failure")
    .option("--interval [sec]", "Refresh interval seconds (default: 10)")
    .option("--timeout [sec]", "Timeout in seconds (default: 1800)")
    .example("gh prx ci watch --fail-fast")
    .example("gh prx ci watch --interval 5 --timeout 1200 --format jsonl")
    .action(
      withErrorHandling(
        async (
          target: string | undefined,
          options: CommonOptions & {
            failFast?: boolean;
            interval?: string;
            timeout?: string;
          },
        ) => {
          applyColorOption(options);
          const format = parseFormat(options.format);
          const repo = inferRepo(options.repo);
          const intervalSec = Number(options.interval || "10");
          const timeoutSec = Number(options.timeout || "1800");
          const exitCode = await watchCi(repo, {
            target,
            failFast: Boolean(options.failFast),
            intervalSec,
            timeoutSec,
            format,
          });
          process.exit(exitCode);
        },
      ),
    ),
);

addCommonOptions(
  cli
    .command("doctor [target]", "Diagnose PR blockers")
    .example("gh prx doctor")
    .example("gh prx doctor 123 --format json")
    .action(
      withErrorHandling((target: string | undefined, options: CommonOptions) => {
        applyColorOption(options);
        const format = parseFormat(options.format);
        const repo = inferRepo(options.repo);
        const result = runDoctor(repo, target);

        printResult(format, result, () => {
          const colors = c();
          return [
            `${colors.bold(result.context.repo)} PR #${result.context.pr.number}`,
            ...result.diagnostics.map((diagnostic) => {
              const level =
                diagnostic.severity === "error"
                  ? colors.red(diagnostic.severity)
                  : diagnostic.severity === "warn"
                    ? colors.yellow(diagnostic.severity)
                    : colors.cyan(diagnostic.severity);
              return `- [${level}] ${diagnostic.code}: ${diagnostic.message} -> ${diagnostic.nextAction}`;
            }),
          ].join("\n");
        });
      }),
    ),
);

try {
  cli.parse(process.argv, { run: false });
  await cli.runMatchedCommand();
} catch (error: unknown) {
  if (error instanceof CliError) {
    process.stderr.write(`${c().red("error:")} ${error.message}\n`);
    process.exit(error.exitCode);
  }
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${c().red("error:")} ${message}\n`);
  process.exit(1);
}
