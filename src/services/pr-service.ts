import type { CheckSummary, PrRef, RepoRef } from "../domain/types";
import { CliError } from "../util/errors";
import { ghJson } from "../util/gh";

interface GhPr {
  number: number;
  title: string;
  url: string;
  baseRefName: string;
  headRefName: string;
  headRefOid: string;
  mergeStateStatus?: string;
  reviewDecision?: string;
  isDraft: boolean;
}

const prFields = [
  "number",
  "title",
  "url",
  "baseRefName",
  "headRefName",
  "headRefOid",
  "mergeStateStatus",
  "reviewDecision",
  "isDraft",
].join(",");

export function resolvePr(target: string | undefined, repo: RepoRef): PrRef {
  const baseArgs = ["pr", "view"];
  if (target) baseArgs.push(target);
  baseArgs.push("--json", prFields);

  let pr: GhPr;
  try {
    if (target) {
      pr = ghJson<GhPr>(baseArgs, { repo: repo.fullName });
    } else {
      pr = ghJson<GhPr>(baseArgs);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    if (!target) {
      const branch = currentBranch();
      if (branch) {
        try {
          pr = ghJson<GhPr>(["pr", "view", branch, "--json", prFields], { repo: repo.fullName });
          if (pr?.number) return pr;
        } catch {
          // Ignore fallback failure and throw clean error below.
        }
      }
    }

    if (!target) {
      throw new CliError(
        "No pull request is associated with the current branch. Pass a PR number, URL, or branch (for example: `gh prx context 123`).",
      );
    }
    throw new CliError(`Could not resolve PR from '${target}': ${message}`);
  }

  if (!pr || !pr.number) {
    throw new CliError("Could not resolve PR from target. Try passing a PR number.");
  }
  return pr;
}

function currentBranch(): string | null {
  const proc = Bun.spawnSync(["git", "branch", "--show-current"], {
    stdout: "pipe",
    stderr: "pipe",
  });
  if (proc.exitCode !== 0) return null;
  const branch = Buffer.from(proc.stdout).toString("utf8").trim();
  return branch || null;
}

export function listChecks(prNumber: number, repo: RepoRef): CheckSummary[] {
  const fields = ["name", "state", "bucket", "workflow", "link", "startedAt", "completedAt"].join(
    ",",
  );
  try {
    return ghJson<CheckSummary[]>(["pr", "checks", String(prNumber), "--json", fields], {
      repo: repo.fullName,
    });
  } catch {
    return [];
  }
}
