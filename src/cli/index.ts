#!/usr/bin/env node

import goke from "goke";
import type { OutputFormat, RepoRef } from "../domain/types";
import {
  renderAnnotations,
  renderChecks,
  renderCiDiagnosis,
  renderNextStep,
  renderRun,
  renderThreads,
} from "../output/text";
import { getAnnotations, getRunLogs, getRunSummary, resolveRunId } from "../services/ci-service";
import { buildContext } from "../services/context-service";
import { diagnoseCi } from "../services/diagnose-service";
import { runDoctor } from "../services/doctor-service";
import { getNextStep } from "../services/next-service";
import { listChecks, resolvePr } from "../services/pr-service";
import { getThreads, resolveThread, unresolveThread } from "../services/thread-service";
import { watchCi } from "../services/watch-service";
import { c, isColorEnabled, setColorEnabled } from "../util/colors";
import { CliError } from "../util/errors";
import { printResult } from "../util/output";
import { inferRepo } from "../util/repo";
import { clearStickyContext, getStickyContext, setStickyContext } from "../util/state";
import {
  isRunLikeAutoTarget,
  parseTarget,
  requirePrTarget,
  targetToServiceInput,
  toStoredTarget,
  type ParsedTarget,
} from "../util/target";

interface CommonOptions {
  format?: OutputFormat;
  repo?: string;
  noColor?: boolean;
  agent?: boolean;
}

interface TargetOptions extends CommonOptions {
  pr?: string;
  run?: string;
}

if (
  process.argv.includes("--no-color") ||
  process.argv.includes("--noColor") ||
  process.argv.includes("--agent")
) {
  setColorEnabled(false);
}

function parseFormat(
  value: string | undefined,
  agentMode = false,
  agentDefault: OutputFormat = "json",
): OutputFormat {
  if (!value) return agentMode ? agentDefault : "text";
  if (value === "text" || value === "json" || value === "jsonl") return value;
  throw new CliError("--format must be text|json|jsonl");
}

function applyColorOption(options: CommonOptions): void {
  setColorEnabled(isColorEnabled(Boolean(options.noColor || options.agent)));
}

function addTargetOptions<T extends { option: (raw: string, description?: string) => T }>(
  cmd: T,
): T {
  return cmd
    .option("--pr [target]", "Treat target as PR number/url/branch")
    .option("--run [id]", "Treat target as workflow run id");
}

function addCommonOptions<T extends { option: (raw: string, description?: string) => T }>(
  cmd: T,
): T {
  return cmd
    .option("--format [format]", "Output format: text|json|jsonl (default: text)")
    .option("--repo [repo]", "Target repository in owner/name format")
    .option("--agent", "Agent mode: defaults to json + no color + smart flags")
    .option("--no-color", "Disable colored output (also honors NO_COLOR env)");
}

function resolveRepoAndTarget(
  target: string | undefined,
  options: TargetOptions,
): {
  repo: RepoRef;
  parsedTarget: ParsedTarget;
} {
  let parsedTarget = parseTarget({
    target,
    pr: options.pr,
    run: options.run,
  });

  const sticky = getStickyContext();
  if (parsedTarget.kind === "none" && sticky?.target) {
    parsedTarget = parseTarget({ target: sticky.target });
  }

  const repoOverride = options.repo || sticky?.repo;
  const repo = inferRepo(repoOverride);
  return { repo, parsedTarget };
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
  addTargetOptions(
    cli
      .command("context [target]", "Unified PR + CI snapshot")
      .example("gh prx context")
      .example("gh prx context 123")
      .example("gh prx context docs/my-branch --repo cli/cli")
      .action(
        withErrorHandling((target: string | undefined, options: TargetOptions) => {
          applyColorOption(options);
          const format = parseFormat(options.format, Boolean(options.agent));
          const { repo, parsedTarget } = resolveRepoAndTarget(target, options);
          const prTarget = requirePrTarget(parsedTarget, "context");
          const context = buildContext(repo, prTarget);

          printResult(format, context, () => {
            const colors = c();
            return [
              `${colors.bold(context.repo)} PR #${context.pr.number}: ${context.pr.title}`,
              `${colors.bold("Suggested next action:")} ${colors.cyan(context.suggestedNextAction)}`,
              `${colors.bold("Suggested command:")} ${colors.cyan(context.suggestedNextCommand)}`,
              `${colors.bold("Unresolved threads:")} ${context.unresolvedThreads.length}`,
              renderChecks(context.checks),
              context.latestRun
                ? renderRun(context.latestRun)
                : "No workflow run found for this PR.",
            ].join("\n\n");
          });
        }),
      ),
  ),
);

