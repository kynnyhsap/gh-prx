# Setup and Development

## Prerequisites

- `gh` CLI installed
- `gh auth login` completed
- Bun installed

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

Optional env vars:

- `GH_AGENT_TEST_PR`
- `GH_AGENT_TEST_RUN`
