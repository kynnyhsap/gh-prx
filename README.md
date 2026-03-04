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
- One-shot CI failure diagnosis (`ci diagnose`)
- CI mutating controls (`ci rerun`, `ci cancel`)
- Polling watch mode with fail-fast exit (`ci watch --fail-fast`)
- Opinionated blocker diagnosis (`doctor`)
- Single actionable next-step planning (`next`)
- Agent profile (`--agent`) with JSON/no-color/smart defaults
- Explicit target typing (`--pr`, `--run`, `pr:`, `run:`)
- Sticky repo/target context (`use`)

## Install

### Recommended (default)

```bash
gh extension install kynnyhsap/gh-prx
```

This uses precompiled release assets when available, so no local build step is required.

### Prerequisites

- `gh` CLI authenticated (`gh auth status`)

For source installs from a local clone, you also need:

- Bun
- Node.js 20+

### Manual install from source (secondary)

```bash
git clone https://github.com/kynnyhsap/gh-prx
cd gh-prx
bun install
bun run build
gh extension install .
```

If you previously installed from GitHub and want to switch back to source mode:

```bash
gh extension remove prx
gh extension install .
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
- `--agent` (agent-optimized defaults)
- `--no-color` (also honors `NO_COLOR`)

Targeted commands also support:

- `--pr <target>` to force PR resolution
- `--run <id>` to force run-id resolution
- `pr:<target>` / `run:<id>` prefixed targets

### Top-level commands

- `gh prx context [<pr>|<branch>]`
- `gh prx threads list [<pr>|<branch>] [--unresolved]`
- `gh prx threads resolve <thread-id>`
- `gh prx threads unresolve <thread-id>`
- `gh prx ci status [<pr>|<branch>|<run-id>]`
- `gh prx ci logs [<pr>|<branch>|<run-id>] [--failed] [--job <id>] [--tail <n>]`
- `gh prx ci annotations [<pr>|<branch>|<run-id>] [--failed]`
- `gh prx ci rerun [<pr>|<branch>|<run-id>] [--failed] [--job <id>] [--debug]`
- `gh prx ci cancel [<pr>|<branch>|<run-id>] [--force]`
- `gh prx ci diagnose [<pr>|<branch>|<run-id>] [--tail <n>] [--max-jobs <n>]`
- `gh prx ci watch [<pr>|<branch>|<run-id>] [--fail-fast] [--interval <sec>] [--timeout <sec>]`
- `gh prx next [<pr>|<branch>]`
- `gh prx doctor [<pr>|<branch>]`
- `gh prx use [<pr>|<branch>|<run-id>] [--clear]`

For complete option docs and examples see `docs/COMMANDS.md`.

## Quickstart workflows

### 1) One-shot PR triage

```bash
gh prx context
```

### 2) Review-first loop

```bash
gh prx threads list --unresolved
gh prx next
gh prx context
gh prx doctor
```

### 3) CI-first loop

```bash
gh prx ci status
gh prx ci diagnose
gh prx ci logs --failed --tail 200
gh prx ci annotations --failed
```

### 4) Live fail-fast monitoring

```bash
gh prx ci watch --fail-fast --format jsonl
```

### 5) Sticky target for repeated loops

```bash
gh prx use pr:123 --repo owner/repo
gh prx context
gh prx next
gh prx use --clear
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
2. sticky context from `gh prx use`
3. current git repo via `gh repo view`

PR target resolution behavior:

- If you pass `<pr>`/`<branch>`, that target is used.
- Else if sticky context exists, sticky target is used.
- If omitted and no sticky target exists, current branch PR is used.
- If no PR is associated, a clear error is returned.

## Runtime behavior (release binaries + source fallback)

`gh-prx` supports two distribution modes:

1. **Release install (`gh extension install kynnyhsap/gh-prx`)**
   - uses precompiled standalone binaries from GitHub Releases
   - no local build required
2. **Source install (`gh extension install .`)**
   - executes `gh-prx` launcher + `dist/index.js`
   - Bun is preferred, Node.js 20+ is fallback

For source installs, the CLI is built to `dist/index.js`, then executed by Bun or Node.

## Architecture

`gh-prx` ships both as precompiled release binaries and as a script-mode source install. All command behavior is implemented in this repo.

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
bun run build:check
bun run build:exe
bun release
```

Release binary build (all targets):

```bash
bun run build:release -- v0.1.3
```

Release binaries are written to `release-dist/`.

One-command release cut (version bump + checks + commit + tag + push):

```bash
bun release
```

`patch` is the default. Accepted targets: `patch`, `minor`, `major`, or explicit `vX.Y.Z`.

Examples:

```bash
bun release
bun release minor
bun release v0.2.0
```

## Release automation

Tag pushes trigger `.github/workflows/release.yml`, which uses `cli/gh-extension-precompile@v2` with `script/build.ts`.
The build script runs lint/typecheck and emits platform binaries to `dist/` so `gh extension install kynnyhsap/gh-prx` can install precompiled assets automatically.

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
