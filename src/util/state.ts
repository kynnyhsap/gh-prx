import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";

export interface StickyContext {
  repo: string;
  target: string;
  updatedAt: string;
}

interface StateFile {
  schemaVersion: number;
  stickyContext?: StickyContext;
}

function stateFilePath(): string {
  if (process.env.GH_PRX_STATE_FILE) return process.env.GH_PRX_STATE_FILE;
  const configHome = process.env.XDG_CONFIG_HOME || join(homedir(), ".config");
  return join(configHome, "gh-prx", "state.json");
}

function loadState(): StateFile {
  const path = stateFilePath();
  if (!existsSync(path)) {
    return { schemaVersion: 1 };
  }

  try {
    const raw = readFileSync(path, "utf8");
    const parsed = JSON.parse(raw) as StateFile;
    if (!parsed || typeof parsed !== "object") return { schemaVersion: 1 };
    return {
      schemaVersion: 1,
      stickyContext: parsed.stickyContext,
    };
  } catch {
    return { schemaVersion: 1 };
  }
}

function saveState(state: StateFile): void {
  const path = stateFilePath();
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(state, null, 2)}\n`, "utf8");
}

export function getStickyContext(): StickyContext | null {
  const state = loadState();
  if (!state.stickyContext) return null;
  return state.stickyContext;
}

export function setStickyContext(context: { repo: string; target: string }): StickyContext {
  const value: StickyContext = {
    repo: context.repo,
    target: context.target,
    updatedAt: new Date().toISOString(),
  };
  saveState({ schemaVersion: 1, stickyContext: value });
  return value;
}

export function clearStickyContext(): void {
  const path = stateFilePath();
  if (existsSync(path)) unlinkSync(path);
}
