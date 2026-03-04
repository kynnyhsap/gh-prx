# Setup and Development

## Prerequisites

- `gh` CLI installed
- `gh auth login` completed
- Bun installed
- Node.js 20+ (for source launcher mode)

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
- Build JS dist: `bun run build`
- Verify tracked dist is current: `bun run build:check`
- Build single-file executable (host): `bun run build:exe`
- Build all release binaries: `bun run build:release -- vX.Y.Z`
- Cut and publish release in one command: `bun run release:cut -- patch`

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

## Live mutating e2e (use carefully)

This suite performs real CI mutations (`rerun`, `cancel`) and is intentionally opt-in.

```bash
bun run e2e:mutate
```

Defaults:

- `GH_PRX_MUTATE_REPO=oven-sh/bun`
- `GH_PRX_MUTATE_AUTHOR` unset (optional)

Override target/reviewer scope by setting:

- `GH_PRX_MUTATE_REPO`
- `GH_PRX_MUTATE_AUTHOR`
- `GH_PRX_E2E_CWD` (optional working directory)

## Release flow

Tagging with `v*` triggers `.github/workflows/release.yml`.

The release pipeline (via `cli/gh-extension-precompile@v2`):

- runs `script/build.ts`
- installs dependencies
- runs typecheck + lint
- builds standalone Bun executables for Darwin/Linux/Windows (amd64 + arm64)
- uploads `dist/*` assets to GitHub Releases for `gh extension install` binary installs
