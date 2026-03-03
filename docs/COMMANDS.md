# Command Reference

All commands support:

- `--format text|json|jsonl` (default `text`)
- `--repo owner/name` (optional)
- `--agent` (agent profile: json/no-color/smart defaults)
- `--no-color` (also honors `NO_COLOR`)

Commands with `[target]` also support:

- `--pr <target>` force PR resolution
- `--run <id>` force run-id resolution
- `pr:<target>` or `run:<id>` target prefixes

## `gh prx context [<pr>|<branch>]`

Unified snapshot: PR metadata, unresolved review threads, check summary, latest run, suggested next action.

Examples:

```bash
gh prx context
gh prx context 123
gh prx context pr:my-feature-branch --repo owner/repo
gh prx context my-feature-branch --format json
```

## `gh prx threads list [<pr>|<branch>] [--unresolved]`

Lists review threads with `file:line` and latest comment metadata.

Examples:

```bash
gh prx threads list
gh prx threads list 123 --unresolved
```

## `gh prx threads resolve <thread-id>`

Resolves a review thread via GraphQL mutation.

Example:

```bash
gh prx threads resolve PRRT_kwD...
```

## `gh prx threads unresolve <thread-id>`

Unresolves a review thread.

Example:

```bash
gh prx threads unresolve PRRT_kwD...
```

## `gh prx ci status [<pr>|<branch>|<run-id>]`

Shows latest run state and jobs. If target is omitted, resolves current branch PR.

Examples:

```bash
gh prx ci status
gh prx ci status --pr 123
gh prx ci status run:18840201234
```

## `gh prx ci logs [<pr>|<branch>|<run-id>] [--failed] [--job <id>] [--tail <n>]`

Prints logs for the run (or job) with optional failure-only mode.

Examples:

```bash
gh prx ci logs --failed
gh prx ci logs run:18840201234 --job 56499230103 --tail 300
```

## `gh prx ci annotations [<pr>|<branch>|<run-id>] [--failed]`

Fetches check-run annotations and prints normalized diagnostics.

Examples:

```bash
gh prx ci annotations --failed
gh prx ci annotations run:18840201234 --format json
```

## `gh prx ci diagnose [<pr>|<branch>|<run-id>] [--tail <n>] [--max-jobs <n>]`

Builds a failure-focused payload: failing jobs, targeted log tails, and annotations grouped by file.

Examples:

```bash
gh prx ci diagnose
gh prx ci diagnose run:18840201234 --tail 300 --max-jobs 2
```

## `gh prx ci watch [<pr>|<branch>|<run-id>] [--fail-fast] [--interval <sec>] [--timeout <sec>]`

Watches CI progress and emits updates. Use `--format jsonl` for streaming events.

Examples:

```bash
gh prx ci watch --fail-fast
gh prx ci watch run:18840201234 --interval 5 --timeout 1200 --format jsonl
```

## `gh prx next [<pr>|<branch>]`

Returns one machine-friendly actionable next step for agents.

Examples:

```bash
gh prx next
gh prx next pr:123 --format json
```

## `gh prx doctor [<pr>|<branch>]`

Classifies merge blockers and prints next actions.

Examples:

```bash
gh prx doctor
gh prx doctor 123 --format json
```

## `gh prx use [<pr>|<branch>|<run-id>] [--clear]`

Shows or persists sticky repo/target context used when later commands omit target/repo.

Examples:

```bash
gh prx use
gh prx use pr:123 --repo owner/repo
gh prx use run:18840201234 --repo owner/repo
gh prx use --clear
```
