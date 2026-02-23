import { CliError } from "./errors";

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

  const proc = Bun.spawnSync(["gh", ...fullArgs], {
    stdout: "pipe",
    stderr: "pipe",
  });

  const stdout = Buffer.from(proc.stdout).toString("utf8").trim();
  const stderr = Buffer.from(proc.stderr).toString("utf8").trim();

  if (proc.exitCode !== 0 && !options.allowFailure) {
    throw new CliError(stderr || `gh ${fullArgs.join(" ")} failed`, proc.exitCode || 1);
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