addCommonOptions(
  addTargetOptions(
    cli
      .command("threads list [target]", "List review threads")
      .option("--unresolved", "Show unresolved threads only")
      .example("gh prx threads list")
      .example("gh prx threads list 123 --unresolved")
      .action(
        withErrorHandling(
          (target: string | undefined, options: TargetOptions & { unresolved?: boolean }) => {
            applyColorOption(options);
            const format = parseFormat(options.format, Boolean(options.agent));
            const { repo, parsedTarget } = resolveRepoAndTarget(target, options);
            const prTarget = requirePrTarget(parsedTarget, "threads list");
            const unresolvedOnly = Boolean(options.unresolved || options.agent);
            const pr = resolvePr(prTarget, repo);
            const threads = getThreads(repo, pr.number, unresolvedOnly);
            printResult(format, { pr: pr.number, threads }, () => renderThreads(threads));
          },
        ),
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
        const format = parseFormat(options.format, Boolean(options.agent));
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
        const format = parseFormat(options.format, Boolean(options.agent));
        const repo = inferRepo(options.repo);
        const result = unresolveThread(repo, threadId);
        printResult(format, result, () => `Thread ${result.id} resolved=${result.isResolved}`);
      }),
    ),
);

addCommonOptions(
  addTargetOptions(
    cli
      .command("ci status [target]", "Show CI status and latest run jobs")
      .example("gh prx ci status")
      .example("gh prx ci status 123")
      .example("gh prx ci status run:22305316388")
      .action(
        withErrorHandling((target: string | undefined, options: TargetOptions) => {
          applyColorOption(options);
          const format = parseFormat(options.format, Boolean(options.agent));
          const { repo, parsedTarget } = resolveRepoAndTarget(target, options);
          const serviceTarget = targetToServiceInput(parsedTarget);
          const runId = resolveRunId(repo, serviceTarget.target, serviceTarget.mode);
          const run = getRunSummary(repo, runId);

          let checks: ReturnType<typeof listChecks> = [];
          const shouldLoadChecks =
            parsedTarget.kind === "none" ||
            parsedTarget.kind === "pr" ||
            (parsedTarget.kind === "auto" && !isRunLikeAutoTarget(parsedTarget.value));

          if (shouldLoadChecks) {
            const prTarget = parsedTarget.kind === "none" ? undefined : parsedTarget.value;
            const pr = resolvePr(prTarget, repo);
            checks = listChecks(pr.number, repo);
          }

          printResult(format, { run, checks }, () => {
            const checksBlock = checks.length > 0 ? renderChecks(checks) : "";
            return [renderRun(run), checksBlock].filter(Boolean).join("\n\n");
          });
        }),
      ),
  ),
);

