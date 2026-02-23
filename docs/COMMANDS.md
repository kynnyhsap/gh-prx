# Command Reference

All commands support:

- `--format text|json|jsonl` (default `text`)
- `--repo owner/name` (optional)
- `--no-color` (also honors `NO_COLOR`)

## `gh prx context [<pr>|<branch>]`

Unified snapshot: PR metadata, unresolved review threads, check summary, latest run, suggested next action.

Examples:

```bash
gh prx context
gh prx context 123
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
gh prx ci status 123
gh prx ci status 18840201234
```

## `gh prx ci logs [<pr>|<branch>|<run-id>] [--failed] [--job <id>] [--tail <n>]`

Prints logs for the run (or job) with optional failure-only mode.

Examples:

```bash
gh prx ci logs --failed
gh prx ci logs 18840201234 --job 56499230103 --tail 300
```

## `gh prx ci annotations [<pr>|<branch>|<run-id>] [--failed]`

Fetches check-run annotations and prints normalized diagnostics.

Examples:

```bash
gh prx ci annotations --failed
gh prx ci annotations 18840201234 --format json
```

## `gh prx ci watch [<pr>|<branch>|<run-id>] [--fail-fast] [--interval <sec>] [--timeout <sec>]`

Watches CI progress and emits updates. Use `--format jsonl` for streaming events.

Examples:

```bash
gh prx ci watch --fail-fast
gh prx ci watch --interval 5 --timeout 1200 --format jsonl
```

## `gh prx doctor [<pr>|<branch>]`

Classifies merge blockers and prints next actions.

Examples:

```bash
gh prx doctor
gh prx doctor 123 --format json
```
