import { CliError } from "./errors";
import { ghExec } from "./gh";
import type { RepoRef } from "../domain/types";

export function inferRepo(override?: string): RepoRef {
  const fullName =
    override || ghExec(["repo", "view", "--json", "nameWithOwner", "-q", ".nameWithOwner"]);
  if (!fullName.includes("/")) {
    throw new CliError("Could not infer repository. Pass --repo owner/name.");
  }
  const [owner, name] = fullName.split("/");
  return {
    host: "github.com",
    owner,
    name,
    fullName,
  };
}
