import { ghJson } from "../util/gh";

export function queryGraphql<T>(
  query: string,
  vars: Record<string, string | number>,
  repo?: string,
): T {
  const args = ["api", "graphql", "-f", `query=${query}`];
  for (const [key, value] of Object.entries(vars)) {
    args.push("-F", `${key}=${String(value)}`);
  }
  return ghJson<T>(args, { repo });
}
