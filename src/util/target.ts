import { CliError } from "./errors";

export type ParsedTarget =
  | { kind: "none" }
  | { kind: "auto"; value: string }
  | { kind: "pr"; value: string }
  | { kind: "run"; value: string };

interface ParseTargetOptions {
  target?: string;
  pr?: string;
  run?: string;
}

function isNumeric(value: string): boolean {
  return /^\d+$/.test(value);
}

function nonEmpty(value: string, label: string): string {
  const trimmed = value.trim();
  if (!trimmed) throw new CliError(`${label} cannot be empty`);
  return trimmed;
}

function ensureRunId(value: string, source: string): string {
  const normalized = nonEmpty(value, source);
  if (!isNumeric(normalized)) {
    throw new CliError(`${source} must be a numeric workflow run id`);
  }
  return normalized;
}

export function parseTarget(options: ParseTargetOptions): ParsedTarget {
  if (options.pr && options.run) {
    throw new CliError("Use either --pr or --run, not both");
  }

  if (options.pr) {
    return { kind: "pr", value: nonEmpty(options.pr, "--pr") };
  }

  if (options.run) {
    return { kind: "run", value: ensureRunId(options.run, "--run") };
  }

  const raw = options.target?.trim();
  if (!raw) return { kind: "none" };

  if (raw.startsWith("pr:")) {
    return { kind: "pr", value: nonEmpty(raw.slice(3), "pr target") };
  }

  if (raw.startsWith("run:")) {
    return { kind: "run", value: ensureRunId(raw.slice(4), "run target") };
  }

  return { kind: "auto", value: raw };
}

export function isRunLikeAutoTarget(value: string | undefined): boolean {
  if (!value) return false;
  return isNumeric(value) && value.length >= 7;
}

export function targetToServiceInput(parsed: ParsedTarget): {
  target: string | undefined;
  mode: "auto" | "pr" | "run";
} {
  if (parsed.kind === "none") return { target: undefined, mode: "auto" };
  if (parsed.kind === "pr") return { target: parsed.value, mode: "pr" };
  if (parsed.kind === "run") return { target: parsed.value, mode: "run" };
  return { target: parsed.value, mode: "auto" };
}

export function requirePrTarget(parsed: ParsedTarget, commandName: string): string | undefined {
  if (parsed.kind === "run") {
    throw new CliError(`${commandName} does not accept run targets. Use --pr or pr:<target>.`);
  }
  if (parsed.kind === "none") return undefined;
  return parsed.value;
}

export function toStoredTarget(parsed: ParsedTarget): string | null {
  if (parsed.kind === "none") return null;
  if (parsed.kind === "run") return `run:${parsed.value}`;
  if (parsed.kind === "pr") return `pr:${parsed.value}`;
  return `pr:${parsed.value}`;
}
