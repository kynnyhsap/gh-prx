# Setup and Development

## Prerequisites

- `gh` CLI installed
- `gh auth login` completed
- Bun installed (preferred) or Node.js 22+

## Local setup

```bash
bun install
bun run build
gh extension install .
```

`gh extension install .` creates a local symlink to the root executable (`gh-prx`).

## Run commands

```bash
gh prx context
gh prx doctor
```

## Tooling

- Lint: `bun run lint` (oxlint)
- Format: `bun run format` (oxfmt)
- Typecheck: `bun run typecheck` (tsgo)
- Tests: `bun test`

No lint/format config files are required; defaults are used.

## Live e2e

```bash
bun run e2e:live
```

Default target is `oven-sh/bun`.

Override target repository by setting:

- `GH_PRX_E2E_REPO` (for example `cli/cli`)
- `GH_PRX_E2E_CWD` (optional working directory; defaults to current directory)

Example:

```bash
GH_PRX_E2E_REPO=cli/cli GH_PRX_E2E_CWD=$(pwd) bun run e2e:live
```
