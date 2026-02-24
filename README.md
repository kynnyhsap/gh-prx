# gh-prx

`gh-prx` is a GitHub CLI extension for fast PR iteration: unresolved review threads, CI status, failed logs, annotations, and fail-fast watch mode from one command surface.

It is optimized for both humans and coding agents:

- default output is readable `text`
- deterministic `json` for scripting
- streaming `jsonl` for watch loops

## Why this exists

Most PR debugging loops are fragmented across multiple commands:

- `gh pr view`
- `gh pr checks`
- `gh run view --log-failed`
- `gh api graphql ...`

`gh-prx` collapses these into a single workflow-oriented CLI.

## Features

- Unified PR + CI snapshot (`context`)
- Review thread queue with `file:line` (`threads list`)
- Resolve/unresolve review threads (`threads resolve`, `threads unresolve`)
- CI run/job summaries (`ci status`)
- Failure-focused log triage (`ci logs --failed`)
- Check annotation diagnostics (`ci annotations`)
- Polling watch mode with fail-fast exit (`ci watch --fail-fast`)
- Opinionated blocker diagnosis (`doctor`)

## Install

### Prerequisites

- `gh` CLI authenticated (`gh auth status`)
- Bun (preferred) or Node.js 22+ (fallback launcher uses `--experimental-strip-types`)

### Install from source (local)

```bash
git clone https://github.com/kynnyhsap/gh-prx
cd gh-prx
bun install
bun run build
gh extension install .
```

### Install from GitHub directly

```bash
gh extension install kynnyhsap/gh-prx
```

### Verify

```bash
gh prx --help
gh prx context
```

## Command overview

All commands support:

- `--format text|json|jsonl` (default: `text`)
- `--repo owner/name` (optional override)
- `--no-color` (also honors `NO_COLOR`)

### Top-level commands

- `gh prx context [<pr>|<branch>]`
- `gh prx threads list [<pr>|<branch>] [--unresolved]`
- `gh prx threads resolve <thread-id>`
- `gh prx threads unresolve <thread-id>`
- `gh prx ci status [<pr>|<branch>|<run-id>]`
- `gh prx ci logs [<pr>|<branch>|<run-id>] [--failed] [--job <id>] [--tail <n>]`
- `gh prx ci annotations [<pr>|<branch>|<run-id>] [--failed]`
- `gh prx ci watch [<pr>|<branch>|<run-id>] [--fail-fast] [--interval <sec>] [--timeout <sec>]`
- `gh prx doctor [<pr>|<branch>]`

For complete option docs and examples see `docs/COMMANDS.md`.

## Quickstart workflows

### 1) One-shot PR triage

```bash
gh prx context
```

### 2) Review-first loop

```bash
gh prx threads list --unresolved
gh prx context
gh prx doctor
```

### 3) CI-first loop

```bash
gh prx ci status
gh prx ci logs --failed --tail 200
gh prx ci annotations --failed
```

### 4) Live fail-fast monitoring

```bash
gh prx ci watch --fail-fast --format jsonl
```

## Output formats

- `text`: default human/agent-readable terminal output
- `json`: machine-friendly snapshot output
- `jsonl`: event stream output for long-running flows (`ci watch`)

Examples:

```bash
gh prx context --format json
gh prx ci watch --fail-fast --format jsonl
NO_COLOR=1 gh prx context
gh prx context --no-color
```

## Repo resolution behavior

`gh-prx` resolves repository in this order:

1. explicit `--repo owner/name`
2. current git repo via `gh repo view`

PR target resolution behavior:

- If you pass `<pr>`/`<branch>`, that target is used.
- If omitted, current branch PR is used.
- If no PR is associated, a clear error is returned.

## Runtime behavior (Bun + Node)

The launcher script (`gh-prx`) supports both runtimes:

1. uses Bun if available
2. otherwise uses Node.js 22+ with `--experimental-strip-types`

This keeps dev ergonomics fast with Bun while remaining Node-compatible.

## Architecture

`gh-prx` is a script extension. GitHub CLI executes the root executable `gh-prx`, and all command behavior is implemented in this repo.

Core layers:

- CLI and command wiring: `src/cli/index.ts` (built with `goke`)
- Domain models: `src/domain/types.ts`
- GitHub wrappers:
  - GraphQL: `src/github/graphql.ts`
  - REST: `src/github/rest.ts`
  - base executor: `src/util/gh.ts`
- Services:
  - PR and checks: `src/services/pr-service.ts`
  - threads: `src/services/thread-service.ts`
  - CI: `src/services/ci-service.ts`
  - context: `src/services/context-service.ts`
  - doctor: `src/services/doctor-service.ts`
  - watch: `src/services/watch-service.ts`
- Output renderers: `src/output/text.ts`, `src/util/output.ts`

## Permissions and API dependencies

`gh-prx` relies on your authenticated `gh` session and these API surfaces:

- GraphQL review thread queries/mutations
- Actions/check runs/job logs/annotations APIs

If your token lacks permissions, commands fail with actionable errors from `gh`.

## Troubleshooting

### `No pull request is associated with the current branch`

- pass an explicit target: `gh prx context 123`
- or pass a branch: `gh prx context my-branch`

### `No workflow runs found for this target`

- run `gh prx ci status <pr-or-run-id>` with a target that has checks
- verify repository with `--repo owner/name`

### `gh` auth/scope issues

- run `gh auth status`
- re-auth if needed: `gh auth login`

### unexpected color in logs

- use `--no-color` or set `NO_COLOR=1`

## Development

```bash
bun install
bun run format
bun run lint
bun run typecheck
bun test
bun run build
```

## End-to-end tests

Readonly live suite:

```bash
bun run e2e:live
```

Default readonly target is `oven-sh/bun`.

Override target if needed:

```bash
GH_PRX_E2E_REPO=cli/cli GH_PRX_E2E_CWD=$(pwd) bun run e2e:live
```

## Related docs

- command reference: `docs/COMMANDS.md`
- setup and local development: `docs/SETUP.md`
- agent usage patterns: `docs/AGENT_GUIDE.md`

## License

MIT (`LICENSE`)
