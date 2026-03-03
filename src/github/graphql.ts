import { ghJson } from "../util/gh";

export function queryGraphql<T>(
  query: string,
  vars: Record<string, string | number | boolean | null | undefined>,
  repo?: string,
): T {
  const args = ["api", "graphql", "-f", `query=${query}`];
  for (const [key, value] of Object.entries(vars)) {
    if (value === undefined || value === null) continue;
    args.push("-F", `${key}=${String(value)}`);
  }
  return ghJson<T>(args, { repo });
}