addCommonOptions(
  addTargetOptions(
    cli
      .command("ci logs [target]", "Show workflow logs")
      .option("--failed", "Show only failed log sections")
      .option("--job [id]", "Specific job ID")
      .option("--tail [n]", "Tail size in lines (default: 200)")
      .example("gh prx ci logs --failed")
      .example("gh prx ci logs run:22305316388 --job 61631229417 --tail 300")
      .action(
        withErrorHandling(
          (
            target: string | undefined,
            options: TargetOptions & { failed?: boolean; job?: string; tail?: string },
          ) => {
            applyColorOption(options);
            const format = parseFormat(options.format, Boolean(options.agent));
            const { repo, parsedTarget } = resolveRepoAndTarget(target, options);
            const serviceTarget = targetToServiceInput(parsedTarget);
            const runId = resolveRunId(repo, serviceTarget.target, serviceTarget.mode);
            const tailSize = Number(options.tail || "200");
            if (!Number.isFinite(tailSize) || tailSize <= 0) {
              throw new CliError("--tail must be a positive number");
            }
            const jobId = options.job ? Number(options.job) : undefined;
            if (options.job && (!Number.isFinite(jobId) || (jobId || 0) <= 0)) {
              throw new CliError("--job must be a numeric job id");
            }
            const failedOnly = Boolean(options.failed || options.agent);
            const logs = getRunLogs(repo, runId, failedOnly, jobId, tailSize);
            printResult(format, { runId, failedOnly, jobId, logs }, () => logs);
          },
        ),
      ),
  ),
);

addCommonOptions(
  addTargetOptions(
    cli
      .command("ci annotations [target]", "Show check-run annotations")
      .option("--failed", "Only annotations from failed jobs")
      .example("gh prx ci annotations --failed")
      .action(
        withErrorHandling(
          (target: string | undefined, options: TargetOptions & { failed?: boolean }) => {
            applyColorOption(options);
            const format = parseFormat(options.format, Boolean(options.agent));
            const { repo, parsedTarget } = resolveRepoAndTarget(target, options);
            const serviceTarget = targetToServiceInput(parsedTarget);
            const runId = resolveRunId(repo, serviceTarget.target, serviceTarget.mode);
            const failedOnly = Boolean(options.failed || options.agent);
            const annotations = getAnnotations(repo, runId, failedOnly);
            printResult(format, { runId, failedOnly, annotations }, () =>
              renderAnnotations(annotations),
            );
          },
        ),
      ),
  ),
);

addCommonOptions(
  addTargetOptions(
    cli
      .command("ci diagnose [target]", "Diagnose failing jobs with logs and annotations")
      .option("--tail [n]", "Tail size in lines per failing job (default: 200)")
      .option("--max-jobs [n]", "Maximum failing jobs to include (default: 3)")
      .example("gh prx ci diagnose")
      .example("gh prx ci diagnose run:22305316388 --tail 300 --max-jobs 2")
      .action(
        withErrorHandling(
          (
            target: string | undefined,
            options: TargetOptions & { tail?: string; maxJobs?: string },
          ) => {
            applyColorOption(options);
            const format = parseFormat(options.format, Boolean(options.agent));
            const { repo, parsedTarget } = resolveRepoAndTarget(target, options);
            const serviceTarget = targetToServiceInput(parsedTarget);
            const tail = Number(options.tail || "200");
            const maxJobs = Number(options.maxJobs || "3");
            if (!Number.isFinite(tail) || tail <= 0) {
              throw new CliError("--tail must be a positive number");
            }
            if (!Number.isFinite(maxJobs) || maxJobs <= 0) {
              throw new CliError("--max-jobs must be a positive number");
            }

            const diagnosis = diagnoseCi(repo, {
              target: serviceTarget.target,
              targetMode: serviceTarget.mode,
              tail,
              maxJobs,
            });

            printResult(format, diagnosis, () => renderCiDiagnosis(diagnosis));
          },
        ),
      ),
  ),
);

