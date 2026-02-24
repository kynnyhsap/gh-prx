import { CliError } from "./errors";
import { spawnSync } from "node:child_process";

interface GhExecOptions {
  repo?: string;
  allowFailure?: boolean;
}

export function ghExec(args: string[], options: GhExecOptions = {}): string {
  const fullArgs = [...args];
  const supportsRepoFlag = fullArgs[0] !== "api";
  if (
    supportsRepoFlag &&
    options.repo &&
    !fullArgs.includes("-R") &&
    !fullArgs.includes("--repo")
  ) {
    fullArgs.push("-R", options.repo);
  }

  const proc = spawnSync("gh", fullArgs, {
    encoding: "utf8",
  });

  const stdout = (proc.stdout || "").trim();
  const stderr = (proc.stderr || "").trim();

  if (proc.status !== 0 && !options.allowFailure) {
    throw new CliError(stderr || `gh ${fullArgs.join(" ")} failed`, proc.status || 1);
  }

  return stdout;
}

export function ghJson<T>(args: string[], options: GhExecOptions = {}): T {
  const raw = ghExec(args, options);
  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new CliError(`Expected JSON from: gh ${args.join(" ")}`);
  }
}
