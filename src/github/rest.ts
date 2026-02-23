import { ghJson, ghExec } from "../util/gh";

export function getJson<T>(path: string, repo?: string): T {
  return ghJson<T>(["api", path], { repo });
}

export function postJson<T>(path: string, body: Record<string, unknown>, repo?: string): T {
  const args = ["api", path, "-X", "POST"];
  for (const [key, value] of Object.entries(body)) {
    args.push("-F", `${key}=${String(value)}`);
  }
  return ghJson<T>(args, { repo });
}

export function getText(path: string, repo?: string): string {
  return ghExec(["api", path], { repo });
}