addCommonOptions(
  addTargetOptions(
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
            options: TargetOptions & {
              failFast?: boolean;
              interval?: string;
              timeout?: string;
            },
          ) => {
            applyColorOption(options);
            const format = parseFormat(options.format, Boolean(options.agent), "jsonl");
            const { repo, parsedTarget } = resolveRepoAndTarget(target, options);
            const serviceTarget = targetToServiceInput(parsedTarget);
            const intervalSec = Number(options.interval || "10");
            const timeoutSec = Number(options.timeout || "1800");
            if (!Number.isFinite(intervalSec) || intervalSec <= 0) {
              throw new CliError("--interval must be a positive number");
            }
            if (!Number.isFinite(timeoutSec) || timeoutSec <= 0) {
              throw new CliError("--timeout must be a positive number");
            }
            const exitCode = await watchCi(repo, {
              target: serviceTarget.target,
              targetMode: serviceTarget.mode,
              failFast: Boolean(options.failFast || options.agent),
              intervalSec,
              timeoutSec,
              format,
            });
            process.exit(exitCode);
          },
        ),
      ),
  ),
);

addCommonOptions(
  addTargetOptions(
    cli
      .command("next [target]", "Return one actionable next step")
      .example("gh prx next")
      .example("gh prx next pr:123 --format json")
      .action(
        withErrorHandling((target: string | undefined, options: TargetOptions) => {
          applyColorOption(options);
          const format = parseFormat(options.format, Boolean(options.agent));
          const { repo, parsedTarget } = resolveRepoAndTarget(target, options);
          const prTarget = requirePrTarget(parsedTarget, "next");
          const next = getNextStep(repo, prTarget);
          printResult(format, next, () => renderNextStep(next));
        }),
      ),
  ),
);

addCommonOptions(
  addTargetOptions(
    cli
      .command("doctor [target]", "Diagnose PR blockers")
      .example("gh prx doctor")
      .example("gh prx doctor 123 --format json")
      .action(
        withErrorHandling((target: string | undefined, options: TargetOptions) => {
          applyColorOption(options);
          const format = parseFormat(options.format, Boolean(options.agent));
          const { repo, parsedTarget } = resolveRepoAndTarget(target, options);
          const prTarget = requirePrTarget(parsedTarget, "doctor");
          const result = runDoctor(repo, prTarget);

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
                const command = diagnostic.command ? ` (${colors.cyan(diagnostic.command)})` : "";
                return `- [${level}] ${diagnostic.code}: ${diagnostic.message} -> ${diagnostic.nextAction}${command}`;
              }),
            ].join("\n");
          });
        }),
      ),
  ),
);

addCommonOptions(
  addTargetOptions(
    cli
      .command("use [target]", "Show or persist sticky repo/target context")
      .option("--clear", "Clear sticky context")
      .example("gh prx use")
      .example("gh prx use 123 --repo owner/repo")
      .example("gh prx use run:22305316388 --repo owner/repo")
      .example("gh prx use --clear")
      .action(
        withErrorHandling(
          (
            target: string | undefined,
            options: TargetOptions & {
              clear?: boolean;
            },
          ) => {
            applyColorOption(options);
            const format = parseFormat(options.format, Boolean(options.agent));

            if (options.clear) {
              clearStickyContext();
              printResult(
                format,
                { stickyContext: null, cleared: true },
                () => "Sticky context cleared.",
              );
              return;
            }

            const parsedTarget = parseTarget({ target, pr: options.pr, run: options.run });
            if (parsedTarget.kind === "none") {
              const sticky = getStickyContext();
              printResult(format, { stickyContext: sticky }, () =>
                sticky
                  ? `Sticky context: ${sticky.repo} ${sticky.target} (updated ${sticky.updatedAt})`
                  : "No sticky context set.",
              );
              return;
            }

            const stickyTarget = toStoredTarget(parsedTarget);
            if (!stickyTarget) {
              throw new CliError("Could not determine sticky target");
            }

            const repo = inferRepo(options.repo);
            const saved = setStickyContext({
              repo: repo.fullName,
              target: stickyTarget,
            });

            printResult(
              format,
              { stickyContext: saved },
              () => `Sticky context set: ${saved.repo} ${saved.target}`,
            );
          },
        ),
      ),
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
